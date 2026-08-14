/**
 * TokenHud: the real-time token consumption dashboard.
 *
 * A compact glass panel pinned to the bottom-right of the viewport. It
 * polls the host snapshot route and renders per-session token usage with a
 * tech-style visual language: monospace numerals, neon accents, progress
 * bars and a subtle scanline texture. Click to expand/collapse; hover rows
 * for the breakdown.
 *
 * @module dsh-token-panel/client/hud
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** One session's token row as served by the host. */
export interface SessionTokenRow {
    readonly sessionId: string;
    readonly live: boolean;
    readonly label: string;
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
}
/** Aggregate snapshot body. */
export interface TokenSnapshot {
    readonly generatedAt: number;
    readonly sessions: readonly SessionTokenRow[];
}
/** The top-level HUD: polling, aggregation and layout. */
export declare function TokenHud(): JSX.Element;
/** Re-export type for the client entry; keeps the module surface explicit. */
export type TokenHudInjected = {
    readonly ctx: ClientContext;
};
//# sourceMappingURL=TokenHud.d.ts.map