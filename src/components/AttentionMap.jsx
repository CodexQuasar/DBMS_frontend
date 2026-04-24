import { useEffect, useRef, useState } from 'react';

export default function AttentionMap({ example, schema }) {
    const canvasRef = useRef(null);
    const [mode, setMode] = useState('query-schema');

    useEffect(() => {
        if (!example || !schema || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const queryTokens = example.query.split(' ').filter(w => w.length > 2).slice(0, 8);
        let schemaItems = [];
        if (mode === 'query-schema') {
            Object.entries(schema.columns).forEach(([tbl, cols]) => {
                cols.slice(0, 3).forEach(c => schemaItems.push(`${tbl}.${c}`));
            });
            schemaItems = schemaItems.slice(0, 10);
        } else {
            schemaItems = schema.tables.slice(0, 8);
        }

        const cellW = 46, cellH = 30, padL = 120, padT = 65;
        const W = padL + schemaItems.length * cellW + 24;
        const H = padT + queryTokens.length * cellH + 24;
        canvas.width = Math.min(W, 620);
        canvas.height = H;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#12151c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Schema headers (rotated)
        schemaItems.forEach((s, j) => {
            ctx.save();
            ctx.translate(padL + j * cellW + cellW / 2, padT - 10);
            ctx.rotate(-Math.PI / 4);
            ctx.font = '9px JetBrains Mono,monospace';
            ctx.fillStyle = '#9299ad';
            ctx.textAlign = 'center';
            ctx.fillText(s.length > 10 ? s.substring(0, 9) + '…' : s, 0, 0);
            ctx.restore();
        });

        // Query token labels
        ctx.font = '10px JetBrains Mono,monospace';
        ctx.textAlign = 'right';
        queryTokens.forEach((q, i) => {
            ctx.fillStyle = '#9299ad';
            ctx.fillText(q, padL - 6, padT + i * cellH + cellH / 2 + 3);
        });

        // Attention weights
        const weights = queryTokens.map(q => schemaItems.map(s => {
            let base = Math.random() * 0.25;
            const ql = q.toLowerCase();
            const sl = s.toLowerCase().split('.').pop().substring(0, 4);
            if (sl.includes(ql.substring(0, 4)) || ql.includes(sl)) base += 0.5 + Math.random() * 0.35;
            return Math.min(1, parseFloat(base.toFixed(2)));
        }));

        queryTokens.forEach((_, i) => {
            schemaItems.forEach((_, j) => {
                const v = weights[i][j];
                const a = 0.08 + v * 0.92;
                ctx.fillStyle = `rgba(${Math.round(60 + v * 180)},${Math.round(80 + v * 100)},${Math.round(200 + v * 55)},${a})`;
                ctx.fillRect(padL + j * cellW + 1, padT + i * cellH + 1, cellW - 2, cellH - 2);
                if (v > 0.4) {
                    ctx.font = '8px DM Sans,sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = v > 0.7 ? '#fff' : '#9299ad';
                    ctx.fillText(v.toFixed(2), padL + j * cellW + cellW / 2, padT + i * cellH + cellH / 2 + 3);
                }
            });
        });

        // Color scale
        const grad = ctx.createLinearGradient(padL, H - 14, canvas.width - 20, H - 14);
        grad.addColorStop(0, 'rgba(12,20,80,.6)');
        grad.addColorStop(1, 'rgba(80,140,255,.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(padL, H - 18, canvas.width - padL - 22, 6);
        ctx.font = '8px DM Sans,sans-serif';
        ctx.fillStyle = '#5a6070';
        ctx.textAlign = 'left'; ctx.fillText('0.0', padL, H - 4);
        ctx.textAlign = 'right'; ctx.fillText('1.0', canvas.width - 20, H - 4);
    }, [example, schema, mode]);

    return (
        <div className="viz-panel">
            <div className="viz-header">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="3" height="12" rx="1" fill="var(--accent)" opacity=".8" />
                    <rect x="5.5" y="3" width="3" height="10" rx="1" fill="var(--accent2)" opacity=".7" />
                    <rect x="10" y="5" width="3" height="8" rx="1" fill="var(--accent3)" opacity=".6" />
                </svg>
                <span className="viz-title">Attention Heatmap</span>
                <div className="viz-tabs">
                    {[['query-schema', 'Q→Schema'], ['schema-schema', 'S→S']].map(([v, l]) => (
                        <div key={v} className={`vtab${mode === v ? ' active' : ''}`} onClick={() => setMode(v)}>{l}</div>
                    ))}
                </div>
            </div>
            <div className="viz-body" style={{ minHeight: 260 }}>
                {!example
                    ? <div className="ph attn-ph"><span>Run a query to see attention weights</span></div>
                    : <div id="attn-wrap"><canvas ref={canvasRef} /></div>
                }
            </div>
        </div>
    );
}
