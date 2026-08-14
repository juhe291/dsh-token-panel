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

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { ObservableSnapshot, SessionListState } from '@deepseek-ai/dsh-client-runtime/client'
import css from './TokenHud.module.css'

/** Host routes. */
const SNAPSHOT_URL = '/plugins/dsh-token-panel/snapshot'
const STATS_URL = '/plugins/dsh-token-panel/stats'
const BALANCE_URL = '/plugins/dsh-token-panel/balance'
/** Poll cadence (ms); keep in sync with the host default. */
const POLL_MS = 1500
/** Stats poll cadence (ms) — daily totals move slowly. */
const STATS_POLL_MS = 10_000
/** Balance poll cadence (ms) — the host caches its own 5-min fetch. */
const BALANCE_POLL_MS = 60_000

/** Time-range options for the history curve. */
const RANGES: readonly { label: string; ms: number }[] = [
  { label: '2m', ms: 2 * 60_000 },
  { label: '5m', ms: 5 * 60_000 },
  { label: '15m', ms: 15 * 60_000 },
]

/** One session's token row as served by the host. */
export interface SessionTokenRow {
  readonly sessionId: string
  readonly live: boolean
  /** Display label: session title when available, else the id tail. */
  readonly label: string
  /** Session title text when the title service has one. */
  readonly title?: string
  readonly totalTokens: number
  readonly surfaceTokens: number
  readonly usage?: {
    readonly uncachedInputTokens: number
    readonly outputTokens: number
    readonly cacheReadTokens: number
    readonly cacheWriteTokens: number
  }
  readonly pressureTokens?: number
  readonly projectedTokens?: number
  readonly contextWindow?: number
  readonly systemTokens: number
  readonly toolsTokens: number
  readonly messageTokens: number
  /** Rolling history of total pressure per poll tick (oldest first). */
  readonly history?: readonly HistoryPoint[]
}

/** One timestamped history sample. */
export interface HistoryPoint {
  readonly t: number
  readonly total: number
  /** Cumulative output tokens at that sample. */
  readonly output?: number
}

/** Aggregate snapshot body. */
export interface TokenSnapshot {
  readonly generatedAt: number
  readonly sessions: readonly SessionTokenRow[]
  readonly prices?: PriceEstimate
  /** Aggregate generation speed (output tokens per second). */
  readonly tps?: number
  /** Monthly budget in CNY (0 = disabled). */
  readonly budgetMonthly?: number
}

/** One day's usage aggregate. */
export interface DayStat {
  readonly date: string
  readonly input: number
  readonly output: number
  readonly cacheRead: number
  readonly cacheWrite: number
  readonly total: number
}

/** One month's usage aggregate. */
export interface MonthStat {
  readonly month: string
  readonly input: number
  readonly output: number
  readonly cacheRead: number
  readonly cacheWrite: number
  readonly total: number
}

/** Durable statistics payload. */
export interface TokenStats {
  readonly generatedAt: number
  readonly days: readonly DayStat[]
  readonly months: readonly MonthStat[]
  readonly prices?: PriceEstimate
}

/** Display-only price estimate (CNY per 1M tokens). */
export interface PriceEstimate {
  readonly input: number
  readonly cacheRead: number
  readonly output: number
  readonly mode?: 'flat' | 'peak' | 'offpeak'
}

/** Account balance snapshot from the balance route. */
export interface BalanceInfo {
  readonly available: boolean
  readonly value?: number
  readonly currency?: string
  readonly at?: number
}

/** The user-defined default position (discriminated union). */
export type DefaultPos =
  | { readonly kind: 'corner' }
  | { readonly kind: 'preset'; readonly preset: 'tl' | 'tr' | 'bl' | 'br' }
  | { readonly kind: 'custom'; readonly x: number; readonly y: number }

/** Preset corner → screen coordinates. Accepts the actual HUD size so the
 *  bottom corners land on the true bottom edge (not offset by a guess). */
function presetCornerPosition(preset: 'tl' | 'tr' | 'bl' | 'br', size?: { width: number; height: number }): { x: number; y: number } {
  const margin = 12
  const w = size?.width ?? 360
  const h = size?.height ?? 520
  const maxX = Math.max(margin, window.innerWidth - w - margin)
  const maxY = Math.max(margin, window.innerHeight - h - margin)
  switch (preset) {
    case 'tl': return { x: margin, y: margin }
    case 'tr': return { x: maxX, y: margin }
    case 'bl': return { x: margin, y: maxY }
    case 'br': return { x: maxX, y: maxY }
  }
}

/** Localized label for a preset corner id. */
function cornerLabel(preset: 'tl' | 'tr' | 'bl' | 'br', t: Translate): string {
  switch (preset) {
    case 'tl': return t('cornerTL')
    case 'tr': return t('cornerTR')
    case 'bl': return t('cornerBL')
    case 'br': return t('cornerBR')
  }
}

