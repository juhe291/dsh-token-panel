/** Browser plugin for the dsh-token-panel HUD. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { createRoot } from 'react-dom/client'
import { TokenHud } from './TokenHud.tsx'

/** Required services: the client runtime only (panel is a body portal). */
export const inject = ['slots']

/**
 * Mount the token HUD through a body portal: a fixed glass panel showing
 * live token consumption across sessions, polling the host snapshot route.
 */
export function apply(ctx: ClientContext): void {
  const host = document.createElement('div')
  host.dataset.tokenPanelHost = ''
  document.body.appendChild(host)
  const root = createRoot(host)
  root.render(<TokenHud />)
  ctx.effect(() => () => {
    root.unmount()
    host.remove()
  }, 'token-panel: hud')
}
