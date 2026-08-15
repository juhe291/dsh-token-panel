# Changelog

This file records user-visible changes to dsh-token-panel. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

[中文版](CHANGELOG.md) ｜ **English**

## [Unreleased]

### Added

- **One-command uninstall script**: the package ships `scripts/uninstall.mjs` — a freshly published plugin (under the ~24h supply-chain minimum release age) can make `dsh plugin remove` fail its lockfile verification; this script calls pnpm directly (bypassing that check) and removes the `dsh.profile.bundles` entry, uninstalling in one command

### Docs

- Install docs now use an **exact version** (`dsh-token-panel@0.4.6`, bumped on each new release) — `@latest` can be derailed by the supply-chain age gate while a release is under ~24h old and resolve to an older version; plus troubleshooting for "installed an old version" and for a missing `dsh` command

## [0.4.6] - 2026-08-15

### Added

- **"Hide HUD" in the long-press menu**: the position menu (long-press the pill or panel header) gains a "Hide HUD" item — click it and the whole panel (pill included) disappears immediately and stays hidden; restore by turning the `hidden` switch off in DSH settings (or setting it back to `false`)
- **DSH settings toggle**: a visual "hidden" switch on the settings page (Plugins → token-panel), no config file editing needed

## [0.4.5] - 2026-08-15

### Added

- **Hide-the-HUD setting**: new `hidden` config option (DSH settings / `cordis.patch.yml`) — set to `true` and the whole HUD (including the bottom-right pill) stops rendering; flip back to `false` to restore. No need to uninstall when you just don't want to see the panel

## [0.4.4] - 2026-08-15

### Fixed

- **Tool-call crash** (`Cannot read properties of undefined (reading 'prepare')`): DSH-internal packages (`@deepseek-ai/*`, `cordis`, `schemastery`, `react`, …) moved from `dependencies` to `peerDependencies`, so pnpm no longer installs a second copy of DSH internals — the duplicate copy broke the `TOOL_RUNTIME_SCHEDULER` Symbol identity and crashed every tool call in the host agent loop

## [0.4.3] - 2026-08-15

### Added

- **Time scrubber (live)**: a slim bar under the live trend curve — drag left to look back through the history buffer at how the curve looked earlier (window size follows 2m / 5m / 15m); peak rate, latest-value pill and hover bubbles follow the panned window
- **Time scrubber (stats)**: the same bar under the daily / monthly curves — shows the most recent 14 days / 6 months by default, drag to pan to earlier periods

### Fixed

- **Overlapping live time ticks** (2m / 5m / 15m): idle gaps made the last two time labels squeeze together; live ticks now sit at even time positions

## [0.4.2] - 2026-08-15

### Changed

- The cost display fixes recorded under 0.4.1 (sub-cent `¥0.001` display, thousands separators) are **actually shipped to npm in this release** — the npm 0.4.1 tarball predates them
- README install notes: npm install needs no build; Git / local installs require Node ≥ 22.5

## [0.4.1] - 2026-08-15

### Changed

- Publishing now uses **Trusted Publisher (OpenID Connect)**: triggered from `v*` tags, publishes with **provenance signatures**, no local token needed

### Fixed

- **Broken `¥0.1分` display for sub-cent costs**: amounts below ¥0.01 now render as `¥0.001` in both languages instead of mixing the ¥ symbol with the fen unit
- **Large-amount readability**: costs ≥ ¥1 now show thousands separators (e.g. `¥12,345.67`) while keeping cent precision; `¥0` renders as `¥0.00`

## [0.4.0] - 2026-08-15

### Added

- **Hover bubble on stats curves**: each plotted point on the daily / monthly curves has a small hit disc — hovering pops a bubble with that point's token value; the current day / month is skipped (its floating value pill already labels it)
- **Steam-style follow tooltip (live)**: move the pointer anywhere over a live trend curve and a bubble snaps to the nearest sample and follows the pointer, showing the token value at that spot, with a faint vertical guide line

### Changed

- **Frosted glass surfaces**: the panel and the collapsed pill are now translucent frosted glass (pill most transparent, panel one step less), consistent across light / dark themes; dark mode uses black drop shadows, dimmed borders and subdued glows instead of light halos
- Sparkline area fill dimmed in dark mode (32% → 13%) so the curve reads as ink, not neon

### Fixed

- **Invisible white bubble text**: the bubble value color now uses `label-secondary` (the previous `label-primary-foreground` is the white foreground meant for the blue pill and vanished on the light bubble)
- **Dark mode bright edges / washed-out gray**: panel shadow switched from light tokens to black, borders dimmed, status-dot glow toned down, panel surface darkened

## [0.3.0] - 2026-08-14

### Added

