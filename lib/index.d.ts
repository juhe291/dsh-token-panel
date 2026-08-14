/**
 * dsh-token-panel host plugin.
 *
 * Exposes one HTTP route (`/plugins/dsh-token-panel/snapshot`) that
 * aggregates live token usage across every live agent session:
 *
 * - `ctx.tokenMeter.measure(session)` for request-and-response pressure and
 *   the heuristic surface total;
 * - `ctx.sessionProjections.snapshot(session)` for the durable provider
 *   usage buckets (`tokenUsage`), context pressure / capacity
 *   (`contextPressure`) and the heuristic context composition
 *   (`contextBreakdown`).
 *
 * The route is registered lazily once the Web server service binds (a
 * headless profile keeps the plugin inert). The browser HUD polls it with
 * `Cache-Control: no-store` and renders the tech-style dashboard.
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
    /** Display-only USD price per 1M input tokens. */
    pricePerMInput: number;
    /** Display-only USD price per 1M output tokens. */
    pricePerMOutput: number;
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
    /** Title hint: the agent id or session id tail. */
    readonly label: string;
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
}
/** Aggregate snapshot for every live agent session. */
export interface TokenPanelSnapshot {
    readonly generatedAt: number;
    readonly sessions: readonly SessionTokenSnapshot[];
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
    constructor(ctx: Context, config: Config);
    collect(): TokenPanelSnapshot;
}
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map