/** Browser plugin for the dsh-token-panel HUD. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Required services: the client runtime only (panel is a body portal). */
export declare const inject: string[];
/**
 * Mount the token HUD through a body portal: a fixed glass panel showing
 * live token consumption across sessions, polling the host snapshot route.
 */
export declare function apply(ctx: ClientContext): void;
