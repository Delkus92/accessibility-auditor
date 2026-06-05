import React, { useState, useEffect, useCallback } from 'react';

const API = typeof __API_URL__ !== 'undefined' && __API_URL__
  ? __API_URL__
  : '';

const LEVEL_COLORS = { A: '#0C447C', AA: '#27500A', AAA: '#633806' };
const LEVEL_BG = { A: '#E6F1FB', AA: '#EAF3DE', AAA: '#FAEEDA' };
const STATUS_CONFIG = {
  fail:                              { label: 'Fail',              color: '#A32D2D', bg: '#FCEBEB' },
  needs_review:                      { label: 'Needs review',      color: '#633806', bg: '#FAEEDA' },
  automated_pass:                    { label: 'Pass (automated)',  color: '#27500A', bg: '#EAF3DE' },
  automated_pass_manual_also_required: { label: 'Pass + manual needed', color: '#27500A', bg: '#EAF3DE' },
  manual_required:                   { label: 'Manual required',   color: '#444441', bg: '#F1EFE8' },
  not_applicable:                    { label: 'Not applicable',    color: '#888780', bg: '#F1EFE8' },
  not_tested_yet:                    { label: 'Not tested',        color: '#888780', bg: '#F1EFE8' },
  scan_error:                        { label: 'Scan error',        color: '#A32D2D', bg: '#FCEBEB' },
};
const PRINCIPLE_LABELS = { perceivable: '1. Perceivable', operable: '2. Operable', understandable: '3. Understandable', robust: '4. Robust' };
const LAW_COLORS = { ADA: '#185FA5', Unruh: '#633806', NYSCRL: '#3C3489', NYSHRL: '#27500A', NYCHRL: '#712B13' };
const LAW_BG = { ADA: '#E6F1FB', Unruh: '#FAEEDA', NYSCRL: '#EEEDFE', NYSHRL: '#EAF3DE', NYCHRL: '#FAECE7' };

