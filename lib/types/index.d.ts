/**
 * dsh-token-panel host plugin.
 *
 * Exposes two HTTP routes:
 *
 * - `/plugins/dsh-token-panel/snapshot` — live token usage across every
 *   live agent session: `ctx.tokenMeter.measure(session)` for pressure and
 *   surface, `ctx.sessionProjections.snapshot(session)` for provider usage
 *   buckets, context pressure/capacity and the heuristic composition.
 * - `/plugins/dsh-token-panel/stats` — durable per-day/per-month usage
 *   aggregates. Usage deltas are appended to per-day JSONL files under
 *   `<dataDir>/usage-YYYY-MM-DD.jsonl` (default
 *   `~/.dsh/cache/dsh-token-panel/`), so statistics survive restarts.
 *
 * The routes are registered lazily once the Web server service binds (a
 * headless profile keeps the plugin inert). The browser HUD polls them with
 * `Cache-Control: no-store`.
 *
 * @module dsh-token-panel
 */
import { Context, Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { TokenUsageProjection } from '@deepseek-ai/dsh-token-meter';
export declare const name = "dsh-token-panel";
export declare const inject: string[];
export interface Config {
    /** Browser panel poll cadence in milliseconds. */
    pollInterval: number;
    /** Display-only CNY price per 1M uncached input tokens (flat mode). */
    pricePerMInput: number;
    /** Display-only CNY price per 1M cache-hit (read) tokens (flat mode). */
    pricePerMCacheRead: number;
    /** Display-only CNY price per 1M output tokens (flat mode). */
    pricePerMOutput: number;
    /** Pricing mode: 'flat' uses the fixed prices above; 'peak-offpeak' switches
     *  by Beijing time (peak 9-12 & 14-18, off-peak otherwise) using the
     *  peak/off-peak price keys below. */
    priceMode: 'flat' | 'peak-offpeak';
    /** Peak-period uncached input price (CNY / 1M tokens). */
    pricePeakInput: number;
    /** Peak-period cache-hit price (CNY / 1M tokens). */
    pricePeakCacheRead: number;
    /** Peak-period output price (CNY / 1M tokens). */
    pricePeakOutput: number;
    /** Off-peak uncached input price (CNY / 1M tokens). */
    priceOffpeakInput: number;
    /** Off-peak cache-hit price (CNY / 1M tokens). */
    priceOffpeakCacheRead: number;
    /** Off-peak output price (CNY / 1M tokens). */
    priceOffpeakOutput: number;
    /** Monthly budget in CNY for the budget meter; 0 disables the meter. */
    budgetMonthly: number;
    /** Directory for durable per-day usage logs (default ~/.dsh/cache/dsh-token-panel). */
    dataDir?: string;
}
export declare const Config: z<Config>;
declare module '@deepseek-ai/cordis' {
    interface Context {
        tokenPanel: TokenPanelService;
    }
}
/** One session's aggregated token snapshot served to the browser. */
export interface SessionTokenSnapshot {
    readonly sessionId: string;
    /** True when the session has a live agent (otherwise archival/historic). */
    readonly live: boolean;
    /** Title hint: the session title when available, else the id tail. */
    readonly label: string;
    /** Session title text when the title service has one. */
    readonly title?: string;
    /** Total request-and-response pressure (provider or heuristic anchor). */
    readonly totalTokens: number;
    /** Heuristic total across the current model-visible surface. */
    readonly surfaceTokens: number;
    /** Durable provider usage buckets (absent until the first provider report). */
    readonly usage?: TokenUsageProjection;
    /** Newest request pressure and route capacity (absent until usage lands). */
    readonly pressureTokens?: number;
    readonly projectedTokens?: number;
    readonly contextWindow?: number;
    /** Heuristic context composition (system/tools/messages). */
    readonly systemTokens: number;
    readonly toolsTokens: number;
    readonly messageTokens: number;
    /** Rolling history of total pressure per poll tick (oldest first). */
    readonly history: readonly HistoryPoint[];
}
/** One timestamped history sample. */
export interface HistoryPoint {
    /** Sample timestamp in epoch milliseconds. */
    readonly t: number;
    /** Total request-and-response pressure at that sample. */
    readonly total: number;
}
/** Aggregate snapshot for every live agent session. */
export interface TokenPanelSnapshot {
    readonly generatedAt: number;
    readonly sessions: readonly SessionTokenSnapshot[];
    /** Display-only price estimates (CNY per 1M tokens). */
    readonly prices: PriceEstimate;
    /** Aggregate generation speed (output tokens / second across sessions). */
    readonly tps: number;
    /** Monthly budget in CNY (0 = meter disabled). */
    readonly budgetMonthly: number;
}
/** Display-only price estimate (CNY per 1M tokens). */
export interface PriceEstimate {
    readonly input: number;
    readonly cacheRead: number;
    readonly output: number;
    /** Pricing mode in effect: flat, peak or off-peak. */
    readonly mode: 'flat' | 'peak' | 'offpeak';
}
/** One day's usage aggregate. */
export interface DayStat {
    readonly date: string;
    readonly input: number;
    readonly output: number;
    readonly cacheRead: number;
    readonly cacheWrite: number;
    readonly total: number;
}
/** One month's usage aggregate. */
export interface MonthStat {
    readonly month: string;
    readonly input: number;
    readonly output: number;
    readonly cacheRead: number;
    readonly cacheWrite: number;
    readonly total: number;
}
/** Durable statistics payload. */
export interface TokenStats {
    readonly generatedAt: number;
    readonly days: readonly DayStat[];
    readonly months: readonly MonthStat[];
    /** Display-only price estimates (CNY per 1M tokens). */
    readonly prices: PriceEstimate;
}
/**
 * Service aggregating token data for the panel. Constructing the service
 * registers it on `ctx.tokenPanel` (the Service base class provides the
 * key automatically), so the web surface can resolve it through a stable
 * key even while the web server binds later.
 */
export declare class TokenPanelService extends Service {
    readonly config: Config;
    static Config: z<Config>;
    private readonly history;
    private readonly lastUsage;
    private readonly knownSessions;
    private lastSampleAt;
    private readonly dataDir;
    private lastTpsOutput;
    private lastTpsAt;
    private cachedBalance;
    private balanceInFlight;
    constructor(ctx: Context, config: Config);
    /** Restore previously-seen session snapshots from known-sessions.json. */
    private loadKnownSessions;
    /** Persist the known-session registry atomically (tmp + rename). */
    private saveKnownSessions;
    /** Resolve the price table currently in effect (flat or peak/off-peak). */
    resolvePrices(now: number): PriceEstimate;
    /** Restore the last-seen usage baselines from state.json (crash-safe). */
    private loadState;
    /** Persist last-seen baselines atomically (tmp + rename). */
    private saveState;
    private sample;
    /** Persist a usage delta for one session to today's JSONL file. */
    private persistDelta;
    collect(): TokenPanelSnapshot;
    /** Aggregate all durable per-day logs into day and month statistics. */
    collectStats(): TokenStats;
    /** Fetch the DeepSeek account balance (cached 5 min, single-flight). */
    fetchBalance(): Promise<{
        value: number;
        currency: string;
        at: number;
    } | null>;
}
export declare function apply(ctx: Context, config: Config): void;
