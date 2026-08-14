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
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import css from './TokenHud.module.css';
/** Host routes. */
const SNAPSHOT_URL = '/plugins/dsh-token-panel/snapshot';
const STATS_URL = '/plugins/dsh-token-panel/stats';
const BALANCE_URL = '/plugins/dsh-token-panel/balance';
/** Poll cadence (ms); keep in sync with the host default. */
const POLL_MS = 1500;
/** Stats poll cadence (ms) — daily totals move slowly. */
const STATS_POLL_MS = 10_000;
/** Balance poll cadence (ms) — the host caches its own 5-min fetch. */
const BALANCE_POLL_MS = 60_000;
/** Time-range options for the history curve. */
const RANGES = [
    { label: '2m', ms: 2 * 60_000 },
    { label: '5m', ms: 5 * 60_000 },
    { label: '15m', ms: 15 * 60_000 },
];
/** Preset corner → screen coordinates. Accepts the actual HUD size so the
 *  bottom corners land on the true bottom edge (not offset by a guess). */
function presetCornerPosition(preset, size) {
    const margin = 12;
    const w = size?.width ?? 360;
    const h = size?.height ?? 520;
    const maxX = Math.max(margin, window.innerWidth - w - margin);
    const maxY = Math.max(margin, window.innerHeight - h - margin);
    switch (preset) {
        case 'tl': return { x: margin, y: margin };
        case 'tr': return { x: maxX, y: margin };
        case 'bl': return { x: margin, y: maxY };
        case 'br': return { x: maxX, y: maxY };
    }
}
/** Localized label for a preset corner id. */
function cornerLabel(preset, t) {
    switch (preset) {
        case 'tl': return t('cornerTL');
        case 'tr': return t('cornerTR');
        case 'bl': return t('cornerBL');
        case 'br': return t('cornerBR');
    }
}
/** Small stroke icons for the long-press menu (match the DSH icon style). */
function MenuIcon({ d }) {
    return (_jsx("svg", { viewBox: "0 0 16 16", width: "13", height: "13", "aria-hidden": "true", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
}
/** Icon paths: back-arrow, crosshair (custom), corner brackets (presets). */
const ICON_BACK = 'M3 8h8M8.5 4.5 12 8l-3.5 3.5M13 3v10';
const ICON_CROSSHAIR = 'M8 1.5v3m0 7v3M1.5 8h3m7 0h3M8 8l.01 0M8 5.8A2.2 2.2 0 1 0 8 10.2 2.2 2.2 0 0 0 8 5.8Z';
const ICON_CORNER = {
    // Pure L-brackets (no stray diagonals): the bracket points INTO the corner.
    tl: 'M1.5 6V1.5H6',
    tr: 'M10 1.5h4.5V6',
    bl: 'M1.5 10v4.5H6',
    br: 'M14.5 10v4.5H10',
};
/** Replace {name} placeholders in a localized template. */
function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, (match, name) => name in values ? String(values[name]) : match);
}
function formatNumber(value) {
    if (value >= 1_000_000_000)
        return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000)
        return `${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000)
        return `${(value / 1_000).toFixed(1)}k`;
    return String(Math.round(value));
}
/** Axis-value formatter: small values keep one decimal (0.5 stays 0.5). */
function formatAxisNumber(value) {
    if (value >= 1_000)
        return formatNumber(value);
    if (value >= 10)
        return String(Math.round(value));
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
/** Format a timestamp as HH:MM:SS. */
function formatTime(t) {
    const date = new Date(t);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}
/** Locale-aware date label for a YYYY-MM-DD key. */
function dateLabel(date, t) {
    const [y, m, d] = date.split('-');
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterdayTs = now.getTime() - 86_400_000;
    const yesterday = `${new Date(yesterdayTs).getFullYear()}-${String(new Date(yesterdayTs).getMonth() + 1).padStart(2, '0')}-${String(new Date(yesterdayTs).getDate()).padStart(2, '0')}`;
    if (date === today)
        return t('today');
    if (date === yesterday)
        return t('yesterday');
    return `${Number(m)}/${Number(d)}`;
}
/** Locale-aware month label for a YYYY-MM key. */
function monthLabel(month, t) {
    const [y, m] = month.split('-');
    const now = new Date();
    if (Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1)
        return t('thisMonth');
    return fill(t('monthFmt'), { y: Number(y), m: Number(m) });
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
/** Format a timestamp for a day-scale axis (M/D). */
function formatDateTick(t) {
    const date = new Date(t);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}
/** Format a timestamp for a month-scale axis (locale-aware). */
function formatMonthTick(t, translate) {
    const date = new Date(t);
    return fill(translate('monthFmt'), { y: date.getFullYear(), m: date.getMonth() + 1 });
}
/** Convert cumulative output samples into per-tick consumption deltas
 *  (idle ticks become 0, so the curve drops to zero when not in use). */
function toConsumption(points) {
    let previous = points[0]?.output ?? 0;
    return points.map((point, index) => {
        const output = point.output ?? 0;
        const delta = index === 0 ? 0 : Math.max(0, output - previous);
        previous = output;
        return { t: point.t, total: delta };
    });
}
/**
 * Sparkline: renders the timestamped history as an SVG area chart with
 * ticks on the bottom axis. Pass `tickFormat` for non-time scales (e.g.
 * daily/monthly stats).
 */
/** Round a value up to a "nice" axis number (1/2/2.5/5 × 10^n). */
function niceCeil(value) {
    if (value <= 0)
        return 1;
    const exponent = Math.floor(Math.log10(value));
    const magnitude = Math.pow(10, exponent);
    const normalized = value / magnitude;
    const nice = normalized <= 1 ? 1
        : normalized <= 2 ? 2
            : normalized <= 2.5 ? 2.5
                : normalized <= 5 ? 5
                    : 10;
    return nice * magnitude;
}
function Sparkline({ points, now, width = 336, height = 72, tickFormat = formatTime, t }) {
    /** Left gutter reserved for the Y-axis value labels. */
    const AXIS_W = 38;
    const plotW = width - AXIS_W;
    // Hysteresis state: the axis rises immediately but only steps down when
    // the data drops below half the current scale (Steam-like stability).
    const yMaxRef = useRef(1);
    const path = useMemo(() => {
        if (points.length === 0)
            return null;
        // Single point: render a centered dot with its tick (curve needs 2+).
        if (points.length === 1) {
            const only = points[0];
            if (only === undefined)
                return null;
            const yTop = 6;
            const yBot = height - 14;
            const axisMax = niceCeil(only.total);
            return {
                kind: 'dot',
                x: AXIS_W + plotW / 2,
                y: yTop + (yBot - yTop) / 2,
                t: only.t,
                ticks: [{ t: only.t, x: AXIS_W + plotW / 2 }],
                yMax: axisMax,
                yMid: axisMax / 2,
                yMin: 0,
            };
        }
        const rawMax = Math.max(...points.map((point) => point.total), 0);
        // Rise immediately; only descend below half the current scale.
        const current = yMaxRef.current;
        if (rawMax > current || rawMax < current * 0.5) {
            yMaxRef.current = niceCeil(rawMax);
        }
        const max = yMaxRef.current;
        const min = 0;
        const span = Math.max(max - min, 1);
        const t0 = points[0]?.t ?? now;
        const t1 = points[points.length - 1]?.t ?? now;
        const tSpan = Math.max(t1 - t0, 1);
        // Reserve a 14px bottom band for tick labels so they never clip.
        const y = (value) => height - 18 - ((value - min) / span) * (height - 28);
        // Right edge keeps 4px clearance so the last dot never clips the panel.
        const x = (t) => AXIS_W + ((t - t0) / tSpan) * (plotW - 4);
        const coords = points.map((point) => [x(point.t), y(point.total)]);
        const line = coords.map(([xValue, yValue], index) => `${index === 0 ? 'M' : 'L'}${xValue.toFixed(1)},${yValue.toFixed(1)}`).join(' ');
        const area = `${line} L${width},${height - 14} L${AXIS_W},${height - 14} Z`;
        const last = coords[coords.length - 1];
        if (last === undefined)
            return null;
        const ticks = [0, 0.5, 1].map((fraction) => {
            const t = t0 + tSpan * fraction;
            return { t, x: x(t) };
        });
        return {
            kind: 'line', line, area, last, ticks,
            yMax: max,
            yMid: max / 2,
            yMin: min,
        };
    }, [points, width, height, now, plotW]);
    if (path === null) {
        return _jsx("div", { className: css.sparkEmpty, style: { width, height }, children: t('waiting') });
    }
    // Y-axis value labels (top/middle/bottom) + faint gridlines.
    const yLabels = [
        { value: path.yMax, y: 8 },
        { value: path.yMid, y: (height - 14 + 8) / 2 },
        { value: path.yMin, y: height - 16 },
    ];
    return (_jsxs("svg", { className: css.spark, viewBox: `0 0 ${width} ${height}`, width: "100%", height: height, preserveAspectRatio: "none", role: "img", "aria-label": t('token'), children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "tokenSparkFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: "0.32" }), _jsx("stop", { offset: "100%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: "0.02" })] }) }), path.kind === 'line' && yLabels.map((label) => (_jsx("line", { x1: AXIS_W, y1: label.y, x2: width, y2: label.y, stroke: "var(--dsw-alias-line-normal)", strokeWidth: "1", vectorEffect: "non-scaling-stroke", opacity: "0.5" }, label.y))), path.kind === 'line' && _jsx("path", { d: path.area, fill: "url(#tokenSparkFill)" }), path.kind === 'line' && _jsx("path", { d: path.line, fill: "none", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "1.6", vectorEffect: "non-scaling-stroke", strokeLinejoin: "round", strokeLinecap: "round" }), _jsx("circle", { cx: path.kind === 'line' ? path.last[0] : path.x, cy: path.kind === 'line' ? path.last[1] : path.y, r: "3", fill: "var(--dsw-alias-bg-module-platform)", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "1.6" }), (path.kind === 'line' || path.kind === 'dot') && (() => {
                const cx = path.kind === 'line' ? path.last[0] : path.x;
                const cy = path.kind === 'line' ? path.last[1] : path.y;
                const text = formatAxisNumber(points[points.length - 1]?.total ?? 0);
                const labelW = text.length * 5 + 8;
                return (_jsxs(_Fragment, { children: [_jsx("line", { x1: AXIS_W, y1: cy, x2: cx, y2: cy, stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "1", vectorEffect: "non-scaling-stroke", strokeDasharray: "3 3", opacity: "0.55" }), _jsx("rect", { x: AXIS_W - labelW - 4, y: cy - 8, width: labelW, height: 13, rx: 6.5, fill: "var(--dsw-alias-state-business-primary)", opacity: "0.9" }), _jsx("text", { x: AXIS_W - labelW / 2 - 4, y: cy + 1.5, textAnchor: "middle", className: css.sparkCurrent, children: text })] }));
            })(), yLabels.map((label) => (_jsx("text", { x: AXIS_W - 5, y: label.y + 3, textAnchor: "end", className: css.sparkYTick, children: formatAxisNumber(label.value) }, label.y))), path.ticks.map((tick) => (_jsx("text", { x: tick.x, y: height - 5, textAnchor: tick.x < 60 ? 'start' : tick.x > width - 60 ? 'end' : 'middle', className: css.sparkTick, children: tickFormat(tick.t) }, tick.t)))] }));
}
/** Collapsed pill shown when the panel is closed. */
function CollapsedChip({ total, cumulative, tps, t }) {
    return (_jsxs("button", { type: "button", className: css.chip, "aria-label": t('openPanel'), children: [_jsx("span", { className: css.chipDot, "aria-hidden": true }), _jsx("span", { className: css.chipLabel, children: "TOKEN" }), _jsx("span", { className: css.chipValue, children: formatNumber(total) }), cumulative !== undefined && (_jsxs("span", { className: css.chipCumulative, children: [t('approx'), formatNumber(cumulative)] })), tps !== undefined && tps > 0 && (_jsxs("span", { className: css.chipTps, children: [tps >= 10 ? Math.round(tps) : tps.toFixed(1), " t/s"] }))] }));
}
/** One session row inside the live view. */
function SessionRow({ row, prices, rangeMs, now, t, onHint, onHintEnd }) {
    const [open, setOpen] = useState(false);
    const usage = row.usage;
    const cost = estimateRowCost(row, prices);
    const used = occupancy(row);
    const label = row.label !== '' ? row.label : row.sessionId.slice(-8);
    // Per-tick consumption deltas: idle ticks drop to zero.
    const history = toConsumption(filterRange(row.history ?? [], now, rangeMs));
    // Cumulative consumption across all buckets (the "usage total").
    const cumulative = usage === undefined
        ? undefined
        : usage.uncachedInputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
    return (_jsxs("div", { className: css.row, "data-open": open, children: [_jsxs("button", { type: "button", className: css.rowHead, onClick: () => { setOpen((current) => !current); }, "aria-expanded": open, children: [_jsxs("span", { className: css.rowName, onPointerEnter: (event) => { onHint(`${row.title ?? ''} ${row.sessionId}`, event.currentTarget); }, onPointerLeave: onHintEnd, children: [_jsx("span", { className: css.rowTitle, children: label }), row.title !== undefined && row.title !== '' && (_jsx("span", { className: css.rowSub, children: row.sessionId.slice(-8) }))] }), _jsxs("span", { className: css.rowTokensWrap, children: [_jsx("span", { className: css.rowTokens, onPointerEnter: (event) => { onHint(t('currentPressure'), event.currentTarget); }, onPointerLeave: onHintEnd, children: formatNumber(row.totalTokens) }), cumulative !== undefined && (_jsxs("span", { className: css.rowCumulative, onPointerEnter: (event) => { onHint(t('cumulativeUsage'), event.currentTarget); }, onPointerLeave: onHintEnd, children: [t('approx'), formatNumber(cumulative)] })), usage !== undefined && (_jsx("span", { className: css.rowCost, onPointerEnter: (event) => { onHint(t('costTitle'), event.currentTarget); }, onPointerLeave: onHintEnd, children: formatCost(cost) }))] }), _jsx("span", { className: css.rowPulse, "data-live": row.live, "aria-hidden": true })] }), open && (_jsxs("div", { className: css.rowDetail, children: [history.length >= 2 && _jsx(Sparkline, { points: history, now: now, t: t }), _jsxs("div", { className: css.detailLine, children: [_jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('input') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.uncachedInputTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('output') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.outputTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('cacheRead') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.cacheReadTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('cacheWrite') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.cacheWriteTokens) })] })] }), _jsxs("div", { className: css.detailLine, children: [_jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('pressure') }), _jsx("span", { className: css.mono, children: row.pressureTokens === undefined ? '—' : formatNumber(row.pressureTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('projected') }), _jsx("span", { className: css.mono, children: row.projectedTokens === undefined ? '—' : formatNumber(row.projectedTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('capacity') }), _jsx("span", { className: css.mono, children: row.contextWindow === undefined ? '—' : formatNumber(row.contextWindow) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('cost') }), _jsx("span", { className: css.mono, children: formatCost(cost) })] })] }), used !== undefined && (_jsx("div", { className: css.barTrack, "aria-label": fill(t('contextBar'), { pct: used.toFixed(0) }), children: _jsx("span", { className: css.barFill, style: { width: `${used}%` }, "data-hot": used > 85 }) }))] }))] }));
}
/** One horizontal usage bar (day or month). */
function StatBar({ label, value, max, input, output, cacheRead, cacheWrite, cost }) {
    const width = max > 0 ? Math.max(2, (value / max) * 100) : 0;
    return (_jsxs("div", { className: css.statRow, children: [_jsx("span", { className: css.statLabel, children: label }), _jsx("span", { className: css.statBarTrack, children: _jsx("span", { className: css.statBarFill, style: { width: `${width}%` } }) }), _jsx("span", { className: css.statValue, children: formatNumber(value) }), _jsx("span", { className: css.statCost, children: formatCost(cost) })] }));
}
/** The stats view: per-month and per-day usage bars, switched separately. */
function StatsView({ stats, t, balance, budgetMonthly }) {
    const [subView, setSubView] = useState('days');
    if (stats === null) {
        return _jsx("span", { className: css.empty, children: t('loading') });
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
    // This month's cost for the budget meter.
    const nowDate = new Date();
    const thisMonthKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`;
    const monthCost = stats.months
        .filter((month) => month.month === thisMonthKey)
        .reduce((sum, month) => sum + estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices), 0);
    return (_jsxs("div", { className: css.statsBody, children: [_jsxs("div", { className: css.statsTotal, children: [_jsx("span", { className: css.statsTotalLabel, children: t('totalLabel') }), _jsx("span", { className: css.mono, children: formatNumber(totalAll) }), _jsxs("span", { className: css.statsTotalSub, children: [t('totalSub'), " \u00B7 ", t('approx'), formatCost(totalCost)] })] }), budgetMonthly > 0 && (_jsxs("div", { className: css.budgetRow, children: [_jsx("span", { className: css.budgetLabel, children: t('budgetLabel') }), _jsx("span", { className: css.budgetTrack, children: _jsx("span", { className: css.budgetFill, style: { width: `${Math.min(100, (monthCost / budgetMonthly) * 100)}%` }, "data-over": monthCost > budgetMonthly }) }), _jsxs("span", { className: css.budgetText, children: [formatCost(monthCost), " / ", formatCost(budgetMonthly), monthCost > budgetMonthly && ` · ${t('budgetOver')}`] })] })), balance?.available === true && balance.value !== undefined && (_jsxs("div", { className: css.balanceRow, children: [_jsx("span", { className: css.budgetLabel, children: t('balanceLabel') }), _jsxs("span", { className: css.balanceValue, children: ["\u00A5", balance.value.toFixed(2)] })] })), hasData && (_jsxs("div", { className: css.viewBar, role: "group", "aria-label": t('granularity'), children: [_jsx("button", { type: "button", className: css.viewButton, "data-active": subView === 'days', onClick: () => { setSubView('days'); }, children: t('byDay') }), _jsx("button", { type: "button", className: css.viewButton, "data-active": subView === 'months', onClick: () => { setSubView('months'); }, children: t('byMonth') })] })), subView === 'months' ? (stats.months.length > 0 ? (_jsxs("section", { className: css.statsSection, children: [_jsxs("header", { className: css.statsSectionHead, children: [t('byMonth'), " \u00B7 ", t('all')] }), monthPoints.length >= 1 && (_jsx("div", { className: css.statsSparkWrap, children: _jsx(Sparkline, { points: monthPoints, now: Date.now(), height: 64, tickFormat: (value) => formatMonthTick(value, t), t: t }) })), stats.months.map((month) => (_jsx(StatBar, { label: monthLabel(month.month, t), value: month.total, max: maxMonth, input: month.input, output: month.output, cacheRead: month.cacheRead, cacheWrite: month.cacheWrite, cost: estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices) }, month.month)))] })) : (_jsx("span", { className: css.empty, children: t('noMonthly') }))) : (stats.days.length > 0 ? (_jsxs("section", { className: css.statsSection, children: [_jsxs("header", { className: css.statsSectionHead, children: [t('byDay'), " \u00B7 ", t('all')] }), dayPoints.length >= 1 && (_jsx("div", { className: css.statsSparkWrap, children: _jsx(Sparkline, { points: dayPoints, now: Date.now(), height: 64, tickFormat: formatDateTick, t: t }) })), stats.days.map((day) => (_jsx(StatBar, { label: dateLabel(day.date, t), value: day.total, max: maxDay, input: day.input, output: day.output, cacheRead: day.cacheRead, cacheWrite: day.cacheWrite, cost: estimateCost(day.input, day.cacheRead, day.cacheWrite, day.output, prices) }, day.date)))] })) : (_jsx("span", { className: css.empty, children: t('noDaily') }))), !hasData && (_jsx("span", { className: css.empty, children: t('noStats') }))] }));
}
/** The top-level HUD: polling, view switching and layout. */
export function TokenHud({ t, sessionsList }) {
    const [snapshot, setSnapshot] = useState(null);
    const [stats, setStats] = useState(null);
    const [balance, setBalance] = useState(null);
    const [view, setView] = useState('live');
    const [open, setOpen] = useState(false);
    const [error, setError] = useState(null);
    const [rangeMs, setRangeMs] = useState(RANGES[1]?.ms ?? 5 * 60_000);
    const [now, setNow] = useState(Date.now());
    const [showAll, setShowAll] = useState(false);
    const inFlight = useRef(false);
    /** User-defined initial position with its display label.
     *  `corner` = system bottom-right; `preset:<id>` = a preset corner;
     *  otherwise a custom dragged position. */
    const [defaultPos, setDefaultPos] = useState(() => {
        try {
            const raw = window.localStorage.getItem('dsh-token-panel-default-pos');
            if (raw === null)
                return null;
            const parsed = JSON.parse(raw);
            if (parsed !== null && typeof parsed === 'object'
                && ((parsed.kind === 'corner')
                    || (parsed.kind === 'preset' && typeof parsed.preset === 'string')
                    || (parsed.kind === 'custom' && typeof parsed.x === 'number' && typeof parsed.y === 'number'))) {
                return parsed;
            }
            return null;
        }
        catch {
            return null;
        }
    });
    // Draggable position: the user-defined default wins on load; otherwise the
    // last dragged position; otherwise the CSS bottom-right corner.
    const [position, setPosition] = useState(() => {
        try {
            const raw = window.localStorage.getItem('dsh-token-panel-default-pos')
                ?? window.localStorage.getItem('dsh-token-panel-pos');
            if (raw === null)
                return null;
            const parsed = JSON.parse(raw);
            if (typeof parsed.x === 'number' && typeof parsed.y === 'number')
                return parsed;
            return null;
        }
        catch {
            return null;
        }
    });
    const dragState = useRef(null);
    /** Timestamp until which pill clicks are swallowed (drag/hold releases).
     *  Timestamp-based so a missed click can never wedge it permanently. */
    const suppressClickUntilRef = useRef(0);
    /** Set when the long-press timer fired (reliable across render closures). */
    const longPressTriggeredRef = useRef(false);
    /** Latest default position, mirrored from state for stale-closure-free reads. */
    const defaultPosRef = useRef(null);
    useEffect(() => { defaultPosRef.current = defaultPos; }, [defaultPos]);
    /** Long-press menu state (opened by holding the pill 600ms without moving). */
    const [pressMenu, setPressMenu] = useState(false);
    /** Position submenu expanded inside the long-press menu. */
    const [pressSubMenu, setPressSubMenu] = useState(false);
    /** "Set default position" capture mode: the next drag saves the position. */
    const [settingDefault, setSettingDefault] = useState(false);
    const settingDefaultRef = useRef(false);
    const setSettingDefaultBoth = (value) => {
        settingDefaultRef.current = value;
        setSettingDefault(value);
    };
    /** Transient confirmation toast text. */
    const [toast, setToast] = useState(null);
    const toastTimerRef = useRef(null);
    const showToast = (text) => {
        setToast(text);
        if (toastTimerRef.current !== null)
            clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => { setToast(null); }, 2200);
    };
    const pressTimerRef = useRef(null);
    const panelRef = useRef(null);
    const hostRef = useRef(null);
    /** Hover hint bubble (JS-driven so it can float over the scrolling rows). */
    const [hint, setHint] = useState(null);
    const hintSeqRef = useRef(0);
    /** Show the auto-fading hint bubble under/above an element. */
    const showHint = (text, el, above = false) => {
        const host = hostRef.current;
        if (host === null)
            return;
        const hostRect = host.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        const cx = Math.min(Math.max(rect.left + rect.width / 2, 130), window.innerWidth - 130);
        hintSeqRef.current += 1;
        setHint({
            key: hintSeqRef.current,
            text,
            x: cx - hostRect.left,
            y: (above ? rect.top - hostRect.top - 8 : rect.bottom - hostRect.top + 8),
            above,
        });
    };
    /** Dismiss the hint bubble (pointer left, or the 2s animation ended). */
    const hideHint = () => { setHint(null); };
    // When the panel OPENS at a dragged (left/top) position, nudge it back
    // inside the viewport once so it renders fully. Runs only on the open
    // transition — dragging afterwards keeps the 48px overhang behavior.
    useLayoutEffect(() => {
        if (!open || panelRef.current === null)
            return;
        const rect = panelRef.current.getBoundingClientRect();
        const maxX = Math.max(8, window.innerWidth - rect.width - 8);
        const maxY = Math.max(8, window.innerHeight - rect.height - 8);
        setPosition((current) => {
            if (current === null)
                return current;
            const x = Math.min(Math.max(current.x, 8), maxX);
            const y = Math.min(Math.max(current.y, 8), maxY);
            return x === current.x && y === current.y ? current : { x, y };
        });
    }, [open]);
    // Close the long-press menu on any outside pointerdown.
    useEffect(() => {
        if (!pressMenu)
            return;
        const onOutside = (event) => {
            const target = event.target;
            if (target !== null && target.closest('[data-press-menu]') !== null)
                return;
            setPressMenu(false);
        };
        document.addEventListener('pointerdown', onOutside);
        return () => { document.removeEventListener('pointerdown', onOutside); };
    }, [pressMenu]);
    const onDragStart = (event) => {
        // Anchor on the element's current on-screen position, not (0,0) —
        // the default state is CSS right/bottom (bottom-right corner).
        const rect = event.currentTarget.getBoundingClientRect();
        const baseX = position?.x ?? rect.left;
        const baseY = position?.y ?? rect.top;
        // Measure the whole HUD once at drag start (stable while dragging).
        const hostEl = event.currentTarget.closest('[data-token-hud]');
        const hostRect = hostEl !== null ? hostEl.getBoundingClientRect() : rect;
        dragState.current = {
            startX: event.clientX,
            startY: event.clientY,
            pointerId: event.pointerId,
            baseX,
            baseY,
            width: hostRect.width,
            height: hostRect.height,
            moved: false,
            last: { x: baseX, y: baseY },
        };
        // Long-press detection: holding still for 600ms opens the corner menu.
        if (pressTimerRef.current !== null)
            clearTimeout(pressTimerRef.current);
        longPressTriggeredRef.current = false;
        pressTimerRef.current = setTimeout(() => {
            const drag = dragState.current;
            if (drag === null || drag.moved)
                return;
            // Fired from a still hold: show the menu and swallow the release click.
            longPressTriggeredRef.current = true;
            setPressMenu(true);
            suppressClickUntilRef.current = Date.now() + 600;
        }, 600);
    };
    /** Pill release: open the panel unless this was a drag or a long-press.
     *  Driven by pointerup (not click), which pointer capture cannot steal. */
    const onPillPointerUp = () => {
        const drag = dragState.current;
        const moved = drag?.moved ?? false;
        const menuShown = longPressTriggeredRef.current;
        onDragEnd();
        if (!moved && !menuShown)
            setOpen(true);
    };
    const onDragMove = (event) => {
        const drag = dragState.current;
        if (drag === null)
            return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        // Ignore jitter: only move after a 4px threshold, so plain clicks on
        // the title never nudge the panel.
        if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4)
            return;
        if (!drag.moved) {
            // Only capture the pointer once a genuine drag starts. Capturing on
            // pointerdown would retarget the release click away from inner
            // buttons (making the pill impossible to open with a single click).
            drag.moved = true;
            try {
                event.currentTarget.setPointerCapture(drag.pointerId);
            }
            catch {
                // Capture unavailable; the drag still works while over the element.
            }
        }
        // Movement cancels the long-press timer (this is a drag, not a hold).
        if (pressTimerRef.current !== null) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
        const rawX = drag.baseX + dx;
        const rawY = drag.baseY + dy;
        // Clamp with a visible sliver: the HUD may hang off-screen but must keep
        // a grabbable strip reachable. The whole HEADER is the panel's drag
        // handle (header height ~46px), so the panel may go negative until only
        // ~24px of the header stays visible — far enough to "cover" the screen
        // top, near enough to always grab back. The pill never leaves the screen.
        const HEADER_VISIBLE = 24;
        const handleW = open ? drag.width : drag.width;
        const minX = open ? -(drag.width - HEADER_VISIBLE) : 0;
        const maxX = window.innerWidth - (open ? HEADER_VISIBLE : drag.width + 8);
        const handleH = open ? 46 : drag.height;
        const minY = open ? -(handleH - HEADER_VISIBLE) : 0;
        const maxY = window.innerHeight - (open ? HEADER_VISIBLE : drag.height + 8);
        drag.last = {
            x: Math.min(Math.max(rawX, minX), Math.max(maxX, minX)),
            y: Math.min(Math.max(rawY, minY), Math.max(maxY, minY)),
        };
        setPosition(drag.last);
    };
    const onDragEnd = () => {
        if (pressTimerRef.current !== null) {
            clearTimeout(pressTimerRef.current);
            pressTimerRef.current = null;
        }
        const drag = dragState.current;
        if (drag === null)
            return;
        const moved = drag.moved;
        const final = drag.last;
        dragState.current = null;
        if (moved) {
            if (settingDefaultRef.current) {
                // Capture mode: this drag defines the new custom default position.
                const next = { kind: 'custom', x: final.x, y: final.y };
                setDefaultPos(next);
                setSettingDefaultBoth(false);
                showToast(t('defaultSaved'));
                try {
                    window.localStorage.setItem('dsh-token-panel-default-pos', JSON.stringify(next));
                }
                catch {
                    // Storage unavailable; the default simply resets next load.
                }
            }
            // Suppress the click that fires after a genuine drag, so dragging the
            // collapsed pill moves it without opening the panel.
            suppressClickUntilRef.current = Date.now() + 600;
            try {
                // Persist the ref-tracked final position (never a stale closure value).
                window.localStorage.setItem('dsh-token-panel-pos', JSON.stringify(final));
            }
            catch {
                // Storage unavailable; position simply resets next load.
            }
        }
    };
    /** Back to the user-defined default position (preset or custom).
     *  When the panel is open, the target is clamped so it lands fully
     *  visible — otherwise an off-screen target looks like "nothing moved". */
    const goToDefault = () => {
        const def = defaultPosRef.current;
        let target;
        if (def === null || def.kind === 'corner') {
            target = null;
        }
        else if (def.kind === 'preset') {
            target = presetCornerPosition(def.preset, hudSize());
        }
        else {
            target = { x: def.x, y: def.y };
        }
        if (target !== null && open && panelRef.current !== null) {
            const rect = panelRef.current.getBoundingClientRect();
            const maxX = Math.max(8, window.innerWidth - rect.width - 8);
            const maxY = Math.max(8, window.innerHeight - rect.height - 8);
            target = {
                x: Math.min(Math.max(target.x, 8), maxX),
                y: Math.min(Math.max(target.y, 8), maxY),
            };
        }
        setPosition(target);
        setPressMenu(false);
        setSettingDefaultBoth(false);
        showToast(def === null || def.kind === 'corner'
            ? t('backToCornerDone')
            : def.kind === 'preset'
                ? fill(t('defaultSetTo'), { pos: cornerLabel(def.preset, t) })
                : t('backToCustomDone'));
        try {
            window.localStorage.removeItem('dsh-token-panel-pos');
        }
        catch {
            // Storage unavailable; position simply resets next load.
        }
    };
    /** Current HUD dimensions for preset math (panel when open, pill fallback). */
    const hudSize = () => {
        if (open && panelRef.current !== null) {
            const rect = panelRef.current.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
        }
        const hostEl = document.querySelector('[data-token-hud]');
        if (hostEl !== null) {
            const rect = hostEl.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0)
                return { width: rect.width, height: rect.height };
        }
        return { width: 360, height: 520 };
    };
    /** Apply a preset corner as the default position (and move there now). */
    const applyPreset = (preset) => {
        const next = { kind: 'preset', preset };
        setDefaultPos(next);
        let target = presetCornerPosition(preset, hudSize());
        if (open && panelRef.current !== null) {
            const rect = panelRef.current.getBoundingClientRect();
            const maxX = Math.max(8, window.innerWidth - rect.width - 8);
            const maxY = Math.max(8, window.innerHeight - rect.height - 8);
            target = {
                x: Math.min(Math.max(target.x, 8), maxX),
                y: Math.min(Math.max(target.y, 8), maxY),
            };
        }
        setPosition(target);
        setPressMenu(false);
        setSettingDefaultBoth(false);
        showToast(fill(t('defaultSetTo'), { pos: cornerLabel(preset, t) }));
        try {
            window.localStorage.setItem('dsh-token-panel-default-pos', JSON.stringify(next));
            window.localStorage.removeItem('dsh-token-panel-pos');
        }
        catch {
            // Storage unavailable; the default simply resets next load.
        }
    };
    /** Enter capture mode: the next drag saves the position as the default. */
    const startSetDefault = () => {
        setPressMenu(false);
        setSettingDefaultBoth(true);
        showToast(t('setDefaultHint'));
    };
    // Current session id from the session list (follows the open conversation).
    const currentSessionId = useSyncExternalStore(sessionsList.subscribe, sessionsList.getSnapshot).current;
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
    // Stats poll at a slower cadence; switching to the stats view refreshes immediately.
    const statsInFlight = useRef(false);
    const fetchStats = async () => {
        if (statsInFlight.current)
            return;
        statsInFlight.current = true;
        try {
            const response = await fetch(STATS_URL, { cache: 'no-store' });
            if (!response.ok)
                return;
            const body = (await response.json());
            if (Array.isArray(body.days))
                setStats(body);
        }
        catch {
            // Keep the last stats snapshot.
        }
        finally {
            statsInFlight.current = false;
        }
    };
    useEffect(() => {
        let cancelled = false;
        if (view === 'stats')
            void fetchStats();
        const timer = setInterval(() => { if (!cancelled)
            void fetchStats(); }, STATS_POLL_MS);
        return () => {
            cancelled = true;
            clearInterval(timer);
        };
    }, [view]);
    // Balance poll (5 min cadence; the host caches its own fetch).
    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            try {
                const response = await fetch(BALANCE_URL, { cache: 'no-store' });
                if (!response.ok)
                    return;
                const body = (await response.json());
                if (!cancelled)
                    setBalance(body);
            }
            catch {
                // Keep the last balance snapshot.
            }
        };
        void tick();
        const timer = setInterval(() => { void tick(); }, BALANCE_POLL_MS);
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
        let cumulative = 0;
        for (const row of snapshot.sessions) {
            total += row.totalTokens;
            output += row.usage?.outputTokens ?? 0;
            cumulative += (row.usage?.uncachedInputTokens ?? 0)
                + (row.usage?.outputTokens ?? 0)
                + (row.usage?.cacheReadTokens ?? 0)
                + (row.usage?.cacheWriteTokens ?? 0);
        }
        return { total, output, cumulative };
    }, [snapshot]);
    const prices = snapshot?.prices ?? { input: 1, cacheRead: 0.02, output: 2 };
    const tps = snapshot?.tps ?? 0;
    const budgetMonthly = snapshot?.budgetMonthly ?? 0;
    const topHistory = useMemo(() => {
        if (snapshot === null || snapshot.sessions.length === 0)
            return [];
        // Prefer the current (open) session's curve; fall back to the largest.
        const current = currentSessionId !== undefined
            ? snapshot.sessions.find((row) => row.sessionId === currentSessionId)
            : undefined;
        const source = current ?? snapshot.sessions[0];
        // Per-tick consumption deltas: idle ticks drop to zero.
        return toConsumption(filterRange(source?.history ?? [], now, rangeMs));
    }, [snapshot, now, rangeMs, currentSessionId]);
    const dragHandlers = {
        onPointerDown: onDragStart,
        onPointerMove: onDragMove,
        onPointerUp: onDragEnd,
        onPointerLeave: onDragEnd,
    };
    const hostStyle = position !== null
        ? { right: 'auto', bottom: 'auto', left: position.x, top: position.y }
        : {};
    if (snapshot === null) {
        return (_jsx("div", { ref: hostRef, className: css.host, style: { ...hostStyle, cursor: 'grab' }, "data-token-hud": true, ...dragHandlers, onPointerUp: onPillPointerUp, children: _jsx(CollapsedChip, { total: 0, t: t }) }));
    }
    return (_jsxs("div", { ref: hostRef, className: css.host, style: hostStyle, "data-token-hud": true, children: [pressMenu && (_jsxs("div", { className: css.pressMenu, "data-press-menu": true, children: [_jsx("button", { type: "button", className: css.pressMenuItem, onClick: () => { goToDefault(); suppressClickUntilRef.current = 0; }, children: _jsxs("span", { className: css.pressMenuLabel, children: [_jsx(MenuIcon, { d: defaultPos === null || defaultPos.kind === 'corner'
                                        ? ICON_CORNER.br
                                        : defaultPos.kind === 'preset'
                                            ? ICON_CORNER[defaultPos.preset]
                                            : ICON_CROSSHAIR }), defaultPos === null || defaultPos.kind === 'corner'
                                    ? t('backToCorner')
                                    : defaultPos.kind === 'preset'
                                        ? `${t('backToDefault')} · ${cornerLabel(defaultPos.preset, t)}`
                                        : t('backToCustom')] }) }), _jsxs("button", { type: "button", className: css.pressMenuItem, onClick: () => { setPressSubMenu((current) => !current); }, "aria-expanded": pressSubMenu, children: [_jsxs("span", { className: css.pressMenuLabel, children: [_jsx(MenuIcon, { d: ICON_CROSSHAIR }), t('positionMenu')] }), _jsx("span", { className: css.pressMenuCaret, children: "\u25B8" })] }), pressSubMenu && (_jsxs("div", { className: css.pressSubMenu, "data-press-menu": true, children: [['tr', 'tl', 'bl', 'br'].map((preset) => (_jsx("button", { type: "button", className: css.pressMenuItem, onClick: () => { applyPreset(preset); suppressClickUntilRef.current = 0; }, children: _jsxs("span", { className: css.pressMenuLabel, children: [_jsx(MenuIcon, { d: ICON_CORNER[preset] }), cornerLabel(preset, t)] }) }, preset))), _jsx("button", { type: "button", className: css.pressMenuItem, onClick: () => { startSetDefault(); suppressClickUntilRef.current = 0; }, children: _jsxs("span", { className: css.pressMenuLabel, children: [_jsx(MenuIcon, { d: ICON_CROSSHAIR }), t('customPos')] }) })] })), _jsx("button", { type: "button", className: css.pressMenuItem, onClick: () => { setPressMenu(false); setPressSubMenu(false); }, children: _jsx("span", { className: css.pressMenuLabel, children: t('cancelMenu') }) })] })), toast !== null && (_jsx("div", { className: css.toast, "data-toast": true, children: toast })), hint !== null && (_jsx("div", { className: css.rowHint, "data-above": hint.above || undefined, style: { left: hint.x, top: hint.y }, onAnimationEnd: hideHint, children: hint.text }, hint.key)), !open && (_jsx("div", { ...dragHandlers, style: { cursor: 'grab' }, onPointerUp: onPillPointerUp, "data-hud-handle": true, "data-hud-hint": t('hoverHint'), children: _jsx(CollapsedChip, { total: totals.total, cumulative: totals.cumulative, tps: tps, t: t }) })), open && (_jsxs("aside", { className: css.panel, "data-token-panel": true, ref: panelRef, children: [_jsxs("header", { className: css.head, ...dragHandlers, "data-hud-handle": true, "data-hud-hint": t('hoverHint'), children: [_jsxs("span", { className: css.title, children: [_jsx("span", { className: css.titleMark, "aria-hidden": true }), t('token')] }), _jsxs("div", { className: css.viewBar, role: "group", "aria-label": t('viewSwitch'), onPointerDown: (event) => { event.stopPropagation(); }, children: [_jsx("button", { type: "button", className: css.viewButton, "data-active": view === 'live', onClick: () => { setView('live'); }, children: t('live') }), _jsx("button", { type: "button", className: css.viewButton, "data-active": view === 'stats', onClick: () => { setView('stats'); }, children: t('stats') })] }), _jsx("button", { type: "button", className: css.closeButton, onClick: () => { setOpen(false); }, onPointerDown: (event) => { event.stopPropagation(); }, "aria-label": t('close'), children: "\u2715" })] }), view === 'live' ? (_jsxs(_Fragment, { children: [topHistory.length >= 2 && (_jsxs("div", { className: css.sparkWrap, children: [_jsx("div", { className: css.rangeBar, role: "group", "aria-label": t('timeRange'), children: RANGES.map((range) => (_jsx("button", { type: "button", className: css.rangeButton, "data-active": range.ms === rangeMs, onClick: () => { setRangeMs(range.ms); }, children: range.label }, range.label))) }), _jsx(Sparkline, { points: topHistory, now: now, t: t })] })), _jsx("div", { className: css.body, children: (() => {
                                    // The current (open) conversation is always shown first;
                                    // other sessions are hidden unless "show all" is toggled.
                                    const current = currentSessionId !== undefined
                                        ? snapshot.sessions.find((row) => row.sessionId === currentSessionId)
                                        : undefined;
                                    const others = snapshot.sessions.filter((row) => row.sessionId !== current?.sessionId);
                                    const rows = current !== undefined
                                        ? [current, ...(showAll ? others : [])]
                                        : (showAll ? snapshot.sessions : snapshot.sessions.slice(0, 3));
                                    if (rows.length === 0 && others.length === 0) {
                                        return _jsx("span", { className: css.empty, children: t('noSessions') });
                                    }
                                    return (_jsxs(_Fragment, { children: [rows.map((row) => (_jsx(SessionRow, { row: row, prices: prices, rangeMs: rangeMs, now: now, t: t, onHint: showHint, onHintEnd: hideHint }, row.sessionId))), !showAll && others.length > 0 && (_jsx("button", { type: "button", className: css.moreButton, onClick: () => { setShowAll(true); }, children: fill(t('expandAll'), { count: others.length }) })), showAll && others.length > 0 && (_jsx("button", { type: "button", className: css.moreButton, onClick: () => { setShowAll(false); }, children: t('collapseAll') }))] }));
                                })() })] })) : (_jsx("div", { className: css.body, children: _jsx(StatsView, { stats: stats, t: t, balance: balance, budgetMonthly: budgetMonthly }) })), _jsxs("footer", { className: css.foot, children: [_jsxs("span", { className: css.footHint, children: [error !== null
                                        ? fill(t('disconnected'), { error })
                                        : view === 'live'
                                            ? fill(t('pollLive'), { total: formatNumber(totals.total), out: formatNumber(totals.output) })
                                            : t('pollStats'), tps > 0 && (_jsxs("span", { className: css.footTps, children: [" \u00B7 ", tps >= 10 ? Math.round(tps) : tps.toFixed(1), " t/s"] })), prices.mode !== undefined && prices.mode !== 'flat' && (_jsx("span", { className: css.footPrice, "data-mode": prices.mode, children: prices.mode === 'peak' ? t('pricePeak') : t('priceOffpeak') }))] }), _jsxs("span", { className: css.footRight, children: [balance?.available === true && balance.value !== undefined && (_jsxs("span", { className: css.footBalance, onPointerEnter: (event) => { showHint(t('balanceTitle'), event.currentTarget, true); }, onPointerLeave: hideHint, children: ["\u00A5", balance.value.toFixed(2)] })), _jsx("span", { className: css.mono, children: new Date(snapshot.generatedAt).toLocaleTimeString() })] })] })] }))] }));
}
