/**
 * api.js — Backend Integration Layer
 * ------------------------------------
 * Replace BASE_URL and AI_URL with the actual endpoints of your model repo.
 * All functions are async and return { data, error }.
 *
 * Expected model-repo endpoints:
 *   POST /predict          → { sql: string, beam_score: number, steps: Step[], attention: number[][] }
 *   POST /ai_reference     → { sql: string }
 *   GET  /schema/:db       → { tables, columns, fks }  (optional — we have local fallback)
 */

// ── CONFIG (edit these to connect to your model repo) ──────────────────────
let CONFIG = {
  baseUrl: localStorage.getItem('ratsql_base_url') || 'http://localhost:5000',
  aiUrl:   localStorage.getItem('ratsql_ai_url')   || 'http://localhost:5001',
  apiKey:  localStorage.getItem('ratsql_api_key')  || '',
};

export function getConfig() { return { ...CONFIG }; }
export function saveConfig(updates) {
  CONFIG = { ...CONFIG, ...updates };
  Object.entries(updates).forEach(([k, v]) => {
    if (v) localStorage.setItem(`ratsql_${k}`, v);
    else    localStorage.removeItem(`ratsql_${k}`);
  });
}

// ── HELPERS ─────────────────────────────────────────────────────────────────
async function post(url, body, apiKey) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── MAIN ENDPOINTS ───────────────────────────────────────────────────────────

/**
 * Call your RAT-SQL model backend.
 * Returns: { sql, beam_score, steps, attention, schema_links, error? }
 */
export async function callRatSQL({ question, db }) {
  try {
    const data = await post(`${CONFIG.baseUrl}/predict`, { question, db }, CONFIG.apiKey);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Call the AI / LLM reference endpoint.
 * Returns: { sql, error? }
 */
export async function callAI({ question, db }) {
  try {
    const data = await post(`${CONFIG.aiUrl}/ai_reference`, { question, db }, CONFIG.apiKey);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

/**
 * Optionally fetch schema from backend; falls back to local SCHEMAS.
 */
export async function fetchSchema(db) {
  try {
    const res = await fetch(`${CONFIG.baseUrl}/schema/${db}`, {
      headers: CONFIG.apiKey ? { Authorization: `Bearer ${CONFIG.apiKey}` } : {},
    });
    if (!res.ok) throw new Error('schema fetch failed');
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}
