/**
 * server.js — Accessibility Auditor API
 *
 * Endpoints:
 *   GET  /health          — Health check (Railway/Render auto-detects)
 *   POST /api/scan        — Run a full accessibility scan on a URL
 *   POST /api/report      — Generate AI narrative from verified scan data
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { scanUrl, validateUrl } = require('./scanner');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security middleware ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));

// CORS: allow your deployed frontend URL + local dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) in dev
    if (!origin || process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origin not allowed'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting — prevents scan abuse
const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                    // 20 scans per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many scan requests. Please wait 15 minutes before trying again.'
  }
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

// In-memory scan store (replace with Redis/DB for production scale)
const scanStore = new Map();
const MAX_STORED_SCANS = 100;

// --- Routes ---

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * POST /api/scan
 * Body: { url: string }
 * Returns: scan results with all 78 WCAG 2.2 criteria populated
 */
app.post('/api/scan', scanLimiter, async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  let normalizedUrl;
  try {
    normalizedUrl = validateUrl(url.trim());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const scanId = uuidv4();
  console.log(`[${scanId}] Scanning: ${normalizedUrl}`);

  // Respond immediately with scan ID so frontend can poll
  res.json({ scanId, status: 'scanning', url: normalizedUrl });

  // Run scan asynchronously
  scanStore.set(scanId, { status: 'scanning', url: normalizedUrl, startedAt: Date.now() });

  try {
    const results = await scanUrl(normalizedUrl);
    scanStore.set(scanId, { status: 'complete', results, completedAt: Date.now() });
    console.log(`[${scanId}] Complete in ${results.scanDurationMs}ms. Violations on ${
      Object.values(results.criteria).filter(c => c.status === 'fail').length
    } criteria.`);
  } catch (err) {
    console.error(`[${scanId}] Scan failed:`, err.message);
    scanStore.set(scanId, { status: 'error', error: err.message });
  }

  // Evict oldest entries if store is full
  if (scanStore.size > MAX_STORED_SCANS) {
    const oldest = [...scanStore.entries()].sort((a, b) => (a[1].startedAt || 0) - (b[1].startedAt || 0))[0];
    if (oldest) scanStore.delete(oldest[0]);
  }
});

/**
 * GET /api/scan/:scanId
 * Poll for scan results
 */
app.get('/api/scan/:scanId', (req, res) => {
  const entry = scanStore.get(req.params.scanId);
  if (!entry) return res.status(404).json({ error: 'Scan not found' });
  res.json(entry);
});

/**
 * POST /api/report
 * Body: { scanResults: object, reportType: 'legal'|'remediation'|'vpat'|'executive' }
 * Generates AI narrative STRICTLY from provided verified scan data.
 * The AI is explicitly prohibited from adding findings not in the data.
 */
app.post('/api/report', reportLimiter, async (req, res) => {
  const { scanResults, reportType } = req.body;

  if (!scanResults || !reportType) {
    return res.status(400).json({ error: 'scanResults and reportType are required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Report generation not configured (missing API key)' });
  }

  const fails = Object.values(scanResults.criteria)
    .filter(c => c.status === 'fail')
    .map(c => `${c.id} ${c.name} (Level ${c.level}, Laws: ${c.laws.join(', ')})\n  Violations: ${c.violations.map(v => v.description).join('; ')}`)
    .join('\n');

  const needsReview = Object.values(scanResults.criteria)
    .filter(c => c.status === 'needs_review')
    .map(c => `${c.id} ${c.name}`)
    .join(', ');

  const manualRequired = Object.values(scanResults.criteria)
    .filter(c => c.status === 'manual_required' || c.status === 'automated_pass_manual_also_required')
    .length;

  const prompts = {
    legal: `You are a disability rights attorney. Based ONLY on the following machine-verified accessibility scan results for ${scanResults.url}, provide a legal exposure analysis.

STRICT INSTRUCTION: You may ONLY discuss the verified findings listed below. Do not infer, assume, or speculate about criteria not listed as failures. Clearly state that untested/manual criteria require human evaluation before legal conclusions can be drawn about them.

VERIFIED AUTOMATED FAILURES (${Object.values(scanResults.criteria).filter(c => c.status === 'fail').length} criteria):
${fails || 'None detected by automated scan'}

NEEDS HUMAN REVIEW (${Object.values(scanResults.criteria).filter(c => c.status === 'needs_review').length} criteria): ${needsReview || 'None'}

CRITERIA REQUIRING MANUAL TESTING ONLY: ${manualRequired} criteria — legal conclusions cannot be drawn from automated scan alone for these.

Analyze the confirmed failures under: ADA Title III, CA Unruh Civil Rights Act (per-violation damages), NYSCRL §40-c, NYSHRL Exec. Law §296, NYCHRL Admin. Code §8-107. Do not speculate beyond the verified data.`,

    remediation: `You are a senior WCAG 2.2 consultant. Based ONLY on the following machine-verified failures for ${scanResults.url}, produce a prioritized remediation roadmap.

STRICT INSTRUCTION: Only address the verified failures below. Do not add recommendations for untested criteria.

VERIFIED FAILURES:
${fails || 'None detected by automated scan'}

For each failure: (1) specific fix required, (2) code example if applicable, (3) how to verify the fix. Organize by Level A → AA → AAA.`,

    vpat: `Draft a VPAT 2.5 for ${scanResults.url} using only the following verified scan data. Mark untested criteria as "Not Evaluated" — never assume pass for untested items.

SCAN DATA (axe-core v${scanResults.axeVersion || 'unknown'}, ${scanResults.scanTimestamp}):
${Object.values(scanResults.criteria).map(c =>
  `${c.id} ${c.name} (${c.level}): ${c.status} ${c.violations.length > 0 ? '— ' + c.violations.map(v => v.description).join('; ') : ''}`
).join('\n')}`,

    executive: `Write a professional accessibility audit executive summary for ${scanResults.url}.

DATA SOURCE: Automated scan using axe-core v${scanResults.axeVersion || 'unknown'} on ${scanResults.scanTimestamp}. Scan duration: ${Math.round((scanResults.scanDurationMs || 0) / 1000)}s.

VERIFIED RESULTS ONLY:
- Automated pass: ${Object.values(scanResults.criteria).filter(c => c.status === 'automated_pass' || c.status === 'automated_pass_manual_also_required').length} criteria
- Automated fail: ${Object.values(scanResults.criteria).filter(c => c.status === 'fail').length} criteria  
- Needs human review: ${Object.values(scanResults.criteria).filter(c => c.status === 'needs_review').length} criteria
- Manual testing required (not yet evaluated): ${manualRequired} criteria

FAILURES:
${fails || 'None detected by automated scan'}

IMPORTANT: Explicitly state in the summary that automated scanning covers approximately 30-40% of WCAG criteria and that manual testing by a qualified auditor is required to complete the assessment.`
  };

  if (!prompts[reportType]) {
    return res.status(400).json({ error: 'Invalid reportType' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: 'You are a professional accessibility consultant and attorney advisor. You generate reports based strictly on verified data provided to you. You never add findings, assume issues, or speculate about criteria not listed in the input data. You always clearly distinguish between automated findings and items requiring manual evaluation.',
        messages: [{ role: 'user', content: prompts[reportType] }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    res.json({ report: data.content?.[0]?.text || '' });
  } catch (err) {
    res.status(500).json({ error: `Report generation failed: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Accessibility Auditor API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
