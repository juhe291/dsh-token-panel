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
import type { ObservableSnapshot, SessionListState } from '@deepseek-ai/dsh-client-runtime/client';
/** One session's token row as served by the host. */
export interface SessionTokenRow {
    readonly sessionId: string;
    readonly live: boolean;
    /** Model id this session's requests use (drives per-model pricing). */
    readonly model?: string;
    /** Per-model token buckets accumulated across the durable logs. */
    readonly modelUsage?: Record<string, PriceUsageBucket>;
    /** Display label: session title when available, else the id tail. */
    readonly label: string;
    /** Session title text when the title service has one. */
    readonly title?: string;
    readonly totalTokens: number;
    readonly surfaceTokens: number;
    readonly usage?: {
        readonly uncachedInputTokens: number;
        readonly outputTokens: number;
        readonly cacheReadTokens: number;
        readonly cacheWriteTokens: number;
    };
    readonly pressureTokens?: number;
    readonly projectedTokens?: number;
    readonly contextWindow?: number;
    readonly systemTokens: number;
    readonly toolsTokens: number;
    readonly messageTokens: number;
    /** Rolling history of total pressure per poll tick (oldest first). */
    readonly history?: readonly HistoryPoint[];
}
/** One timestamped history sample. */
export interface HistoryPoint {
    readonly t: number;
    readonly total: number;
    /** Cumulative output tokens at that sample. */
    readonly output?: number;
}
/** Aggregate snapshot body. */
export interface TokenSnapshot {
    readonly generatedAt: number;
    readonly sessions: readonly SessionTokenRow[];
    readonly prices?: PriceEstimate;
    /** Per-model price tiers in effect (flat/peak/offpeak). */
    readonly modelPrices?: Record<string, PriceTier>;
    /** Aggregate generation speed (output tokens per second). */
    readonly tps?: number;
    /** Monthly budget in CNY (0 = disabled). */
    readonly budgetMonthly?: number;
    /** Host config: true hides the entire HUD (pill + panel). */
    readonly hidden?: boolean;
}
/** One pricing tier: cache hit / miss / output (CNY per 1M tokens). */
export interface PriceTier {
    readonly hit: number;
    readonly miss: number;
    readonly output: number;
}
/** One day's usage aggregate. */
export interface DayStat {
    readonly date: string;
    readonly input: number;
    readonly output: number;
    readonly cacheRead: number;
    readonly cacheWrite: number;
    readonly total: number;
    /** Per-model token buckets so costs price each model separately. */
    readonly models?: Record<string, PriceUsageBucket>;
}
/** One month's usage aggregate. */
export interface MonthStat {
    readonly month: string;
    readonly input: number;
    readonly output: number;
    readonly cacheRead: number;
    readonly cacheWrite: number;
    readonly total: number;
    /** Per-model token buckets so costs price each model separately. */
    readonly models?: Record<string, PriceUsageBucket>;
}
/** Four-bucket token counts for one model. */
export interface PriceUsageBucket {
    readonly i: number;
    readonly o: number;
    readonly cr: number;
    readonly cw: number;
}
/** Durable statistics payload. */
export interface TokenStats {
    readonly generatedAt: number;
    readonly days: readonly DayStat[];
    readonly months: readonly MonthStat[];
    readonly prices?: PriceEstimate;
    /** Per-model price tiers in effect (flat/peak/offpeak). */
    readonly modelPrices?: Record<string, PriceTier>;
}
/** Display-only price estimate (CNY per 1M tokens). */
export interface PriceEstimate {
    readonly input: number;
    readonly cacheRead: number;
    readonly output: number;
    readonly mode?: 'flat' | 'peak' | 'offpeak';
}
/** Account balance snapshot from the balance route. */
export interface BalanceInfo {
    readonly available: boolean;
    readonly value?: number;
    readonly currency?: string;
    readonly at?: number;
}
/** The user-defined default position (discriminated union). */
export type DefaultPos = {
    readonly kind: 'corner';
} | {
    readonly kind: 'preset';
    readonly preset: 'tl' | 'tr' | 'bl' | 'br';
} | {
    readonly kind: 'custom';
    readonly x: number;
    readonly y: number;
};
/** Localized copy contract for the HUD (en/zh dictionaries in index.tsx). */
export interface TokenHudLocale {
    readonly token: string;
    readonly live: string;
    readonly stats: string;
    readonly close: string;
    readonly byDay: string;
    readonly byMonth: string;
    readonly all: string;
    readonly totalLabel: string;
    readonly totalSub: string;
    readonly approx: string;
    readonly currentPressure: string;
    readonly cumulativeUsage: string;
    /** Template: '{count}' is replaced with the session count. */
    readonly expandAll: string;
    readonly collapseAll: string;
    readonly noSessions: string;
    readonly waiting: string;
    readonly noStats: string;
    readonly noDaily: string;
    readonly noMonthly: string;
    readonly loading: string;
    readonly input: string;
    readonly output: string;
    readonly cacheRead: string;
    readonly cacheWrite: string;
    readonly pressure: string;
    readonly projected: string;
    readonly capacity: string;
    readonly cost: string;
    /** Tooltip for the session row cost figure. */
    readonly costTitle: string;
    readonly today: string;
    readonly yesterday: string;
    readonly thisMonth: string;
    /** Month label template: '{y}' year, '{m}' month number. */
    readonly monthFmt: string;
    /** Template: '{total}' and '{out}' are replaced with formatted numbers. */
    readonly pollLive: string;
    readonly pollStats: string;
    readonly pricePeak: string;
    readonly priceOffpeak: string;
    readonly priceFlat: string;
    readonly balanceTitle: string;
    readonly balanceLabel: string;
    readonly budgetLabel: string;
    readonly budgetOver: string;
    /** Template: '{error}' is replaced with the error message. */
    readonly disconnected: string;
    readonly timeRange: string;
    readonly viewSwitch: string;
    readonly granularity: string;
    readonly openPanel: string;
    /** Tooltip hint for the draggable title bar. */
    readonly dragHint: string;
    /** Hover tooltip summarizing the three gestures. */
    readonly hoverHint: string;
    /** Long-press menu: back to the current default position. */
    readonly backToDefault: string;
    /** Long-press menu: back to a custom-saved default. */
    readonly backToCustom: string;
    /** Toast after returning to the custom-saved default. */
    readonly backToCustomDone: string;
    /** Long-press menu: back to the bottom-right corner (system default). */
    readonly backToCorner: string;
    /** Toast after resetting to the corner. */
    readonly backToCornerDone: string;
    /** Long-press menu: position submenu entry. */
    readonly positionMenu: string;
    /** Position presets. */
    readonly cornerTL: string;
    readonly cornerTR: string;
    readonly cornerBL: string;
    readonly cornerBR: string;
    /** Custom position (drag-to-save) entry. */
    readonly customPos: string;
    /** Long-press menu: enter "set default position" capture mode. */
    readonly setAsDefault: string;
    /** Toast while in capture mode: drag to a new spot and release. */
    readonly setDefaultHint: string;
    /** Toast after the default position was saved. */
    readonly defaultSaved: string;
    /** Toast template: default set to a preset '{pos}'. */
    readonly defaultSetTo: string;
    /** Long-press menu: dismiss. */
    readonly cancelMenu: string;
    /** Template: '{pct}' is replaced with the percent number. */
    readonly contextBar: string;
    /** Section title: live consumption trend. */
    readonly trendTitle: string;
    /** Section title: sessions list. */
    readonly sessionTitle: string;
    /** Section title: stats summary. */
    readonly summaryTitle: string;
    /** Peak generation speed label (live view). */
    readonly peakLabel: string;
    /** Template: '{count}' active sessions. */
    readonly sessionsActive: string;
    /** Template: '{count}' days/months in the daily/monthly list. */
    readonly daysCount: string;
    readonly monthsCount: string;
    /** Templates: expand/collapse the daily/monthly list. */
    readonly expandDays: string;
    readonly expandMonths: string;
    readonly collapseList: string;
    /** Hover hint on the editable budget/balance values. */
    readonly editHint: string;
    /** Toast after saving an edited value. */
    readonly editSaved: string;
    /** Note under the editable rows. */
    readonly balanceLocalNote: string;
    /** Footer: current cost label. */
    readonly costNow: string;
    /** aria-labels for the inline editors. */
    readonly budgetInput: string;
    readonly balanceInput: string;
    /** Placeholder when budget/balance is not set yet. */
    readonly notSet: string;
    /** Tiny (< 1 cent) cost: '¥{yuan}' (trimmed decimals). */
    readonly costTiny: string;
    /** aria-label for the time scrubber under curves. */
    readonly scrubLabel: string;
    /** Long-press menu item that hides the whole HUD. */
    readonly hideHud: string;
    /** Tooltip on the hide item: how to restore. */
    readonly hideHudRestore: string;
}
type Translate = (key: keyof TokenHudLocale) => string;
/** The top-level HUD: polling, view switching and layout. */
export declare function TokenHud({ t, sessionsList }: {
    readonly t: Translate;
    readonly sessionsList: ObservableSnapshot<SessionListState>;
}): JSX.Element | null;
export {};
