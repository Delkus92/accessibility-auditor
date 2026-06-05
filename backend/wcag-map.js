/**
 * Authoritative mapping of axe-core rule IDs to WCAG 2.2 success criteria.
 * Each entry references the normative WCAG 2.2 specification.
 * Laws mapped per criterion based on published legal standards as of 2024.
 *
 * Sources:
 *   - WCAG 2.2: https://www.w3.org/TR/WCAG22/
 *   - axe-core rules: https://dequeuniversity.com/rules/axe/
 *   - ADA Title III (42 U.S.C. § 12181)
 *   - CA Unruh Civil Rights Act (Cal. Civ. Code § 51)
 *   - NYSCRL § 40-c
 *   - NYSHRL Executive Law § 296
 *   - NYCHRL NYC Admin. Code § 8-107
 */

const WCAG_CRITERIA = {
  '1.1.1': {
    name: 'Non-text content',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [
      'image-alt', 'input-image-alt', 'area-alt', 'role-img-alt',
      'svg-img-alt', 'object-alt', 'frame-title', 'image-redundant-alt'
    ]
  },
  '1.2.1': {
    name: 'Audio-only and video-only (prerecorded)',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['audio-caption'],
    manualRequired: true,
    manualNote: 'Verify transcripts for audio-only and text alternatives for video-only content.'
  },
  '1.2.2': {
    name: 'Captions (prerecorded)',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['video-caption'],
    manualRequired: true,
    manualNote: 'Automated tools detect missing caption tracks. Caption accuracy requires manual review.'
  },
  '1.2.3': {
    name: 'Audio description or media alternative (prerecorded)',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: check for audio description track or full text alternative on all prerecorded video.'
  },
  '1.2.4': {
    name: 'Captions (live)',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify live video streams and verify real-time captions are present.'
  },
  '1.2.5': {
    name: 'Audio description (prerecorded)',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify audio description track on all prerecorded synchronized media.'
  },
  '1.2.6': {
    name: 'Sign language (prerecorded)',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: check for sign language interpreter on prerecorded synchronized media.'
  },
  '1.2.7': {
    name: 'Extended audio description (prerecorded)',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: check for extended audio description where standard AD is insufficient.'
  },
  '1.2.8': {
    name: 'Media alternative (prerecorded)',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify full text alternative (script-level) for all prerecorded synchronized media.'
  },
  '1.2.9': {
    name: 'Audio-only (live)',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify real-time text alternative for live audio-only broadcasts.'
  },
  '1.3.1': {
    name: 'Info and relationships',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [
      'label', 'label-content-name-mismatch', 'landmark-one-main',
      'list', 'listitem', 'definition-list', 'dlitem',
      'table-duplicate-name', 'table-fake-caption', 'td-headers-attr',
      'th-has-data-cells', 'scope-attr-valid', 'empty-table-header',
      'heading-order', 'p-as-heading', 'presentation-role-conflict'
    ]
  },
  '1.3.2': {
    name: 'Meaningful sequence',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: disable CSS and compare DOM reading order to visual order.'
  },
  '1.3.3': {
    name: 'Sensory characteristics',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: search for instructions relying solely on shape, color, size, or location.'
  },
  '1.3.4': {
    name: 'Orientation',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['css-orientation-lock'],
    manualRequired: true,
    manualNote: 'Automated: CSS orientation lock detection. Manual: test on physical device in both orientations.'
  },
  '1.3.5': {
    name: 'Identify input purpose',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['autocomplete-valid']
  },
  '1.3.6': {
    name: 'Identify purpose',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [
      'landmark-banner-is-top-level', 'landmark-complementary-is-top-level',
      'landmark-contentinfo-is-top-level', 'landmark-main-is-top-level',
      'landmark-no-duplicate-banner', 'landmark-no-duplicate-contentinfo',
      'landmark-no-duplicate-main', 'landmark-unique', 'region'
    ]
  },
  '1.4.1': {
    name: 'Use of color',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['link-in-text-block'],
    manualRequired: true,
    manualNote: 'Partial automation: link-in-text-block rule. Full manual review required for color-only error states, charts, and required field indicators.'
  },
  '1.4.2': {
    name: 'Audio control',
    principle: 'perceivable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: check for auto-playing audio and verify keyboard-accessible pause/stop/mute control.'
  },
  '1.4.3': {
    name: 'Contrast (minimum)',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['color-contrast'],
    note: 'axe-core computes actual contrast ratios from rendered CSS. Results include exact measured ratio vs required ratio.'
  },
  '1.4.4': {
    name: 'Resize text',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['meta-viewport'],
    manualRequired: true,
    manualNote: 'Automated: user-scalable=no detection. Manual: test at 200% zoom for content loss or horizontal scroll.'
  },
  '1.4.5': {
    name: 'Images of text',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: inspect images for text content that could be rendered as real CSS text.'
  },
  '1.4.6': {
    name: 'Contrast (enhanced)',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: ['color-contrast-enhanced'],
    note: 'axe-core computes 7:1 ratio for normal text, 4.5:1 for large text.'
  },
  '1.4.7': {
    name: 'Low or no background audio',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: assess background audio levels in speech audio content.'
  },
  '1.4.8': {
    name: 'Visual presentation',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: check line width ≤80 chars, line spacing ≥1.5×, no full justification, user color selection.'
  },
  '1.4.9': {
    name: 'Images of text (no exception)',
    principle: 'perceivable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: no images of text permitted except pure decoration or logos.'
  },
  '1.4.10': {
    name: 'Reflow',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: test at 320px viewport width (or 400% zoom at 1280px) for horizontal scrolling or content loss.'
  },
  '1.4.11': {
    name: 'Non-text contrast',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['color-contrast'],
    manualRequired: true,
    manualNote: 'Automated: axe detects some UI component contrast. Manual: measure button borders, input borders, focus indicators, chart elements with CCA (3:1 minimum).'
  },
  '1.4.12': {
    name: 'Text spacing',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: apply text spacing bookmarklet. Verify no content loss at line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em.'
  },
  '1.4.13': {
    name: 'Content on hover or focus',
    principle: 'perceivable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: test all tooltips and popovers for dismissable (Escape), hoverable, and persistent behavior.'
  },
  '2.1.1': {
    name: 'Keyboard',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [
      'accesskeys', 'focusable-no-name', 'tabindex',
      'scrollable-region-focusable', 'interactive-supports-focus'
    ],
    manualRequired: true,
    manualNote: 'Automated: detects non-focusable interactive elements. Manual: complete all user flows with keyboard only.'
  },
  '2.1.2': {
    name: 'No keyboard trap',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: tab into every component and verify focus can exit with Tab/Shift+Tab/Escape.'
  },
  '2.1.3': {
    name: 'Keyboard (no exception)',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: stricter than 2.1.1 — no path-based exceptions permitted.'
  },
  '2.1.4': {
    name: 'Character key shortcuts',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify single-character keyboard shortcuts and verify mechanism to turn off or remap.'
  },
  '2.2.1': {
    name: 'Timing adjustable',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['meta-refresh'],
    manualRequired: true,
    manualNote: 'Automated: meta refresh detection. Manual: test session timeouts for warning and extension mechanism.'
  },
  '2.2.2': {
    name: 'Pause, stop, hide',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['blink', 'marquee'],
    manualRequired: true,
    manualNote: 'Automated: blink and marquee element detection. Manual: verify pause/stop controls on carousels and auto-updating content.'
  },
  '2.2.3': {
    name: 'No timing',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify no time limits exist on site except real-time or essential exceptions.'
  },
  '2.2.4': {
    name: 'Interruptions',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify all non-emergency interruptions can be postponed or suppressed by user.'
  },
  '2.2.5': {
    name: 'Re-authenticating',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: trigger session expiration and verify data is preserved on re-authentication.'
  },
  '2.2.6': {
    name: 'Timeouts',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify user is warned of timeout duration where data loss could result.'
  },
  '2.3.1': {
    name: 'Three flashes or below threshold',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review with PEAT tool: test all video and animated content for flashing > 3Hz.'
  },
  '2.3.2': {
    name: 'Three flashes',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review with PEAT: no flashing content at any frequency permitted.'
  },
  '2.3.3': {
    name: 'Animation from interactions',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify prefers-reduced-motion is implemented and removes non-essential animation.'
  },
  '2.4.1': {
    name: 'Bypass blocks',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['bypass', 'skip-link', 'landmark-one-main', 'heading-order']
  },
  '2.4.2': {
    name: 'Page titled',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['document-title']
  },
  '2.4.3': {
    name: 'Focus order',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['tabindex'],
    manualRequired: true,
    manualNote: 'Automated: positive tabindex detection. Manual: tab through full page and verify logical sequence and modal focus management.'
  },
  '2.4.4': {
    name: 'Link purpose (in context)',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['link-name', 'identical-links-same-purpose']
  },
  '2.4.5': {
    name: 'Multiple ways',
    principle: 'operable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify at least 2 navigation mechanisms (search, site map, navigation links, etc.).'
  },
  '2.4.6': {
    name: 'Headings and labels',
    principle: 'operable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['empty-heading', 'heading-order', 'label'],
    manualRequired: true,
    manualNote: 'Automated: empty/missing headings and labels. Manual: verify all headings and labels are descriptive.'
  },
  '2.4.7': {
    name: 'Focus visible',
    principle: 'operable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['focus-trap'],
    manualRequired: true,
    manualNote: 'Automated: focus trap detection. Manual: tab through all elements and verify visible focus indicator is present.'
  },
  '2.4.8': {
    name: 'Location',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify breadcrumb, site map, or highlighted nav item communicates current location.'
  },
  '2.4.9': {
    name: 'Link purpose (link only)',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: ['link-name'],
    manualRequired: true,
    manualNote: 'Stricter than 2.4.4: purpose must be determinable from link text alone, no surrounding context permitted.'
  },
  '2.4.10': {
    name: 'Section headings',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: ['heading-order'],
    manualRequired: true,
    manualNote: 'Requires manual review: verify content sections each have a descriptive heading.'
  },
  '2.4.11': {
    name: 'Focus not obscured (minimum)',
    principle: 'operable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: tab through page with sticky headers/footers and verify focused element is not entirely hidden.'
  },
  '2.4.12': {
    name: 'Focus not obscured (enhanced)',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: stricter than 2.4.11 — no part of focused element may be obscured by sticky content.'
  },
  '2.4.13': {
    name: 'Focus appearance',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review with CCA: focus indicator must have 3:1 contrast and enclose the component or meet area requirement.'
  },
  '2.5.1': {
    name: 'Pointer gestures',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify multi-point/path-based gestures and verify single-pointer alternatives.'
  },
  '2.5.2': {
    name: 'Pointer cancellation',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify click/tap actions fire on up-event and can be cancelled by moving pointer off target.'
  },
  '2.5.3': {
    name: 'Label in name',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['label-content-name-mismatch']
  },
  '2.5.4': {
    name: 'Motion actuation',
    principle: 'operable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify device-motion triggered functions and verify UI alternatives and disable mechanism.'
  },
  '2.5.5': {
    name: 'Target size (enhanced)',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: measure all interactive targets — minimum 44×44 CSS pixels for AAA.'
  },
  '2.5.6': {
    name: 'Concurrent input mechanisms',
    principle: 'operable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify site does not restrict or detect input modality to limit functionality.'
  },
  '2.5.7': {
    name: 'Dragging movements',
    principle: 'operable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify all drag operations and verify single-pointer alternatives exist.'
  },
  '2.5.8': {
    name: 'Target size (minimum)',
    principle: 'operable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['target-size'],
    manualRequired: true,
    manualNote: 'Automated: axe target-size rule (24×24px minimum). Manual: verify offset spacing for undersized targets and measure borderline cases.'
  },
  '3.1.1': {
    name: 'Language of page',
    principle: 'understandable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['html-has-lang', 'html-lang-valid', 'html-xml-lang-mismatch']
  },
  '3.1.2': {
    name: 'Language of parts',
    principle: 'understandable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['valid-lang'],
    manualRequired: true,
    manualNote: 'Automated: invalid lang attribute values. Manual: identify foreign language passages and verify lang attribute on containing element.'
  },
  '3.1.3': {
    name: 'Unusual words',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify jargon, idioms, or technical terms and verify definition mechanism exists.'
  },
  '3.1.4': {
    name: 'Abbreviations',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify abbreviations and verify expansion via abbr element, glossary, or first-use expansion.'
  },
  '3.1.5': {
    name: 'Reading level',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: assess reading level (Flesch-Kincaid). If above lower secondary education, verify simplified alternative.'
  },
  '3.1.6': {
    name: 'Pronunciation',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: identify words where pronunciation disambiguates meaning and verify guide is provided.'
  },
  '3.2.1': {
    name: 'On focus',
    principle: 'understandable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: tab to every focusable element and verify no context change occurs on focus alone.'
  },
  '3.2.2': {
    name: 'On input',
    principle: 'understandable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: change all select/checkbox/radio inputs and verify no automatic navigation or form submission.'
  },
  '3.2.3': {
    name: 'Consistent navigation',
    principle: 'understandable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: compare navigation order and labels across minimum 5 pages.'
  },
  '3.2.4': {
    name: 'Consistent identification',
    principle: 'understandable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify components with same function are labeled consistently across all pages.'
  },
  '3.2.5': {
    name: 'Change on request',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: ['meta-refresh'],
    manualRequired: true,
    manualNote: 'Automated: meta-refresh detection. Manual: verify no auto-redirect, auto-refresh, or context changes without user action.'
  },
  '3.2.6': {
    name: 'Consistent help',
    principle: 'understandable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify help mechanisms appear in consistent location across all page templates.'
  },
  '3.3.1': {
    name: 'Error identification',
    principle: 'understandable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['aria-required-attr', 'aria-valid-attr-value'],
    manualRequired: true,
    manualNote: 'Automated: ARIA error attribute detection. Manual: submit forms with errors and verify messages identify field and describe issue in text.'
  },
  '3.3.2': {
    name: 'Labels or instructions',
    principle: 'understandable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: ['label', 'label-title-only']
  },
  '3.3.3': {
    name: 'Error suggestion',
    principle: 'understandable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: trigger validation errors and verify messages provide specific corrective suggestion.'
  },
  '3.3.4': {
    name: 'Error prevention (legal, financial, data)',
    principle: 'understandable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: test checkout/legal flows for review step, confirmation, or reversibility.'
  },
  '3.3.5': {
    name: 'Help',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: verify context-sensitive help available on complex forms.'
  },
  '3.3.6': {
    name: 'Error prevention (all)',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: stricter than 3.3.4 — all form submissions must be reversible, checkable, or confirmable.'
  },
  '3.3.7': {
    name: 'Redundant entry',
    principle: 'understandable',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: test multi-step forms for redundant data entry without auto-population.'
  },
  '3.3.8': {
    name: 'Accessible authentication (minimum)',
    principle: 'understandable',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: test login/registration for cognitive function tests (CAPTCHA, puzzles) and verify accessible alternative exists.'
  },
  '3.3.9': {
    name: 'Accessible authentication (enhanced)',
    principle: 'understandable',
    level: 'AAA',
    laws: ['NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review: no cognitive function tests permitted at all, including object recognition alternatives.'
  },
  '4.1.1': {
    name: 'Parsing',
    principle: 'robust',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: ['duplicate-id', 'duplicate-id-active', 'duplicate-id-aria']
  },
  '4.1.2': {
    name: 'Name, role, value',
    principle: 'robust',
    level: 'A',
    laws: ['ADA', 'Unruh', 'NYSCRL', 'NYSHRL', 'NYCHRL'],
    axeRules: [
      'aria-allowed-attr', 'aria-allowed-role', 'aria-command-name',
      'aria-dialog-name', 'aria-hidden-body', 'aria-hidden-focus',
      'aria-input-field-name', 'aria-meter-name', 'aria-progressbar-name',
      'aria-required-attr', 'aria-required-children', 'aria-required-parent',
      'aria-roles', 'aria-toggle-field-name', 'aria-tooltip-name',
      'aria-treeitem-name', 'aria-valid-attr', 'aria-valid-attr-value',
      'button-name', 'input-button-name', 'select-name',
      'frame-title', 'frame-focusable-content'
    ]
  },
  '4.1.3': {
    name: 'Status messages',
    principle: 'robust',
    level: 'AA',
    laws: ['ADA', 'Unruh', 'NYSHRL', 'NYCHRL'],
    axeRules: [],
    manualRequired: true,
    manualNote: 'Requires manual review with screen reader: trigger form success, cart updates, error alerts and verify announcement without focus movement.'
  }
};

/**
 * Build reverse index: axe rule ID → array of WCAG criterion IDs
 */
const AXE_RULE_TO_WCAG = {};
Object.entries(WCAG_CRITERIA).forEach(([critId, crit]) => {
  (crit.axeRules || []).forEach(ruleId => {
    if (!AXE_RULE_TO_WCAG[ruleId]) AXE_RULE_TO_WCAG[ruleId] = [];
    if (!AXE_RULE_TO_WCAG[ruleId].includes(critId)) {
      AXE_RULE_TO_WCAG[ruleId].push(critId);
    }
  });
});

module.exports = { WCAG_CRITERIA, AXE_RULE_TO_WCAG };
