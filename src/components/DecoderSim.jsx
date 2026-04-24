import { useRef, useState, useEffect } from 'react';

const TOKEN_CLASS = { kw: 'tok-kw', tbl: 'tok-tbl', col: 'tok-col', op: 'tok-op', val: 'tok-val', fn: 'tok-fn' };

export default function DecoderSim({ steps }) {
    const [visible, setVisible] = useState([]);
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(3);
    const timerRef = useRef(null);
    const listRef = useRef(null);

    const SPEEDS = [1200, 900, 700, 450, 200];

    // Reset when new steps arrive
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, [steps]);

    function stop() {
        clearInterval(timerRef.current);
        setPlaying(false);
    }

    function play() {
        if (!steps?.length) return;
        if (playing) { stop(); return; }
        setPlaying(true);
        timerRef.current = setInterval(() => {
            setIdx(prev => {
                if (prev >= steps.length) { stop(); return prev; }
                setVisible(v => [...v, steps[prev]]);
                return prev + 1;
            });
        }, SPEEDS[speed - 1]);
    }

    function step() {
        if (!steps?.length || idx >= steps.length) return;
        setVisible(v => [...v, steps[idx]]);
        setIdx(i => i + 1);
    }

    function reset() {
        stop();
        setVisible([]);
        setIdx(0);
    }

    function changeSpeed(v) {
        setSpeed(Number(v));
        if (playing) { stop(); }
    }

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [visible]);

    return (
        <div className="viz-panel full">
            <div className="viz-header">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 4h10M4 7h6M6 10h2" stroke="var(--warn)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span className="viz-title">Decoder Step-by-Step Simulation</span>
                <div className="decoder-controls" style={{ margin: 0, marginLeft: 'auto' }}>
                    <button className={`ctrl-btn primary`} onClick={play} disabled={!steps?.length}>
                        {playing ? 'Pause' : 'Play'}
                    </button>
                    <button className="ctrl-btn" onClick={reset} disabled={!steps?.length}>Reset</button>
                    <button className="ctrl-btn" onClick={step} disabled={!steps?.length || idx >= (steps?.length || 0)}>Step</button>
                    <div className="speed-row">
                        Speed
                        <input type="range" min="1" max="5" value={speed} onChange={e => changeSpeed(e.target.value)} />
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{speed}x</span>
                    </div>
                </div>
            </div>
            <div className="viz-body">
                {!steps?.length
                    ? <div className="ph d-ph"><span>Run a query to simulate the decoder</span></div>
                    : (
                        <div ref={listRef} className="decoder-list" style={{ maxHeight: 280, overflowY: 'auto' }}>
                            {visible.map((s, i) => (
                                <div key={i} className="d-row">
                                    <div className="d-num">{i + 1}</div>
                                    <span className={`d-tok ${TOKEN_CLASS[s.type] || 'tok-kw'}`}>{s.tok}</span>
                                    <span className="d-action">{s.action}</span>
                                    <div className="d-conf">
                                        <div className="conf-track">
                                            <div className="conf-fill" style={{ width: `${Math.round(s.conf * 100)}%` }} />
                                        </div>
                                        <span>{Math.round(s.conf * 100)}%</span>
                                    </div>
                                </div>
                            ))}
                            {visible.length === 0 && steps.length > 0 && (
                                <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
                                    Press Play or Step to begin
                                </div>
                            )}
                        </div>
                    )
                }
            </div>
        </div>
    );
}
