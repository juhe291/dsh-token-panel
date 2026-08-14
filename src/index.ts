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

import type { IncomingMessage, ServerResponse } from 'node:http'
import { homedir } from 'node:os'
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Context, Service } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { Session } from '@deepseek-ai/dsh-session'
import type { SessionProjectionRegistry } from '@deepseek-ai/dsh-session-projection'
import type { SessionTitleService } from '@deepseek-ai/dsh-session-title'
import type { TokenMeter, TokenUsageProjection } from '@deepseek-ai/dsh-token-meter'

export const name = 'dsh-token-panel'
export const inject = ['tokenMeter', 'sessionProjections', 'sessionTitle', 'agents', 'credentials']

export interface Config {
  /** Browser panel poll cadence in milliseconds. */
  pollInterval: number
  /** Display-only CNY price per 1M uncached input tokens (flat mode). */
  pricePerMInput: number
  /** Display-only CNY price per 1M cache-hit (read) tokens (flat mode). */
  pricePerMCacheRead: number
  /** Display-only CNY price per 1M output tokens (flat mode). */
  pricePerMOutput: number
  /** Pricing mode: 'flat' uses the fixed prices above; 'peak-offpeak' switches
   *  by Beijing time (peak 9-12 & 14-18, off-peak otherwise) using the
   *  peak/off-peak price keys below. */
  priceMode: 'flat' | 'peak-offpeak'
  /** Peak-period uncached input price (CNY / 1M tokens). */
  pricePeakInput: number
  /** Peak-period cache-hit price (CNY / 1M tokens). */
  pricePeakCacheRead: number
  /** Peak-period output price (CNY / 1M tokens). */
  pricePeakOutput: number
  /** Off-peak uncached input price (CNY / 1M tokens). */
  priceOffpeakInput: number
  /** Off-peak cache-hit price (CNY / 1M tokens). */
  priceOffpeakCacheRead: number
  /** Off-peak output price (CNY / 1M tokens). */
  priceOffpeakOutput: number
  /** Monthly budget in CNY for the budget meter; 0 disables the meter. */
  budgetMonthly: number
  /** Directory for durable per-day usage logs (default ~/.dsh/cache/dsh-token-panel). */
  dataDir?: string
}

export const Config: z<Config> = z.object({
  pollInterval: z.number().default(1500),
  // DeepSeek official CNY prices per 1M tokens for deepseek-v4-flash
  // (current table, valid until the 2026-08-17 peak/off-peak revision):
  // cache hit ¥0.02, cache miss ¥1, output ¥2. Display-only estimates —
  // the authoritative bill is the provider dashboard.
  pricePerMInput: z.number().default(1),
  pricePerMCacheRead: z.number().default(0.02),
  pricePerMOutput: z.number().default(2),
  priceMode: z.union([z.const('flat'), z.const('peak-offpeak')]).default('flat'),
  // 2026-08-17 peak/off-peak schedule (Beijing time): peak 9-12 & 14-18.
  pricePeakInput: z.number().default(3),
  pricePeakCacheRead: z.number().default(0.1),
  pricePeakOutput: z.number().default(9),
  priceOffpeakInput: z.number().default(1.5),
  priceOffpeakCacheRead: z.number().default(0.05),
  priceOffpeakOutput: z.number().default(4.5),
  budgetMonthly: z.number().default(0),
  dataDir: z.string(),
})

declare module '@deepseek-ai/cordis' {
  interface Context {
    tokenPanel: TokenPanelService
  }
}

/** One session's aggregated token snapshot served to the browser. */
export interface SessionTokenSnapshot {
  readonly sessionId: string
  /** True when the session has a live agent (otherwise archival/historic). */
  readonly live: boolean
  /** Title hint: the session title when available, else the id tail. */
  readonly label: string
  /** Session title text when the title service has one. */
  readonly title?: string
  /** Total request-and-response pressure (provider or heuristic anchor). */
  readonly totalTokens: number
  /** Heuristic total across the current model-visible surface. */
  readonly surfaceTokens: number
  /** Durable provider usage buckets (absent until the first provider report). */
  readonly usage?: TokenUsageProjection
  /** Newest request pressure and route capacity (absent until usage lands). */
  readonly pressureTokens?: number
  readonly projectedTokens?: number
  readonly contextWindow?: number
  /** Heuristic context composition (system/tools/messages). */
  readonly systemTokens: number
  readonly toolsTokens: number
  readonly messageTokens: number
  /** Rolling history of total pressure per poll tick (oldest first). */
  readonly history: readonly HistoryPoint[]
}

