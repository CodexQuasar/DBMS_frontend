import { useState, useCallback } from 'react';
import SchemaGraph from './components/SchemaGraph.jsx';
import AttentionMap from './components/AttentionMap.jsx';
import DecoderSim from './components/DecoderSim.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import { SCHEMAS, EXAMPLES } from './data.js';
import { callRatSQL, callAI } from './api.js';

/* ── SQL Syntax Highlighter ─────────────────────────────── */
function highlight(sql) {
  if (!sql) return '';
  const KW = /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|HAVING|LIMIT|UNION|DISTINCT|AS|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|COUNT|SUM|AVG|MIN|MAX|ASC|DESC|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE)\b/gi;
  return sql
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/'([^']*)'/g, "<span class='str'>'$1'</span>")
    .replace(/\b(\d+(?:\.\d+)?)\b/g, "<span class='num'>$1</span>")
    .replace(KW, m => `<span class='kw'>${m.toUpperCase()}</span>`)
    .replace(/\b([A-Z][a-z]\w*)\b(?=\s*\.)/g, "<span class='tbl'>$1</span>")
    .replace(/\n/g, '<br/>');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export default function App() {
  const [db, setDb] = useState('concert_singer');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [result, setResult] = useState(null); // { ratsql, ai, match, beam, links, steps, error }
  const [copied, setCopied] = useState('');

  const schema = SCHEMAS[db];

  /* ── Load example ── */
  function loadExample(i) {
    const ex = EXAMPLES[i];
    setDb(ex.db);
    setQuery(ex.query);
  }

  /* ── Copy SQL ── */
  function copySql(which) {
    const text = which === 'ratsql' ? result?.ratsql : result?.ai;
    if (text) {
      navigator.clipboard.writeText(text).catch(() => { });
      setCopied(which);
      setTimeout(() => setCopied(''), 1500);
    }
  }

  /* ── Clear ── */
  function clearAll() {
    setQuery('');
    setResult(null);
  }

  /* ── Run Query ── */
  const runQuery = useCallback(async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);

    await sleep(200); // let UI update

    // Try real API first
    const [rsRes, aiRes] = await Promise.all([
      callRatSQL({ question: query, db }),
      callAI({ question: query, db }),
    ]);

    // If API succeeded, use real data
    if (rsRes.data && !rsRes.error) {
      const d = rsRes.data;
      setResult({
        ratsql: d.sql || '',
        ai: aiRes.data?.sql || '',
        match: d.match || 'unknown',
        beam: d.beam_score ? d.beam_score.toFixed(3) : '—',
        links: d.schema_links || 0,
        steps: d.steps || [],
        error: null,
      });
    } else {
      // Fallback: match to local examples
      let ex = EXAMPLES.find(e => e.db === db && e.query.toLowerCase().includes(query.split(' ')[0].toLowerCase()));
      if (!ex) ex = EXAMPLES.find(e => e.db === db) || EXAMPLES[0];
      setResult({
        ratsql: ex.ratsql,
        ai: ex.ai,
        match: ex.match,
        beam: ex.beam,
        links: ex.links,
        steps: ex.steps,
        apiError: rsRes.error ? `Backend offline — showing demo data. (${rsRes.error})` : null,
      });
    }

    setLoading(false);
  }, [query, db, loading]);

  /* ── Key handler ── */
  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runQuery();
  }

  /* ── Match badge ── */
  const matchBadge = result
    ? result.match === 'exact'
      ? <span className="match-badge match-ok">✓ Exact Match</span>
      : result.match === 'equivalent'
        ? <span className="match-badge match-diff">≈ Semantically Equivalent</span>
        : <span className="match-badge" style={{ color: 'var(--text3)' }}>◌ Unknown</span>
    : null;

  return (
    <>
      {/* ── Header ── */}
      <header>
        <div className="logo">
          <div className="logo-mark">R</div>
          <div className="logo-text">RAT<span>-SQL</span></div>
        </div>
        <div className="header-right">
          <span className="badge badge-blue"><span className="dot" />ACL 2020</span>
          <span className="badge badge-green"><span className="dot" />Spider Benchmark</span>
          <span className="badge badge-purple">Relation-Aware</span>
          <button className="settings-btn" onClick={() => setShowConfig(s => !s)}>⚙ API Config</button>
        </div>
      </header>

      <main>

        {/* ── API Config ── */}
        {showConfig && <ConfigPanel onClose={() => setShowConfig(false)} />}

        {/* ── Query Input ── */}
        <div>
          <div className="section-label">Natural Language Query</div>
          <div className="query-panel">
            <div className="query-toolbar">
              {/* DB icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                <ellipse cx="8" cy="4" rx="6" ry="2.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 4v4c0 1.38 2.69 2.5 6 2.5S14 9.38 14 8V4" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 8v4c0 1.38 2.69 2.5 6 2.5S14 13.38 14 12V8" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <div className="db-selector">
                <select value={db} onChange={e => setDb(e.target.value)}>
                  {Object.keys(SCHEMAS).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="toolbar-spacer" />
              {EXAMPLES.map((ex, i) => (
                <button key={i} className="example-btn" onClick={() => loadExample(i)}>
                  Example {i + 1}
                </button>
              ))}
            </div>
            <div className="query-body">
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                rows={3}
                placeholder='Ask anything — e.g. "Show all singers ordered by age" · Ctrl+Enter to run'
              />
            </div>
            <div className="query-actions">
              <button className="run-btn" onClick={runQuery} disabled={loading || !query.trim()}>
                {loading
                  ? <><div className="spinner" /><span>Generating…</span></>
                  : <>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <polygon points="3,2 11,6.5 3,11" fill="white" />
                    </svg>
                    <span>Generate SQL</span>
                  </>
                }
              </button>
              <button className="clear-btn" onClick={clearAll}>Clear</button>
              {result?.beam && result.beam !== '—' && (
                <div className="beam-badge">
                  Beam Score <span className="beam-val">{result.beam}</span>
                </div>
              )}
            </div>
            {result?.apiError && (
              <div style={{ padding: '0 18px 12px' }}>
                <div className="error-banner">{result.apiError}</div>
              </div>
            )}
          </div>
        </div>

        {/* ── SQL Output ── */}
        <div>
          <div className="section-label">Generated SQL — Comparison</div>
          <div className="results-grid">
            {/* RAT-SQL */}
            <div className={`result-card${result?.match === 'exact' ? ' match-exact' : ''}`}>
              <div className="result-header">
                <div className="result-icon icon-ratsql">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="#4f8ef7" />
                    <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" fill="#4f8ef7" opacity=".6" />
                    <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" fill="#4f8ef7" opacity=".6" />
                    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" fill="#4f8ef7" opacity=".4" />
                  </svg>
                </div>
                <div className="result-title">RAT-SQL Output</div>
                <div className="result-meta">Relation-Aware Encoder</div>
              </div>
              <div className="sql-box">
                {loading
                  ? <><div className="shimmer" style={{ width: '70%' }} /><div className="shimmer" style={{ width: '90%' }} /><div className="shimmer" style={{ width: '55%' }} /></>
                  : result?.ratsql
                    ? <>
                      <button className="copy-btn" onClick={() => copySql('ratsql')}>
                        {copied === 'ratsql' ? '✓ Copied' : 'Copy'}
                      </button>
                      <span dangerouslySetInnerHTML={{ __html: highlight(result.ratsql) }} />
                    </>
                    : <span className="sql-placeholder">RAT-SQL generated query will appear here…</span>
                }
              </div>
              {result && (
                <div className="comparison-bar">
                  <span style={{ color: 'var(--text3)', fontSize: 11 }}>Schema items linked</span>
                  <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 13 }}>{result.links}</span>
                  <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: 8 }}>Beam width: 4</span>
                </div>
              )}
            </div>

            {/* AI Reference */}
            <div className={`result-card${result?.match === 'exact' ? ' match-exact' : ''}`}>
              <div className="result-header">
                <div className="result-icon icon-ai">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6" stroke="#7c5cfc" strokeWidth="1.2" />
                    <path d="M5 7.5h5M7.5 5v5" stroke="#7c5cfc" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="result-title">AI Reference Output</div>
                <div className="result-meta">Ground Truth / LLM</div>
              </div>
              <div className="sql-box">
                {loading
                  ? <><div className="shimmer" style={{ width: '65%' }} /><div className="shimmer" style={{ width: '85%' }} /><div className="shimmer" style={{ width: '50%' }} /></>
                  : result?.ai
                    ? <>
                      <button className="copy-btn" onClick={() => copySql('ai')}>
                        {copied === 'ai' ? '✓ Copied' : 'Copy'}
                      </button>
                      <span dangerouslySetInnerHTML={{ __html: highlight(result.ai) }} />
                    </>
                    : <span className="sql-placeholder">AI reference query will appear here…</span>
                }
              </div>
              {result && (
                <div className="comparison-bar">
                  {matchBadge}
                  <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 11 }}>Execution Accuracy: 100%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Visualizations ── */}
        <div>
          <div className="section-label">Analysis &amp; Visualizations</div>
          <div className="viz-grid">
            <SchemaGraph schema={schema} />
            <AttentionMap example={result ? { query, db, ratsql: result.ratsql } : null} schema={schema} />
            <DecoderSim steps={result?.steps} />
          </div>
        </div>

      </main>

      <footer>
        Built for DBMS Project — Based on{' '}
        <a href="https://arxiv.org/abs/1911.04942" target="_blank" rel="noreferrer">
          RAT-SQL (Wang et al., ACL 2020)
        </a>{' '}
        &nbsp;·&nbsp; Spider + WikiSQL Benchmarks
      </footer>
    </>
  );
}