- **Per-model pricing**: session rows and daily/monthly stats bill each session at the price table of the model it actually used (v4-flash / v4-pro, etc.), so sessions that switched models are no longer billed entirely at one rate
- **auto price mode**: uses the flat legacy rates until 2026-08-17 00:00 Beijing time, then automatically switches to DeepSeek's official peak/off-peak schedule (peak 9-12 / 14-18); the footer badge shows "flat / peak / off-peak rate" accordingly — no config change needed

### Changed

- Footer redesigned into three columns: status + price mode ｜ current cost ｜ date + time (rearranges the "current cost" introduced in 0.2.2)
- Stats view simplified: dropped the "Summary" and "Trend" headings, cumulative total label enlarged into a single line (follow-up to the 0.2.2 layout rework)
- Curve Y axis reworked: unit label always visible, compact ticks (1B/500M), current-value pill floats next to the latest point — large values no longer overlap
- Stats and live views aligned to identical heights; footer current cost unified with stats figures

### Fixed

- **Invisible budget progress bar** (regression from 0.2.2): referenced nonexistent theme tokens (`state-success` etc.); replaced with the theme's real suffixed variables — green progress/cost/badges all render again
- **Stats view crash** (regression from 0.2.2): React Hooks order violation made the panel disappear when switching to stats
- **Overestimated session cost**: sessions mixing models were billed entirely at the current model's rate (fixed by per-model pricing)
- Extra whitespace and grey scrollbar strip from the stats view's double container (leftover from the 0.2.2 layout rework)

## [0.2.2] - 2026-08-14

### Added

- **Editable budget & balance**: click values in the stats view to edit inline (Enter saves / Esc cancels) with a hover hint; the balance decreases locally with estimated token consumption (baseline method, persists across reloads), falling back to the API balance when unset
- **Current cost in the footer**: cumulative estimated cost shown bottom-right of the panel
- **Peak rate readout**: peak consumption rate (t/s) shown above the live trend curve

### Changed

- **UI layout rework**: enlarged section captions (13px) separating 实时趋势 / 会话 / 汇总 / 趋势 / 按日, big-number hierarchy + segmented controls, keeping the tech feel (mono font / glow accents)
- Session list shows only the current session by default; "Show all" reveals the rest
- Daily / monthly detail lists collapsed by default (0 rows), expand on demand

### Fixed

- Removed the stats view's old flat layout and border lines (whitespace sections instead)

## [0.2.1] - 2026-08-14

### Fixed

- Session-row and account-balance hover hints now auto-fade (fade in ~1.5s then fade out on their own, never lingering while hovered); native browser tooltips removed

## [0.2.0] - 2026-08-14

### Added

- **Per-session cost (¥)**: every live row shows a green estimated cost — see what the current conversation costs at a glance
- **Panel drag system**:
  - Drag the pill or the panel header to move; position remembered across reloads
  - May drag past screen edges (any side), but a grabbable header strip always stays visible
  - Pointer capture + 4px threshold: fast drags never drop, single clicks never misfire
- **Long-press position menu** (hold 0.6s):
  - Back to default (icon and label follow the saved default)
  - "Position" submenu: top-left / top-right / bottom-left / bottom-right presets (snapped with the panel's real size)
  - **Custom position**: pick it, drag anywhere, release to save as the new default
  - SVG stroke icons matching the DSH design language
- **Y-axis ticks**: every curve gets value labels and faint gridlines
- **Auto-scaling Y axis**: 1/2/2.5/5×10ⁿ rounding with hysteresis (rises immediately, falls lazily), zero when idle
- **Current-value indicator**: dashed leader with a live value pill at the latest point
- **Peak/off-peak pricing mode**: `priceMode: peak-offpeak` switches prices by Beijing time
- **TPS readout**: generation speed (t/s) on the pill and the footer
- **Account balance**: the stats view auto-fetches the DeepSeek balance (5-min cache)
- **Monthly budget**: a `budgetMonthly` config shows a progress bar that turns red over budget
- **Historic-session persistence**: the session registry is saved to disk — "Show all" survives restarts

### Changed

- Closing with ✕ no longer resets the position (use the long-press menu to go back)
- Stats view "Daily / Monthly" lists every date and month

### Fixed

- Curves drop to zero when idle (consumption deltas instead of a held pressure line)
- Time ticks no longer clipped by the SVG edge (adaptive anchors + bottom band)
- Fractional ticks keep one decimal (0.5 no longer shows as 1)
- Stats view refreshes immediately on switch
- Drag vs click vs long-press gesture conflicts (click not opening, needing two clicks after a drag, etc.)
- Preset corners sat too high (now computed from the real panel size)
- Panel could not be grabbed back after dragging off-screen (handle stays visible)
- Single click opens the panel (pointer-capture timing fix)

## [0.1.0] - 2026-08-14

### Added

- First release: live view (session pressure / cumulative / details / curves), stats view (daily / monthly / durable logs), DeepSeek official-rate cost estimates, bilingual zh/en UI