/** One timestamped history sample. */
export interface HistoryPoint {
  /** Sample timestamp in epoch milliseconds. */
  readonly t: number
  /** Total request-and-response pressure at that sample. */
  readonly total: number
}

/** Aggregate snapshot for every live agent session. */
export interface TokenPanelSnapshot {
  readonly generatedAt: number
  readonly sessions: readonly SessionTokenSnapshot[]
  /** Display-only price estimates (CNY per 1M tokens). */
  readonly prices: PriceEstimate
  /** Aggregate generation speed (output tokens / second across sessions). */
  readonly tps: number
  /** Monthly budget in CNY (0 = meter disabled). */
  readonly budgetMonthly: number
}

/** Display-only price estimate (CNY per 1M tokens). */
export interface PriceEstimate {
  readonly input: number
  readonly cacheRead: number
  readonly output: number
  /** Pricing mode in effect: flat, peak or off-peak. */
  readonly mode: 'flat' | 'peak' | 'offpeak'
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
  /** Display-only price estimates (CNY per 1M tokens). */
  readonly prices: PriceEstimate
}

/** Rolling per-session history buffer (600 points ≈ 15 min at 1.5s polling). */
const HISTORY_CAP = 600

/** One appended usage-delta line (short keys to keep logs compact). */
interface UsageDeltaLine {
  /** Epoch ms of the observation. */
  readonly t: number
  /** Session id tail (stable identifier for display). */
  readonly s: string
  /** Delta of uncached input tokens since the last observation. */
  readonly i: number
  /** Delta of output tokens since the last observation. */
  readonly o: number
  /** Delta of cache-read tokens since the last observation. */
  readonly cr: number
  /** Delta of cache-write tokens since the last observation. */
  readonly cw: number
}

/** Last observed cumulative usage per session, for delta computation. */
interface LastUsage {
  readonly input: number
  readonly output: number
  readonly cacheRead: number
  readonly cacheWrite: number
}

function defaultDataDir(): string {
  return join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'cache', 'dsh-token-panel')
}