/** Small stroke icons for the long-press menu (match the DSH icon style). */
function MenuIcon({ d }: { readonly d: string }) {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"
      fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

/** Icon paths: back-arrow, crosshair (custom), corner brackets (presets). */
const ICON_BACK = 'M3 8h8M8.5 4.5 12 8l-3.5 3.5M13 3v10'
const ICON_CROSSHAIR = 'M8 1.5v3m0 7v3M1.5 8h3m7 0h3M8 8l.01 0M8 5.8A2.2 2.2 0 1 0 8 10.2 2.2 2.2 0 0 0 8 5.8Z'
const ICON_CORNER: Record<'tl' | 'tr' | 'bl' | 'br', string> = {
  // Pure L-brackets (no stray diagonals): the bracket points INTO the corner.
  tl: 'M1.5 6V1.5H6',
  tr: 'M10 1.5h4.5V6',
  bl: 'M1.5 10v4.5H6',
  br: 'M14.5 10v4.5H10',
}

/** Localized copy contract for the HUD (en/zh dictionaries in index.tsx). */
export interface TokenHudLocale {
  readonly token: string
  readonly live: string
  readonly stats: string
  readonly close: string
  readonly byDay: string
  readonly byMonth: string
  readonly all: string
  readonly totalLabel: string
  readonly totalSub: string
  readonly approx: string
  readonly currentPressure: string
  readonly cumulativeUsage: string
  /** Template: '{count}' is replaced with the session count. */
  readonly expandAll: string
  readonly collapseAll: string
  readonly noSessions: string
  readonly waiting: string
  readonly noStats: string
  readonly noDaily: string
  readonly noMonthly: string
  readonly loading: string
  readonly input: string
  readonly output: string
  readonly cacheRead: string
  readonly cacheWrite: string
  readonly pressure: string
  readonly projected: string
  readonly capacity: string
  readonly cost: string
  /** Tooltip for the session row cost figure. */
  readonly costTitle: string
  readonly today: string
  readonly yesterday: string
  readonly thisMonth: string
  /** Month label template: '{y}' year, '{m}' month number. */
  readonly monthFmt: string
  /** Template: '{total}' and '{out}' are replaced with formatted numbers. */
  readonly pollLive: string
  readonly pollStats: string
  readonly pricePeak: string
  readonly priceOffpeak: string
  readonly balanceTitle: string
  readonly balanceLabel: string
  readonly budgetLabel: string
  readonly budgetOver: string
  /** Template: '{error}' is replaced with the error message. */
  readonly disconnected: string
  readonly timeRange: string
  readonly viewSwitch: string
  readonly granularity: string
  readonly openPanel: string
  /** Tooltip hint for the draggable title bar. */
  readonly dragHint: string
  /** Hover tooltip summarizing the three gestures. */
  readonly hoverHint: string
  /** Long-press menu: back to the current default position. */
  readonly backToDefault: string
  /** Long-press menu: back to a custom-saved default. */
  readonly backToCustom: string
  /** Toast after returning to the custom-saved default. */
  readonly backToCustomDone: string
  /** Long-press menu: back to the bottom-right corner (system default). */
  readonly backToCorner: string
  /** Toast after resetting to the corner. */
  readonly backToCornerDone: string
  /** Long-press menu: position submenu entry. */
  readonly positionMenu: string
  /** Position presets. */
  readonly cornerTL: string
  readonly cornerTR: string
  readonly cornerBL: string
  readonly cornerBR: string
  /** Custom position (drag-to-save) entry. */
  readonly customPos: string
  /** Long-press menu: enter "set default position" capture mode. */
  readonly setAsDefault: string
  /** Toast while in capture mode: drag to a new spot and release. */
  readonly setDefaultHint: string
  /** Toast after the default position was saved. */
  readonly defaultSaved: string
  /** Toast template: default set to a preset '{pos}'. */
  readonly defaultSetTo: string
  /** Long-press menu: dismiss. */
  readonly cancelMenu: string
  /** Template: '{pct}' is replaced with the percent number. */
  readonly contextBar: string
}

type Translate = (key: keyof TokenHudLocale) => string

/** Replace {name} placeholders in a localized template. */
function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match)
}

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(Math.round(value))
}

