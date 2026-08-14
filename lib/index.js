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
import { homedir } from 'node:os';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Service } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export const name = 'dsh-token-panel';
export const inject = ['tokenMeter', 'sessionProjections', 'sessionTitle', 'agents', 'credentials'];
const priceTierSchema = z.object({
    hit: z.number().min(0),
    miss: z.number().min(0),
    output: z.number().min(0),
});
const modelPriceSchema = z.object({
    flat: priceTierSchema,
    peak: priceTierSchema,
    offpeak: priceTierSchema,
});
// DeepSeek official prices per 1M tokens (flat table, valid until 2026-08-17).
const BUILTIN_MODEL_PRICES = {
    'deepseek-v4-flash': {
        flat: { hit: 0.02, miss: 1, output: 2 },
        // 2026-08-17 peak/off-peak revision:
        peak: { hit: 0.1, miss: 3, output: 9 },
        offpeak: { hit: 0.05, miss: 1.5, output: 4.5 },
    },
    'deepseek-v4-pro': {
        flat: { hit: 0.025, miss: 3, output: 6 },
        peak: { hit: 0.3, miss: 9, output: 27 },
        offpeak: { hit: 0.15, miss: 4.5, output: 13.5 },
    },
};
export const Config = z.object({
    pollInterval: z.number().default(1500),
    // DeepSeek official CNY prices per 1M tokens for deepseek-v4-flash
    // (current table, valid until the 2026-08-17 peak/off-peak revision):
    // cache hit ¥0.02, cache miss ¥1, output ¥2. Display-only estimates —
    // the authoritative bill is the provider dashboard.
    pricePerMInput: z.number().default(1),
    pricePerMCacheRead: z.number().default(0.02),
    pricePerMOutput: z.number().default(2),
    priceMode: z.union([z.const('flat'), z.const('peak-offpeak'), z.const('auto')]).default('auto'),
    // 2026-08-17 peak/off-peak schedule (Beijing time): peak 9-12 & 14-18.
    pricePeakInput: z.number().default(3),
    pricePeakCacheRead: z.number().default(0.1),
    pricePeakOutput: z.number().default(9),
    priceOffpeakInput: z.number().default(1.5),
    priceOffpeakCacheRead: z.number().default(0.05),
    priceOffpeakOutput: z.number().default(4.5),
    modelPrices: z.dict(modelPriceSchema).default(BUILTIN_MODEL_PRICES),
    budgetMonthly: z.number().default(0),
    dataDir: z.string(),
});
/** Rolling per-session history buffer (600 points ≈ 15 min at 1.5s polling). */
const HISTORY_CAP = 600;
function defaultDataDir() {
    return join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'cache', 'dsh-token-panel');
}
function dayKey(t) {
    const d = new Date(t);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}
function monthKey(day) {
    return day.slice(0, 7);
}
/**
 * Service aggregating token data for the panel. Constructing the service
 * registers it on `ctx.tokenPanel` (the Service base class provides the
 * key automatically), so the web surface can resolve it through a stable
 * key even while the web server binds later.
 */
