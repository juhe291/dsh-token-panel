import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { TokenHud } from "./TokenHud.js";
/** Required services: the client runtime only (panel is a body portal). */
export const inject = ['slots'];
/**
 * Mount the token HUD through a body portal: a fixed glass panel showing
 * live token consumption across sessions, polling the host snapshot route.
 */
export function apply(ctx) {
    const host = document.createElement('div');
    host.dataset.tokenPanelHost = '';
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(_jsx(TokenHud, {}));
    ctx.effect(() => () => {
        root.unmount();
        host.remove();
    }, 'token-panel: hud');
}