/** Axis-value formatter: small values keep one decimal (0.5 stays 0.5). */
function formatAxisNumber(value: number): string {
  if (value >= 1_000) return formatNumber(value)
  if (value >= 10) return String(Math.round(value))
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

/** Format a timestamp as HH:MM:SS. */
function formatTime(t: number): string {
  const date = new Date(t)
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

/** Locale-aware date label for a YYYY-MM-DD key. */
function dateLabel(date: string, t: Translate): string {
  const [y, m, d] = date.split('-')
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yesterdayTs = now.getTime() - 86_400_000
  const yesterday = `${new Date(yesterdayTs).getFullYear()}-${String(new Date(yesterdayTs).getMonth() + 1).padStart(2, '0')}-${String(new Date(yesterdayTs).getDate()).padStart(2, '0')}`
  if (date === today) return t('today')
  if (date === yesterday) return t('yesterday')
  return `${Number(m)}/${Number(d)}`
}

/** Locale-aware month label for a YYYY-MM key. */
function monthLabel(month: string, t: Translate): string {
  const [y, m] = month.split('-')
  const now = new Date()
  if (Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1) return t('thisMonth')
  return fill(t('monthFmt'), { y: Number(y), m: Number(m) })
}

/** Estimate cost in CNY from usage buckets (cache hit priced separately). */
function estimateCost(
  input: number,
  cacheRead: number,
  cacheWrite: number,
  output: number,
  prices: PriceEstimate,
): number {
  return (
    ((input + cacheWrite) / 1_000_000) * prices.input
    + (cacheRead / 1_000_000) * prices.cacheRead
    + (output / 1_000_000) * prices.output
  )
}

/** Estimate session cost in CNY from provider usage buckets. */
function estimateRowCost(row: SessionTokenRow, prices: PriceEstimate): number {
  const usage = row.usage
  if (usage === undefined) return 0
  return estimateCost(
    usage.uncachedInputTokens,
    usage.cacheReadTokens,
    usage.cacheWriteTokens,
    usage.outputTokens,
    prices,
  )
}

/** Format a CNY cost for display. */
function formatCost(cost: number): string {
  if (cost >= 1) return `¥${cost.toFixed(2)}`
  if (cost >= 0.01) return `¥${cost.toFixed(3)}`
  return `¥${(cost * 100).toFixed(1)}分`
}

/** Occupancy percent for the pressure bar (capacity may be absent). */
function occupancy(row: SessionTokenRow): number | undefined {
  const capacity = row.contextWindow
  if (capacity === undefined || capacity <= 0) return undefined
  const pressure = row.projectedTokens ?? row.pressureTokens ?? row.totalTokens
  return Math.min(100, Math.max(0, (pressure / capacity) * 100))
}

/** Filter history points to the trailing window ending at `now`. */
function filterRange(points: readonly HistoryPoint[], now: number, rangeMs: number): readonly HistoryPoint[] {
  const cutoff = now - rangeMs
  return points.filter((point) => point.t >= cutoff)
}

/** Format a timestamp for a day-scale axis (M/D). */
function formatDateTick(t: number): string {
  const date = new Date(t)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

/** Format a timestamp for a month-scale axis (locale-aware). */
function formatMonthTick(t: number, translate: Translate): string {
  const date = new Date(t)
  return fill(translate('monthFmt'), { y: date.getFullYear(), m: date.getMonth() + 1 })
}

/** Convert cumulative output samples into per-tick consumption deltas
 *  (idle ticks become 0, so the curve drops to zero when not in use). */
function toConsumption(points: readonly HistoryPoint[]): readonly HistoryPoint[] {
  let previous = points[0]?.output ?? 0
  return points.map((point, index) => {
    const output = point.output ?? 0
    const delta = index === 0 ? 0 : Math.max(0, output - previous)
    previous = output
    return { t: point.t, total: delta }
  })
}

/**
 * Sparkline: renders the timestamped history as an SVG area chart with
 * ticks on the bottom axis. Pass `tickFormat` for non-time scales (e.g.
 * daily/monthly stats).
 */
/** Round a value up to a "nice" axis number (1/2/2.5/5 × 10^n). */
function niceCeil(value: number): number {
  if (value <= 0) return 1
  const exponent = Math.floor(Math.log10(value))
  const magnitude = Math.pow(10, exponent)
  const normalized = value / magnitude
  const nice = normalized <= 1 ? 1
    : normalized <= 2 ? 2
      : normalized <= 2.5 ? 2.5
        : normalized <= 5 ? 5
          : 10
  return nice * magnitude
}

function Sparkline({ points, now, width = 336, height = 72, tickFormat = formatTime, t }: {
  readonly points: readonly HistoryPoint[]
  readonly now: number
  readonly width?: number
  readonly height?: number
  readonly tickFormat?: (t: number) => string
  readonly t: Translate
}) {
  /** Left gutter reserved for the Y-axis value labels. */
  const AXIS_W = 38
  const plotW = width - AXIS_W
  // Hysteresis state: the axis rises immediately but only steps down when
  // the data drops below half the current scale (Steam-like stability).
  const yMaxRef = useRef<number>(1)

  const path = useMemo(() => {
    if (points.length === 0) return null
    // Single point: render a centered dot with its tick (curve needs 2+).
    if (points.length === 1) {
      const only = points[0]
      if (only === undefined) return null
      const yTop = 6
      const yBot = height - 14
      const axisMax = niceCeil(only.total)
      return {
        kind: 'dot' as const,
        x: AXIS_W + plotW / 2,
        y: yTop + (yBot - yTop) / 2,
        t: only.t,
        ticks: [{ t: only.t, x: AXIS_W + plotW / 2 }],
        yMax: axisMax,
        yMid: axisMax / 2,
        yMin: 0,
      }
    }
    const rawMax = Math.max(...points.map((point) => point.total), 0)
    // Rise immediately; only descend below half the current scale.
    const current = yMaxRef.current
    if (rawMax > current || rawMax < current * 0.5) {
      yMaxRef.current = niceCeil(rawMax)
    }
    const max = yMaxRef.current
    const min = 0
    const span = Math.max(max - min, 1)
    const t0 = points[0]?.t ?? now
    const t1 = points[points.length - 1]?.t ?? now
    const tSpan = Math.max(t1 - t0, 1)
    // Reserve a 14px bottom band for tick labels so they never clip.
    const y = (value: number): number => height - 18 - ((value - min) / span) * (height - 28)
    // Right edge keeps 4px clearance so the last dot never clips the panel.
    const x = (t: number): number => AXIS_W + ((t - t0) / tSpan) * (plotW - 4)
    const coords = points.map((point) => [x(point.t), y(point.total)] as const)
    const line = coords.map(([xValue, yValue], index) =>
      `${index === 0 ? 'M' : 'L'}${xValue.toFixed(1)},${yValue.toFixed(1)}`).join(' ')
    const area = `${line} L${width},${height - 14} L${AXIS_W},${height - 14} Z`
    const last = coords[coords.length - 1]
    if (last === undefined) return null
    const ticks = [0, 0.5, 1].map((fraction) => {
      const t = t0 + tSpan * fraction
      return { t, x: x(t) }
    })
    return {
      kind: 'line' as const, line, area, last, ticks,
      yMax: max,
      yMid: max / 2,
      yMin: min,
    }
  }, [points, width, height, now, plotW])

  if (path === null) {
    return <div className={css.sparkEmpty} style={{ width, height }}>{t('waiting')}</div>
  }

  // Y-axis value labels (top/middle/bottom) + faint gridlines.
  const yLabels = [
    { value: path.yMax, y: 8 },
    { value: path.yMid, y: (height - 14 + 8) / 2 },
    { value: path.yMin, y: height - 16 },
  ]

  return (
    <svg className={css.spark} viewBox={`0 0 ${width} ${height}`} width="100%" height={height}
      preserveAspectRatio="none" role="img" aria-label={t('token')}>
      <defs>
        <linearGradient id="tokenSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--dsw-alias-state-business-primary)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--dsw-alias-state-business-primary)" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {path.kind === 'line' && yLabels.map((label) => (
        <line key={label.y} x1={AXIS_W} y1={label.y} x2={width} y2={label.y}
          stroke="var(--dsw-alias-line-normal)" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity="0.5" />
      ))}
      {path.kind === 'line' && <path d={path.area} fill="url(#tokenSparkFill)" />}
      {path.kind === 'line' && <path d={path.line} fill="none" stroke="var(--dsw-alias-state-business-primary)"
        strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />}
      <circle cx={path.kind === 'line' ? path.last[0] : path.x} cy={path.kind === 'line' ? path.last[1] : path.y}
        r="3" fill="var(--dsw-alias-bg-module-platform)"
        stroke="var(--dsw-alias-state-business-primary)" strokeWidth="1.6" />
      {/* Current-value indicator: dashed leader from the latest point to the
          Y axis plus a highlighted label that follows the value in real time. */}
      {(path.kind === 'line' || path.kind === 'dot') && (() => {
        const cx = path.kind === 'line' ? path.last[0] : path.x
        const cy = path.kind === 'line' ? path.last[1] : path.y
        const text = formatAxisNumber(points[points.length - 1]?.total ?? 0)
        const labelW = text.length * 5 + 8
        return (
          <>
            <line x1={AXIS_W} y1={cy} x2={cx} y2={cy}
              stroke="var(--dsw-alias-state-business-primary)" strokeWidth="1"
              vectorEffect="non-scaling-stroke" strokeDasharray="3 3" opacity="0.55" />
            <rect x={AXIS_W - labelW - 4} y={cy - 8} width={labelW} height={13} rx={6.5}
              fill="var(--dsw-alias-state-business-primary)" opacity="0.9" />
            <text x={AXIS_W - labelW / 2 - 4} y={cy + 1.5}
              textAnchor="middle"
              className={css.sparkCurrent}>
              {text}
            </text>
          </>
        )
      })()}
      {yLabels.map((label) => (
        <text key={label.y} x={AXIS_W - 5} y={label.y + 3}
          textAnchor="end"
          className={css.sparkYTick}>
          {formatAxisNumber(label.value)}
        </text>
      ))}
      {path.ticks.map((tick) => (
        <text key={tick.t} x={tick.x} y={height - 5}
          textAnchor={tick.x < 60 ? 'start' : tick.x > width - 60 ? 'end' : 'middle'}
          className={css.sparkTick}>
          {tickFormat(tick.t)}
        </text>
      ))}
    </svg>
  )
}

/** Collapsed pill shown when the panel is closed. */
function CollapsedChip({ total, cumulative, tps, t }: {
  readonly total: number
  readonly cumulative?: number
  readonly tps?: number
  readonly t: Translate
}) {
  return (
    <button type="button" className={css.chip} aria-label={t('openPanel')}>
      <span className={css.chipDot} aria-hidden />
      <span className={css.chipLabel}>TOKEN</span>
      <span className={css.chipValue}>{formatNumber(total)}</span>
      {cumulative !== undefined && (
        <span className={css.chipCumulative}>{t('approx')}{formatNumber(cumulative)}</span>
      )}
      {tps !== undefined && tps > 0 && (
        <span className={css.chipTps}>{tps >= 10 ? Math.round(tps) : tps.toFixed(1)} t/s</span>
      )}
    </button>
  )
}

/** One session row inside the live view. */
function SessionRow({ row, prices, rangeMs, now, t }: {
  readonly row: SessionTokenRow
  readonly prices: PriceEstimate
  readonly rangeMs: number
  readonly now: number
  readonly t: Translate
}) {
  const [open, setOpen] = useState(false)
  const usage = row.usage
  const cost = estimateRowCost(row, prices)
  const used = occupancy(row)
  const label = row.label !== '' ? row.label : row.sessionId.slice(-8)
  // Per-tick consumption deltas: idle ticks drop to zero.
  const history = toConsumption(filterRange(row.history ?? [], now, rangeMs))
  // Cumulative consumption across all buckets (the "usage total").
  const cumulative = usage === undefined
    ? undefined
    : usage.uncachedInputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens

  return (
    <div className={css.row} data-open={open}>
      <button
        type="button"
        className={css.rowHead}
        onClick={() => { setOpen((current) => !current) }}
        aria-expanded={open}
      >
        <span className={css.rowName} title={`${row.title ?? ''} ${row.sessionId}`}>
          <span className={css.rowTitle}>{label}</span>
          {row.title !== undefined && row.title !== '' && (
            <span className={css.rowSub}>{row.sessionId.slice(-8)}</span>
          )}
        </span>
        <span className={css.rowTokensWrap}>
          <span className={css.rowTokens} title={t('currentPressure')}>{formatNumber(row.totalTokens)}</span>
          {cumulative !== undefined && (
            <span className={css.rowCumulative} title={t('cumulativeUsage')}>{t('approx')}{formatNumber(cumulative)}</span>
          )}
          {usage !== undefined && (
            <span className={css.rowCost} title={t('costTitle')}>{formatCost(cost)}</span>
          )}
        </span>
        <span className={css.rowPulse} data-live={row.live} aria-hidden />
      </button>
      {open && (
        <div className={css.rowDetail}>
          {history.length >= 2 && <Sparkline points={history} now={now} t={t} />}
          <div className={css.detailLine}>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('input')}</span><span className={css.mono}>{usage === undefined ? '—' : formatNumber(usage.uncachedInputTokens)}</span></span>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('output')}</span><span className={css.mono}>{usage === undefined ? '—' : formatNumber(usage.outputTokens)}</span></span>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('cacheRead')}</span><span className={css.mono}>{usage === undefined ? '—' : formatNumber(usage.cacheReadTokens)}</span></span>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('cacheWrite')}</span><span className={css.mono}>{usage === undefined ? '—' : formatNumber(usage.cacheWriteTokens)}</span></span>
          </div>
          <div className={css.detailLine}>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('pressure')}</span><span className={css.mono}>{row.pressureTokens === undefined ? '—' : formatNumber(row.pressureTokens)}</span></span>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('projected')}</span><span className={css.mono}>{row.projectedTokens === undefined ? '—' : formatNumber(row.projectedTokens)}</span></span>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('capacity')}</span><span className={css.mono}>{row.contextWindow === undefined ? '—' : formatNumber(row.contextWindow)}</span></span>
            <span className={css.detailItem}><span className={css.detailLabel}>{t('cost')}</span><span className={css.mono}>{formatCost(cost)}</span></span>
          </div>
          {used !== undefined && (
            <div className={css.barTrack} aria-label={fill(t('contextBar'), { pct: used.toFixed(0) })}>
              <span className={css.barFill} style={{ width: `${used}%` }} data-hot={used > 85} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** One horizontal usage bar (day or month). */
function StatBar({ label, value, max, input, output, cacheRead, cacheWrite, cost }: {
  readonly label: string
  readonly value: number
  readonly max: number
  readonly input: number
  readonly output: number
  readonly cacheRead: number
  readonly cacheWrite: number
  readonly cost: number
}) {
  const width = max > 0 ? Math.max(2, (value / max) * 100) : 0
  return (
    <div className={css.statRow}>
      <span className={css.statLabel}>{label}</span>
      <span className={css.statBarTrack}>
        <span className={css.statBarFill} style={{ width: `${width}%` }} />
      </span>
      <span className={css.statValue}>{formatNumber(value)}</span>
      <span className={css.statCost}>{formatCost(cost)}</span>
    </div>
  )
}

/** The stats view: per-month and per-day usage bars, switched separately. */
function StatsView({ stats, t, balance, budgetMonthly }: {
  readonly stats: TokenStats | null
  readonly t: Translate
  readonly balance: BalanceInfo | null
  readonly budgetMonthly: number
}) {
  const [subView, setSubView] = useState<'days' | 'months'>('days')

  if (stats === null) {
    return <span className={css.empty}>{t('loading')}</span>
  }
  const prices = stats.prices ?? { input: 1, cacheRead: 0.02, output: 2 }
  const maxMonth = Math.max(...stats.months.map((month) => month.total), 1)
  const maxDay = Math.max(...stats.days.map((day) => day.total), 1)
  const totalAll = stats.months.reduce((sum, month) => sum + month.total, 0)
  const totalCost = stats.months.reduce(
    (sum, month) => sum + estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices),
    0,
  )
  const hasData = stats.months.length > 0 || stats.days.length > 0
  // Convert day/month aggregates to sparkline points (midnight / month-start timestamps).
  const dayPoints = useMemo<readonly HistoryPoint[]>(() => stats.days.map((day) => ({
    t: Date.parse(`${day.date}T12:00:00`),
    total: day.total,
  })), [stats.days])
  const monthPoints = useMemo<readonly HistoryPoint[]>(() => stats.months.map((month) => ({
    t: Date.parse(`${month.month}-15T12:00:00`),
    total: month.total,
  })), [stats.months])
  // This month's cost for the budget meter.
  const nowDate = new Date()
  const thisMonthKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`
  const monthCost = stats.months
    .filter((month) => month.month === thisMonthKey)
    .reduce((sum, month) => sum + estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices), 0)
  return (
    <div className={css.statsBody}>
      <div className={css.statsTotal}>
        <span className={css.statsTotalLabel}>{t('totalLabel')}</span>
        <span className={css.mono}>{formatNumber(totalAll)}</span>
        <span className={css.statsTotalSub}>{t('totalSub')} · {t('approx')}{formatCost(totalCost)}</span>
      </div>
      {budgetMonthly > 0 && (
        <div className={css.budgetRow}>
          <span className={css.budgetLabel}>{t('budgetLabel')}</span>
          <span className={css.budgetTrack}>
            <span
              className={css.budgetFill}
              style={{ width: `${Math.min(100, (monthCost / budgetMonthly) * 100)}%` }}
              data-over={monthCost > budgetMonthly}
            />
          </span>
          <span className={css.budgetText}>
            {formatCost(monthCost)} / {formatCost(budgetMonthly)}
            {monthCost > budgetMonthly && ` · ${t('budgetOver')}`}
          </span>
        </div>
      )}
      {balance?.available === true && balance.value !== undefined && (
        <div className={css.balanceRow}>
          <span className={css.budgetLabel}>{t('balanceLabel')}</span>
          <span className={css.balanceValue}>¥{balance.value.toFixed(2)}</span>
        </div>
      )}
      {hasData && (
        <div className={css.viewBar} role="group" aria-label={t('granularity')}>
          <button type="button" className={css.viewButton} data-active={subView === 'days'} onClick={() => { setSubView('days') }}>{t('byDay')}</button>
          <button type="button" className={css.viewButton} data-active={subView === 'months'} onClick={() => { setSubView('months') }}>{t('byMonth')}</button>
        </div>
      )}
      {subView === 'months' ? (
        stats.months.length > 0 ? (
          <section className={css.statsSection}>
            <header className={css.statsSectionHead}>{t('byMonth')} · {t('all')}</header>
            {monthPoints.length >= 1 && (
              <div className={css.statsSparkWrap}>
                <Sparkline points={monthPoints} now={Date.now()} height={64}
                  tickFormat={(value) => formatMonthTick(value, t)} t={t} />
              </div>
            )}
            {stats.months.map((month) => (
              <StatBar key={month.month} label={monthLabel(month.month, t)} value={month.total} max={maxMonth}
                input={month.input} output={month.output} cacheRead={month.cacheRead} cacheWrite={month.cacheWrite}
                cost={estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices)} />
            ))}
          </section>
        ) : (
          <span className={css.empty}>{t('noMonthly')}</span>
        )
      ) : (
        stats.days.length > 0 ? (
          <section className={css.statsSection}>
            <header className={css.statsSectionHead}>{t('byDay')} · {t('all')}</header>
            {dayPoints.length >= 1 && (
              <div className={css.statsSparkWrap}>
                <Sparkline points={dayPoints} now={Date.now()} height={64} tickFormat={formatDateTick} t={t} />
              </div>
            )}
            {stats.days.map((day) => (
              <StatBar key={day.date} label={dateLabel(day.date, t)} value={day.total} max={maxDay}
                input={day.input} output={day.output} cacheRead={day.cacheRead} cacheWrite={day.cacheWrite}
                cost={estimateCost(day.input, day.cacheRead, day.cacheWrite, day.output, prices)} />
            ))}
          </section>
        ) : (
          <span className={css.empty}>{t('noDaily')}</span>
        )
      )}
      {!hasData && (
        <span className={css.empty}>{t('noStats')}</span>
      )}
    </div>
  )
}

/** The top-level HUD: polling, view switching and layout. */
export function TokenHud({ t, sessionsList }: {
  readonly t: Translate
  readonly sessionsList: ObservableSnapshot<SessionListState>
}): JSX.Element {
  const [snapshot, setSnapshot] = useState<TokenSnapshot | null>(null)
  const [stats, setStats] = useState<TokenStats | null>(null)
  const [balance, setBalance] = useState<BalanceInfo | null>(null)
  const [view, setView] = useState<'live' | 'stats'>('live')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rangeMs, setRangeMs] = useState<number>(RANGES[1]?.ms ?? 5 * 60_000)
  const [now, setNow] = useState<number>(Date.now())
  const [showAll, setShowAll] = useState(false)
  const inFlight = useRef(false)

  /** User-defined initial position with its display label.
   *  `corner` = system bottom-right; `preset:<id>` = a preset corner;
   *  otherwise a custom dragged position. */
  const [defaultPos, setDefaultPos] = useState<DefaultPos | null>(() => {
    try {
      const raw = window.localStorage.getItem('dsh-token-panel-default-pos')
      if (raw === null) return null
      const parsed = JSON.parse(raw) as DefaultPos
      if (parsed !== null && typeof parsed === 'object'
        && ((parsed.kind === 'corner')
          || (parsed.kind === 'preset' && typeof parsed.preset === 'string')
          || (parsed.kind === 'custom' && typeof parsed.x === 'number' && typeof parsed.y === 'number'))) {
        return parsed
      }
      return null
    } catch {
      return null
    }
  })
  // Draggable position: the user-defined default wins on load; otherwise the
  // last dragged position; otherwise the CSS bottom-right corner.
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    try {
      const raw = window.localStorage.getItem('dsh-token-panel-default-pos')
        ?? window.localStorage.getItem('dsh-token-panel-pos')
      if (raw === null) return null
      const parsed = JSON.parse(raw) as { x: number; y: number }
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed
      return null
    } catch {
      return null
    }
  })
  const dragState = useRef<{ startX: number; startY: number; pointerId: number; baseX: number; baseY: number; width: number; height: number; moved: boolean; last: { x: number; y: number } } | null>(null)
  /** Timestamp until which pill clicks are swallowed (drag/hold releases).
   *  Timestamp-based so a missed click can never wedge it permanently. */
  const suppressClickUntilRef = useRef(0)
  /** Set when the long-press timer fired (reliable across render closures). */
  const longPressTriggeredRef = useRef(false)
  /** Latest default position, mirrored from state for stale-closure-free reads. */
  const defaultPosRef = useRef<DefaultPos | null>(null)
  useEffect(() => { defaultPosRef.current = defaultPos }, [defaultPos])
  /** Long-press menu state (opened by holding the pill 600ms without moving). */
  const [pressMenu, setPressMenu] = useState(false)
  /** Position submenu expanded inside the long-press menu. */
  const [pressSubMenu, setPressSubMenu] = useState(false)
  /** "Set default position" capture mode: the next drag saves the position. */
  const [settingDefault, setSettingDefault] = useState(false)
  const settingDefaultRef = useRef(false)
  const setSettingDefaultBoth = (value: boolean): void => {
    settingDefaultRef.current = value
    setSettingDefault(value)
  }
  /** Transient confirmation toast text. */
  const [toast, setToast] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = (text: string): void => {
    setToast(text)
    if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => { setToast(null) }, 2200)
  }
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)

  // When the panel OPENS at a dragged (left/top) position, nudge it back
  // inside the viewport once so it renders fully. Runs only on the open
  // transition — dragging afterwards keeps the 48px overhang behavior.
  useLayoutEffect(() => {
    if (!open || panelRef.current === null) return
    const rect = panelRef.current.getBoundingClientRect()
    const maxX = Math.max(8, window.innerWidth - rect.width - 8)
    const maxY = Math.max(8, window.innerHeight - rect.height - 8)
    setPosition((current) => {
      if (current === null) return current
      const x = Math.min(Math.max(current.x, 8), maxX)
      const y = Math.min(Math.max(current.y, 8), maxY)
      return x === current.x && y === current.y ? current : { x, y }
    })
  }, [open])

  // Close the long-press menu on any outside pointerdown.
  useEffect(() => {
    if (!pressMenu) return
    const onOutside = (event: PointerEvent): void => {
      const target = event.target as HTMLElement | null
      if (target !== null && target.closest('[data-press-menu]') !== null) return
      setPressMenu(false)
    }
    document.addEventListener('pointerdown', onOutside)
    return () => { document.removeEventListener('pointerdown', onOutside) }
  }, [pressMenu])

  const onDragStart = (event: React.PointerEvent<HTMLElement>): void => {
    // Anchor on the element's current on-screen position, not (0,0) —
    // the default state is CSS right/bottom (bottom-right corner).
    const rect = event.currentTarget.getBoundingClientRect()
    const baseX = position?.x ?? rect.left
    const baseY = position?.y ?? rect.top
    // Measure the whole HUD once at drag start (stable while dragging).
    const hostEl = (event.currentTarget as HTMLElement).closest('[data-token-hud]')
    const hostRect = hostEl !== null ? hostEl.getBoundingClientRect() : rect
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
    }
    // Long-press detection: holding still for 600ms opens the corner menu.
    if (pressTimerRef.current !== null) clearTimeout(pressTimerRef.current)
    longPressTriggeredRef.current = false
    pressTimerRef.current = setTimeout(() => {
      const drag = dragState.current
      if (drag === null || drag.moved) return
      // Fired from a still hold: show the menu and swallow the release click.
      longPressTriggeredRef.current = true
      setPressMenu(true)
      suppressClickUntilRef.current = Date.now() + 600
    }, 600)
  }

  /** Pill release: open the panel unless this was a drag or a long-press.
   *  Driven by pointerup (not click), which pointer capture cannot steal. */
  const onPillPointerUp = (): void => {
    const drag = dragState.current
    const moved = drag?.moved ?? false
    const menuShown = longPressTriggeredRef.current
    onDragEnd()
    if (!moved && !menuShown) setOpen(true)
  }
  const onDragMove = (event: React.PointerEvent<HTMLElement>): void => {
    const drag = dragState.current
    if (drag === null) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    // Ignore jitter: only move after a 4px threshold, so plain clicks on
    // the title never nudge the panel.
    if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return
    if (!drag.moved) {
      // Only capture the pointer once a genuine drag starts. Capturing on
      // pointerdown would retarget the release click away from inner
      // buttons (making the pill impossible to open with a single click).
      drag.moved = true
      try {
        event.currentTarget.setPointerCapture(drag.pointerId)
      } catch {
        // Capture unavailable; the drag still works while over the element.
      }
    }
    // Movement cancels the long-press timer (this is a drag, not a hold).
    if (pressTimerRef.current !== null) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    const rawX = drag.baseX + dx
    const rawY = drag.baseY + dy
    // Clamp with a visible sliver: the HUD may hang off-screen but must keep
    // a grabbable strip reachable. The whole HEADER is the panel's drag
    // handle (header height ~46px), so the panel may go negative until only
    // ~24px of the header stays visible — far enough to "cover" the screen
    // top, near enough to always grab back. The pill never leaves the screen.
    const HEADER_VISIBLE = 24
    const handleW = open ? drag.width : drag.width
    const minX = open ? -(drag.width - HEADER_VISIBLE) : 0
    const maxX = window.innerWidth - (open ? HEADER_VISIBLE : drag.width + 8)
    const handleH = open ? 46 : drag.height
    const minY = open ? -(handleH - HEADER_VISIBLE) : 0
    const maxY = window.innerHeight - (open ? HEADER_VISIBLE : drag.height + 8)
    drag.last = {
      x: Math.min(Math.max(rawX, minX), Math.max(maxX, minX)),
      y: Math.min(Math.max(rawY, minY), Math.max(maxY, minY)),
    }
    setPosition(drag.last)
  }
  const onDragEnd = (): void => {
    if (pressTimerRef.current !== null) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    const drag = dragState.current
    if (drag === null) return
    const moved = drag.moved
    const final = drag.last
    dragState.current = null
    if (moved) {
      if (settingDefaultRef.current) {
        // Capture mode: this drag defines the new custom default position.
        const next: DefaultPos = { kind: 'custom', x: final.x, y: final.y }
        setDefaultPos(next)
        setSettingDefaultBoth(false)
        showToast(t('defaultSaved'))
        try {
          window.localStorage.setItem('dsh-token-panel-default-pos', JSON.stringify(next))
        } catch {
          // Storage unavailable; the default simply resets next load.
        }
      }
      // Suppress the click that fires after a genuine drag, so dragging the
      // collapsed pill moves it without opening the panel.
      suppressClickUntilRef.current = Date.now() + 600
      try {
        // Persist the ref-tracked final position (never a stale closure value).
        window.localStorage.setItem('dsh-token-panel-pos', JSON.stringify(final))
      } catch {
        // Storage unavailable; position simply resets next load.
      }
    }
  }

  /** Back to the user-defined default position (preset or custom).
   *  When the panel is open, the target is clamped so it lands fully
   *  visible — otherwise an off-screen target looks like "nothing moved". */
  const goToDefault = (): void => {
    const def = defaultPosRef.current
    let target: { x: number; y: number } | null
    if (def === null || def.kind === 'corner') {
      target = null
    } else if (def.kind === 'preset') {
      target = presetCornerPosition(def.preset, hudSize())
    } else {
      target = { x: def.x, y: def.y }
    }
    if (target !== null && open && panelRef.current !== null) {
      const rect = panelRef.current.getBoundingClientRect()
      const maxX = Math.max(8, window.innerWidth - rect.width - 8)
      const maxY = Math.max(8, window.innerHeight - rect.height - 8)
      target = {
        x: Math.min(Math.max(target.x, 8), maxX),
        y: Math.min(Math.max(target.y, 8), maxY),
      }
    }
    setPosition(target)
    setPressMenu(false)
    setSettingDefaultBoth(false)
    showToast(def === null || def.kind === 'corner'
      ? t('backToCornerDone')
      : def.kind === 'preset'
        ? fill(t('defaultSetTo'), { pos: cornerLabel(def.preset, t) })
        : t('backToCustomDone'))
    try {
      window.localStorage.removeItem('dsh-token-panel-pos')
    } catch {
      // Storage unavailable; position simply resets next load.
    }
  }

  /** Current HUD dimensions for preset math (panel when open, pill fallback). */
  const hudSize = (): { width: number; height: number } => {
    if (open && panelRef.current !== null) {
      const rect = panelRef.current.getBoundingClientRect()
      return { width: rect.width, height: rect.height }
    }
    const hostEl = document.querySelector('[data-token-hud]')
    if (hostEl !== null) {
      const rect = hostEl.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) return { width: rect.width, height: rect.height }
    }
    return { width: 360, height: 520 }
  }

  /** Apply a preset corner as the default position (and move there now). */
  const applyPreset = (preset: 'tl' | 'tr' | 'bl' | 'br'): void => {
    const next: DefaultPos = { kind: 'preset', preset }
    setDefaultPos(next)
    let target = presetCornerPosition(preset, hudSize())
    if (open && panelRef.current !== null) {
      const rect = panelRef.current.getBoundingClientRect()
      const maxX = Math.max(8, window.innerWidth - rect.width - 8)
      const maxY = Math.max(8, window.innerHeight - rect.height - 8)
      target = {
        x: Math.min(Math.max(target.x, 8), maxX),
        y: Math.min(Math.max(target.y, 8), maxY),
      }
    }
    setPosition(target)
    setPressMenu(false)
    setSettingDefaultBoth(false)
    showToast(fill(t('defaultSetTo'), { pos: cornerLabel(preset, t) }))
    try {
      window.localStorage.setItem('dsh-token-panel-default-pos', JSON.stringify(next))
      window.localStorage.removeItem('dsh-token-panel-pos')
    } catch {
      // Storage unavailable; the default simply resets next load.
    }
  }

  /** Enter capture mode: the next drag saves the position as the default. */
  const startSetDefault = (): void => {
    setPressMenu(false)
    setSettingDefaultBoth(true)
    showToast(t('setDefaultHint'))
  }

  // Current session id from the session list (follows the open conversation).
  const currentSessionId = useSyncExternalStore(
    sessionsList.subscribe,
    sessionsList.getSnapshot,
  ).current

  useEffect(() => {
    let cancelled = false
    const tick = async (): Promise<void> => {
      if (inFlight.current || cancelled) return
      inFlight.current = true
      try {
        const response = await fetch(SNAPSHOT_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const body = (await response.json()) as TokenSnapshot
        if (!cancelled && Array.isArray(body.sessions)) {
          setSnapshot(body)
          setNow(Date.now())
          setError(null)
        }
      } catch (cause: unknown) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause))
      } finally {
        inFlight.current = false
      }
    }
    void tick()
    const timer = setInterval(() => { void tick() }, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  // Stats poll at a slower cadence; switching to the stats view refreshes immediately.
  const statsInFlight = useRef(false)
  const fetchStats = async (): Promise<void> => {
    if (statsInFlight.current) return
    statsInFlight.current = true
    try {
      const response = await fetch(STATS_URL, { cache: 'no-store' })
      if (!response.ok) return
      const body = (await response.json()) as TokenStats
      if (Array.isArray(body.days)) setStats(body)
    } catch {
      // Keep the last stats snapshot.
    } finally {
      statsInFlight.current = false
    }
  }
  useEffect(() => {
    let cancelled = false
    if (view === 'stats') void fetchStats()
    const timer = setInterval(() => { if (!cancelled) void fetchStats() }, STATS_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [view])

  // Balance poll (5 min cadence; the host caches its own fetch).
  useEffect(() => {
    let cancelled = false
    const tick = async (): Promise<void> => {
      try {
        const response = await fetch(BALANCE_URL, { cache: 'no-store' })
        if (!response.ok) return
        const body = (await response.json()) as BalanceInfo
        if (!cancelled) setBalance(body)
      } catch {
        // Keep the last balance snapshot.
      }
    }
    void tick()
    const timer = setInterval(() => { void tick() }, BALANCE_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const totals = useMemo(() => {
    if (snapshot === null) return { total: 0, output: 0 }
    let total = 0
    let output = 0
    let cumulative = 0
    for (const row of snapshot.sessions) {
      total += row.totalTokens
      output += row.usage?.outputTokens ?? 0
      cumulative += (row.usage?.uncachedInputTokens ?? 0)
        + (row.usage?.outputTokens ?? 0)
        + (row.usage?.cacheReadTokens ?? 0)
        + (row.usage?.cacheWriteTokens ?? 0)
    }
    return { total, output, cumulative }
  }, [snapshot])

  const prices = snapshot?.prices ?? { input: 1, cacheRead: 0.02, output: 2 }
  const tps = snapshot?.tps ?? 0
  const budgetMonthly = snapshot?.budgetMonthly ?? 0

  const topHistory = useMemo(() => {
    if (snapshot === null || snapshot.sessions.length === 0) return []
    // Prefer the current (open) session's curve; fall back to the largest.
    const current = currentSessionId !== undefined
      ? snapshot.sessions.find((row) => row.sessionId === currentSessionId)
      : undefined
    const source = current ?? snapshot.sessions[0]
    // Per-tick consumption deltas: idle ticks drop to zero.
    return toConsumption(filterRange(source?.history ?? [], now, rangeMs))
  }, [snapshot, now, rangeMs, currentSessionId])

  const dragHandlers = {
    onPointerDown: onDragStart,
    onPointerMove: onDragMove,
    onPointerUp: onDragEnd,
    onPointerLeave: onDragEnd,
  }

  const hostStyle: React.CSSProperties = position !== null
    ? { right: 'auto', bottom: 'auto', left: position.x, top: position.y }
    : {}

  if (snapshot === null) {
    return (
      <div className={css.host} style={{ ...hostStyle, cursor: 'grab' }} data-token-hud
        {...dragHandlers} onPointerUp={onPillPointerUp}>
        <CollapsedChip total={0} t={t} />
      </div>
    )
  }

  return (
    <div className={css.host} style={hostStyle} data-token-hud>
      {pressMenu && (
        <div className={css.pressMenu} data-press-menu>
          <button
            type="button"
            className={css.pressMenuItem}
            onClick={() => { goToDefault(); suppressClickUntilRef.current = 0 }}
          >
            <span className={css.pressMenuLabel}>
              <MenuIcon d={
                defaultPos === null || defaultPos.kind === 'corner'
                  ? ICON_CORNER.br
                  : defaultPos.kind === 'preset'
                    ? ICON_CORNER[defaultPos.preset]
                    : ICON_CROSSHAIR
              } />
              {defaultPos === null || defaultPos.kind === 'corner'
                ? t('backToCorner')
                : defaultPos.kind === 'preset'
                  ? `${t('backToDefault')} · ${cornerLabel(defaultPos.preset, t)}`
                  : t('backToCustom')}
            </span>
          </button>
          <button
            type="button"
            className={css.pressMenuItem}
            onClick={() => { setPressSubMenu((current) => !current) }}
            aria-expanded={pressSubMenu}
          >
            <span className={css.pressMenuLabel}>
              <MenuIcon d={ICON_CROSSHAIR} />
              {t('positionMenu')}
            </span>
            <span className={css.pressMenuCaret}>▸</span>
          </button>
          {pressSubMenu && (
            <div className={css.pressSubMenu} data-press-menu>
              {(['tr', 'tl', 'bl', 'br'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={css.pressMenuItem}
                  onClick={() => { applyPreset(preset); suppressClickUntilRef.current = 0 }}
                >
                  <span className={css.pressMenuLabel}>
                    <MenuIcon d={ICON_CORNER[preset]} />
                    {cornerLabel(preset, t)}
                  </span>
                </button>
              ))}
              <button
                type="button"
                className={css.pressMenuItem}
                onClick={() => { startSetDefault(); suppressClickUntilRef.current = 0 }}
              >
                <span className={css.pressMenuLabel}>
                  <MenuIcon d={ICON_CROSSHAIR} />
                  {t('customPos')}
                </span>
              </button>
            </div>
          )}
          <button
            type="button"
            className={css.pressMenuItem}
            onClick={() => { setPressMenu(false); setPressSubMenu(false) }}
          >
            <span className={css.pressMenuLabel}>{t('cancelMenu')}</span>
          </button>
        </div>
      )}
      {toast !== null && (
        <div className={css.toast} data-toast>{toast}</div>
      )}
      {!open && (
        <div
          {...dragHandlers}
          style={{ cursor: 'grab' }}
          onPointerUp={onPillPointerUp}
          data-hud-handle
          data-hud-hint={t('hoverHint')}
        >
          <CollapsedChip total={totals.total} cumulative={totals.cumulative} tps={tps} t={t} />
        </div>
      )}
      {open && (
        <aside className={css.panel} data-token-panel ref={panelRef}>
          <header className={css.head} {...dragHandlers} data-hud-handle data-hud-hint={t('hoverHint')}>
            <span className={css.title} title={t('dragHint')}>
              <span className={css.titleMark} aria-hidden />{t('token')}
            </span>
            <div className={css.viewBar} role="group" aria-label={t('viewSwitch')}
              onPointerDown={(event) => { event.stopPropagation() }}>
              <button type="button" className={css.viewButton} data-active={view === 'live'} onClick={() => { setView('live') }}>{t('live')}</button>
              <button type="button" className={css.viewButton} data-active={view === 'stats'} onClick={() => { setView('stats') }}>{t('stats')}</button>
            </div>
            <button
              type="button"
              className={css.closeButton}
              onClick={() => { setOpen(false) }}
              onPointerDown={(event) => { event.stopPropagation() }}
              aria-label={t('close')}
            >
              ✕
            </button>
          </header>
          {view === 'live' ? (
            <>
              {topHistory.length >= 2 && (
                <div className={css.sparkWrap}>
                  <div className={css.rangeBar} role="group" aria-label={t('timeRange')}>
                    {RANGES.map((range) => (
                      <button
                        key={range.label}
                        type="button"
                        className={css.rangeButton}
                        data-active={range.ms === rangeMs}
                        onClick={() => { setRangeMs(range.ms) }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                  <Sparkline points={topHistory} now={now} t={t} />
                </div>
              )}
              <div className={css.body}>
                {(() => {
                  // The current (open) conversation is always shown first;
                  // other sessions are hidden unless "show all" is toggled.
                  const current = currentSessionId !== undefined
                    ? snapshot.sessions.find((row) => row.sessionId === currentSessionId)
                    : undefined
                  const others = snapshot.sessions.filter((row) => row.sessionId !== current?.sessionId)
                  const rows = current !== undefined
                    ? [current, ...(showAll ? others : [])]
                    : (showAll ? snapshot.sessions : snapshot.sessions.slice(0, 3))
                  if (rows.length === 0 && others.length === 0) {
                    return <span className={css.empty}>{t('noSessions')}</span>
                  }
                  return (
                    <>
                      {rows.map((row) => (
                        <SessionRow key={row.sessionId} row={row} prices={prices} rangeMs={rangeMs} now={now} t={t} />
                      ))}
                      {!showAll && others.length > 0 && (
                        <button type="button" className={css.moreButton} onClick={() => { setShowAll(true) }}>
                          {fill(t('expandAll'), { count: others.length })}
                        </button>
                      )}
                      {showAll && others.length > 0 && (
                        <button type="button" className={css.moreButton} onClick={() => { setShowAll(false) }}>
                          {t('collapseAll')}
                        </button>
                      )}
                    </>
                  )
                })()}
              </div>
            </>
          ) : (
            <div className={css.body}>
              <StatsView stats={stats} t={t} balance={balance} budgetMonthly={budgetMonthly} />
            </div>
          )}
          <footer className={css.foot}>
            <span className={css.footHint}>
              {error !== null
                ? fill(t('disconnected'), { error })
                : view === 'live'
                  ? fill(t('pollLive'), { total: formatNumber(totals.total), out: formatNumber(totals.output) })
                  : t('pollStats')}
              {tps > 0 && (
                <span className={css.footTps}> · {tps >= 10 ? Math.round(tps) : tps.toFixed(1)} t/s</span>
              )}
              {prices.mode !== undefined && prices.mode !== 'flat' && (
                <span className={css.footPrice} data-mode={prices.mode}>
                  {prices.mode === 'peak' ? t('pricePeak') : t('priceOffpeak')}
                </span>
              )}
            </span>
            <span className={css.footRight}>
              {balance?.available === true && balance.value !== undefined && (
                <span className={css.footBalance} title={t('balanceTitle')}>
                  ¥{balance.value.toFixed(2)}
                </span>
              )}
              <span className={css.mono}>{new Date(snapshot.generatedAt).toLocaleTimeString()}</span>
            </span>
          </footer>
        </aside>
      )}
    </div>
  )
}
