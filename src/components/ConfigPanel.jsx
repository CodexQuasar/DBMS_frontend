import { useState } from 'react';
import { getConfig, saveConfig } from '../api';

export default function ConfigPanel({ onClose }) {
    const cfg = getConfig();
    const [baseUrl, setBaseUrl] = useState(cfg.baseUrl);
    const [aiUrl, setAiUrl] = useState(cfg.aiUrl);
    const [apiKey, setApiKey] = useState(cfg.apiKey);
    const [saved, setSaved] = useState(false);

    function handleSave() {
        saveConfig({ baseUrl, aiUrl, apiKey });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }

    return (
        <div className="config-panel fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)', background: 'var(--surf2)' }}>
                <span style={{ fontFamily: 'var(--head)', fontWeight: 600, fontSize: 13 }}>⚙ API Configuration</span>
                <span style={{ color: 'var(--text3)', fontSize: 11, flex: 1 }}>Connect to your model backend</span>
                {saved && <span style={{ color: 'var(--accent3)', fontSize: 12 }}>✓ Saved</span>}
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
            <div className="config-body">
                <div className="config-field">
                    <label>RAT-SQL Backend URL</label>
                    <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="http://localhost:5000" />
                </div>
                <div className="config-field">
                    <label>AI / LLM Reference URL</label>
                    <input value={aiUrl} onChange={e => setAiUrl(e.target.value)} placeholder="http://localhost:5001" />
                </div>
                <div className="config-field">
                    <label>API Key (optional)</label>
                    <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Bearer token…" />
                </div>
                <button className="run-btn" style={{ height: 34, padding: '0 20px', fontSize: 13 }} onClick={handleSave}>Save</button>
            </div>
        </div>
    );
}
