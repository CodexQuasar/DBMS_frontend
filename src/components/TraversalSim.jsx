import { useState, useRef, useEffect } from 'react';

/* ── Binary Search Tree used for demos ────────────────────── */
const DEMO_TREE = {
    val: 50,
    left: {
        val: 30,
        left: { val: 20, left: { val: 15, left: null, right: null }, right: { val: 25, left: null, right: null } },
        right: { val: 40, left: { val: 35, left: null, right: null }, right: { val: 45, left: null, right: null } },
    },
    right: {
        val: 70,
        left: { val: 60, left: { val: 55, left: null, right: null }, right: { val: 65, left: null, right: null } },
        right: { val: 80, left: { val: 75, left: null, right: null }, right: { val: 90, left: null, right: null } },
    },
};

/* ── Traversal algorithms ─────────────────────────────────── */
function inorder(node, acc = []) {
    if (!node) return acc;
    inorder(node.left, acc);
    acc.push(node.val);
    inorder(node.right, acc);
    return acc;
}

function preorder(node, acc = []) {
    if (!node) return acc;
    acc.push(node.val);
    preorder(node.left, acc);
    preorder(node.right, acc);
    return acc;
}

function postorder(node, acc = []) {
    if (!node) return acc;
    postorder(node.left, acc);
    postorder(node.right, acc);
    acc.push(node.val);
    return acc;
}

