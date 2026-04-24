import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const COLORS = ['#1a2d4a', '#1e2a45', '#1e2a3e', '#1a2e3a', '#1e2e2a', '#2a2838', '#2e2630', '#2a2a20'];
const BORDERS = ['#4f8ef7', '#7c5cfc', '#27d98a', '#f5a623', '#ef5350', '#4dd0e1', '#ab47bc', '#ffca28'];

export default function SchemaGraph({ schema }) {
    const svgRef = useRef(null);
    const tipRef = useRef(null);
    const [tab, setTab] = useState('tables');

    useEffect(() => {
        if (!schema || !svgRef.current) return;
        const svgEl = svgRef.current;
        svgEl.innerHTML = '';
        const W = svgEl.clientWidth || 520;
        const H = 340;
        const tables = schema.tables.slice(0, 8);
        const nodes = tables.map(t => ({ id: t, cols: schema.columns[t] || [] }));
        const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
        const links = (schema.fks || []).map(([s, t]) => {
            const [sT, sC] = s.split('.');
            const [tT, tC] = t.split('.');
            return { source: sT, target: tT, label: `${sC}→${tC}` };
        }).filter(l => nodeMap[l.source] && nodeMap[l.target]);

        const svg = d3.select(svgEl).attr('width', W).attr('height', H);

        // Arrow
        svg.append('defs').append('marker')
            .attr('id', 'arr').attr('viewBox', '0 0 10 10')
            .attr('refX', 30).attr('refY', 5)
            .attr('markerWidth', 6).attr('markerHeight', 6)
            .attr('orient', 'auto-start-reverse')
            .append('path').attr('d', 'M2 1L8 5L2 9')
            .attr('fill', 'none').attr('stroke', '#3d4455').attr('stroke-width', 1.5);

        const sim = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(130).strength(.6))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(W / 2, H / 2))
            .force('collision', d3.forceCollide(58));

        const linkG = svg.append('g');
        const linkEls = linkG.selectAll('line').data(links).enter().append('line')
            .attr('stroke', '#2e3347').attr('stroke-width', 1.5)
            .attr('marker-end', 'url(#arr)');

        const lblEls = svg.append('g').selectAll('text').data(links).enter().append('text')
            .attr('font-size', 9).attr('fill', '#4a5066').attr('text-anchor', 'middle')
            .text(d => d.label);

        const tip = tipRef.current;
        const ng = svg.append('g').selectAll('g').data(nodes).enter().append('g')
            .attr('cursor', 'pointer')
            .call(d3.drag()
                .on('start', (e, d) => { if (!e.active) sim.alphaTarget(.3).restart(); d.fx = d.x; d.fy = d.y; })
                .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
                .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
            .on('mouseover', (e, d) => {
                tip.style.display = 'block';
                tip.style.left = (e.offsetX + 14) + 'px';
                tip.style.top = (e.offsetY - 10) + 'px';
                tip.innerHTML = `<b style="color:var(--accent)">${d.id}</b><br><span style="color:var(--text3);font-size:11px">${d.cols.slice(0, 6).join(', ')}${d.cols.length > 6 ? '…' : ''}</span>`;
            })
            .on('mouseout', () => { tip.style.display = 'none'; });

        ng.append('rect')
            .attr('x', -46).attr('y', -22).attr('width', 92).attr('height', 44).attr('rx', 10)
            .attr('fill', (d, i) => COLORS[i % COLORS.length])
            .attr('stroke', (d, i) => BORDERS[i % BORDERS.length]).attr('stroke-width', 1.2);

        ng.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
            .attr('y', -6).attr('font-family', 'JetBrains Mono,monospace').attr('font-size', 11)
            .attr('font-weight', 600).attr('fill', '#e8eaf0')
            .text(d => d.id.length > 12 ? d.id.substring(0, 11) + '…' : d.id);

        ng.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
            .attr('y', 9).attr('font-size', 9).attr('fill', '#5a6070')
            .text(d => `${d.cols.length} cols`);

        sim.on('tick', () => {
            linkEls
                .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            lblEls
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
            ng.attr('transform', d => {
                d.x = Math.max(55, Math.min(W - 55, d.x));
                d.y = Math.max(28, Math.min(H - 28, d.y));
                return `translate(${d.x},${d.y})`;
            });
        });

        return () => { sim.stop(); };
    }, [schema, tab]);

    return (
        <div className="viz-panel">
            <div className="viz-header">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="3" r="2" stroke="var(--accent)" strokeWidth="1.2" />
                    <circle cx="2" cy="11" r="2" stroke="var(--accent3)" strokeWidth="1.2" />
                    <circle cx="12" cy="11" r="2" stroke="var(--accent2)" strokeWidth="1.2" />
                    <path d="M7 5v2M4 10L6 7M10 10L8 7" stroke="var(--text3)" strokeWidth="1" strokeLinecap="round" />
                </svg>
                <span className="viz-title">Schema Relation Graph</span>
                <div className="viz-tabs">
                    {['tables', 'erd'].map(t => (
                        <div key={t} className={`vtab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
                            {t === 'tables' ? 'Tables' : 'ERD'}
                        </div>
                    ))}
                </div>
            </div>
            <div className="viz-body" style={{ padding: 0, position: 'relative' }}>
                {!schema
                    ? <div className="ph"><span>Select a database to visualise schema</span></div>
                    : <svg ref={svgRef} id="schema-svg" />
                }
                <div className="g-tip" ref={tipRef} style={{ display: 'none', position: 'absolute' }} />
            </div>
        </div>
    );
}
