import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * TokenHud: the real-time token consumption dashboard.
 *
 * A compact panel pinned to the bottom-right of the viewport. Two views:
 *
 * - **实时 (live)**: polls the host snapshot route and renders per-session
 *   token usage with a live SVG history curve carrying real time ticks and
 *   a range switch (2m / 5m / 15m).
 * - **统计 (stats)**: polls the host stats route and renders per-day and
 *   per-month usage bars from durable JSONL logs.
 *
 * Colors follow the DSH design tokens, so the HUD matches the host theme
 * (light and dark) automatically.
 *
 * @module dsh-token-panel/client/hud
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import css from './TokenHud.module.css';
/** Host routes. */
const SNAPSHOT_URL = '/plugins/dsh-token-panel/snapshot';
const STATS_URL = '/plugins/dsh-token-panel/stats';
/** Poll cadence (ms); keep in sync with the host default. */
const POLL_MS = 1500;
/** Stats poll cadence (ms) — daily totals move slowly. */
const STATS_POLL_MS = 10_000;
/** Time-range options for the history curve. */
const RANGES = [
    { label: '2m', ms: 2 * 60_000 },
    { label: '5m', ms: 5 * 60_000 },
    { label: '15m', ms: 15 * 60_000 },
];
function formatNumber(value) {
    if (value >= 1_000_000_000)
        return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000)
        return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000)
        return `${(value / 1_000).toFixed(1)}k`;
    return String(Math.round(value));
}
/** Format a timestamp as HH:MM:SS. */
function formatTime(t) {
    const date = new Date(t);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}
/** Short Chinese date label for a YYYY-MM-DD key. */
function dateLabel(date) {
    const [y, m, d] = date.split('-');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (date === today)
        return '今天';
    return `${Number(m)}月${Number(d)}日`;
}
/** Month label for a YYYY-MM key. */
function monthLabel(month) {
    const [y, m] = month.split('-');
    const now = new Date();
    if (Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1)
        return '本月';
    return `${y}年${Number(m)}月`;
}
/** Estimate cost in CNY from usage buckets (cache hit priced separately). */
function estimateCost(input, cacheRead, cacheWrite, output, prices) {
    return (((input + cacheWrite) / 1_000_000) * prices.input
        + (cacheRead / 1_000_000) * prices.cacheRead
        + (output / 1_000_000) * prices.output);
}
/** Estimate session cost in CNY from provider usage buckets. */
function estimateRowCost(row, prices) {
    const usage = row.usage;
    if (usage === undefined)
        return 0;
    return estimateCost(usage.uncachedInputTokens, usage.cacheReadTokens, usage.cacheWriteTokens, usage.outputTokens, prices);
}
/** Format a CNY cost for display. */
function formatCost(cost) {
    if (cost >= 1)
        return `¥${cost.toFixed(2)}`;
    if (cost >= 0.01)
        return `¥${cost.toFixed(3)}`;
    return `¥${(cost * 100).toFixed(1)}分`;
}
/** Occupancy percent for the pressure bar (capacity may be absent). */
function occupancy(row) {
    const capacity = row.contextWindow;
    if (capacity === undefined || capacity <= 0)
        return undefined;
    const pressure = row.projectedTokens ?? row.pressureTokens ?? row.totalTokens;
    return Math.min(100, Math.max(0, (pressure / capacity) * 100));
}
/** Filter history points to the trailing window ending at `now`. */
function filterRange(points, now, rangeMs) {
    const cutoff = now - rangeMs;
    return points.filter((point) => point.t >= cutoff);
}
/** Format a timestamp for a date-scale axis (M/D). */
function formatDateTick(t) {
    const date = new Date(t);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}
/**
 * Sparkline: renders the timestamped history as an SVG area chart with
 * ticks on the bottom axis. Pass `tickFormat` for non-time scales (e.g.
 * daily/monthly stats).
 */
