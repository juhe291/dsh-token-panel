/** Browser plugin for the dsh-token-panel HUD. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type TokenHudLocale } from './TokenHud.tsx';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** dsh-token-panel HUD copy. */
        'token-panel': keyof TokenHudLocale;
    }
}
/** Required client services. */
export declare const inject: string[];
/**
 * Mount the token HUD through a body portal: a fixed glass panel showing
 * live token consumption across sessions, polling the host snapshot route.
 * Copy follows the DSH locale (en/zh) via `ctx.locale`.
 */
export declare function apply(ctx: ClientContext): void;
