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
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
/**
 * Sparkline: renders the timestamped history as an SVG area chart with
 * ticks on the bottom axis. Pass `tickFormat` for non-time scales (e.g.
 * daily/monthly stats).
 */
function Sparkline({ points, now, width = 336, height = 72, tickFormat = formatTime, t }) {
    const path = useMemo(() => {
        if (points.length === 0)
            return null;
        // Single point: render a centered dot with its tick (curve needs 2+).
        if (points.length === 1) {
            const only = points[0];
            if (only === undefined)
                return null;
            return {
                kind: 'dot',
                x: width / 2,
                y: height / 2 - 6,
                t: only.t,
                ticks: [{ t: only.t, x: width / 2 }],
            };
        }
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
        return { kind: 'line', line, area, last, ticks };
    }, [points, width, height, now]);
    if (path === null) {
        return _jsx("div", { className: css.sparkEmpty, style: { width, height }, children: t('waiting') });
    }
    return (_jsxs("svg", { className: css.spark, viewBox: `0 0 ${width} ${height}`, width: "100%", height: height, preserveAspectRatio: "none", role: "img", "aria-label": t('token'), children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "tokenSparkFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "0%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: "0.32" }), _jsx("stop", { offset: "100%", stopColor: "var(--dsw-alias-state-business-primary)", stopOpacity: "0.02" })] }) }), path.kind === 'line' && _jsx("path", { d: path.area, fill: "url(#tokenSparkFill)" }), path.kind === 'line' && _jsx("path", { d: path.line, fill: "none", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "1.6", vectorEffect: "non-scaling-stroke", strokeLinejoin: "round", strokeLinecap: "round" }), _jsx("circle", { cx: path.kind === 'line' ? path.last[0] : path.x, cy: path.kind === 'line' ? path.last[1] : path.y, r: "3", fill: "var(--dsw-alias-bg-module-platform)", stroke: "var(--dsw-alias-state-business-primary)", strokeWidth: "1.6" }), path.ticks.map((tick) => (_jsx("text", { x: tick.x, y: height - 3, textAnchor: "middle", className: css.sparkTick, children: tickFormat(tick.t) }, tick.t)))] }));
}
/** Collapsed pill shown when the panel is closed. */
function CollapsedChip({ total, cumulative, tps, onClick, t }) {
    return (_jsxs("button", { type: "button", className: css.chip, onClick: onClick, "aria-label": t('openPanel'), children: [_jsx("span", { className: css.chipDot, "aria-hidden": true }), _jsx("span", { className: css.chipLabel, children: "TOKEN" }), _jsx("span", { className: css.chipValue, children: formatNumber(total) }), cumulative !== undefined && (_jsxs("span", { className: css.chipCumulative, children: [t('approx'), formatNumber(cumulative)] })), tps !== undefined && tps > 0 && (_jsxs("span", { className: css.chipTps, children: [tps >= 10 ? Math.round(tps) : tps.toFixed(1), " t/s"] }))] }));
}
/** One session row inside the live view. */
function SessionRow({ row, prices, rangeMs, now, t }) {
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
    return (_jsxs("div", { className: css.row, "data-open": open, children: [_jsxs("button", { type: "button", className: css.rowHead, onClick: () => { setOpen((current) => !current); }, "aria-expanded": open, children: [_jsxs("span", { className: css.rowName, title: `${row.title ?? ''} ${row.sessionId}`, children: [_jsx("span", { className: css.rowTitle, children: label }), row.title !== undefined && row.title !== '' && (_jsx("span", { className: css.rowSub, children: row.sessionId.slice(-8) }))] }), _jsxs("span", { className: css.rowTokensWrap, children: [_jsx("span", { className: css.rowTokens, title: t('currentPressure'), children: formatNumber(row.totalTokens) }), cumulative !== undefined && (_jsxs("span", { className: css.rowCumulative, title: t('cumulativeUsage'), children: [t('approx'), formatNumber(cumulative)] }))] }), _jsx("span", { className: css.rowPulse, "data-live": row.live, "aria-hidden": true })] }), open && (_jsxs("div", { className: css.rowDetail, children: [history.length >= 2 && _jsx(Sparkline, { points: history, now: now, t: t }), _jsxs("div", { className: css.detailLine, children: [_jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('input') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.uncachedInputTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('output') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.outputTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('cacheRead') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.cacheReadTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('cacheWrite') }), _jsx("span", { className: css.mono, children: usage === undefined ? '—' : formatNumber(usage.cacheWriteTokens) })] })] }), _jsxs("div", { className: css.detailLine, children: [_jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('pressure') }), _jsx("span", { className: css.mono, children: row.pressureTokens === undefined ? '—' : formatNumber(row.pressureTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('projected') }), _jsx("span", { className: css.mono, children: row.projectedTokens === undefined ? '—' : formatNumber(row.projectedTokens) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('capacity') }), _jsx("span", { className: css.mono, children: row.contextWindow === undefined ? '—' : formatNumber(row.contextWindow) })] }), _jsxs("span", { className: css.detailItem, children: [_jsx("span", { className: css.detailLabel, children: t('cost') }), _jsx("span", { className: css.mono, children: formatCost(cost) })] })] }), used !== undefined && (_jsx("div", { className: css.barTrack, "aria-label": fill(t('contextBar'), { pct: used.toFixed(0) }), children: _jsx("span", { className: css.barFill, style: { width: `${used}%` }, "data-hot": used > 85 }) }))] }))] }));
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
    // Draggable position (persisted in localStorage; null = CSS default bottom-right).
    const [position, setPosition] = useState(() => {
        try {
            const raw = window.localStorage.getItem('dsh-token-panel-pos');
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
    const onDragStart = (event) => {
        // Anchor on the element's current on-screen position, not (0,0) —
        // the default state is CSS right/bottom (bottom-right corner).
        const rect = event.currentTarget.getBoundingClientRect();
        dragState.current = {
            startX: event.clientX,
            startY: event.clientY,
            baseX: position?.x ?? rect.left,
            baseY: position?.y ?? rect.top,
        };
    };
    const onDragMove = (event) => {
        const drag = dragState.current;
        if (drag === null)
            return;
        setPosition({
            x: drag.baseX + (event.clientX - drag.startX),
            y: drag.baseY + (event.clientY - drag.startY),
        });
    };
    const onDragEnd = () => {
        const drag = dragState.current;
        if (drag === null)
            return;
        dragState.current = null;
        try {
            window.localStorage.setItem('dsh-token-panel-pos', JSON.stringify(position));
        }
        catch {
            // Storage unavailable; position simply resets next load.
        }
    };
    /** Reset to the default bottom-right corner and forget the saved position. */
    const resetPosition = () => {
        setPosition(null);
        try {
            window.localStorage.removeItem('dsh-token-panel-pos');
        }
        catch {
            // Storage unavailable; position simply resets next load.
        }
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
        return filterRange(source?.history ?? [], now, rangeMs);
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
        return (_jsx("div", { className: css.host, style: hostStyle, children: _jsx(CollapsedChip, { total: 0, onClick: () => { setOpen(true); }, t: t }) }));
    }
    return (_jsxs("div", { className: css.host, style: hostStyle, children: [!open && (_jsx("div", { ...dragHandlers, style: { cursor: 'grab' }, children: _jsx(CollapsedChip, { total: totals.total, cumulative: totals.cumulative, tps: tps, onClick: () => { setOpen(true); }, t: t }) })), open && (_jsxs("aside", { className: css.panel, "data-token-panel": true, children: [_jsxs("header", { className: css.head, ...dragHandlers, children: [_jsxs("span", { className: css.title, children: [_jsx("span", { className: css.titleMark, "aria-hidden": true }), t('token')] }), _jsxs("div", { className: css.viewBar, role: "group", "aria-label": t('viewSwitch'), children: [_jsx("button", { type: "button", className: css.viewButton, "data-active": view === 'live', onClick: () => { setView('live'); }, children: t('live') }), _jsx("button", { type: "button", className: css.viewButton, "data-active": view === 'stats', onClick: () => { setView('stats'); }, children: t('stats') })] }), _jsx("button", { type: "button", className: css.closeButton, onClick: () => { resetPosition(); setOpen(false); }, "aria-label": t('close'), children: "\u2715" })] }), view === 'live' ? (_jsxs(_Fragment, { children: [topHistory.length >= 2 && (_jsxs("div", { className: css.sparkWrap, children: [_jsx("div", { className: css.rangeBar, role: "group", "aria-label": t('timeRange'), children: RANGES.map((range) => (_jsx("button", { type: "button", className: css.rangeButton, "data-active": range.ms === rangeMs, onClick: () => { setRangeMs(range.ms); }, children: range.label }, range.label))) }), _jsx(Sparkline, { points: topHistory, now: now, t: t })] })), _jsx("div", { className: css.body, children: (() => {
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
                                    return (_jsxs(_Fragment, { children: [rows.map((row) => (_jsx(SessionRow, { row: row, prices: prices, rangeMs: rangeMs, now: now, t: t }, row.sessionId))), !showAll && others.length > 0 && (_jsx("button", { type: "button", className: css.moreButton, onClick: () => { setShowAll(true); }, children: fill(t('expandAll'), { count: others.length }) })), showAll && others.length > 0 && (_jsx("button", { type: "button", className: css.moreButton, onClick: () => { setShowAll(false); }, children: t('collapseAll') }))] }));
                                })() })] })) : (_jsx("div", { className: css.body, children: _jsx(StatsView, { stats: stats, t: t, balance: balance, budgetMonthly: budgetMonthly }) })), _jsxs("footer", { className: css.foot, children: [_jsxs("span", { className: css.footHint, children: [error !== null
                                        ? fill(t('disconnected'), { error })
                                        : view === 'live'
                                            ? fill(t('pollLive'), { total: formatNumber(totals.total), out: formatNumber(totals.output) })
                                            : t('pollStats'), tps > 0 && (_jsxs("span", { className: css.footTps, children: [" \u00B7 ", tps >= 10 ? Math.round(tps) : tps.toFixed(1), " t/s"] })), prices.mode !== undefined && prices.mode !== 'flat' && (_jsx("span", { className: css.footPrice, "data-mode": prices.mode, children: prices.mode === 'peak' ? t('pricePeak') : t('priceOffpeak') }))] }), _jsxs("span", { className: css.footRight, children: [balance?.available === true && balance.value !== undefined && (_jsxs("span", { className: css.footBalance, title: t('balanceTitle'), children: ["\u00A5", balance.value.toFixed(2)] })), _jsx("span", { className: css.mono, children: new Date(snapshot.generatedAt).toLocaleTimeString() })] })] })] }))] }));
}