function Sparkline({ points, now, width = 336, height = 72, tickFormat = formatTime }) {
    const path = useMemo(() => {
        if (points.length < 2)
            return null;
        const max = Math.max(...points.map((point) => point.total), 1);
        const min = Math.min(...points.map((point) => point.total), 0);
        const span = Math.max(max - min, 1);
        const t0 = points[0]?.t ?? now;
        const t1 = points[points.length - 1]?.t ?? now;
        const tSpan = Math.max(t1 - t0, 1);
        const y = (value) => height - 16 - ((value - min) / span) * (height - 24);
        const x = (t) => ((t - t0) / tSpan) * width;
        const coords = points.map((point) => [x(point.t), y(point.total)]);
        const line = coords.map(([xValue, yValue], index) => `${index === 0 ? 'M' : 'L'}${xValue.toFixed(1)},${yValue.toFixed(1)}`).join(' ');
        const area = `${line} L${width},${height - 12} L0,${height - 12} Z`;
        const last = coords[coords.length - 1];
        if (last === undefined)
            return null;
        const ticks = [0, 0.5, 1].map((fraction) => {
            const t = t0 + tSpan * fraction;
            return { t, x: x(t) };
        });
        return { line, area, last, ticks };
    }, [points, width, height, now]);
    if (path === null) {
        return _jsx("div", { className: css.sparkEmpty, style: { width, height }, children: "\u7B49\u5F85\u6570\u636E\u2026" });
    }
    return (_jsxs("svg", { className: css.spark, viewBox: `0 0 ${width} ${height}`, width: "100%", height: height, preserveAspectRatio: "none", role: "img", "aria-label": "token \u6D88\u8017\u66F2\u7EBF", children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "tokenSparkFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: "0.32" }), _jsx("stop", { offset: "100%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: "0.02" })] }) }), _jsx("path", { d: path.area, fill: "url(#tokenSparkFill)" }), _jsx("path", { d: path.line, fill: "none", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "1.6", vectorEffect: "non-scaling-stroke", strokeLinejoin: "round", strokeLinecap: "round" }), _jsx("circle", { cx: path.last[0], cy: path.last[1], r: "2.6", fill: "var(--dsw-alias-bg-module-platform)", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "1.4" }), path.ticks.map((tick) => (_jsx("text", { x: tick.x, y: height - 3, textAnchor: tick.x < width * 0.15 ? 'start' : tick.x > width * 0.85 ? 'end' : 'middle', className: css.sparkTick, children: tickFormat(tick.t) }, tick.t)))] }));
}
/** Collapsed pill shown when the panel is closed. */
function CollapsedChip({ total, onClick }) {
    return (_jsxs("button", { type: "button", className: css.chip, onClick: onClick, "aria-label": "\u6253\u5F00 Token \u9762\u677F", children: [_jsx("span", { className: css.chipDot, "aria-hidden": true }), _jsx("span", { className: css.chipLabel, children: "TOKEN" }), _jsx("span", { className: css.chipValue, children: formatNumber(total) })] }));
}
/** One session row inside the live view. */
function SessionRow({ row, prices, rangeMs, now }) {
    const [open, setOpen] = useState(false);
    const usage = row.usage;
    const cost = estimateRowCost(row, prices);
    const used = occupancy(row);
    const label = row.label !== '' ? row.label : row.sessionId.slice(-8);
    const history = filterRange(row.history ?? [], now, rangeMs);
    // Cumulative consumption across all buckets (the "usage total").
    const cumulative = usage === undefined
        ? undefined
        : usage.uncachedInputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
    return (_jsxs("div", { className: css.row, "data-open": open, children: [_jsxs("button", { type: "button", className: css.rowHead, onClick: () => { setOpen((current) => !current); }, "aria-expanded": open, children: [_jsxs("span", { className: css.rowName, title: `${row.title ?? ''} ${row.sessionId}`, children: [_jsx("span", { className: css.rowTitle, children: label }), row.title !== undefined && row.title !== '' && (_jsx("span", { className: css.rowSub, children: row.sessionId.slice(-8) }))] }), _jsxs("span", { className: css.rowTokensWrap, children: [_jsx("span", { className: css.rowTokens, title: "\u5F53\u524D\u4E0A\u4E0B\u6587\u538B\u529B", children: formatNumber(row.totalTokens) }), cumulative !== undefined && (_jsxs("span", { className: css.rowCumulative, title: "\u7D2F\u8BA1\u6D88\u8017", children: ["\u2248", formatNumber(cumulative)] }))] }), _jsx("span", { className: css.rowPulse, "data-live": row.live, "aria-hidden": true })] }), open && (_jsxs("div", { className: css.rowDetail, children: [history.length >= 2 && _jsx(Sparkline, { points: history, now: now }), _jsxs("div", { className: css.detailLine, children: [_jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u8F93\u5165" }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.uncachedInputTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u8F93\u51FA" }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.outputTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u7F13\u5B58\u8BFB" }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.cacheReadTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u7F13\u5B58\u5199" }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.cacheWriteTokens) })] })] }), _jsxs("div", { className: css.detailLine, children: [_jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u538B\u529B" }), _jsx("span", { className: css.mono, children: row.pressureTokens === undefined ? '—' : formatNumber(row.pressureTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u9884\u8BA1" }), _jsx("span", { className: css.mono, children: row.projectedTokens === undefined ? '—' : formatNumber(row.projectedTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u5BB9\u91CF" }), _jsx("span", { className: css.mono, children: row.contextWindow === undefined ? '—' : formatNumber(row.contextWindow) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: "\u6210\u672C" }), _jsx("span", { className: css.mono, children: formatCost(cost) })] })] }), used !== undefined && (_jsx("div", { className: css.barTrack, "aria-label": `上下文占用 ${used.toFixed(0)}%`, children: _jsx("span", { className: css.barFill, style: { width: `${used}%` }, "data-hot": used > 85 }) }))] }))] }));
}
/** One horizontal usage bar (day or month). */
function StatBar({ label, value, max, input, output, cacheRead, cacheWrite, cost }) {
    const width = max > 0 ? Math.max(2, (value / max) * 100) : 0;
    return (_jsxs("div", { className: css.statRow, children: [_jsx("span", { className: css.statLabel, children: label }), _jsx("span", { className: css.statBarTrack, children: _jsx("span", { className: css.statBarFill, style: { width: `${width}%` } }) }), _jsx("span", { className: css.statValue, children: formatNumber(value) }), _jsx("span", { className: css.statCost, children: formatCost(cost) })] }));
}
/** The stats view: per-month and per-day usage bars, switched separately. */
function StatsView({ stats }) {
    const [subView, setSubView] = useState('days');
    if (stats === null) {
        return _jsx("span", { className: css.empty, children: "\u7EDF\u8BA1\u6570\u636E\u52A0\u8F7D\u4E2D\u2026" });
    }
    const prices = stats.prices ?? { input: 1, cacheRead: 0.02, output: 2 };
    const maxMonth = Math.max(...stats.months.map((month) => month.total), 1);
    const maxDay = Math.max(...stats.days.map((day) => day.total), 1);
    const totalAll = stats.months.reduce((sum, month) => sum + month.total, 0);
    const totalCost = stats.months.reduce((sum, month) => sum + estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices), 0);
    const hasData = stats.months.length > 0 || stats.days.length > 0;
    // Convert day/month aggregates to sparkline points (midnight / month-start timestamps).
    const dayPoints = useMemo(() => stats.days.map((day) => ({
        t: Date.parse(`${day.date}T12:00:00`),
        total: day.total,
    })), [stats.days]);
    const monthPoints = useMemo(() => stats.months.map((month) => ({
        t: Date.parse(`${month.month}-15T12:00:00`),
        total: month.total,
    })), [stats.months]);
    return (_jsxs("div", { className: css.statsBody, children: [_jsxs("div", { className: css.statsTotal, children: [_jsx("span", { className: css.statsTotalLabel, children: "\u7D2F\u8BA1\u6D88\u8017" }), _jsx("span", { className: css.mono, children: formatNumber(totalAll) }), _jsxs("span", { className: css.statsTotalSub, children: ["token \u00B7 \u7EA6 ", formatCost(totalCost)] })] }), hasData && (_jsxs("div", { className: css.viewBar, role: "group", "aria-label": "\u7EDF\u8BA1\u7C92\u5EA6", children: [_jsx("button", { type: "button", className: css.viewButton, "data-active": subView === 'days', onClick: () => { setSubView('days'); }, children: "\u6309\u65E5" }), _jsx("button", { type: "button", className: css.viewButton, "data-active": subView === 'months', onClick: () => { setSubView('months'); }, children: "\u6309\u6708" })] })), subView === 'months' ? (stats.months.length > 0 ? (_jsxs("section", { className: css.statsSection, children: [_jsx("header", { className: css.statsSectionHead, children: "\u6309\u6708 \u00B7 \u5168\u90E8" }), monthPoints.length >= 2 && (_jsx("div", { className: css.statsSparkWrap, children: _jsx(Sparkline, { points: monthPoints, now: Date.now(), height: 64, tickFormat: formatDateTick }) })), stats.months.map((month) => (_jsx(StatBar, { label: monthLabel(month.month), value: month.total, max: maxMonth, input: month.input, output: month.output, cacheRead: month.cacheRead, cacheWrite: month.cacheWrite, cost: estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices) }, month.month)))] })) : (_jsx("span", { className: css.empty, children: "\u6682\u65E0\u6309\u6708\u6570\u636E" }))) : (stats.days.length > 0 ? (_jsxs("section", { className: css.statsSection, children: [_jsx("header", { className: css.statsSectionHead, children: "\u6309\u65E5 \u00B7 \u5168\u90E8" }), dayPoints.length >= 2 && (_jsx("div", { className: css.statsSparkWrap, children: _jsx(Sparkline, { points: dayPoints, now: Date.now(), height: 64, tickFormat: formatDateTick }) })), stats.days.map((day) => (_jsx(StatBar, { label: dateLabel(day.date), value: day.total, max: maxDay, input: day.input, output: day.output, cacheRead: day.cacheRead, cacheWrite: day.cacheWrite, cost: estimateCost(day.input, day.cacheRead, day.cacheWrite, day.output, prices) }, day.date)))] })) : (_jsx("span", { className: css.empty, children: "\u6682\u65E0\u6309\u65E5\u6570\u636E" }))), !hasData && (_jsx("span", { className: css.empty, children: "\u6682\u65E0\u7EDF\u8BA1\u6570\u636E\uFF08\u4F7F\u7528\u4F1A\u8BDD\u540E\u81EA\u52A8\u8BB0\u5F55\uFF09" }))] }));
}
/** The top-level HUD: polling, view switching and layout. */
export function TokenHud() {
    const [snapshot, setSnapshot] = useState(null);
    const [stats, setStats] = useState(null);
    const [view, setView] = useState('live');
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);
    const [rangeMs, setRangeMs] = useState(RANGES[1]?.ms ?? 5 * 60_000);
    const [now, setNow] = useState(Date.now());
    const [showAll, setShowAll] = useState(false);
    const inFlight = useRef(false);
    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            if (inFlight.current || cancelled)
                return;
            inFlight.current = true;
            try {
                const response = await fetch(SNAPSHOT_URL, { cache: 'no-store' });
                if (!response.ok)
                    throw new Error(`HTTP ${response.status}`);
                const body = (await response.json());
                if (!cancelled && Array.isArray(body.sessions)) {
                    setSnapshot(body);
                    setNow(Date.now());
                    setError(null);
                }
            }
            catch (cause) {
                if (!cancelled)
                    setError(cause instanceof Error ? cause.message : String(cause));
            }
            finally {
                inFlight.current = false;
            }
        };
        void tick();
        const timer = setInterval(() => { void tick(); }, POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, []);
    // Stats poll at a slower cadence.
    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const response = await fetch(STATS_URL, { cache: 'no-store' });
                if (!response.ok)
                    return;
                const body = (await response.json());
                if (!cancelled && Array.isArray(body.days))
                    setStats(body);
            }
            catch {
                // Keep the last stats snapshot.
            }
        };
        void tick();
        const timer = setInterval(() => { void tick(); }, STATS_POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, []);
    const totals = useMemo(() => {
        if (snapshot === null)
            return { total: 0, output: 0 };
        let total = 0;
        let output = 0;
        for (const row of snapshot.sessions) {
            total += row.totalTokens;
            output += row.usage?.outputTokens ?? 0;
        }
        return { total, output };
    }, [snapshot]);
    const prices = snapshot?.prices ?? { input: 1, cacheRead: 0.02, output: 2 };
    const topHistory = useMemo(() => {
        if (snapshot === null || snapshot.sessions.length === 0)
            return [];
        return filterRange(snapshot.sessions[0]?.history ?? [], now, rangeMs);
    }, [snapshot, now, rangeMs]);
    if (snapshot === null) {
        return (_jsx("div", { className: css.host, children: _jsx(CollapsedChip, { total: 0, onClick: () => { setOpen(true); } }) }));
    }
    return (_jsxs("div", { className: css.host, children: [!open && _jsx(CollapsedChip, { total: totals.total, onClick: () => { setOpen(true); } }), open && (_jsxs("aside", { className: css.panel, "data-token-panel": true, children: [_jsxs("header", { className: css.head, children: [_jsxs("span", { className: css.title, children: [_jsx("span", { className: css.titleMark, "aria-hidden": true }), "TOKEN\u00A0HUD"] }), _jsxs("div", { className: css.viewBar, role: "group", "aria-label": "\u89C6\u56FE\u5207\u6362", children: [_jsx("button", { type: "button", className: css.viewButton, "data-active": view === 'live', onClick: () => { setView('live'); }, children: "\u5B9E\u65F6" }), _jsx("button", { type: "button", className: css.viewButton, "data-active": view === 'stats', onClick: () => { setView('stats'); }, children: "\u7EDF\u8BA1" })] }), _jsx("button", { type: "button", className: css.closeButton, onClick: () => { setOpen(false); }, "aria-label": "\u6536\u8D77", children: "\u2715" })] }), view === 'live' ? (_jsxs(_Fragment, { children: [topHistory.length >= 2 && (_jsxs("div", { className: css.sparkWrap, children: [_jsx("div", { className: css.rangeBar, role: "group", "aria-label": "\u65F6\u95F4\u8303\u56F4", children: RANGES.map((range) => (_jsx("button", { type: "button", className: css.rangeButton, "data-active": range.ms === rangeMs, onClick: () => { setRangeMs(range.ms); }, children: range.label }, range.label))) }), _jsx(Sparkline, { points: topHistory, now: now })] })), _jsxs("div", { className: css.body, children: [snapshot.sessions.length === 0 && (_jsx("span", { className: css.empty, children: "\u65E0\u6D3B\u52A8\u4F1A\u8BDD" })), snapshot.sessions.slice(0, showAll ? undefined : 3).map((row) => (_jsx(SessionRow, { row: row, prices: prices, rangeMs: rangeMs, now: now }, row.sessionId))), !showAll && snapshot.sessions.length > 3 && (_jsxs("button", { type: "button", className: css.moreButton, onClick: () => { setShowAll(true); }, children: ["\u5C55\u5F00\u5168\u90E8 ", snapshot.sessions.length, " \u4E2A\u4F1A\u8BDD"] })), showAll && snapshot.sessions.length > 3 && (_jsx("button", { type: "button", className: css.moreButton, onClick: () => { setShowAll(false); }, children: "\u6536\u8D77\uFF0C\u53EA\u770B\u524D 3 \u4E2A" }))] })] })) : (_jsx("div", { className: css.body, children: _jsx(StatsView, { stats: stats }) })), _jsxs("footer", { className: css.foot, children: [_jsx("span", { className: css.footHint, children: error !== null
                                    ? `连接中断 · ${error}`
                                    : view === 'live'
                                        ? `实时 TOTAL ${formatNumber(totals.total)} · OUT ${formatNumber(totals.output)}`
                                        : '按日按月统计' }), _jsx("span", { className: css.mono, children: new Date(snapshot.generatedAt).toLocaleTimeString() })] })] }))] }));
}