function bfs(root) {
    if (!root) return [];
    const queue = [root];
    const result = [];
    while (queue.length) {
        const node = queue.shift();
        result.push(node.val);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
    return result;
}

const TRAVERSAL_FNS = { Inorder: inorder, Preorder: preorder, Postorder: postorder, BFS: bfs };

const TRAVERSAL_DESC = {
    Inorder: 'Left → Root → Right',
    Preorder: 'Root → Left → Right',
    Postorder: 'Left → Right → Root',
    BFS: 'Level by level (queue)',
};

/* ── Layout computation ───────────────────────────────────── */
function computeLayout(node, depth = 0, left = 0, width = 400) {
    if (!node) return [];
    const cx = left + width / 2;
    const cy = depth * 70 + 36;
    return [
        { val: node.val, cx, cy },
        ...computeLayout(node.left, depth + 1, left, width / 2),
        ...computeLayout(node.right, depth + 1, left + width / 2, width / 2),
    ];
}

function computeEdges(node, layout) {
    if (!node) return [];
    const edges = [];
    const pos = layout.find(p => p.val === node.val);
    if (!pos) return [];
    if (node.left) {
        const childPos = layout.find(p => p.val === node.left.val);
        if (childPos) edges.push({ x1: pos.cx, y1: pos.cy, x2: childPos.cx, y2: childPos.cy });
        edges.push(...computeEdges(node.left, layout));
    }
    if (node.right) {
        const childPos = layout.find(p => p.val === node.right.val);
        if (childPos) edges.push({ x1: pos.cx, y1: pos.cy, x2: childPos.cx, y2: childPos.cy });
        edges.push(...computeEdges(node.right, layout));
    }
    return edges;
}

const LAYOUT = computeLayout(DEMO_TREE);
const EDGES = computeEdges(DEMO_TREE, LAYOUT);
const SVG_W = 400;
const SVG_H = 300;

/* ── Component ────────────────────────────────────────────── */
export default function TraversalSim() {
    const [traversalType, setTraversalType] = useState('Inorder');
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(3);
    const timerRef = useRef(null);
    const listRef = useRef(null);

    const SPEEDS = [1400, 1000, 700, 400, 180];

    function getSteps(type) {
        const fn = TRAVERSAL_FNS[type || traversalType];
        return fn(DEMO_TREE);
    }

    function stopPlay() {
        clearInterval(timerRef.current);
        setPlaying(false);
    }

    function play() {
        if (playing) { stopPlay(); return; }
        let s = steps;
        let start = currentStep;
        if (s.length === 0 || currentStep >= s.length - 1) {
            s = getSteps();
            setSteps(s);
            start = -1;
            setCurrentStep(-1);
        }
        setPlaying(true);
        let idx = start;
        timerRef.current = setInterval(() => {
            idx++;
            if (idx >= s.length) {
                clearInterval(timerRef.current);
                setPlaying(false);
                setCurrentStep(s.length - 1);
                return;
            }
            setCurrentStep(idx);
        }, SPEEDS[speed - 1]);
    }

    function stepForward() {
        let s = steps;
        if (s.length === 0) {
            s = getSteps();
            setSteps(s);
            setCurrentStep(0);
            return;
        }
        if (currentStep < s.length - 1) setCurrentStep(c => c + 1);
    }

    function reset() {
        stopPlay();
        setCurrentStep(-1);
        setSteps([]);
    }

    function changeType(type) {
        stopPlay();
        setTraversalType(type);
        setCurrentStep(-1);
        setSteps([]);
    }

    // Auto-scroll step list
    useEffect(() => {
        if (!listRef.current) return;
        const el = listRef.current.querySelector('.trav-step.current');
        if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [currentStep]);

    const visitedSet = new Set(steps.slice(0, currentStep + 1));
    const currentVal = currentStep >= 0 ? steps[currentStep] : null;

    return (
        <div className="viz-panel full">
            <div className="viz-header">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                    <circle cx="7.5" cy="2" r="1.8" fill="var(--accent)" />
                    <circle cx="3" cy="7.5" r="1.8" fill="var(--accent)" opacity=".7" />
                    <circle cx="12" cy="7.5" r="1.8" fill="var(--accent)" opacity=".7" />
                    <circle cx="1" cy="13" r="1.5" fill="var(--accent)" opacity=".4" />
                    <circle cx="5" cy="13" r="1.5" fill="var(--accent)" opacity=".4" />
                    <circle cx="10" cy="13" r="1.5" fill="var(--accent)" opacity=".4" />
                    <circle cx="14" cy="13" r="1.5" fill="var(--accent)" opacity=".4" />
                    <line x1="7.5" y1="3.8" x2="3" y2="5.7" stroke="var(--border2)" strokeWidth="1.2" />
                    <line x1="7.5" y1="3.8" x2="12" y2="5.7" stroke="var(--border2)" strokeWidth="1.2" />
                    <line x1="3" y1="9.3" x2="1" y2="11.5" stroke="var(--border2)" strokeWidth="1.2" />
                    <line x1="3" y1="9.3" x2="5" y2="11.5" stroke="var(--border2)" strokeWidth="1.2" />
                    <line x1="12" y1="9.3" x2="10" y2="11.5" stroke="var(--border2)" strokeWidth="1.2" />
                    <line x1="12" y1="9.3" x2="14" y2="11.5" stroke="var(--border2)" strokeWidth="1.2" />
                </svg>
                <span className="viz-title">Tree Traversal Simulation</span>

                {/* Traversal type tabs */}
                <div className="viz-tabs" style={{ marginLeft: 12 }}>
                    {Object.keys(TRAVERSAL_FNS).map(t => (
                        <button
                            key={t}
                            className={`vtab${traversalType === t ? ' active' : ''}`}
                            onClick={() => changeType(t)}
                        >{t}</button>
                    ))}
                </div>

                {/* Controls */}
                <div className="decoder-controls" style={{ margin: 0, marginLeft: 'auto' }}>
                    <button className="ctrl-btn primary" onClick={play}>
                        {playing ? (
                            <><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="1.5" y="1.5" width="2.5" height="7" rx=".5" /><rect x="6" y="1.5" width="2.5" height="7" rx=".5" /></svg> Pause</>
                        ) : (
                            <><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9" /></svg> Play</>
                        )}
                    </button>
                    <button className="ctrl-btn" onClick={stepForward} disabled={steps.length > 0 && currentStep >= steps.length - 1}>
                        Step →
                    </button>
                    <button className="ctrl-btn" onClick={reset}>Reset</button>
                    <div className="speed-row">
                        Speed
                        <input type="range" min="1" max="5" value={speed} onChange={e => { stopPlay(); setSpeed(Number(e.target.value)); }} />
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{speed}×</span>
                    </div>
                </div>
            </div>

            <div className="viz-body traversal-body">
                {/* Tree diagram */}
                <div className="traversal-diagram">
                    <div className="trav-desc">{TRAVERSAL_DESC[traversalType]}</div>
                    <svg
                        width="100%"
                        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                        preserveAspectRatio="xMidYMid meet"
                        aria-label="Binary search tree diagram"
                    >
                        {EDGES.map((e, i) => (
                            <line
                                key={i}
                                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                                stroke="var(--border2)" strokeWidth="1.5"
                            />
                        ))}
                        {LAYOUT.map(({ val, cx, cy }) => {
                            const isCurrent = val === currentVal;
                            const isVisited = visitedSet.has(val) && !isCurrent;
                            return (
                                <g key={val} transform={`translate(${cx},${cy})`}>
                                    <circle
                                        r="18"
                                        fill={isCurrent ? 'var(--accent)' : isVisited ? 'var(--accent-muted)' : 'var(--surf3)'}
                                        stroke={isCurrent ? 'var(--accent)' : isVisited ? 'var(--accent)' : 'var(--border2)'}
                                        strokeWidth={isCurrent ? 2.5 : 1.5}
                                        style={{ transition: 'fill .25s, stroke .25s' }}
                                    />
                                    <text
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fill={isCurrent ? '#fff' : isVisited ? 'var(--accent)' : 'var(--text2)'}
                                        fontSize="11"
                                        fontWeight={isCurrent ? '700' : '500'}
                                        fontFamily="var(--mono)"
                                        style={{ transition: 'fill .25s' }}
                                    >{val}</text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Step list */}
                <div className="traversal-steps">
                    <div className="traversal-order-label">
                        {traversalType} order:&nbsp;
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                            {steps.length > 0 ? steps.join(' → ') : '—'}
                        </span>
                    </div>
                    <div ref={listRef} className="trav-step-list">
                        {steps.length === 0 ? (
                            <div className="trav-empty">Press <strong>Play</strong> or <strong>Step →</strong> to begin traversal</div>
                        ) : steps.map((val, i) => (
                            <div
                                key={i}
                                className={`trav-step${i === currentStep ? ' current' : ''}${i < currentStep ? ' visited' : ''}`}
                            >
                                <span className="trav-step-num">{i + 1}</span>
                                <span className="trav-node-val">{val}</span>
                                <span className="trav-step-label">
                                    {i < currentStep ? '✓ visited' : i === currentStep ? '← current' : 'pending'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