export class TokenPanelService extends Service {
    config;
    static Config = Config;
    history = new Map();
    lastUsage = new Map();
    knownSessions = new Map();
    /** Per-session per-model token buckets (rebuilt from logs on restart). */
    sessionModelUsage = new Map();
    lastSampleAt = 0;
    dataDir;
    lastTpsOutput = 0;
    lastTpsAt = 0;
    cachedBalance = null;
    balanceInFlight = false;
    constructor(ctx, config) {
        super(ctx, 'tokenPanel');
        this.config = config;
        this.dataDir = config.dataDir !== undefined && config.dataDir !== ''
            ? config.dataDir
            : defaultDataDir();
        this.loadState();
        this.loadKnownSessions();
        this.rebuildSessionModelUsage();
    }
    /** Rebuild per-session per-model buckets by replaying the usage logs. */
    rebuildSessionModelUsage() {
        if (!existsSync(this.dataDir))
            return;
        try {
            for (const entry of readdirSync(this.dataDir)) {
                if (!/^usage-\d{4}-\d{2}-\d{2}\.jsonl$/.test(entry))
                    continue;
                for (const line of readFileSync(join(this.dataDir, entry), 'utf8').split('\n')) {
                    if (line === '')
                        continue;
                    try {
                        const delta = JSON.parse(line);
                        if (typeof delta.i !== 'number' || typeof delta.o !== 'number')
                            continue;
                        this.addModelUsage(delta.s, delta.m, delta.i, delta.o, delta.cr, delta.cw);
                    }
                    catch {
                        // Torn or foreign line: skip.
                    }
                }
            }
        }
        catch (error) {
            this.ctx.logger.warn(`token-panel: session model usage rebuild failed: ${String(error)}`);
        }
    }
    /** Accumulate a delta into the per-session per-model bucket map. */
    addModelUsage(sessionTail, model, i, o, cr, cw) {
        let byModel = this.sessionModelUsage.get(sessionTail);
        if (byModel === undefined) {
            byModel = new Map();
            this.sessionModelUsage.set(sessionTail, byModel);
        }
        const key = typeof model === 'string' && model !== '' ? model : 'unknown';
        const bucket = byModel.get(key) ?? { i: 0, o: 0, cr: 0, cw: 0 };
        bucket.i += i;
        bucket.o += o;
        bucket.cr += cr;
        bucket.cw += cw;
        byModel.set(key, bucket);
    }
    /** Restore previously-seen session snapshots from known-sessions.json. */
    loadKnownSessions() {
        try {
            const path = join(this.dataDir, 'known-sessions.json');
            if (!existsSync(path))
                return;
            const rows = JSON.parse(readFileSync(path, 'utf8'));
            for (const [id, row] of Object.entries(rows)) {
                if (row !== null && typeof row === 'object'
                    && typeof row.label === 'string' && typeof row.totalTokens === 'number') {
                    this.knownSessions.set(id, row);
                }
            }
        }
        catch (error) {
            this.ctx.logger.warn(`token-panel: known-sessions restore failed: ${String(error)}`);
        }
    }
    /** Persist the known-session registry atomically (tmp + rename). */
    saveKnownSessions() {
        try {
            if (!existsSync(this.dataDir))
                mkdirSync(this.dataDir, { recursive: true });
            const rows = {};
            for (const [id, row] of this.knownSessions)
                rows[id] = row;
            const tmp = join(this.dataDir, 'known-sessions.json.tmp');
            const final = join(this.dataDir, 'known-sessions.json');
            writeFileSync(tmp, JSON.stringify(rows));
            renameSync(tmp, final);
        }
        catch (error) {
            this.ctx.logger.warn(`token-panel: known-sessions save failed: ${String(error)}`);
        }
    }
    /** Resolve the price table currently in effect (flat or peak/off-peak). */
    resolvePrices(now) {
        const peak = this.isPeakNow(now);
        if (this.effectiveMode(now) === 'flat') {
            return {
                input: this.config.pricePerMInput,
                cacheRead: this.config.pricePerMCacheRead,
                output: this.config.pricePerMOutput,
                mode: 'flat',
            };
        }
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
            };
    }
    /** Which pricing family applies: 'auto' = flat before 2026-08-17
     *  (Beijing midnight), peak-offpeak from that date onward. */
    effectiveMode(now) {
        const mode = this.config.priceMode;
        if (mode === 'flat' || mode === 'peak-offpeak')
            return mode;
        // auto: the official peak/off-peak revision takes effect 2026-08-17 00:00 CST.
        const REVISION_MS = Date.UTC(2026, 7, 16, 16, 0, 0); // 2026-08-17 00:00 +08:00
        return now >= REVISION_MS ? 'peak-offpeak' : 'flat';
    }
    /** Beijing peak hours: 9-12 and 14-18. */
    isPeakNow(now) {
        const beijing = new Date(now + 8 * 3_600_000);
        const hour = beijing.getUTCHours();
        return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
    }
    /** Resolve the per-model price table in effect right now (flat/peak/offpeak). */
    resolveModelPrices(now) {
        const tier = this.effectiveMode(now) === 'peak-offpeak'
            ? (this.isPeakNow(now) ? 'peak' : 'offpeak')
            : 'flat';
        const tables = this.config.modelPrices ?? {};
        const resolved = {};
        for (const [model, table] of Object.entries(tables)) {
            resolved[model] = table[tier];
        }
        return resolved;
    }
    /** Restore the last-seen usage baselines from state.json (crash-safe). */
    loadState() {
        try {
            const statePath = join(this.dataDir, 'state.json');
            if (!existsSync(statePath))
                return;
            const state = JSON.parse(readFileSync(statePath, 'utf8'));
            for (const [id, usage] of Object.entries(state)) {
                if (usage !== null && typeof usage === 'object'
                    && typeof usage.input === 'number' && typeof usage.output === 'number'
                    && typeof usage.cacheRead === 'number' && typeof usage.cacheWrite === 'number') {
                    this.lastUsage.set(id, usage);
                }
            }
        }
        catch (error) {
            this.ctx.logger.warn(`token-panel: state restore failed: ${String(error)}`);
        }
    }
    /** Persist last-seen baselines atomically (tmp + rename). */
    saveState() {
        try {
            if (!existsSync(this.dataDir))
                mkdirSync(this.dataDir, { recursive: true });
            const state = {};
            for (const [id, usage] of this.lastUsage)
                state[id] = usage;
            const tmp = join(this.dataDir, 'state.json.tmp');
            const final = join(this.dataDir, 'state.json');
            writeFileSync(tmp, JSON.stringify(state));
            renameSync(tmp, final);
        }
        catch (error) {
            this.ctx.logger.warn(`token-panel: state save failed: ${String(error)}`);
        }
    }
    sample(id, totalTokens, outputTokens, now) {
        let series = this.history.get(id);
        if (series === undefined) {
            series = [];
            this.history.set(id, series);
        }
        // Only one sample per tick even when multiple tabs poll.
        if (now - this.lastSampleAt >= 500) {
            series.push({ t: now, total: totalTokens, output: outputTokens });
            if (series.length > HISTORY_CAP)
                series.shift();
        }
        return series;
    }
    /** Persist a usage delta for one session to today's JSONL file. */
    persistDelta(id, usage, now, model) {
        const previous = this.lastUsage.get(id);
        if (previous === undefined) {
            // First observation (fresh install or a session unknown to state):
            // record the FULL current usage as the opening baseline so nothing
            // that happened before the panel started is silently lost. Subsequent
            // observations write deltas against this baseline.
            if (!existsSync(this.dataDir))
                mkdirSync(this.dataDir, { recursive: true });
            appendFileSync(join(this.dataDir, `usage-${dayKey(now)}.jsonl`), `${JSON.stringify({
                t: now,
                s: id.slice(-8),
                m: model,
                i: usage.uncachedInputTokens,
                o: usage.outputTokens,
                cr: usage.cacheReadTokens,
                cw: usage.cacheWriteTokens,
            })}\n`);
            this.addModelUsage(id.slice(-8), model, usage.uncachedInputTokens, usage.outputTokens, usage.cacheReadTokens, usage.cacheWriteTokens);
            this.lastUsage.set(id, {
                input: usage.uncachedInputTokens,
                output: usage.outputTokens,
                cacheRead: usage.cacheReadTokens,
                cacheWrite: usage.cacheWriteTokens,
            });
            this.saveState();
            return;
        }
        const delta = {
            t: now,
            s: id.slice(-8),
            m: model,
            i: Math.max(0, usage.uncachedInputTokens - previous.input),
            o: Math.max(0, usage.outputTokens - previous.output),
            cr: Math.max(0, usage.cacheReadTokens - previous.cacheRead),
            cw: Math.max(0, usage.cacheWriteTokens - previous.cacheWrite),
        };
        this.lastUsage.set(id, {
            input: usage.uncachedInputTokens,
            output: usage.outputTokens,
            cacheRead: usage.cacheReadTokens,
            cacheWrite: usage.cacheWriteTokens,
        });
        if (delta.i === 0 && delta.o === 0 && delta.cr === 0 && delta.cw === 0)
            return;
        if (!existsSync(this.dataDir))
            mkdirSync(this.dataDir, { recursive: true });
        appendFileSync(join(this.dataDir, `usage-${dayKey(now)}.jsonl`), `${JSON.stringify(delta)}\n`);
        this.addModelUsage(id.slice(-8), model, delta.i, delta.o, delta.cr, delta.cw);
        this.saveState();
    }
    collect() {
        const ctx = this.ctx;
        const agents = ctx.agents.list();
        const sessions = [];
        const seen = new Set();
        const now = Date.now();
        for (const agent of agents) {
            const session = agent.session;
            const id = session.id;
            if (seen.has(id))
                continue;
            seen.add(id);
            let usage;
            let pressureTokens;
            let projectedTokens;
            let contextWindow;
            let systemTokens = 0;
            let toolsTokens = 0;
            let messageTokens = 0;
            try {
                const projection = ctx.sessionProjections.snapshot(session);
                const tokenUsage = projection.values.tokenUsage;
                if (tokenUsage !== undefined)
                    usage = tokenUsage;
                const pressure = projection.values.contextPressure;
                if (pressure !== undefined) {
                    pressureTokens = pressure.pressureTokens;
                    projectedTokens = pressure.projectedTokens;
                    contextWindow = pressure.contextWindow;
                }
                const breakdown = projection.values.contextBreakdown;
                if (breakdown !== undefined) {
                    systemTokens = breakdown.systemTokens;
                    toolsTokens = breakdown.toolsTokens;
                    messageTokens = breakdown.messageTokens;
                }
            }
            catch (error) {
                // A cold or concurrently-removing session must not break the panel.
                ctx.logger.debug(`token-panel: projection read failed for ${id}: ${String(error)}`);
            }
            if (usage !== undefined) {
                try {
                    this.persistDelta(id, usage, now, agent.options.model ?? 'unknown');
                }
                catch (error) {
                    ctx.logger.warn(`token-panel: usage persist failed for ${id}: ${String(error)}`);
                }
            }
            let measurement;
            try {
                measurement = ctx.tokenMeter.measure(session);
            }
            catch (error) {
                ctx.logger.debug(`token-panel: measure failed for ${id}: ${String(error)}`);
            }
            const totalTokens = measurement?.totalTokens ?? 0;
            let title;
            try {
                title = ctx.sessionTitle.get(session)?.title;
            }
            catch (error) {
                ctx.logger.debug(`token-panel: title read failed for ${id}: ${String(error)}`);
            }
            sessions.push({
                sessionId: id,
                live: true,
                model: agent.options.model,
                ...(this.sessionModelUsage.has(id.slice(-8))
                    ? { modelUsage: Object.fromEntries([...this.sessionModelUsage.get(id.slice(-8)).entries()].map(([model, bucket]) => [model, { i: bucket.i, o: bucket.o, cr: bucket.cr, cw: bucket.cw }])) }
                    : {}),
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
                history: [...this.sample(id, totalTokens, usage?.outputTokens ?? 0, now)],
            });
            // Remember every live session so restarts keep the row (historic
            // sessions have no live agent after a restart; the registry is the
            // only way the "show all" list survives).
            this.knownSessions.set(id, {
                label: title !== undefined && title !== '' ? title : id.slice(-8),
                ...(title !== undefined && title !== '' ? { title } : {}),
                totalTokens,
                lastSeen: now,
            });
        }
        // Append historic sessions (no live agent right now) from the registry.
        for (const [id, known] of this.knownSessions) {
            if (seen.has(id))
                continue;
            sessions.push({
                sessionId: id,
                live: false,
                label: known.label,
                ...(known.title !== undefined && known.title !== '' ? { title: known.title } : {}),
                totalTokens: known.totalTokens,
                surfaceTokens: 0,
                systemTokens: 0,
                toolsTokens: 0,
                messageTokens: 0,
                history: [],
            });
        }
        this.saveKnownSessions();
        this.lastSampleAt = now;
        // Aggregate TPS: total output tokens delta across sessions per second.
        let totalOutput = 0;
        for (const session of sessions)
            totalOutput += session.usage?.outputTokens ?? 0;
        let tps = 0;
        if (this.lastTpsAt > 0 && now > this.lastTpsAt) {
            const delta = Math.max(0, totalOutput - this.lastTpsOutput);
            tps = delta / ((now - this.lastTpsAt) / 1000);
        }
        this.lastTpsOutput = totalOutput;
        this.lastTpsAt = now;
        // Hide sessions that never actually consumed anything (fresh empty
        // conversations created by clicking "New chat" show 0/≈0 and are noise).
        const meaningful = sessions.filter((session) => session.totalTokens > 0 || session.surfaceTokens > 0);
        meaningful.sort((a, b) => b.totalTokens - a.totalTokens);
        return {
            generatedAt: now,
            sessions: meaningful,
            prices: this.resolvePrices(now),
            modelPrices: this.resolveModelPrices(now),
            tps,
            budgetMonthly: this.config.budgetMonthly,
        };
    }
    /** Aggregate all durable per-day logs into day and month statistics. */
    collectStats() {
        const days = new Map();
        const addDelta = (day, delta) => {
            day.input += delta.i;
            day.output += delta.o;
            day.cacheRead += delta.cr;
            day.cacheWrite += delta.cw;
            const model = typeof delta.m === 'string' && delta.m !== '' ? delta.m : 'unknown';
            let bucket = day.models.get(model);
            if (bucket === undefined) {
                bucket = { i: 0, o: 0, cr: 0, cw: 0 };
                day.models.set(model, bucket);
            }
            bucket.i += delta.i;
            bucket.o += delta.o;
            bucket.cr += delta.cr;
            bucket.cw += delta.cw;
        };
        if (existsSync(this.dataDir)) {
            for (const entry of readdirSync(this.dataDir)) {
                const match = /^usage-(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(entry);
                if (match === null)
                    continue;
                const date = match[1] ?? '';
                let day = days.get(date);
                if (day === undefined) {
                    day = { date, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, models: new Map() };
                    days.set(date, day);
                }
                const lines = readFileSync(join(this.dataDir, entry), 'utf8').split('\n');
                for (const line of lines) {
                    if (line === '')
                        continue;
                    try {
                        const delta = JSON.parse(line);
                        if (typeof delta.i !== 'number' || typeof delta.o !== 'number')
                            continue;
                        addDelta(day, delta);
                    }
                    catch {
                        // Torn or foreign line: skip.
                    }
                }
            }
        }
        // Recompute totals and sort newest first.
        const dayList = [...days.values()].map((day) => ({
            date: day.date,
            input: day.input,
            output: day.output,
            cacheRead: day.cacheRead,
            cacheWrite: day.cacheWrite,
            total: day.input + day.output + day.cacheRead + day.cacheWrite,
            models: Object.fromEntries([...day.models.entries()].map(([model, bucket]) => [model, { i: bucket.i, o: bucket.o, cr: bucket.cr, cw: bucket.cw }])),
        })).sort((a, b) => b.date.localeCompare(a.date));
        const months = new Map();
        for (const day of dayList) {
            const month = monthKey(day.date);
            let entry = months.get(month);
            if (entry === undefined) {
                entry = { month, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, models: new Map() };
                months.set(month, entry);
            }
            entry.input += day.input;
            entry.output += day.output;
            entry.cacheRead += day.cacheRead;
            entry.cacheWrite += day.cacheWrite;
            for (const [model, bucket] of Object.entries(day.models)) {
                let mb = entry.models.get(model);
                if (mb === undefined) {
                    mb = { i: 0, o: 0, cr: 0, cw: 0 };
                    entry.models.set(model, mb);
                }
                mb.i += bucket.i;
                mb.o += bucket.o;
                mb.cr += bucket.cr;
                mb.cw += bucket.cw;
            }
        }
        const monthList = [...months.values()].map((entry) => ({
            month: entry.month,
            input: entry.input,
            output: entry.output,
            cacheRead: entry.cacheRead,
            cacheWrite: entry.cacheWrite,
            total: entry.input + entry.output + entry.cacheRead + entry.cacheWrite,
            models: Object.fromEntries([...entry.models.entries()].map(([model, bucket]) => [model, { i: bucket.i, o: bucket.o, cr: bucket.cr, cw: bucket.cw }])),
        })).sort((a, b) => b.month.localeCompare(a.month));
        const now = Date.now();
        return {
            generatedAt: now,
            days: dayList,
            months: monthList,
            prices: this.resolvePrices(now),
            modelPrices: this.resolveModelPrices(now),
        };
    }
    /** Fetch the DeepSeek account balance (cached 5 min, single-flight). */
    async fetchBalance() {
        if (this.cachedBalance !== null && Date.now() - this.cachedBalance.at < 5 * 60_000) {
            return this.cachedBalance;
        }
        if (this.balanceInFlight)
            return this.cachedBalance;
        this.balanceInFlight = true;
        try {
            const ctx = this.ctx;
            const credential = ctx.credentials.resolve('DEEPSEEK_API_KEY');
            const key = credential?.secret;
            if (key === undefined || key === '')
                return null;
            const response = await fetch('https://api.deepseek.com/user/balance', {
                headers: { Authorization: `Bearer ${key}` },
            });
            if (!response.ok) {
                this.ctx.logger.warn(`token-panel: balance fetch HTTP ${response.status}`);
                return this.cachedBalance;
            }
            const body = (await response.json());
            const info = body.balance_infos?.[0];
            const value = Number(info?.total_balance ?? NaN);
            if (!Number.isFinite(value))
                return this.cachedBalance;
            this.cachedBalance = { value, currency: info?.currency ?? 'CNY', at: Date.now() };
            return this.cachedBalance;
        }
        catch (error) {
            this.ctx.logger.warn(`token-panel: balance fetch failed: ${String(error)}`);
            return this.cachedBalance;
        }
        finally {
            this.balanceInFlight = false;
        }
    }
}
const WEB_SERVER_KEYS = ['webServer', 'httpServer'];
function json(res, status, body) {
    res.writeHead(status, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
    });
    res.end(JSON.stringify(body));
}
export function apply(ctx, config) {
    const service = new TokenPanelService(ctx, config);
    let webRegistered = false;
    const registerWebSurface = () => {
        if (webRegistered)
            return;
        const webServer = (ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1]));
        if (webServer === undefined)
            return;
        webRegistered = true;
        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-token-panel/snapshot',
            handler: async (_req, res) => {
                try {
                    json(res, 200, service.collect());
                }
                catch (error) {
                    ctx.logger.warn(`token-panel: snapshot failed: ${String(error)}`);
                    json(res, 500, { error: String(error) });
                }
            },
        }), 'token-panel: snapshot route');
        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-token-panel/stats',
            handler: async (_req, res) => {
                try {
                    json(res, 200, service.collectStats());
                }
                catch (error) {
                    ctx.logger.warn(`token-panel: stats failed: ${String(error)}`);
                    json(res, 500, { error: String(error) });
                }
            },
        }), 'token-panel: stats route');
        ctx.effect(() => webServer.register({
            kind: 'exact',
            path: '/plugins/dsh-token-panel/balance',
            handler: async (_req, res) => {
                try {
                    const balance = await service.fetchBalance();
                    json(res, 200, balance === null
                        ? { available: false }
                        : { available: true, value: balance.value, currency: balance.currency, at: balance.at });
                }
                catch (error) {
                    ctx.logger.warn(`token-panel: balance route failed: ${String(error)}`);
                    json(res, 500, { error: String(error) });
                }
            },
        }), 'token-panel: balance route');
    };
    registerWebSurface();
    ctx.on('internal/service', (name) => {
        if (WEB_SERVER_KEYS.includes(name)) {
            registerWebSurface();
        }
    });
}