function dayKey(t: number): string {
  const d = new Date(t)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function monthKey(day: string): string {
  return day.slice(0, 7)
}

/**
 * Service aggregating token data for the panel. Constructing the service
 * registers it on `ctx.tokenPanel` (the Service base class provides the
 * key automatically), so the web surface can resolve it through a stable
 * key even while the web server binds later.
 */
export class TokenPanelService extends Service {
  static Config = Config

  private readonly history = new Map<string, HistoryPoint[]>()
  private readonly lastUsage = new Map<string, LastUsage>()
  private lastSampleAt = 0
  private readonly dataDir: string
  private lastTpsOutput = 0
  private lastTpsAt = 0
  private cachedBalance: { value: number; currency: string; at: number } | null = null
  private balanceInFlight = false

  constructor(ctx: Context, public readonly config: Config) {
    super(ctx, 'tokenPanel')
    this.dataDir = config.dataDir !== undefined && config.dataDir !== ''
      ? config.dataDir
      : defaultDataDir()
    this.loadState()
  }

  /** Resolve the price table currently in effect (flat or peak/off-peak). */
  resolvePrices(now: number): PriceEstimate {
    if (this.config.priceMode !== 'peak-offpeak') {
      return {
        input: this.config.pricePerMInput,
        cacheRead: this.config.pricePerMCacheRead,
        output: this.config.pricePerMOutput,
        mode: 'flat',
      }
    }
    // Beijing peak hours: 9-12 and 14-18. Use the Beijing hour directly.
    const beijing = new Date(now + 8 * 3_600_000)
    const hour = beijing.getUTCHours()
    const peak = (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18)
    return peak
      ? {
          input: this.config.pricePeakInput,
          cacheRead: this.config.pricePeakCacheRead,
          output: this.config.pricePeakOutput,
          mode: 'peak',
        }
      : {
          input: this.config.priceOffpeakInput,
          cacheRead: this.config.priceOffpeakCacheRead,
          output: this.config.priceOffpeakOutput,
          mode: 'offpeak',
        }
  }

  /** Restore the last-seen usage baselines from state.json (crash-safe). */
  private loadState(): void {
    try {
      const statePath = join(this.dataDir, 'state.json')
      if (!existsSync(statePath)) return
      const state = JSON.parse(readFileSync(statePath, 'utf8')) as Record<string, LastUsage>
      for (const [id, usage] of Object.entries(state)) {
        if (usage !== null && typeof usage === 'object'
          && typeof usage.input === 'number' && typeof usage.output === 'number'
          && typeof usage.cacheRead === 'number' && typeof usage.cacheWrite === 'number') {
          this.lastUsage.set(id, usage)
        }
      }
    } catch (error: unknown) {
      this.ctx.logger.warn(`token-panel: state restore failed: ${String(error)}`)
    }
  }

  /** Persist last-seen baselines atomically (tmp + rename). */
  private saveState(): void {
    try {
      if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true })
      const state: Record<string, LastUsage> = {}
      for (const [id, usage] of this.lastUsage) state[id] = usage
      const tmp = join(this.dataDir, 'state.json.tmp')
      const final = join(this.dataDir, 'state.json')
      writeFileSync(tmp, JSON.stringify(state))
      renameSync(tmp, final)
    } catch (error: unknown) {
      this.ctx.logger.warn(`token-panel: state save failed: ${String(error)}`)
    }
  }

  private sample(id: string, totalTokens: number, now: number): readonly HistoryPoint[] {
    let series = this.history.get(id)
    if (series === undefined) {
      series = []
      this.history.set(id, series)
    }
    // Only one sample per tick even when multiple tabs poll.
    if (now - this.lastSampleAt >= 500) {
      series.push({ t: now, total: totalTokens })
      if (series.length > HISTORY_CAP) series.shift()
    }
    return series
  }

  /** Persist a usage delta for one session to today's JSONL file. */
  private persistDelta(id: string, usage: TokenUsageProjection, now: number): void {
    const previous = this.lastUsage.get(id)
    if (previous === undefined) {
      // First observation (fresh install or a session unknown to state):
      // record the FULL current usage as the opening baseline so nothing
      // that happened before the panel started is silently lost. Subsequent
      // observations write deltas against this baseline.
      if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true })
      appendFileSync(join(this.dataDir, `usage-${dayKey(now)}.jsonl`), `${JSON.stringify({
        t: now,
        s: id.slice(-8),
        i: usage.uncachedInputTokens,
        o: usage.outputTokens,
        cr: usage.cacheReadTokens,
        cw: usage.cacheWriteTokens,
      } satisfies UsageDeltaLine)}\n`)
      this.lastUsage.set(id, {
        input: usage.uncachedInputTokens,
        output: usage.outputTokens,
        cacheRead: usage.cacheReadTokens,
        cacheWrite: usage.cacheWriteTokens,
      })
      this.saveState()
      return
    }
    const delta: UsageDeltaLine = {
      t: now,
      s: id.slice(-8),
      i: Math.max(0, usage.uncachedInputTokens - previous.input),
      o: Math.max(0, usage.outputTokens - previous.output),
      cr: Math.max(0, usage.cacheReadTokens - previous.cacheRead),
      cw: Math.max(0, usage.cacheWriteTokens - previous.cacheWrite),
    }
    this.lastUsage.set(id, {
      input: usage.uncachedInputTokens,
      output: usage.outputTokens,
      cacheRead: usage.cacheReadTokens,
      cacheWrite: usage.cacheWriteTokens,
    })
    if (delta.i === 0 && delta.o === 0 && delta.cr === 0 && delta.cw === 0) return
    if (!existsSync(this.dataDir)) mkdirSync(this.dataDir, { recursive: true })
    appendFileSync(join(this.dataDir, `usage-${dayKey(now)}.jsonl`), `${JSON.stringify(delta)}\n`)
    this.saveState()
  }

  collect(): TokenPanelSnapshot {
    const ctx = this.ctx as Context & {
      tokenMeter: TokenMeter
      sessionProjections: SessionProjectionRegistry
      sessionTitle: SessionTitleService
      agents: { list(): Agent[] }
    }
    const agents = ctx.agents.list()
    const sessions: SessionTokenSnapshot[] = []
    const seen = new Set<string>()
    const now = Date.now()

    for (const agent of agents) {
      const session: Session = agent.session
      const id = session.id
      if (seen.has(id)) continue
      seen.add(id)

      let usage: TokenUsageProjection | undefined
      let pressureTokens: number | undefined
      let projectedTokens: number | undefined
      let contextWindow: number | undefined
      let systemTokens = 0
      let toolsTokens = 0
      let messageTokens = 0

      try {
        const projection = ctx.sessionProjections.snapshot(session)
        const tokenUsage = projection.values.tokenUsage
        if (tokenUsage !== undefined) usage = tokenUsage
        const pressure = projection.values.contextPressure
        if (pressure !== undefined) {
          pressureTokens = pressure.pressureTokens
          projectedTokens = pressure.projectedTokens
          contextWindow = pressure.contextWindow
        }
        const breakdown = projection.values.contextBreakdown
        if (breakdown !== undefined) {
          systemTokens = breakdown.systemTokens
          toolsTokens = breakdown.toolsTokens
          messageTokens = breakdown.messageTokens
        }
      } catch (error: unknown) {
        // A cold or concurrently-removing session must not break the panel.
        ctx.logger.debug(`token-panel: projection read failed for ${id}: ${String(error)}`)
      }

      if (usage !== undefined) {
        try {
          this.persistDelta(id, usage, now)
        } catch (error: unknown) {
          ctx.logger.warn(`token-panel: usage persist failed for ${id}: ${String(error)}`)
        }
      }

      let measurement: { totalTokens: number; surfaceTokens: number } | undefined
      try {
        measurement = ctx.tokenMeter.measure(session)
      } catch (error: unknown) {
        ctx.logger.debug(`token-panel: measure failed for ${id}: ${String(error)}`)
      }

      const totalTokens = measurement?.totalTokens ?? 0
      let title: string | undefined
      try {
        title = ctx.sessionTitle.get(session)?.title
      } catch (error: unknown) {
        ctx.logger.debug(`token-panel: title read failed for ${id}: ${String(error)}`)
      }
      sessions.push({
        sessionId: id,
        live: true,
        label: title !== undefined && title !== '' ? title : id.slice(-8),
        ...(title !== undefined && title !== '' ? { title } : {}),
        totalTokens,
        surfaceTokens: measurement?.surfaceTokens ?? 0,
        ...(usage !== undefined ? { usage } : {}),
        ...(pressureTokens !== undefined ? { pressureTokens } : {}),
        ...(projectedTokens !== undefined ? { projectedTokens } : {}),
        ...(contextWindow !== undefined ? { contextWindow } : {}),
        systemTokens,
        toolsTokens,
        messageTokens,
        history: [...this.sample(id, totalTokens, now)],
      })
    }

    this.lastSampleAt = now

    // Aggregate TPS: total output tokens delta across sessions per second.
    let totalOutput = 0
    for (const session of sessions) totalOutput += session.usage?.outputTokens ?? 0
    let tps = 0
    if (this.lastTpsAt > 0 && now > this.lastTpsAt) {
      const delta = Math.max(0, totalOutput - this.lastTpsOutput)
      tps = delta / ((now - this.lastTpsAt) / 1000)
    }
    this.lastTpsOutput = totalOutput
    this.lastTpsAt = now

    // Hide sessions that never actually consumed anything (fresh empty
    // conversations created by clicking "New chat" show 0/≈0 and are noise).
    const meaningful = sessions.filter((session) =>
      session.totalTokens > 0 || session.surfaceTokens > 0)
    meaningful.sort((a, b) => b.totalTokens - a.totalTokens)
    return {
      generatedAt: now,
      sessions: meaningful,
      prices: this.resolvePrices(now),
      tps,
      budgetMonthly: this.config.budgetMonthly,
    }
  }

  /** Aggregate all durable per-day logs into day and month statistics. */
  collectStats(): TokenStats {
    interface MutableDay {
      date: string
      input: number
      output: number
      cacheRead: number
      cacheWrite: number
    }
    interface MutableMonth {
      month: string
      input: number
      output: number
      cacheRead: number
      cacheWrite: number
    }
    const days = new Map<string, MutableDay>()
    if (existsSync(this.dataDir)) {
      for (const entry of readdirSync(this.dataDir)) {
        const match = /^usage-(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(entry)
        if (match === null) continue
        const date = match[1] ?? ''
        let day = days.get(date)
        if (day === undefined) {
          day = { date, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
          days.set(date, day)
        }
        const lines = readFileSync(join(this.dataDir, entry), 'utf8').split('\n')
        for (const line of lines) {
          if (line === '') continue
          try {
            const delta = JSON.parse(line) as UsageDeltaLine
            if (typeof delta.i !== 'number' || typeof delta.o !== 'number') continue
            day.input += delta.i
            day.output += delta.o
            day.cacheRead += delta.cr
            day.cacheWrite += delta.cw
          } catch {
            // Torn or foreign line: skip.
          }
        }
      }
    }
    // Recompute totals and sort newest first.
    const dayList: DayStat[] = [...days.values()].map((day) => ({
      date: day.date,
      input: day.input,
      output: day.output,
      cacheRead: day.cacheRead,
      cacheWrite: day.cacheWrite,
      total: day.input + day.output + day.cacheRead + day.cacheWrite,
    })).sort((a, b) => b.date.localeCompare(a.date))

    const months = new Map<string, MutableMonth>()
    for (const day of dayList) {
      const month = monthKey(day.date)
      let entry = months.get(month)
      if (entry === undefined) {
        entry = { month, input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
        months.set(month, entry)
      }
      entry.input += day.input
      entry.output += day.output
      entry.cacheRead += day.cacheRead
      entry.cacheWrite += day.cacheWrite
    }
    const monthList: MonthStat[] = [...months.values()].map((entry) => ({
      month: entry.month,
      input: entry.input,
      output: entry.output,
      cacheRead: entry.cacheRead,
      cacheWrite: entry.cacheWrite,
      total: entry.input + entry.output + entry.cacheRead + entry.cacheWrite,
    })).sort((a, b) => b.month.localeCompare(a.month))

    return {
      generatedAt: Date.now(),
      days: dayList,
      months: monthList,
      prices: this.resolvePrices(Date.now()),
    }
  }

  /** Fetch the DeepSeek account balance (cached 5 min, single-flight). */
  async fetchBalance(): Promise<{ value: number; currency: string; at: number } | null> {
    if (this.cachedBalance !== null && Date.now() - this.cachedBalance.at < 5 * 60_000) {
      return this.cachedBalance
    }
    if (this.balanceInFlight) return this.cachedBalance
    this.balanceInFlight = true
    try {
      const ctx = this.ctx as Context & {
        credentials: { resolve(ref: string): { secret?: string } | undefined }
      }
      const credential = ctx.credentials.resolve('DEEPSEEK_API_KEY')
      const key = credential?.secret
      if (key === undefined || key === '') return null
      const response = await fetch('https://api.deepseek.com/user/balance', {
        headers: { Authorization: `Bearer ${key}` },
      })
      if (!response.ok) {
        this.ctx.logger.warn(`token-panel: balance fetch HTTP ${response.status}`)
        return this.cachedBalance
      }
      const body = (await response.json()) as {
        balance_infos?: Array<{ currency?: string; total_balance?: string }>
      }
      const info = body.balance_infos?.[0]
      const value = Number(info?.total_balance ?? NaN)
      if (!Number.isFinite(value)) return this.cachedBalance
      this.cachedBalance = { value, currency: info?.currency ?? 'CNY', at: Date.now() }
      return this.cachedBalance
    } catch (error: unknown) {
      this.ctx.logger.warn(`token-panel: balance fetch failed: ${String(error)}`)
      return this.cachedBalance
    } finally {
      this.balanceInFlight = false
    }
  }
}

/**
 * Web-server route host: the beta transition renames the service without
 * changing the route registration shape, so accept either key.
 */
interface WebRouteHost {
  register(route: {
    kind: 'exact' | 'prefix'
    path: string
    handler: (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
  }): () => void
}

const WEB_SERVER_KEYS = ['webServer', 'httpServer'] as const

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

export function apply(ctx: Context, config: Config): void {
  const service = new TokenPanelService(ctx, config)

  let webRegistered = false
  const registerWebSurface = (): void => {
    if (webRegistered) return
    const webServer = (ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1])) as WebRouteHost | undefined
    if (webServer === undefined) return
    webRegistered = true

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/dsh-token-panel/snapshot',
      handler: async (_req, res) => {
        try {
          json(res, 200, service.collect())
        } catch (error: unknown) {
          ctx.logger.warn(`token-panel: snapshot failed: ${String(error)}`)
          json(res, 500, { error: String(error) })
        }
      },
    }), 'token-panel: snapshot route')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/dsh-token-panel/stats',
      handler: async (_req, res) => {
        try {
          json(res, 200, service.collectStats())
        } catch (error: unknown) {
          ctx.logger.warn(`token-panel: stats failed: ${String(error)}`)
          json(res, 500, { error: String(error) })
        }
      },
    }), 'token-panel: stats route')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/dsh-token-panel/balance',
      handler: async (_req, res) => {
        try {
          const balance = await service.fetchBalance()
          json(res, 200, balance === null
            ? { available: false }
            : { available: true, value: balance.value, currency: balance.currency, at: balance.at })
        } catch (error: unknown) {
          ctx.logger.warn(`token-panel: balance route failed: ${String(error)}`)
          json(res, 500, { error: String(error) })
        }
      },
    }), 'token-panel: balance route')
  }

  registerWebSurface()
  ctx.on('internal/service', (name) => {
    if (WEB_SERVER_KEYS.includes(name as (typeof WEB_SERVER_KEYS)[number])) {
      registerWebSurface()
    }
  })
}