export default function App() {
  const [url, setUrl] = useState('');
  const [scanId, setScanId] = useState(null);
  const [scanStatus, setScanStatus] = useState('idle'); // idle|scanning|complete|error
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('workbook');
  const [filter, setFilter] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [manualOverrides, setManualOverrides] = useState({});
  const [manualNotes, setManualNotes] = useState({});
  const [reportType, setReportType] = useState(null);
  const [reportContent, setReportContent] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Poll for scan results
  useEffect(() => {
    if (!scanId || scanStatus !== 'scanning') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/scan/${scanId}`);
        const data = await res.json();
        if (data.status === 'complete') {
          setResults(data.results);
          setScanStatus('complete');
          clearInterval(interval);
        } else if (data.status === 'error') {
          setError(data.error);
          setScanStatus('error');
          clearInterval(interval);
        }
      } catch (e) {
        setError('Lost connection to scan server. Please try again.');
        setScanStatus('error');
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [scanId, scanStatus]);

  // Elapsed timer during scan
  useEffect(() => {
    if (scanStatus !== 'scanning') { setElapsedSeconds(0); return; }
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [scanStatus]);

  const startScan = async () => {
    if (!url.trim()) return;
    setError(null);
    setResults(null);
    setScanStatus('scanning');
    setExpandedRows(new Set());
    setManualOverrides({});
    setManualNotes({});
    setReportContent('');
    try {
      const res = await fetch(`${API}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScanId(data.scanId);
    } catch (e) {
      setError(e.message);
      setScanStatus('error');
    }
  };

  const generateReport = async (type) => {
    setReportType(type);
    setReportLoading(true);
    setReportContent('');
    try {
      const res = await fetch(`${API}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanResults: results, reportType: type })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReportContent(data.report);
    } catch (e) {
      setReportContent(`Error generating report: ${e.message}`);
    } finally {
      setReportLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const setOverride = (id, val) => setManualOverrides(prev => ({ ...prev, [id]: val }));
  const setNote = (id, val) => setManualNotes(prev => ({ ...prev, [id]: val }));

  const getEffectiveStatus = (crit) => manualOverrides[crit.id] || crit.status;

  const getCriteria = () => {
    if (!results) return [];
    return Object.values(results.criteria).filter(c => {
      const s = getEffectiveStatus(c);
      if (filter === 'all') return true;
      if (['perceivable','operable','understandable','robust'].includes(filter)) return c.principle === filter;
      if (['A','AA','AAA'].includes(filter)) return c.level === filter;
      if (filter === 'fail') return s === 'fail';
      if (filter === 'manual') return s === 'manual_required';
      if (filter === 'review') return s === 'needs_review';
      if (filter === 'pass') return s === 'automated_pass' || s === 'automated_pass_manual_also_required';
      return true;
    });
  };

  const getSummary = () => {
    if (!results) return {};
    const all = Object.values(results.criteria);
    return {
      total: all.length,
      fail: all.filter(c => getEffectiveStatus(c) === 'fail').length,
      pass: all.filter(c => ['automated_pass','automated_pass_manual_also_required'].includes(getEffectiveStatus(c))).length,
      review: all.filter(c => getEffectiveStatus(c) === 'needs_review').length,
      manual: all.filter(c => ['manual_required'].includes(getEffectiveStatus(c))).length,
      na: all.filter(c => getEffectiveStatus(c) === 'not_applicable').length,
      aFails: all.filter(c => c.level === 'A' && getEffectiveStatus(c) === 'fail').length,
      aaFails: all.filter(c => c.level === 'AA' && getEffectiveStatus(c) === 'fail').length,
    };
  };

  const s = getSummary();

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: '#0B1829', padding: '0 2rem', display: 'flex', alignItems: 'center', height: 56, gap: 12 }}>
        <div style={{ width: 32, height: 32, background: '#1A8CFF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Accessibility Auditor</span>
        <span style={{ color: '#4A7DB5', fontSize: 12, marginLeft: 4 }}>WCAG 2.2 · ADA · Unruh · NYSCRL · NYSHRL · NYCHRL</span>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Scan Form */}
        <div style={{ background: '#fff', border: '0.5px solid #e0ded8', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 10 }}>Enter the URL to audit</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && startScan()}
              placeholder="https://example.com"
              disabled={scanStatus === 'scanning'}
              style={{ flex: 1, height: 40, borderRadius: 8, border: '0.5px solid #ccc', padding: '0 12px', fontSize: 14, outline: 'none' }}
              aria-label="Website URL to audit"
            />
            <button
              onClick={startScan}
              disabled={scanStatus === 'scanning' || !url.trim()}
              style={{ height: 40, padding: '0 20px', borderRadius: 8, border: 'none', background: scanStatus === 'scanning' ? '#ccc' : '#1A8CFF', color: '#fff', fontWeight: 600, fontSize: 13, cursor: scanStatus === 'scanning' ? 'not-allowed' : 'pointer' }}
            >
              {scanStatus === 'scanning' ? `Scanning… ${elapsedSeconds}s` : 'Run audit'}
            </button>
          </div>

          {/* Notice */}
          <div style={{ marginTop: 12, padding: '8px 12px', background: '#FAEEDA', border: '0.5px solid #EF9F27', borderRadius: 8, fontSize: 12, color: '#633806', lineHeight: 1.5 }}>
            <strong>What this tool does:</strong> Loads your URL in a real headless Chromium browser and runs axe-core against the live DOM. Results are machine-verified. Approximately 30–40% of WCAG 2.2 criteria are automatable — the remaining criteria are marked <em>Manual required</em> and must be evaluated by a qualified auditor.
          </div>

          {error && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#FCEBEB', border: '0.5px solid #F09595', borderRadius: 8, fontSize: 12, color: '#A32D2D' }}>
              {error}
            </div>
          )}
        </div>

        {/* Scanning state */}
        {scanStatus === 'scanning' && (
          <div style={{ background: '#fff', border: '0.5px solid #e0ded8', borderRadius: 12, padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid #e0ded8', borderTopColor: '#1A8CFF', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 500, color: '#333', marginBottom: 4 }}>Running accessibility scan…</div>
            <div style={{ fontSize: 12, color: '#888' }}>Loading {url} in headless Chromium · Running axe-core against live DOM · {elapsedSeconds}s elapsed</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>Typically takes 15–45 seconds depending on page complexity</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Results */}
        {scanStatus === 'complete' && results && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0,1fr))', gap: 8, marginBottom: '1.25rem' }}>
              {[
                { label: 'Total criteria', value: s.total, color: '#333' },
                { label: 'Automated fails', value: s.fail, color: s.fail > 0 ? '#A32D2D' : '#333' },
                { label: 'Automated pass', value: s.pass, color: '#27500A' },
                { label: 'Needs review', value: s.review, color: '#633806' },
                { label: 'Manual required', value: s.manual, color: '#444' },
                { label: 'Level A fails', value: s.aFails, color: s.aFails > 0 ? '#A32D2D' : '#27500A' },
              ].map(m => (
                <div key={m.label} style={{ background: '#fff', border: '0.5px solid #e0ded8', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 3 }}>{m.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: m.color }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Page metadata */}
            <div style={{ background: '#fff', border: '0.5px solid #e0ded8', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: 24, fontSize: 12, color: '#666', flexWrap: 'wrap' }}>
              <span><strong>URL:</strong> {results.url}</span>
              <span><strong>Title:</strong> {results.pageTitle || '—'}</span>
              <span><strong>Lang:</strong> {results.pageLang || 'not set'}</span>
              <span><strong>axe-core:</strong> v{results.axeVersion}</span>
              <span><strong>Scan time:</strong> {Math.round(results.scanDurationMs / 1000)}s</span>
              <span><strong>Scanned:</strong> {new Date(results.scanTimestamp).toLocaleString()}</span>
              {results.summary.errors.length > 0 && (
                <span style={{ color: '#A32D2D' }}><strong>Warnings:</strong> {results.summary.errors.join('; ')}</span>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid #ddd', marginBottom: '1rem' }}>
              {['workbook', 'report'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ padding: '8px 16px', border: 'none', background: 'none', fontSize: 13, fontWeight: activeTab === tab ? 500 : 400, color: activeTab === tab ? '#1A8CFF' : '#666', borderBottom: activeTab === tab ? '2px solid #1A8CFF' : '2px solid transparent', cursor: 'pointer', marginBottom: -1 }}>
                  {tab === 'workbook' ? 'Audit Workbook' : 'Reports'}
                </button>
              ))}
            </div>

            {/* Workbook tab */}
            {activeTab === 'workbook' && (
              <>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '1rem' }}>
                  {[
                    ['all','All (78)'], ['fail','Failures'], ['review','Needs review'],
                    ['pass','Automated pass'], ['manual','Manual required'],
                    ['perceivable','1. Perceivable'], ['operable','2. Operable'],
                    ['understandable','3. Understandable'], ['robust','4. Robust'],
                    ['A','Level A'], ['AA','Level AA'], ['AAA','Level AAA']
                  ].map(([f, label]) => (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{ height: 26, padding: '0 10px', borderRadius: 20, border: '0.5px solid', borderColor: filter === f ? '#1A8CFF' : '#ddd', background: filter === f ? '#E6F1FB' : '#fff', color: filter === f ? '#0C447C' : '#666', fontSize: 11, cursor: 'pointer' }}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Criterion table */}
                <div style={{ background: '#fff', border: '0.5px solid #e0ded8', borderRadius: 12, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8f7f4' }}>
                        <th style={thStyle}></th>
                        <th style={thStyle}>SC</th>
                        <th style={thStyle}>Criterion</th>
                        <th style={thStyle}>Level</th>
                        <th style={thStyle}>Laws</th>
                        <th style={thStyle}>Automated result</th>
                        <th style={thStyle}>Override / notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCriteria().map(crit => {
                        const st = STATUS_CONFIG[getEffectiveStatus(crit)] || STATUS_CONFIG.not_tested_yet;
                        const expanded = expandedRows.has(crit.id);
                        return (
                          <React.Fragment key={crit.id}>
                            <tr style={{ borderBottom: '0.5px solid #f0ede8' }} onMouseEnter={e => e.currentTarget.style.background='#fafaf8'} onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                              <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                                <button onClick={() => toggleRow(crit.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 14, lineHeight: 1 }}
                                  aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${crit.id}`}>
                                  {expanded ? '▲' : '▼'}
                                </button>
                              </td>
                              <td style={{ padding: '8px 6px', fontSize: 11, fontWeight: 600, color: '#666', whiteSpace: 'nowrap' }}>{crit.id}</td>
                              <td style={{ padding: '8px 8px' }}>
                                <div style={{ fontSize: 12, color: '#222', lineHeight: 1.4 }}>{crit.name}</div>
                                <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{PRINCIPLE_LABELS[crit.principle]}</div>
                              </td>
                              <td style={{ padding: '8px 6px' }}>
                                <span style={{ background: LEVEL_BG[crit.level], color: LEVEL_COLORS[crit.level], fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20 }}>{crit.level}</span>
                              </td>
                              <td style={{ padding: '8px 6px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                  {crit.laws.map(law => (
                                    <span key={law} style={{ background: LAW_BG[law], color: LAW_COLORS[law], fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 20 }}>{law}</span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: '8px 6px' }}>
                                <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 20, whiteSpace: 'nowrap' }}>{st.label}</span>
                                {crit.violations.length > 0 && (
                                  <div style={{ fontSize: 10, color: '#A32D2D', marginTop: 3 }}>{crit.violations.length} violation{crit.violations.length !== 1 ? 's' : ''}</div>
                                )}
                              </td>
                              <td style={{ padding: '8px 6px' }}>
                                <select value={manualOverrides[crit.id] || ''} onChange={e => setOverride(crit.id, e.target.value)}
                                  style={{ fontSize: 11, height: 26, borderRadius: 6, border: '0.5px solid #ddd', background: '#fff', color: '#333', padding: '0 4px', width: '100%', minWidth: 110 }}
                                  aria-label={`Manual override for ${crit.id}`}>
                                  <option value="">— Use automated</option>
                                  <option value="pass">✓ Manually verified pass</option>
                                  <option value="fail">✗ Manually verified fail</option>
                                  <option value="manual_required">Requires manual test</option>
                                  <option value="not_applicable">N/A for this site</option>
                                </select>
                              </td>
                            </tr>
                            {expanded && (
                              <tr>
                                <td colSpan={7} style={{ padding: '12px 16px', background: '#f8f7f4', borderBottom: '0.5px solid #e0ded8' }}>
                                  {/* Violations */}
                                  {crit.violations.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                      <div style={{ fontSize: 11, fontWeight: 600, color: '#A32D2D', marginBottom: 6 }}>Violations ({crit.violations.length})</div>
                                      {crit.violations.map((v, i) => (
                                        <div key={i} style={{ background: '#fff', border: '0.5px solid #F09595', borderRadius: 6, padding: '8px 10px', marginBottom: 6 }}>
                                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, background: v.impact === 'critical' ? '#FCEBEB' : v.impact === 'serious' ? '#FAEEDA' : '#F1EFE8', color: v.impact === 'critical' ? '#A32D2D' : v.impact === 'serious' ? '#633806' : '#444', padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>{v.impact}</span>
                                            <span style={{ fontSize: 11, fontWeight: 500, color: '#333' }}>{v.ruleId}</span>
                                            <a href={v.helpUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: '#1A8CFF', marginLeft: 'auto' }}>Deque docs ↗</a>
                                          </div>
                                          <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>{v.description}</div>
                                          {v.nodes.slice(0, 3).map((node, ni) => (
                                            <div key={ni} style={{ background: '#f8f7f4', borderRadius: 4, padding: '4px 8px', fontSize: 10, marginBottom: 3 }}>
                                              <div style={{ color: '#666', fontFamily: 'monospace', marginBottom: 2, wordBreak: 'break-all' }}>{String(node.target)}</div>
                                              <div style={{ color: '#A32D2D' }}>{node.failureSummary}</div>
                                            </div>
                                          ))}
                                          {v.nodes.length > 3 && <div style={{ fontSize: 10, color: '#aaa' }}>+ {v.nodes.length - 3} more affected elements</div>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {/* Needs review */}
                                  {crit.incomplete.length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                      <div style={{ fontSize: 11, fontWeight: 600, color: '#633806', marginBottom: 6 }}>Needs human review ({crit.incomplete.length})</div>
                                      {crit.incomplete.map((v, i) => (
                                        <div key={i} style={{ background: '#fff', border: '0.5px solid #FAC775', borderRadius: 6, padding: '8px 10px', marginBottom: 6 }}>
                                          <div style={{ fontSize: 11, fontWeight: 500, color: '#333', marginBottom: 2 }}>{v.ruleId}</div>
                                          <div style={{ fontSize: 11, color: '#555' }}>{v.description}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {/* Manual testing note */}
                                  {(crit.manualRequired || crit.status === 'manual_required') && (
                                    <div style={{ background: '#EEEDFE', border: '0.5px solid #AFA9EC', borderRadius: 6, padding: '8px 10px', marginBottom: 10, fontSize: 11, color: '#3C3489' }}>
                                      <strong>Manual testing required:</strong> {crit.manualNote || 'This criterion cannot be fully evaluated by automated tools.'}
                                    </div>
                                  )}
                                  {/* Auditor notes */}
                                  <div>
                                    <label style={{ fontSize: 10, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>Auditor notes &amp; evidence</label>
                                    <textarea value={manualNotes[crit.id] || ''} onChange={e => setNote(crit.id, e.target.value)}
                                      placeholder="Record testing method, tool used, measured values, element references, URLs tested..."
                                      style={{ width: '100%', minHeight: 56, borderRadius: 6, border: '0.5px solid #ddd', fontSize: 11, padding: '6px 8px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                                      aria-label={`Auditor notes for ${crit.id}`}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Reports tab */}
            {activeTab === 'report' && (
              <div>
                <div style={{ background: '#FAEEDA', border: '0.5px solid #EF9F27', borderRadius: 8, padding: '10px 14px', marginBottom: '1rem', fontSize: 12, color: '#633806' }}>
                  All reports are generated strictly from the automated scan data above. The AI is explicitly instructed not to add findings for untested criteria or speculate beyond verified results.
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  {[
                    ['executive', 'Executive summary'],
                    ['legal', 'Legal exposure analysis'],
                    ['remediation', 'Remediation roadmap'],
                    ['vpat', 'VPAT 2.5 draft']
                  ].map(([type, label]) => (
                    <button key={type} onClick={() => generateReport(type)} disabled={reportLoading}
                      style={{ height: 36, padding: '0 16px', borderRadius: 8, border: '0.5px solid #ddd', background: reportType === type ? '#1A8CFF' : '#fff', color: reportType === type ? '#fff' : '#333', fontSize: 12, fontWeight: 500, cursor: reportLoading ? 'not-allowed' : 'pointer' }}>
                      {reportLoading && reportType === type ? 'Generating…' : label}
                    </button>
                  ))}
                </div>
                {reportContent && (
                  <div style={{ background: '#fff', border: '0.5px solid #e0ded8', borderRadius: 12, padding: '1.25rem', fontSize: 13, color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 600, overflowY: 'auto' }}>
                    {reportContent}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

const thStyle = {
  padding: '8px 8px',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#888',
  textAlign: 'left',
  borderBottom: '0.5px solid #e0ded8',
  background: '#f8f7f4'
};
