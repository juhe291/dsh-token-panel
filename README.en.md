<div align="center">

# dsh-token-panel

[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)](https://github.com/juhe291/dsh-token-panel/releases)
[![Platform](https://img.shields.io/badge/platform-web-cyan?style=flat-square)](https://github.com/juhe291/dsh-token-panel)
[![Topic: dsh-plugin](https://img.shields.io/badge/topic-dsh--plugin-8A2BE2?style=flat-square)](https://github.com/topics/dsh-plugin)

**Real-time token consumption HUD for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — live session pressure, cumulative usage, history curves, and per-day/per-month statistics, in a corner dashboard that follows your current conversation.**

🌐 [**中文**](README.md) ｜ **English**

</div>

<p align="center">
  <img src="assets/screenshot.png" alt="dsh-token-panel UI preview" width="520">
</p>

---

## Overview

A compact pill in the bottom-right corner shows the total token pressure in real time. Click it to expand a dashboard with two switchable views — **Live** and **Stats** — styled with DSH design tokens (auto light/dark adaptation). The panel **follows your current conversation**: when you open a different chat, the panel shows that session; empty and historic sessions stay hidden behind a "Show all" toggle.

### 🟢 Live View

| Feature | Description |
|---|---|
| Session list | One row per session: **title + current context pressure + cumulative usage**; titles come from the DSH session-title service |
| Session details | Click a row: input / output / cache-read / cache-write, pressure / projected / capacity, estimated cost, context-usage progress bar (turns red above 85%) |
| Live curves | Per-session SVG area chart with real time ticks (HH:MM:SS) and **2m / 5m / 15m** range switching |
| Follows current session | Only the open conversation is shown by default; historic sessions collapse behind "Show all" — never crowded |
| Empty-session filter | Fresh conversations with 0 tokens are hidden entirely |

### 📊 Stats View

| Feature | Description |
|---|---|
| Daily / Monthly | Independent tabs listing every day / month with bars, token counts and estimated cost |
| Trend curves | SVG curves over days / months with M/D date ticks |
| Cumulative total | Total tokens consumed plus the ≈¥ estimated cost |
| Durable | Usage is written to per-day JSONL logs on disk — **survives restarts** |

### 💰 Cost Estimation

Priced with the **official DeepSeek rates** (CNY per 1M tokens), billing cache hits, uncached input and output separately. Display-only — the provider dashboard is authoritative.

---

## Installation

### From GitHub

```sh
dsh plugin --profile web add github:juhe291/dsh-token-panel
```

### From a local path

```sh
dsh plugin --profile web add C:\path\to\dsh-token-panel
```

**Restart the profile**, then refresh the browser — the TOKEN pill appears bottom-right.

> ⚠️ **pnpm ≥ 10 blocks Git build scripts**: if the first install fails with `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`, add the `allowBuilds` entry printed in the error to the `pnpm-workspace.yaml` in your profile directory, then re-run the install command. This package ships a `prepare` build script **and** committed `lib/` artifacts, so it works with or without allowlisted builds.

---

## Usage

1. Click the **TOKEN pill** (cyan pulsing dot + total pressure) to expand the panel
2. Switch views with **Live | Stats** at the top; **✕** collapses the panel
3. Live view: click a session row to expand details and its curve; switch 2m / 5m / 15m windows
4. Stats view: toggle **Daily / Monthly**; bars and trend curve share the screen
5. The bold number on a row = **current context pressure** (what is in context right now); the grey `≈` number = **cumulative usage** (everything consumed historically, including cache reads)
6. The panel follows the conversation you are viewing; "Show all" reveals historic sessions

---

## Configuration

In your profile's `cordis.patch.yml` (or the plugin section of `settings.yaml`):

```yaml
- id: token-panel
  name: dsh-token-panel
  config:
    pollInterval: 1500          # live poll interval (ms)
    pricePerMInput: 1           # uncached input price (CNY / 1M tokens)
    pricePerMCacheRead: 0.02    # cache-hit price (CNY / 1M tokens)
    pricePerMOutput: 2          # output price (CNY / 1M tokens)
    # dataDir: ~/.dsh/cache/dsh-token-panel   # durable log directory (optional)
```

| Key | Default | Description |
|---|---|---|
| `pollInterval` | `1500` | Browser live-poll interval (ms) |
| `pricePerMInput` | `1` | Estimated price per 1M uncached input tokens (CNY, display only) |
| `pricePerMCacheRead` | `0.02` | Estimated price per 1M cache-hit tokens (CNY, display only) |
| `pricePerMOutput` | `2` | Estimated price per 1M output tokens (CNY, display only) |
| `dataDir` | `~/.dsh/cache/dsh-token-panel` | Durable usage-log directory |

> Defaults match **deepseek-v4-flash** official pricing (cache hit ¥0.02 / miss ¥1 / output ¥2 per 1M tokens). DeepSeek moves to peak/off-peak pricing on 2026-08-17 (peak 9-12, 14-18 CST) — update the three price keys when your plan changes. Adjust freely for other models/providers.

---

## Data Storage

Usage logs are appended per day (one JSON delta per line):

```
~/.dsh/cache/dsh-token-panel/
├── usage-2026-08-14.jsonl   # daily usage logs
└── state.json               # last-seen baselines (resume across restarts)
```

Tracked buckets: uncached input, output, cache read, cache write (deltas). The first observation of a session writes a full baseline, then deltas follow — totals start from the true baseline and never double-count after a restart.

---

## How It Works

- **Host side** (`src/index.ts`):
  - Aggregates `ctx.tokenMeter.measure()` (pressure/surface), `ctx.sessionProjections.snapshot()` (provider usage/capacity/breakdown) and `ctx.sessionTitle.get()` (titles)
  - Serves two HTTP routes: `/plugins/dsh-token-panel/snapshot` (live), `/plugins/dsh-token-panel/stats` (durable stats)
  - Persists usage deltas per day (crash-safe: tmp + atomic rename)
  - Filters out empty sessions (0 tokens)
- **Client side** (`src/client/`): body-portal corner panel, 1.5s live poll + 10s stats poll, SVG curves, DSH design-token theming, **en/zh locale** following the DSH language setting, current-session tracking via `ctx.sessions.list`

---

## Development

```sh
pnpm install
pnpm build            # tsc host + tsc client + tsdown
pnpm verify           # artifact consistency (exports/patch/client bundle)
```

### Publishing a release

```sh
pnpm build && pnpm verify
git add -A
git commit -m "feat: ..."
git push
```

---

## FAQ

**Q: Why do the live and stats numbers differ?**
A: Live shows **current context pressure** (tens of thousands — k units); stats show **cumulative historical usage** including cache reads (hundreds of millions — M units). Two different metrics; the panel shows both (pressure + ≈cumulative).

**Q: How accurate is the cost estimate?**
A: It applies official DeepSeek rates by bucket (cache hits at ¥0.02/1M). Display-only — always verify against the [DeepSeek platform](https://platform.deepseek.com).

**Q: Why is the curve only the last few minutes?**
A: Live curves are an in-memory rolling window (600 points ≈ 15 min) and reset on restart; the stats view's daily/monthly curves are backed by durable disk logs and persist.

**Q: Some sessions are missing from the panel.**
A: The panel follows your current conversation and hides empty (0-token) sessions. Historic sessions appear after clicking "Show all".

---

## License

[MIT](LICENSE)

---

*Made with 🐋 for the DeepSeek Harness plugin ecosystem.*
