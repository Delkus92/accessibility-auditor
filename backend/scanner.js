/**
 * scanner.js — Core accessibility scanning engine
 *
 * Uses Playwright to load a real URL in headless Chromium, then injects
 * axe-core to run a full automated audit against the live DOM.
 *
 * IMPORTANT: Only reports what axe-core actually verified. Criteria that
 * require manual testing are returned with status "manual_required" and
 * explicit testing instructions. No criterion is ever assumed to pass.
 */

const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const { WCAG_CRITERIA, AXE_RULE_TO_WCAG } = require('./wcag-map');

const SCAN_TIMEOUT = 60000; // 60 seconds max per page

/**
 * Scan a single URL and return verified findings mapped to WCAG 2.2 criteria.
 * @param {string} url - The URL to scan
 * @param {object} options - Scan options
 * @returns {object} - Structured audit results
 */
async function scanUrl(url, options = {}) {
  const startTime = Date.now();
  let browser = null;

  const result = {
    url,
    scanTimestamp: new Date().toISOString(),
    scanDurationMs: 0,
    pageTitle: null,
    pageLang: null,
    statusCode: null,
    axeVersion: null,
    criteria: {},
    summary: {
      total: Object.keys(WCAG_CRITERIA).length,
      automated_pass: 0,
      automated_fail: 0,
      automated_incomplete: 0,
      manual_required: 0,
      errors: []
    },
    rawAxeResults: null
  };

  // Initialize all criteria as manual_required by default
  // Nothing is ever assumed to pass — only axe findings override this
  Object.entries(WCAG_CRITERIA).forEach(([id, crit]) => {
    result.criteria[id] = {
      id,
      name: crit.name,
      principle: crit.principle,
      level: crit.level,
      laws: crit.laws,
      status: crit.axeRules && crit.axeRules.length > 0 ? 'not_tested_yet' : 'manual_required',
      automatable: crit.axeRules && crit.axeRules.length > 0,
      manualRequired: !!crit.manualRequired,
      manualNote: crit.manualNote || null,
      violations: [],
      incomplete: [],
      passes: [],
      axeRulesTested: crit.axeRules || []
    };
  });

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      userAgent: 'Mozilla/5.0 (compatible; AccessibilityAuditor/1.0; +https://github.com/accessibility-auditor)',
      ignoreHTTPSErrors: false
    });

    const page = await context.newPage();

    // Capture HTTP response
    let responseStatus = null;
    page.on('response', response => {
      if (response.url() === url || response.url() === url + '/') {
        responseStatus = response.status();
      }
    });

    // Navigate to target URL
    let navigationError = null;
    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: SCAN_TIMEOUT
      });
    } catch (navErr) {
      // Try with domcontentloaded as fallback
      try {
        await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: SCAN_TIMEOUT
        });
        navigationError = `Warning: networkidle timeout, fell back to domcontentloaded. Some dynamic content may not have loaded. (${navErr.message})`;
      } catch (fallbackErr) {
        throw new Error(`Failed to load URL: ${fallbackErr.message}`);
      }
    }

    if (navigationError) {
      result.summary.errors.push(navigationError);
    }

    result.statusCode = responseStatus;
    result.pageTitle = await page.title();
    result.pageLang = await page.evaluate(() => document.documentElement.lang || null);

    // Run axe-core against the live DOM
    // Using tags: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa to cover
    // all applicable WCAG 2.x rules in axe's ruleset
    const axeBuilder = new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']);

    const axeResults = await axeBuilder.analyze();
    result.axeVersion = axeResults.testEngine?.version || 'unknown';
    result.rawAxeResults = {
      violations: axeResults.violations,
      passes: axeResults.passes,
      incomplete: axeResults.incomplete,
      inapplicable: axeResults.inapplicable
    };

    // --- Map violations to WCAG criteria ---
    axeResults.violations.forEach(violation => {
      const wcagIds = mapAxeRuleToWcag(violation.id, violation.tags);
      wcagIds.forEach(critId => {
        if (!result.criteria[critId]) return;
        result.criteria[critId].status = 'fail';
        result.criteria[critId].violations.push({
          ruleId: violation.id,
          impact: violation.impact,           // critical, serious, moderate, minor
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map(node => ({
            target: node.target,
            html: node.html,
            failureSummary: node.failureSummary,
            impact: node.impact
          }))
        });
      });
    });

    // --- Map passes to WCAG criteria ---
    // A criterion is only marked "pass" if axe tested it AND found no violations
    // AND there are no incomplete (needs-review) results for it
    axeResults.passes.forEach(pass => {
      const wcagIds = mapAxeRuleToWcag(pass.id, pass.tags);
      wcagIds.forEach(critId => {
        if (!result.criteria[critId]) return;
        // Don't overwrite a fail
        if (result.criteria[critId].status !== 'fail') {
          result.criteria[critId].passes.push({
            ruleId: pass.id,
            description: pass.description,
            nodeCount: pass.nodes.length
          });
        }
      });
    });

    // --- Map incomplete (needs review) results ---
    axeResults.incomplete.forEach(incomplete => {
      const wcagIds = mapAxeRuleToWcag(incomplete.id, incomplete.tags);
      wcagIds.forEach(critId => {
        if (!result.criteria[critId]) return;
        if (result.criteria[critId].status !== 'fail') {
          result.criteria[critId].status = 'needs_review';
        }
        result.criteria[critId].incomplete.push({
          ruleId: incomplete.id,
          impact: incomplete.impact,
          description: incomplete.description,
          help: incomplete.help,
          helpUrl: incomplete.helpUrl,
          nodes: incomplete.nodes.map(node => ({
            target: node.target,
            html: node.html,
            failureSummary: node.failureSummary
          }))
        });
      });
    });

    // --- Finalize status for automatable criteria ---
    // A criterion with axe rules that had no violations, no incomplete,
    // but had passes is "automated_pass"
    Object.values(result.criteria).forEach(crit => {
      if (crit.automatable) {
        if (crit.status === 'fail') {
          result.summary.automated_fail++;
        } else if (crit.status === 'needs_review') {
          result.summary.automated_incomplete++;
          // Still needs review — do not mark pass
        } else if (crit.passes.length > 0 && crit.violations.length === 0 && crit.incomplete.length === 0) {
          crit.status = 'automated_pass';
          result.summary.automated_pass++;
        } else {
          // axe rules exist but nothing was tested (inapplicable / no elements found)
          crit.status = 'not_applicable';
        }
      } else {
        result.summary.manual_required++;
      }

      // All criteria with manualRequired flag always note manual testing needed
      // regardless of automated result
      if (crit.manualRequired && crit.status === 'automated_pass') {
        crit.status = 'automated_pass_manual_also_required';
      }
    });

    await context.close();

  } catch (err) {
    result.summary.errors.push(`Scan error: ${err.message}`);
    // Mark all automatable criteria as scan_error rather than any result
    Object.values(result.criteria).forEach(crit => {
      if (crit.automatable && crit.status === 'not_tested_yet') {
        crit.status = 'scan_error';
      }
    });
  } finally {
    if (browser) await browser.close();
  }

  result.scanDurationMs = Date.now() - startTime;
  return result;
}

/**
 * Map an axe rule ID to WCAG criterion IDs using:
 * 1. Our explicit reverse index (primary)
 * 2. axe's own tags array (fallback for rules not in our map)
 */
function mapAxeRuleToWcag(ruleId, tags = []) {
  const fromMap = AXE_RULE_TO_WCAG[ruleId] || [];
  if (fromMap.length > 0) return fromMap;

  // Fallback: parse wcag tags like "wcag111" → "1.1.1"
  const fromTags = [];
  tags.forEach(tag => {
    const match = tag.match(/^wcag(\d)(\d)(\d+)$/);
    if (match) {
      const id = `${match[1]}.${match[2]}.${match[3]}`;
      if (WCAG_CRITERIA[id] && !fromTags.includes(id)) {
        fromTags.push(id);
      }
    }
  });
  return fromTags;
}

/**
 * Validate and normalize a URL before scanning
 */
function validateUrl(url) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only http:// and https:// URLs are supported');
    }
    // Block private/local addresses
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local')
    ) {
      throw new Error('Private/local URLs are not allowed');
    }
    return parsed.href;
  } catch (err) {
    throw new Error(`Invalid URL: ${err.message}`);
  }
}

module.exports = { scanUrl, validateUrl };
