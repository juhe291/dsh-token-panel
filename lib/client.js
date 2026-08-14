window.__ModuleLoader__.load({
	id: "dsh-token-panel",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react_dom_client = require("react-dom/client");
		let react = require("react");
		//#region \0dsh-css:C:\Users\q1684\dsh-token-panel\src\client\TokenHud.module.css.mjs
		const css = "html{--token-panel-mono:\"Cascadia Code\", \"Consolas\", \"SF Mono\", \"JetBrains Mono\", monospace}._7TU4uW_host{z-index:2147483000;font-family:var(--token-panel-mono);position:fixed;bottom:18px;right:18px}._7TU4uW_pressMenu{z-index:30;border:1px solid color-mix(in srgb, var(--dsw-alias-line-strong) 58%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 95%, transparent);backdrop-filter:blur(16px);min-width:148px;box-shadow:0 8px 24px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);border-radius:10px;flex-direction:column;gap:2px;padding:4px;animation:.12s ease-out _7TU4uW_tokenPanelIn;display:flex;position:absolute;bottom:46px;right:0}._7TU4uW_host:has(>._7TU4uW_panel) ._7TU4uW_pressMenu{top:58px;bottom:auto}._7TU4uW_toast{z-index:30;border:1px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 95%, transparent);backdrop-filter:blur(16px);max-width:260px;box-shadow:0 8px 24px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);color:var(--dsw-alias-label-primary);letter-spacing:.04em;pointer-events:none;border-radius:8px;padding:8px 12px;font-size:11px;animation:.12s ease-out _7TU4uW_tokenPanelIn;position:absolute;bottom:46px;right:0}._7TU4uW_host:has(>._7TU4uW_panel) ._7TU4uW_toast{top:58px;bottom:auto}._7TU4uW_pressMenuItem{color:var(--dsw-alias-label-primary);font:inherit;letter-spacing:.04em;text-align:left;cursor:pointer;background:0 0;border:none;border-radius:7px;justify-content:space-between;align-items:center;gap:10px;padding:8px 12px;font-size:12px;transition:background .12s;display:flex}._7TU4uW_pressMenuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}._7TU4uW_pressMenuLabel{align-items:center;gap:8px;display:inline-flex}._7TU4uW_pressMenuCaret{color:var(--dsw-alias-label-tertiary);font-size:10px}._7TU4uW_pressSubMenu{border-left:2px solid color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-module) 50%, transparent);border-radius:0 8px 8px 0;flex-direction:column;gap:2px;margin:0 6px 2px;padding:4px;display:flex}._7TU4uW_chip{box-sizing:border-box;border:1px solid var(--dsw-alias-line-normal);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 92%, transparent);backdrop-filter:blur(14px);height:34px;box-shadow:0 8px 28px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);color:var(--dsw-alias-label-secondary);font:inherit;letter-spacing:.12em;cursor:pointer;border-radius:999px;align-items:center;gap:8px;padding:0 14px;font-size:11px;font-weight:600;transition:border-color .15s,box-shadow .15s,transform .12s;display:inline-flex}._7TU4uW_chip:hover{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 20px color-mix(in srgb, var(--dsw-alias-state-business-primary) 30%, transparent);transform:translateY(-1px)}._7TU4uW_chip:focus-visible,._7TU4uW_closeButton:focus-visible,._7TU4uW_rowHead:focus-visible,._7TU4uW_rangeButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}._7TU4uW_chipDot{background:var(--dsw-alias-state-business-primary);width:7px;height:7px;box-shadow:0 0 8px var(--dsw-alias-state-business-primary);border-radius:50%;animation:1.4s ease-in-out infinite _7TU4uW_tokenPanelPulse}._7TU4uW_chipLabel{color:var(--dsw-alias-label-tertiary)}._7TU4uW_chipValue{color:var(--dsw-alias-state-business-primary);font-weight:700}._7TU4uW_chipCumulative{color:var(--dsw-alias-label-tertiary);letter-spacing:.04em;font-size:10px;font-weight:500}._7TU4uW_chipTps{color:var(--dsw-alias-state-success);letter-spacing:.02em;font-size:10px;font-weight:500}@keyframes _7TU4uW_tokenPanelPulse{0%,to{opacity:.45}50%{opacity:1}}@keyframes _7TU4uW_tokenPanelIn{0%{opacity:0}to{opacity:1}}._7TU4uW_panel{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-line-strong) 58%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 95%, transparent);backdrop-filter:blur(18px)saturate(1.08);width:360px;max-height:min(72dvh,560px);box-shadow:0 12px 32px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent), 0 32px 72px color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent);border-radius:14px;flex-direction:column;animation:.18s ease-out _7TU4uW_tokenPanelIn;display:flex;overflow:hidden}._7TU4uW_head{border-bottom:1px solid var(--dsw-alias-line-normal);align-items:center;gap:10px;padding:12px 16px;display:flex}._7TU4uW_title{min-width:0;color:var(--dsw-alias-label-primary);letter-spacing:.18em;cursor:grab;touch-action:none;user-select:none;flex:1;align-self:stretch;align-items:center;gap:7px;font-size:12px;font-weight:700;display:inline-flex}._7TU4uW_title:active{cursor:grabbing}._7TU4uW_titleMark{background:var(--dsw-alias-state-business-primary);width:8px;height:8px;box-shadow:0 0 8px var(--dsw-alias-state-business-primary);transform:rotate(45deg)}._7TU4uW_viewBar{border:1px solid var(--dsw-alias-line-normal);background:color-mix(in srgb, var(--dsw-alias-bg-module) 60%, transparent);border-radius:999px;gap:2px;margin-left:auto;padding:2px;display:inline-flex}._7TU4uW_viewButton{color:var(--dsw-alias-label-tertiary);font:inherit;letter-spacing:.08em;cursor:pointer;background:0 0;border:none;border-radius:999px;padding:4px 14px;font-size:11px;transition:color .12s,background .12s}._7TU4uW_viewButton:hover{color:var(--dsw-alias-label-primary)}._7TU4uW_viewButton[data-active=true]{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-on-fill);font-weight:700}._7TU4uW_closeButton{width:30px;height:30px;color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:8px;justify-content:center;align-items:center;font-size:13px;transition:color .12s,border-color .12s;display:inline-flex}._7TU4uW_closeButton:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-line-normal)}._7TU4uW_sparkWrap{border-bottom:1px solid var(--dsw-alias-line-normal);padding:10px 14px 6px}._7TU4uW_rangeBar{gap:4px;margin-bottom:6px;display:flex}._7TU4uW_rangeButton{border:1px solid var(--dsw-alias-line-normal);color:var(--dsw-alias-label-tertiary);font:inherit;letter-spacing:.08em;cursor:pointer;background:0 0;border-radius:999px;padding:4px 12px;font-size:11px;transition:border-color .12s,color .12s,background .12s}._7TU4uW_rangeButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}._7TU4uW_rangeButton[data-active=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent);color:var(--dsw-alias-state-business-primary);font-weight:700}._7TU4uW_spark{display:block;overflow:visible}._7TU4uW_sparkTick{fill:var(--dsw-alias-label-tertiary);font-size:9px;font-family:var(--token-panel-mono);letter-spacing:.02em}._7TU4uW_sparkYTick{fill:var(--dsw-alias-label-tertiary);font-size:8px;font-family:var(--token-panel-mono);letter-spacing:.02em}._7TU4uW_sparkCurrent{fill:var(--dsw-alias-label-on-fill);font-size:8px;font-weight:700;font-family:var(--token-panel-mono)}._7TU4uW_sparkEmpty{color:var(--dsw-alias-label-tertiary);letter-spacing:.08em;justify-content:center;align-items:center;font-size:10px;display:flex}._7TU4uW_body{flex:1;min-height:0;padding:6px 10px;overflow-y:auto}._7TU4uW_empty{text-align:center;color:var(--dsw-alias-label-tertiary);letter-spacing:.1em;padding:18px 8px;font-size:11px;display:block}._7TU4uW_row{border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-line-normal) 60%, transparent);padding:2px 0}._7TU4uW_row:last-child{border-bottom:none}._7TU4uW_rowHead{box-sizing:border-box;width:100%;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;text-align:left;background:0 0;border:none;border-radius:8px;align-items:center;gap:10px;padding:9px 8px;font-size:12px;display:flex}._7TU4uW_rowHead:hover{background:var(--dsw-alias-interactive-bg-hover)}._7TU4uW_rowName{min-width:0;color:var(--dsw-alias-label-secondary);letter-spacing:.04em;flex:1;align-items:baseline;gap:6px;display:flex;overflow:hidden}._7TU4uW_rowTitle{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-primary);overflow:hidden}._7TU4uW_rowSub{color:var(--dsw-alias-label-tertiary);letter-spacing:.06em;flex:none;font-size:9px}._7TU4uW_rowTokensWrap{flex:none;align-items:baseline;gap:6px;display:inline-flex}._7TU4uW_rowTokens{color:var(--dsw-alias-label-primary);font-weight:700}._7TU4uW_rowCumulative{color:var(--dsw-alias-label-tertiary);letter-spacing:.04em;font-size:9px}._7TU4uW_moreButton{box-sizing:border-box;border:1px dashed var(--dsw-alias-line-normal);width:calc(100% - 16px);color:var(--dsw-alias-label-tertiary);font:inherit;letter-spacing:.06em;cursor:pointer;background:0 0;border-radius:8px;margin:8px 8px 4px;padding:10px 12px;font-size:11px;transition:border-color .12s,color .12s,background .12s;display:block}._7TU4uW_moreButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, transparent)}._7TU4uW_rowPulse{background:var(--dsw-alias-label-tertiary);border-radius:50%;flex:none;width:6px;height:6px}._7TU4uW_rowPulse[data-live=true]{background:var(--dsw-alias-state-business-primary);box-shadow:0 0 6px var(--dsw-alias-state-business-primary);animation:1.4s ease-in-out infinite _7TU4uW_tokenPanelPulse}._7TU4uW_rowDetail{padding:4px 10px 12px}._7TU4uW_detailLine{grid-template-columns:1fr 1fr;gap:8px 18px;margin-bottom:10px;display:grid}._7TU4uW_detailItem{justify-content:space-between;align-items:baseline;gap:8px;display:flex}._7TU4uW_detailLabel{color:var(--dsw-alias-label-tertiary);letter-spacing:.06em;flex:none;font-size:10px}._7TU4uW_detailItem ._7TU4uW_mono{color:var(--dsw-alias-label-secondary);text-align:right;font-size:11px}._7TU4uW_barTrack{background:var(--dsw-alias-bg-fill-neutral);border-radius:2px;height:4px;margin-top:2px;overflow:hidden}._7TU4uW_barFill{background:var(--dsw-alias-state-business-primary);height:100%;box-shadow:0 0 6px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);border-radius:2px;transition:width .4s;display:block}._7TU4uW_barFill[data-hot=true]{background:var(--dsw-alias-state-danger);box-shadow:0 0 8px color-mix(in srgb, var(--dsw-alias-state-danger) 50%, transparent)}._7TU4uW_foot{border-top:1px solid var(--dsw-alias-line-normal);color:var(--dsw-alias-label-tertiary);letter-spacing:.1em;justify-content:space-between;align-items:center;gap:8px;padding:8px 16px;font-size:9px;display:flex}._7TU4uW_foot ._7TU4uW_mono{color:var(--dsw-alias-label-tertiary);font-size:9px}._7TU4uW_footRight{align-items:baseline;gap:8px;display:inline-flex}._7TU4uW_footTps{color:var(--dsw-alias-state-success);letter-spacing:.02em}._7TU4uW_footPrice{letter-spacing:.06em;border-radius:999px;padding:1px 6px;font-size:9px}._7TU4uW_footPrice[data-mode=peak]{background:color-mix(in srgb, var(--dsw-alias-state-warning) 16%, transparent);color:var(--dsw-alias-state-warning)}._7TU4uW_footPrice[data-mode=offpeak]{background:color-mix(in srgb, var(--dsw-alias-state-success) 14%, transparent);color:var(--dsw-alias-state-success)}._7TU4uW_footBalance{color:var(--dsw-alias-state-business-primary);font-weight:700}._7TU4uW_budgetRow,._7TU4uW_balanceRow{align-items:center;gap:10px;padding:4px 10px 6px;display:flex}._7TU4uW_budgetLabel{color:var(--dsw-alias-label-tertiary);letter-spacing:.06em;flex:none;font-size:10px}._7TU4uW_budgetTrack{background:var(--dsw-alias-bg-fill-neutral);border-radius:3px;flex:1;height:6px;overflow:hidden}._7TU4uW_budgetFill{background:var(--dsw-alias-state-success);border-radius:3px;height:100%;transition:width .4s;display:block}._7TU4uW_budgetFill[data-over=true]{background:var(--dsw-alias-state-danger)}._7TU4uW_budgetText{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;flex:none;font-size:10px}._7TU4uW_balanceValue{color:var(--dsw-alias-state-business-primary);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700}._7TU4uW_mono{font-variant-numeric:tabular-nums}._7TU4uW_statsBody{padding:4px 2px}._7TU4uW_statsBody ._7TU4uW_viewBar{margin:0 10px 10px}._7TU4uW_statsSparkWrap{padding:0 10px 8px}._7TU4uW_statsTotal{border-bottom:1px solid var(--dsw-alias-line-normal);align-items:baseline;gap:8px;margin-bottom:8px;padding:6px 10px 10px;display:flex}._7TU4uW_statsTotalLabel{color:var(--dsw-alias-label-tertiary);letter-spacing:.1em;font-size:10px}._7TU4uW_statsTotal ._7TU4uW_mono{color:var(--dsw-alias-state-business-primary);font-size:16px;font-weight:700}._7TU4uW_statsTotalSub{color:var(--dsw-alias-label-tertiary);font-size:10px}._7TU4uW_statsSection{margin-bottom:10px}._7TU4uW_statsSectionHead{color:var(--dsw-alias-label-tertiary);letter-spacing:.14em;padding:4px 10px 6px;font-size:10px}._7TU4uW_statRow{align-items:center;gap:10px;padding:3px 10px;display:flex}._7TU4uW_statLabel{width:64px;color:var(--dsw-alias-label-secondary);letter-spacing:.04em;text-overflow:ellipsis;white-space:nowrap;flex:none;font-size:10px;overflow:hidden}._7TU4uW_statBarTrack{background:var(--dsw-alias-bg-fill-neutral);border-radius:3px;flex:1;height:10px;overflow:hidden}._7TU4uW_statBarFill{background:linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, transparent), var(--dsw-alias-state-business-primary));border-radius:3px;height:100%;transition:width .4s;display:block}._7TU4uW_statValue{text-align:right;width:52px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;flex:none;font-size:11px;font-weight:700}._7TU4uW_statCost{text-align:right;width:70px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;font-size:9px}";
		const tagId = "dsh-token-panel/TokenHud.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-token-panel";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TokenHud_module_css_default = {
			"mono": "_7TU4uW_mono",
			"chipValue": "_7TU4uW_chipValue",
			"rowName": "_7TU4uW_rowName",
			"rowTitle": "_7TU4uW_rowTitle",
			"rowSub": "_7TU4uW_rowSub",
			"viewButton": "_7TU4uW_viewButton",
			"statsTotalSub": "_7TU4uW_statsTotalSub",
			"statBarTrack": "_7TU4uW_statBarTrack",
			"detailLabel": "_7TU4uW_detailLabel",
			"foot": "_7TU4uW_foot",
			"balanceValue": "_7TU4uW_balanceValue",
			"rangeButton": "_7TU4uW_rangeButton",
			"chip": "_7TU4uW_chip",
			"tokenPanelPulse": "_7TU4uW_tokenPanelPulse",
			"barTrack": "_7TU4uW_barTrack",
			"statsSectionHead": "_7TU4uW_statsSectionHead",
			"pressMenuCaret": "_7TU4uW_pressMenuCaret",
			"panel": "_7TU4uW_panel",
			"sparkTick": "_7TU4uW_sparkTick",
			"statsTotalLabel": "_7TU4uW_statsTotalLabel",
			"sparkYTick": "_7TU4uW_sparkYTick",
			"statValue": "_7TU4uW_statValue",
			"body": "_7TU4uW_body",
			"chipCumulative": "_7TU4uW_chipCumulative",
			"statCost": "_7TU4uW_statCost",
			"barFill": "_7TU4uW_barFill",
			"empty": "_7TU4uW_empty",
			"title": "_7TU4uW_title",
			"chipTps": "_7TU4uW_chipTps",
			"spark": "_7TU4uW_spark",
			"footBalance": "_7TU4uW_footBalance",
			"sparkEmpty": "_7TU4uW_sparkEmpty",
			"rowDetail": "_7TU4uW_rowDetail",
			"tokenPanelIn": "_7TU4uW_tokenPanelIn",
			"closeButton": "_7TU4uW_closeButton",
			"rowTokens": "_7TU4uW_rowTokens",
			"budgetFill": "_7TU4uW_budgetFill",
			"chipLabel": "_7TU4uW_chipLabel",
			"statsBody": "_7TU4uW_statsBody",
			"detailItem": "_7TU4uW_detailItem",
			"footPrice": "_7TU4uW_footPrice",
			"statLabel": "_7TU4uW_statLabel",
			"rowTokensWrap": "_7TU4uW_rowTokensWrap",
			"statRow": "_7TU4uW_statRow",
			"moreButton": "_7TU4uW_moreButton",
			"row": "_7TU4uW_row",
			"pressMenu": "_7TU4uW_pressMenu",
			"statsSparkWrap": "_7TU4uW_statsSparkWrap",
			"rowHead": "_7TU4uW_rowHead",
			"host": "_7TU4uW_host",
			"detailLine": "_7TU4uW_detailLine",
			"statsTotal": "_7TU4uW_statsTotal",
			"sparkWrap": "_7TU4uW_sparkWrap",
			"footTps": "_7TU4uW_footTps",
			"budgetTrack": "_7TU4uW_budgetTrack",
			"balanceRow": "_7TU4uW_balanceRow",
			"toast": "_7TU4uW_toast",
			"pressSubMenu": "_7TU4uW_pressSubMenu",
			"rowCumulative": "_7TU4uW_rowCumulative",
			"budgetRow": "_7TU4uW_budgetRow",
			"budgetText": "_7TU4uW_budgetText",
			"rangeBar": "_7TU4uW_rangeBar",
			"pressMenuLabel": "_7TU4uW_pressMenuLabel",
			"statBarFill": "_7TU4uW_statBarFill",
			"chipDot": "_7TU4uW_chipDot",
			"rowPulse": "_7TU4uW_rowPulse",
			"footRight": "_7TU4uW_footRight",
			"sparkCurrent": "_7TU4uW_sparkCurrent",
			"budgetLabel": "_7TU4uW_budgetLabel",
			"titleMark": "_7TU4uW_titleMark",
			"viewBar": "_7TU4uW_viewBar",
			"head": "_7TU4uW_head",
			"statsSection": "_7TU4uW_statsSection",
			"pressMenuItem": "_7TU4uW_pressMenuItem"
		};
		//#endregion
		//#region lib/client/TokenHud.js
		/**
		* TokenHud: the real-time token consumption dashboard.
		*
		* A compact panel pinned to the bottom-right of the viewport. Two views:
		*
		* - **实时 (live)**: polls the host snapshot route and renders per-session
		*   token usage with a live SVG history curve carrying real time ticks and
		*   a range switch (2m / 5m / 15m).
		* - **统计 (stats)**: polls the host stats route and renders per-day and
		*   per-month usage bars from durable JSONL logs.
		*
		* Colors follow the DSH design tokens, so the HUD matches the host theme
		* (light and dark) automatically.
		*
		* @module dsh-token-panel/client/hud
		*/
		/** Host routes. */
		const SNAPSHOT_URL = "/plugins/dsh-token-panel/snapshot";
		const STATS_URL = "/plugins/dsh-token-panel/stats";
		const BALANCE_URL = "/plugins/dsh-token-panel/balance";
		/** Poll cadence (ms); keep in sync with the host default. */
		const POLL_MS = 1500;
		/** Stats poll cadence (ms) — daily totals move slowly. */
		const STATS_POLL_MS = 1e4;
		/** Balance poll cadence (ms) — the host caches its own 5-min fetch. */
		const BALANCE_POLL_MS = 6e4;
		/** Time-range options for the history curve. */
		const RANGES = [
			{
				label: "2m",
				ms: 2 * 6e4
			},
			{
				label: "5m",
				ms: 5 * 6e4
			},
			{
				label: "15m",
				ms: 15 * 6e4
			}
		];
		/** Preset corner → screen coordinates for the panel (360 wide, ~520 tall). */
		function presetCornerPosition(preset) {
			const margin = 12;
			const w = 360;
			const h = 520;
			const maxX = Math.max(margin, window.innerWidth - w - margin);
			const maxY = Math.max(margin, window.innerHeight - h - margin);
			switch (preset) {
				case "tl": return {
					x: margin,
					y: margin
				};
				case "tr": return {
					x: maxX,
					y: margin
				};
				case "bl": return {
					x: margin,
					y: maxY
				};
				case "br": return {
					x: maxX,
					y: maxY
				};
			}
		}
		/** Localized label for a preset corner id. */
		function cornerLabel(preset, t) {
			switch (preset) {
				case "tl": return t("cornerTL");
				case "tr": return t("cornerTR");
				case "bl": return t("cornerBL");
				case "br": return t("cornerBR");
			}
		}
		/** Small stroke icons for the long-press menu (match the DSH icon style). */
		function MenuIcon({ d }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				width: "13",
				height: "13",
				"aria-hidden": "true",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.4",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: (0, react_jsx_runtime.jsx)("path", { d })
			});
		}
		const ICON_CROSSHAIR = "M8 1.5v3m0 7v3M1.5 8h3m7 0h3M8 8l.01 0M8 5.8A2.2 2.2 0 1 0 8 10.2 2.2 2.2 0 0 0 8 5.8Z";
		const ICON_CORNER = {
			tl: "M1.5 6V1.5H6",
			tr: "M10 1.5h4.5V6",
			bl: "M1.5 10v4.5H6",
			br: "M14.5 10v4.5H10"
		};
		/** Replace {name} placeholders in a localized template. */
		function fill(template, values) {
			return template.replace(/\{(\w+)\}/g, (match, name) => name in values ? String(values[name]) : match);
		}
		function formatNumber(value) {
			if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
			if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
			if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
			return String(Math.round(value));
		}
		/** Axis-value formatter: small values keep one decimal (0.5 stays 0.5). */
		function formatAxisNumber(value) {
			if (value >= 1e3) return formatNumber(value);
			if (value >= 10) return String(Math.round(value));
			const rounded = Math.round(value * 10) / 10;
			return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
		}
		/** Format a timestamp as HH:MM:SS. */
		function formatTime(t) {
			const date = new Date(t);
			return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
		}
		/** Locale-aware date label for a YYYY-MM-DD key. */
		function dateLabel(date, t) {
			const [y, m, d] = date.split("-");
			const now = /* @__PURE__ */ new Date();
			const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
			const yesterdayTs = now.getTime() - 864e5;
			const yesterday = `${new Date(yesterdayTs).getFullYear()}-${String(new Date(yesterdayTs).getMonth() + 1).padStart(2, "0")}-${String(new Date(yesterdayTs).getDate()).padStart(2, "0")}`;
			if (date === today) return t("today");
			if (date === yesterday) return t("yesterday");
			return `${Number(m)}/${Number(d)}`;
		}
		/** Locale-aware month label for a YYYY-MM key. */
		function monthLabel(month, t) {
			const [y, m] = month.split("-");
			const now = /* @__PURE__ */ new Date();
			if (Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1) return t("thisMonth");
			return fill(t("monthFmt"), {
				y: Number(y),
				m: Number(m)
			});
		}
		/** Estimate cost in CNY from usage buckets (cache hit priced separately). */
		function estimateCost(input, cacheRead, cacheWrite, output, prices) {
			return (input + cacheWrite) / 1e6 * prices.input + cacheRead / 1e6 * prices.cacheRead + output / 1e6 * prices.output;
		}
		/** Estimate session cost in CNY from provider usage buckets. */
		function estimateRowCost(row, prices) {
			const usage = row.usage;
			if (usage === void 0) return 0;
			return estimateCost(usage.uncachedInputTokens, usage.cacheReadTokens, usage.cacheWriteTokens, usage.outputTokens, prices);
		}
		/** Format a CNY cost for display. */
		function formatCost(cost) {
			if (cost >= 1) return `¥${cost.toFixed(2)}`;
			if (cost >= .01) return `¥${cost.toFixed(3)}`;
			return `¥${(cost * 100).toFixed(1)}分`;
		}
		/** Occupancy percent for the pressure bar (capacity may be absent). */
		function occupancy(row) {
			const capacity = row.contextWindow;
			if (capacity === void 0 || capacity <= 0) return void 0;
			const pressure = row.projectedTokens ?? row.pressureTokens ?? row.totalTokens;
			return Math.min(100, Math.max(0, pressure / capacity * 100));
		}
		/** Filter history points to the trailing window ending at `now`. */
		function filterRange(points, now, rangeMs) {
			const cutoff = now - rangeMs;
			return points.filter((point) => point.t >= cutoff);
		}
		/** Format a timestamp for a day-scale axis (M/D). */
		function formatDateTick(t) {
			const date = new Date(t);
			return `${date.getMonth() + 1}/${date.getDate()}`;
		}
		/** Format a timestamp for a month-scale axis (locale-aware). */
		function formatMonthTick(t, translate) {
			const date = new Date(t);
			return fill(translate("monthFmt"), {
				y: date.getFullYear(),
				m: date.getMonth() + 1
			});
		}
		/** Convert cumulative output samples into per-tick consumption deltas
		*  (idle ticks become 0, so the curve drops to zero when not in use). */
		function toConsumption(points) {
			let previous = points[0]?.output ?? 0;
			return points.map((point, index) => {
				const output = point.output ?? 0;
				const delta = index === 0 ? 0 : Math.max(0, output - previous);
				previous = output;
				return {
					t: point.t,
					total: delta
				};
			});
		}
		/**
		* Sparkline: renders the timestamped history as an SVG area chart with
		* ticks on the bottom axis. Pass `tickFormat` for non-time scales (e.g.
		* daily/monthly stats).
		*/
		/** Round a value up to a "nice" axis number (1/2/2.5/5 × 10^n). */
		function niceCeil(value) {
			if (value <= 0) return 1;
			const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
			const normalized = value / magnitude;
			return (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10) * magnitude;
		}
		function Sparkline({ points, now, width = 336, height = 72, tickFormat = formatTime, t }) {
			/** Left gutter reserved for the Y-axis value labels. */
			const AXIS_W = 38;
			const plotW = width - AXIS_W;
			const yMaxRef = (0, react.useRef)(1);
			const path = (0, react.useMemo)(() => {
				if (points.length === 0) return null;
				if (points.length === 1) {
					const only = points[0];
					if (only === void 0) return null;
					const yTop = 6;
					const yBot = height - 14;
					const axisMax = niceCeil(only.total);
					return {
						kind: "dot",
						x: AXIS_W + plotW / 2,
						y: yTop + (yBot - yTop) / 2,
						t: only.t,
						ticks: [{
							t: only.t,
							x: AXIS_W + plotW / 2
						}],
						yMax: axisMax,
						yMid: axisMax / 2,
						yMin: 0
					};
				}
				const rawMax = Math.max(...points.map((point) => point.total), 0);
				const current = yMaxRef.current;
				if (rawMax > current || rawMax < current * .5) yMaxRef.current = niceCeil(rawMax);
				const max = yMaxRef.current;
				const min = 0;
				const span = Math.max(max - min, 1);
				const t0 = points[0]?.t ?? now;
				const t1 = points[points.length - 1]?.t ?? now;
				const tSpan = Math.max(t1 - t0, 1);
				const y = (value) => height - 18 - (value - min) / span * (height - 28);
				const x = (t) => AXIS_W + (t - t0) / tSpan * (plotW - 4);
				const coords = points.map((point) => [x(point.t), y(point.total)]);
				const line = coords.map(([xValue, yValue], index) => `${index === 0 ? "M" : "L"}${xValue.toFixed(1)},${yValue.toFixed(1)}`).join(" ");
				const area = `${line} L${width},${height - 14} L${AXIS_W},${height - 14} Z`;
				const last = coords[coords.length - 1];
				if (last === void 0) return null;
				return {
					kind: "line",
					line,
					area,
					last,
					ticks: [
						0,
						.5,
						1
					].map((fraction) => {
						const t = t0 + tSpan * fraction;
						return {
							t,
							x: x(t)
						};
					}),
					yMax: max,
					yMid: max / 2,
					yMin: min
				};
			}, [
				points,
				width,
				height,
				now,
				plotW
			]);
			if (path === null) return (0, react_jsx_runtime.jsx)("div", {
				className: TokenHud_module_css_default.sparkEmpty,
				style: {
					width,
					height
				},
				children: t("waiting")
			});
			const yLabels = [
				{
					value: path.yMax,
					y: 8
				},
				{
					value: path.yMid,
					y: (height - 14 + 8) / 2
				},
				{
					value: path.yMin,
					y: height - 16
				}
			];
			return (0, react_jsx_runtime.jsxs)("svg", {
				className: TokenHud_module_css_default.spark,
				viewBox: `0 0 ${width} ${height}`,
				width: "100%",
				height,
				preserveAspectRatio: "none",
				role: "img",
				"aria-label": t("token"),
				children: [
					(0, react_jsx_runtime.jsx)("defs", { children: (0, react_jsx_runtime.jsxs)("linearGradient", {
						id: "tokenSparkFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [(0, react_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--dsw-alias-state-business-primary)",
							stopOpacity: "0.32"
						}), (0, react_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--dsw-alias-state-business-primary)",
							stopOpacity: "0.02"
						})]
					}) }),
					path.kind === "line" && yLabels.map((label) => (0, react_jsx_runtime.jsx)("line", {
						x1: AXIS_W,
						y1: label.y,
						x2: width,
						y2: label.y,
						stroke: "var(--dsw-alias-line-normal)",
						strokeWidth: "1",
						vectorEffect: "non-scaling-stroke",
						opacity: "0.5"
					}, label.y)),
					path.kind === "line" && (0, react_jsx_runtime.jsx)("path", {
						d: path.area,
						fill: "url(#tokenSparkFill)"
					}),
					path.kind === "line" && (0, react_jsx_runtime.jsx)("path", {
						d: path.line,
						fill: "none",
						stroke: "var(--dsw-alias-state-business-primary)",
						strokeWidth: "1.6",
						vectorEffect: "non-scaling-stroke",
						strokeLinejoin: "round",
						strokeLinecap: "round"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: path.kind === "line" ? path.last[0] : path.x,
						cy: path.kind === "line" ? path.last[1] : path.y,
						r: "3",
						fill: "var(--dsw-alias-bg-module-platform)",
						stroke: "var(--dsw-alias-state-business-primary)",
						strokeWidth: "1.6"
					}),
					(path.kind === "line" || path.kind === "dot") && (() => {
						const cx = path.kind === "line" ? path.last[0] : path.x;
						const cy = path.kind === "line" ? path.last[1] : path.y;
						const text = formatAxisNumber(points[points.length - 1]?.total ?? 0);
						const labelW = text.length * 5 + 8;
						return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsx)("line", {
								x1: AXIS_W,
								y1: cy,
								x2: cx,
								y2: cy,
								stroke: "var(--dsw-alias-state-business-primary)",
								strokeWidth: "1",
								vectorEffect: "non-scaling-stroke",
								strokeDasharray: "3 3",
								opacity: "0.55"
							}),
							(0, react_jsx_runtime.jsx)("rect", {
								x: AXIS_W - labelW - 4,
								y: cy - 8,
								width: labelW,
								height: 13,
								rx: 6.5,
								fill: "var(--dsw-alias-state-business-primary)",
								opacity: "0.9"
							}),
							(0, react_jsx_runtime.jsx)("text", {
								x: AXIS_W - labelW / 2 - 4,
								y: cy + 1.5,
								textAnchor: "middle",
								className: TokenHud_module_css_default.sparkCurrent,
								children: text
							})
						] });
					})(),
					yLabels.map((label) => (0, react_jsx_runtime.jsx)("text", {
						x: AXIS_W - 5,
						y: label.y + 3,
						textAnchor: "end",
						className: TokenHud_module_css_default.sparkYTick,
						children: formatAxisNumber(label.value)
					}, label.y)),
					path.ticks.map((tick) => (0, react_jsx_runtime.jsx)("text", {
						x: tick.x,
						y: height - 5,
						textAnchor: tick.x < 60 ? "start" : tick.x > width - 60 ? "end" : "middle",
						className: TokenHud_module_css_default.sparkTick,
						children: tickFormat(tick.t)
					}, tick.t))
				]
			});
		}
		/** Collapsed pill shown when the panel is closed. */
		function CollapsedChip({ total, cumulative, tps, t }) {
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: TokenHud_module_css_default.chip,
				"aria-label": t("openPanel"),
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.chipDot,
						"aria-hidden": true
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.chipLabel,
						children: "TOKEN"
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.chipValue,
						children: formatNumber(total)
					}),
					cumulative !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
						className: TokenHud_module_css_default.chipCumulative,
						children: [t("approx"), formatNumber(cumulative)]
					}),
					tps !== void 0 && tps > 0 && (0, react_jsx_runtime.jsxs)("span", {
						className: TokenHud_module_css_default.chipTps,
						children: [tps >= 10 ? Math.round(tps) : tps.toFixed(1), " t/s"]
					})
				]
			});
		}
		/** One session row inside the live view. */
		function SessionRow({ row, prices, rangeMs, now, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const usage = row.usage;
			const cost = estimateRowCost(row, prices);
			const used = occupancy(row);
			const label = row.label !== "" ? row.label : row.sessionId.slice(-8);
			const history = toConsumption(filterRange(row.history ?? [], now, rangeMs));
			const cumulative = usage === void 0 ? void 0 : usage.uncachedInputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TokenHud_module_css_default.row,
				"data-open": open,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: TokenHud_module_css_default.rowHead,
					onClick: () => {
						setOpen((current) => !current);
					},
					"aria-expanded": open,
					children: [
						(0, react_jsx_runtime.jsxs)("span", {
							className: TokenHud_module_css_default.rowName,
							title: `${row.title ?? ""} ${row.sessionId}`,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.rowTitle,
								children: label
							}), row.title !== void 0 && row.title !== "" && (0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.rowSub,
								children: row.sessionId.slice(-8)
							})]
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: TokenHud_module_css_default.rowTokensWrap,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.rowTokens,
								title: t("currentPressure"),
								children: formatNumber(row.totalTokens)
							}), cumulative !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
								className: TokenHud_module_css_default.rowCumulative,
								title: t("cumulativeUsage"),
								children: [t("approx"), formatNumber(cumulative)]
							})]
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: TokenHud_module_css_default.rowPulse,
							"data-live": row.live,
							"aria-hidden": true
						})
					]
				}), open && (0, react_jsx_runtime.jsxs)("div", {
					className: TokenHud_module_css_default.rowDetail,
					children: [
						history.length >= 2 && (0, react_jsx_runtime.jsx)(Sparkline, {
							points: history,
							now,
							t
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: TokenHud_module_css_default.detailLine,
							children: [
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("input")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: usage === void 0 ? "—" : formatNumber(usage.uncachedInputTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("output")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: usage === void 0 ? "—" : formatNumber(usage.outputTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("cacheRead")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: usage === void 0 ? "—" : formatNumber(usage.cacheReadTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("cacheWrite")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: usage === void 0 ? "—" : formatNumber(usage.cacheWriteTokens)
									})]
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: TokenHud_module_css_default.detailLine,
							children: [
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("pressure")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: row.pressureTokens === void 0 ? "—" : formatNumber(row.pressureTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("projected")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: row.projectedTokens === void 0 ? "—" : formatNumber(row.projectedTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("capacity")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: row.contextWindow === void 0 ? "—" : formatNumber(row.contextWindow)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: t("cost")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: formatCost(cost)
									})]
								})
							]
						}),
						used !== void 0 && (0, react_jsx_runtime.jsx)("div", {
							className: TokenHud_module_css_default.barTrack,
							"aria-label": fill(t("contextBar"), { pct: used.toFixed(0) }),
							children: (0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.barFill,
								style: { width: `${used}%` },
								"data-hot": used > 85
							})
						})
					]
				})]
			});
		}
		/** One horizontal usage bar (day or month). */
		function StatBar({ label, value, max, input, output, cacheRead, cacheWrite, cost }) {
			const width = max > 0 ? Math.max(2, value / max * 100) : 0;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TokenHud_module_css_default.statRow,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.statLabel,
						children: label
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.statBarTrack,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: TokenHud_module_css_default.statBarFill,
							style: { width: `${width}%` }
						})
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.statValue,
						children: formatNumber(value)
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.statCost,
						children: formatCost(cost)
					})
				]
			});
		}
		/** The stats view: per-month and per-day usage bars, switched separately. */
		function StatsView({ stats, t, balance, budgetMonthly }) {
			const [subView, setSubView] = (0, react.useState)("days");
			if (stats === null) return (0, react_jsx_runtime.jsx)("span", {
				className: TokenHud_module_css_default.empty,
				children: t("loading")
			});
			const prices = stats.prices ?? {
				input: 1,
				cacheRead: .02,
				output: 2
			};
			const maxMonth = Math.max(...stats.months.map((month) => month.total), 1);
			const maxDay = Math.max(...stats.days.map((day) => day.total), 1);
			const totalAll = stats.months.reduce((sum, month) => sum + month.total, 0);
			const totalCost = stats.months.reduce((sum, month) => sum + estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices), 0);
			const hasData = stats.months.length > 0 || stats.days.length > 0;
			const dayPoints = (0, react.useMemo)(() => stats.days.map((day) => ({
				t: Date.parse(`${day.date}T12:00:00`),
				total: day.total
			})), [stats.days]);
			const monthPoints = (0, react.useMemo)(() => stats.months.map((month) => ({
				t: Date.parse(`${month.month}-15T12:00:00`),
				total: month.total
			})), [stats.months]);
			const nowDate = /* @__PURE__ */ new Date();
			const thisMonthKey = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}`;
			const monthCost = stats.months.filter((month) => month.month === thisMonthKey).reduce((sum, month) => sum + estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices), 0);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TokenHud_module_css_default.statsBody,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: TokenHud_module_css_default.statsTotal,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.statsTotalLabel,
								children: t("totalLabel")
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.mono,
								children: formatNumber(totalAll)
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TokenHud_module_css_default.statsTotalSub,
								children: [
									t("totalSub"),
									" · ",
									t("approx"),
									formatCost(totalCost)
								]
							})
						]
					}),
					budgetMonthly > 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TokenHud_module_css_default.budgetRow,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.budgetLabel,
								children: t("budgetLabel")
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.budgetTrack,
								children: (0, react_jsx_runtime.jsx)("span", {
									className: TokenHud_module_css_default.budgetFill,
									style: { width: `${Math.min(100, monthCost / budgetMonthly * 100)}%` },
									"data-over": monthCost > budgetMonthly
								})
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TokenHud_module_css_default.budgetText,
								children: [
									formatCost(monthCost),
									" / ",
									formatCost(budgetMonthly),
									monthCost > budgetMonthly && ` · ${t("budgetOver")}`
								]
							})
						]
					}),
					balance?.available === true && balance.value !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TokenHud_module_css_default.balanceRow,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: TokenHud_module_css_default.budgetLabel,
							children: t("balanceLabel")
						}), (0, react_jsx_runtime.jsxs)("span", {
							className: TokenHud_module_css_default.balanceValue,
							children: ["¥", balance.value.toFixed(2)]
						})]
					}),
					hasData && (0, react_jsx_runtime.jsxs)("div", {
						className: TokenHud_module_css_default.viewBar,
						role: "group",
						"aria-label": t("granularity"),
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TokenHud_module_css_default.viewButton,
							"data-active": subView === "days",
							onClick: () => {
								setSubView("days");
							},
							children: t("byDay")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TokenHud_module_css_default.viewButton,
							"data-active": subView === "months",
							onClick: () => {
								setSubView("months");
							},
							children: t("byMonth")
						})]
					}),
					subView === "months" ? stats.months.length > 0 ? (0, react_jsx_runtime.jsxs)("section", {
						className: TokenHud_module_css_default.statsSection,
						children: [
							(0, react_jsx_runtime.jsxs)("header", {
								className: TokenHud_module_css_default.statsSectionHead,
								children: [
									t("byMonth"),
									" · ",
									t("all")
								]
							}),
							monthPoints.length >= 1 && (0, react_jsx_runtime.jsx)("div", {
								className: TokenHud_module_css_default.statsSparkWrap,
								children: (0, react_jsx_runtime.jsx)(Sparkline, {
									points: monthPoints,
									now: Date.now(),
									height: 64,
									tickFormat: (value) => formatMonthTick(value, t),
									t
								})
							}),
							stats.months.map((month) => (0, react_jsx_runtime.jsx)(StatBar, {
								label: monthLabel(month.month, t),
								value: month.total,
								max: maxMonth,
								input: month.input,
								output: month.output,
								cacheRead: month.cacheRead,
								cacheWrite: month.cacheWrite,
								cost: estimateCost(month.input, month.cacheRead, month.cacheWrite, month.output, prices)
							}, month.month))
						]
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.empty,
						children: t("noMonthly")
					}) : stats.days.length > 0 ? (0, react_jsx_runtime.jsxs)("section", {
						className: TokenHud_module_css_default.statsSection,
						children: [
							(0, react_jsx_runtime.jsxs)("header", {
								className: TokenHud_module_css_default.statsSectionHead,
								children: [
									t("byDay"),
									" · ",
									t("all")
								]
							}),
							dayPoints.length >= 1 && (0, react_jsx_runtime.jsx)("div", {
								className: TokenHud_module_css_default.statsSparkWrap,
								children: (0, react_jsx_runtime.jsx)(Sparkline, {
									points: dayPoints,
									now: Date.now(),
									height: 64,
									tickFormat: formatDateTick,
									t
								})
							}),
							stats.days.map((day) => (0, react_jsx_runtime.jsx)(StatBar, {
								label: dateLabel(day.date, t),
								value: day.total,
								max: maxDay,
								input: day.input,
								output: day.output,
								cacheRead: day.cacheRead,
								cacheWrite: day.cacheWrite,
								cost: estimateCost(day.input, day.cacheRead, day.cacheWrite, day.output, prices)
							}, day.date))
						]
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.empty,
						children: t("noDaily")
					}),
					!hasData && (0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.empty,
						children: t("noStats")
					})
				]
			});
		}
		/** The top-level HUD: polling, view switching and layout. */
		function TokenHud({ t, sessionsList }) {
			const [snapshot, setSnapshot] = (0, react.useState)(null);
			const [stats, setStats] = (0, react.useState)(null);
			const [balance, setBalance] = (0, react.useState)(null);
			const [view, setView] = (0, react.useState)("live");
			const [open, setOpen] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [rangeMs, setRangeMs] = (0, react.useState)(RANGES[1]?.ms ?? 5 * 6e4);
			const [now, setNow] = (0, react.useState)(Date.now());
			const [showAll, setShowAll] = (0, react.useState)(false);
			const inFlight = (0, react.useRef)(false);
			/** User-defined initial position with its display label.
			*  `corner` = system bottom-right; `preset:<id>` = a preset corner;
			*  otherwise a custom dragged position. */
			const [defaultPos, setDefaultPos] = (0, react.useState)(() => {
				try {
					const raw = window.localStorage.getItem("dsh-token-panel-default-pos");
					if (raw === null) return null;
					const parsed = JSON.parse(raw);
					if (parsed !== null && typeof parsed === "object" && (parsed.kind === "corner" || parsed.kind === "preset" && typeof parsed.preset === "string" || parsed.kind === "custom" && typeof parsed.x === "number" && typeof parsed.y === "number")) return parsed;
					return null;
				} catch {
					return null;
				}
			});
			const [position, setPosition] = (0, react.useState)(() => {
				try {
					const raw = window.localStorage.getItem("dsh-token-panel-default-pos") ?? window.localStorage.getItem("dsh-token-panel-pos");
					if (raw === null) return null;
					const parsed = JSON.parse(raw);
					if (typeof parsed.x === "number" && typeof parsed.y === "number") return parsed;
					return null;
				} catch {
					return null;
				}
			});
			const dragState = (0, react.useRef)(null);
			/** Timestamp until which pill clicks are swallowed (drag/hold releases).
			*  Timestamp-based so a missed click can never wedge it permanently. */
			const suppressClickUntilRef = (0, react.useRef)(0);
			/** Set when the long-press timer fired (reliable across render closures). */
			const longPressTriggeredRef = (0, react.useRef)(false);
			/** Latest default position, mirrored from state for stale-closure-free reads. */
			const defaultPosRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				defaultPosRef.current = defaultPos;
			}, [defaultPos]);
			/** Long-press menu state (opened by holding the pill 600ms without moving). */
			const [pressMenu, setPressMenu] = (0, react.useState)(false);
			/** Position submenu expanded inside the long-press menu. */
			const [pressSubMenu, setPressSubMenu] = (0, react.useState)(false);
			/** "Set default position" capture mode: the next drag saves the position. */
			const [settingDefault, setSettingDefault] = (0, react.useState)(false);
			const settingDefaultRef = (0, react.useRef)(false);
			const setSettingDefaultBoth = (value) => {
				settingDefaultRef.current = value;
				setSettingDefault(value);
			};
			/** Transient confirmation toast text. */
			const [toast, setToast] = (0, react.useState)(null);
			const toastTimerRef = (0, react.useRef)(null);
			const showToast = (text) => {
				setToast(text);
				if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
				toastTimerRef.current = setTimeout(() => {
					setToast(null);
				}, 2200);
			};
			const pressTimerRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				if (!open || panelRef.current === null) return;
				const rect = panelRef.current.getBoundingClientRect();
				const maxX = Math.max(8, window.innerWidth - rect.width - 8);
				const maxY = Math.max(8, window.innerHeight - rect.height - 8);
				setPosition((current) => {
					if (current === null) return current;
					const x = Math.min(Math.max(current.x, 8), maxX);
					const y = Math.min(Math.max(current.y, 8), maxY);
					return x === current.x && y === current.y ? current : {
						x,
						y
					};
				});
			}, [open]);
			(0, react.useEffect)(() => {
				if (!pressMenu) return;
				const onOutside = (event) => {
					const target = event.target;
					if (target !== null && target.closest("[data-press-menu]") !== null) return;
					setPressMenu(false);
				};
				document.addEventListener("pointerdown", onOutside);
				return () => {
					document.removeEventListener("pointerdown", onOutside);
				};
			}, [pressMenu]);
			const onDragStart = (event) => {
				const rect = event.currentTarget.getBoundingClientRect();
				const baseX = position?.x ?? rect.left;
				const baseY = position?.y ?? rect.top;
				const hostEl = event.currentTarget.closest("[data-token-hud]");
				const hostRect = hostEl !== null ? hostEl.getBoundingClientRect() : rect;
				dragState.current = {
					startX: event.clientX,
					startY: event.clientY,
					pointerId: event.pointerId,
					baseX,
					baseY,
					width: hostRect.width,
					height: hostRect.height,
					moved: false,
					last: {
						x: baseX,
						y: baseY
					}
				};
				if (pressTimerRef.current !== null) clearTimeout(pressTimerRef.current);
				longPressTriggeredRef.current = false;
				pressTimerRef.current = setTimeout(() => {
					const drag = dragState.current;
					if (drag === null || drag.moved) return;
					longPressTriggeredRef.current = true;
					setPressMenu(true);
					suppressClickUntilRef.current = Date.now() + 600;
				}, 600);
			};
			/** Pill release: open the panel unless this was a drag or a long-press.
			*  Driven by pointerup (not click), which pointer capture cannot steal. */
			const onPillPointerUp = () => {
				const moved = dragState.current?.moved ?? false;
				const menuShown = longPressTriggeredRef.current;
				onDragEnd();
				if (!moved && !menuShown) setOpen(true);
			};
			const onDragMove = (event) => {
				const drag = dragState.current;
				if (drag === null) return;
				const dx = event.clientX - drag.startX;
				const dy = event.clientY - drag.startY;
				if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
				if (!drag.moved) {
					drag.moved = true;
					try {
						event.currentTarget.setPointerCapture(drag.pointerId);
					} catch {}
				}
				if (pressTimerRef.current !== null) {
					clearTimeout(pressTimerRef.current);
					pressTimerRef.current = null;
				}
				const rawX = drag.baseX + dx;
				const rawY = drag.baseY + dy;
				const VISIBLE = 48;
				const minX = VISIBLE - drag.width;
				const maxX = window.innerWidth - VISIBLE;
				const minY = VISIBLE - drag.height;
				const maxY = window.innerHeight - VISIBLE;
				drag.last = {
					x: Math.min(Math.max(rawX, minX), Math.max(maxX, minX)),
					y: Math.min(Math.max(rawY, minY), Math.max(maxY, minY))
				};
				setPosition(drag.last);
			};
			const onDragEnd = () => {
				if (pressTimerRef.current !== null) {
					clearTimeout(pressTimerRef.current);
					pressTimerRef.current = null;
				}
				const drag = dragState.current;
				if (drag === null) return;
				const moved = drag.moved;
				const final = drag.last;
				dragState.current = null;
				if (moved) {
					if (settingDefaultRef.current) {
						const next = {
							kind: "custom",
							x: final.x,
							y: final.y
						};
						setDefaultPos(next);
						setSettingDefaultBoth(false);
						showToast(t("defaultSaved"));
						try {
							window.localStorage.setItem("dsh-token-panel-default-pos", JSON.stringify(next));
						} catch {}
					}
					suppressClickUntilRef.current = Date.now() + 600;
					try {
						window.localStorage.setItem("dsh-token-panel-pos", JSON.stringify(final));
					} catch {}
				}
			};
			/** Back to the user-defined default position (preset or custom).
			*  When the panel is open, the target is clamped so it lands fully
			*  visible — otherwise an off-screen target looks like "nothing moved". */
			const goToDefault = () => {
				const def = defaultPosRef.current;
				let target;
				if (def === null || def.kind === "corner") target = null;
				else if (def.kind === "preset") target = presetCornerPosition(def.preset);
				else target = {
					x: def.x,
					y: def.y
				};
				if (target !== null && open && panelRef.current !== null) {
					const rect = panelRef.current.getBoundingClientRect();
					const maxX = Math.max(8, window.innerWidth - rect.width - 8);
					const maxY = Math.max(8, window.innerHeight - rect.height - 8);
					target = {
						x: Math.min(Math.max(target.x, 8), maxX),
						y: Math.min(Math.max(target.y, 8), maxY)
					};
				}
				setPosition(target);
				setPressMenu(false);
				setSettingDefaultBoth(false);
				showToast(def === null || def.kind === "corner" ? t("backToCornerDone") : def.kind === "preset" ? fill(t("defaultSetTo"), { pos: cornerLabel(def.preset, t) }) : t("backToCustomDone"));
				try {
					window.localStorage.removeItem("dsh-token-panel-pos");
				} catch {}
			};
			/** Apply a preset corner as the default position (and move there now). */
			const applyPreset = (preset) => {
				const next = {
					kind: "preset",
					preset
				};
				setDefaultPos(next);
				let target = presetCornerPosition(preset);
				if (open && panelRef.current !== null) {
					const rect = panelRef.current.getBoundingClientRect();
					const maxX = Math.max(8, window.innerWidth - rect.width - 8);
					const maxY = Math.max(8, window.innerHeight - rect.height - 8);
					target = {
						x: Math.min(Math.max(target.x, 8), maxX),
						y: Math.min(Math.max(target.y, 8), maxY)
					};
				}
				setPosition(target);
				setPressMenu(false);
				setSettingDefaultBoth(false);
				showToast(fill(t("defaultSetTo"), { pos: cornerLabel(preset, t) }));
				try {
					window.localStorage.setItem("dsh-token-panel-default-pos", JSON.stringify(next));
					window.localStorage.removeItem("dsh-token-panel-pos");
				} catch {}
			};
			/** Enter capture mode: the next drag saves the position as the default. */
			const startSetDefault = () => {
				setPressMenu(false);
				setSettingDefaultBoth(true);
				showToast(t("setDefaultHint"));
			};
			const currentSessionId = (0, react.useSyncExternalStore)(sessionsList.subscribe, sessionsList.getSnapshot).current;
			(0, react.useEffect)(() => {
				let cancelled = false;
				const tick = async () => {
					if (inFlight.current || cancelled) return;
					inFlight.current = true;
					try {
						const response = await fetch(SNAPSHOT_URL, { cache: "no-store" });
						if (!response.ok) throw new Error(`HTTP ${response.status}`);
						const body = await response.json();
						if (!cancelled && Array.isArray(body.sessions)) {
							setSnapshot(body);
							setNow(Date.now());
							setError(null);
						}
					} catch (cause) {
						if (!cancelled) setError(cause instanceof Error ? cause.message : String(cause));
					} finally {
						inFlight.current = false;
					}
				};
				tick();
				const timer = setInterval(() => {
					tick();
				}, POLL_MS);
				return () => {
					cancelled = true;
					clearInterval(timer);
				};
			}, []);
			const statsInFlight = (0, react.useRef)(false);
			const fetchStats = async () => {
				if (statsInFlight.current) return;
				statsInFlight.current = true;
				try {
					const response = await fetch(STATS_URL, { cache: "no-store" });
					if (!response.ok) return;
					const body = await response.json();
					if (Array.isArray(body.days)) setStats(body);
				} catch {} finally {
					statsInFlight.current = false;
				}
			};
			(0, react.useEffect)(() => {
				let cancelled = false;
				if (view === "stats") fetchStats();
				const timer = setInterval(() => {
					if (!cancelled) fetchStats();
				}, STATS_POLL_MS);
				return () => {
					cancelled = true;
					clearInterval(timer);
				};
			}, [view]);
			(0, react.useEffect)(() => {
				let cancelled = false;
				const tick = async () => {
					try {
						const response = await fetch(BALANCE_URL, { cache: "no-store" });
						if (!response.ok) return;
						const body = await response.json();
						if (!cancelled) setBalance(body);
					} catch {}
				};
				tick();
				const timer = setInterval(() => {
					tick();
				}, BALANCE_POLL_MS);
				return () => {
					cancelled = true;
					clearInterval(timer);
				};
			}, []);
			const totals = (0, react.useMemo)(() => {
				if (snapshot === null) return {
					total: 0,
					output: 0
				};
				let total = 0;
				let output = 0;
				let cumulative = 0;
				for (const row of snapshot.sessions) {
					total += row.totalTokens;
					output += row.usage?.outputTokens ?? 0;
					cumulative += (row.usage?.uncachedInputTokens ?? 0) + (row.usage?.outputTokens ?? 0) + (row.usage?.cacheReadTokens ?? 0) + (row.usage?.cacheWriteTokens ?? 0);
				}
				return {
					total,
					output,
					cumulative
				};
			}, [snapshot]);
			const prices = snapshot?.prices ?? {
				input: 1,
				cacheRead: .02,
				output: 2
			};
			const tps = snapshot?.tps ?? 0;
			const budgetMonthly = snapshot?.budgetMonthly ?? 0;
			const topHistory = (0, react.useMemo)(() => {
				if (snapshot === null || snapshot.sessions.length === 0) return [];
				return toConsumption(filterRange(((currentSessionId !== void 0 ? snapshot.sessions.find((row) => row.sessionId === currentSessionId) : void 0) ?? snapshot.sessions[0])?.history ?? [], now, rangeMs));
			}, [
				snapshot,
				now,
				rangeMs,
				currentSessionId
			]);
			const dragHandlers = {
				onPointerDown: onDragStart,
				onPointerMove: onDragMove,
				onPointerUp: onDragEnd,
				onPointerLeave: onDragEnd
			};
			const hostStyle = position !== null ? {
				right: "auto",
				bottom: "auto",
				left: position.x,
				top: position.y
			} : {};
			if (snapshot === null) return (0, react_jsx_runtime.jsx)("div", {
				className: TokenHud_module_css_default.host,
				style: {
					...hostStyle,
					cursor: "grab"
				},
				"data-token-hud": true,
				...dragHandlers,
				onPointerUp: onPillPointerUp,
				children: (0, react_jsx_runtime.jsx)(CollapsedChip, {
					total: 0,
					t
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TokenHud_module_css_default.host,
				style: hostStyle,
				"data-token-hud": true,
				children: [
					pressMenu && (0, react_jsx_runtime.jsxs)("div", {
						className: TokenHud_module_css_default.pressMenu,
						"data-press-menu": true,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: TokenHud_module_css_default.pressMenuItem,
								onClick: () => {
									goToDefault();
									suppressClickUntilRef.current = 0;
								},
								children: (0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.pressMenuLabel,
									children: [(0, react_jsx_runtime.jsx)(MenuIcon, { d: defaultPos === null || defaultPos.kind === "corner" ? ICON_CORNER.br : defaultPos.kind === "preset" ? ICON_CORNER[defaultPos.preset] : ICON_CROSSHAIR }), defaultPos === null || defaultPos.kind === "corner" ? t("backToCorner") : defaultPos.kind === "preset" ? `${t("backToDefault")} · ${cornerLabel(defaultPos.preset, t)}` : t("backToCustom")]
								})
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: TokenHud_module_css_default.pressMenuItem,
								onPointerEnter: () => {
									setPressSubMenu(true);
								},
								onClick: () => {
									setPressSubMenu((current) => !current);
								},
								"aria-expanded": pressSubMenu,
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.pressMenuLabel,
									children: [(0, react_jsx_runtime.jsx)(MenuIcon, { d: ICON_CROSSHAIR }), t("positionMenu")]
								}), (0, react_jsx_runtime.jsx)("span", {
									className: TokenHud_module_css_default.pressMenuCaret,
									children: "▸"
								})]
							}),
							pressSubMenu && (0, react_jsx_runtime.jsxs)("div", {
								className: TokenHud_module_css_default.pressSubMenu,
								"data-press-menu": true,
								children: [[
									"tr",
									"tl",
									"bl",
									"br"
								].map((preset) => (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TokenHud_module_css_default.pressMenuItem,
									onClick: () => {
										applyPreset(preset);
										suppressClickUntilRef.current = 0;
									},
									children: (0, react_jsx_runtime.jsxs)("span", {
										className: TokenHud_module_css_default.pressMenuLabel,
										children: [(0, react_jsx_runtime.jsx)(MenuIcon, { d: ICON_CORNER[preset] }), cornerLabel(preset, t)]
									})
								}, preset)), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TokenHud_module_css_default.pressMenuItem,
									onClick: () => {
										startSetDefault();
										suppressClickUntilRef.current = 0;
									},
									children: (0, react_jsx_runtime.jsxs)("span", {
										className: TokenHud_module_css_default.pressMenuLabel,
										children: [(0, react_jsx_runtime.jsx)(MenuIcon, { d: ICON_CROSSHAIR }), t("customPos")]
									})
								})]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: TokenHud_module_css_default.pressMenuItem,
								onClick: () => {
									setPressMenu(false);
									setPressSubMenu(false);
								},
								children: (0, react_jsx_runtime.jsx)("span", {
									className: TokenHud_module_css_default.pressMenuLabel,
									children: t("cancelMenu")
								})
							})
						]
					}),
					toast !== null && (0, react_jsx_runtime.jsx)("div", {
						className: TokenHud_module_css_default.toast,
						"data-toast": true,
						children: toast
					}),
					!open && (0, react_jsx_runtime.jsx)("div", {
						...dragHandlers,
						style: { cursor: "grab" },
						onPointerUp: onPillPointerUp,
						children: (0, react_jsx_runtime.jsx)(CollapsedChip, {
							total: totals.total,
							cumulative: totals.cumulative,
							tps,
							t
						})
					}),
					open && (0, react_jsx_runtime.jsxs)("aside", {
						className: TokenHud_module_css_default.panel,
						"data-token-panel": true,
						ref: panelRef,
						children: [
							(0, react_jsx_runtime.jsxs)("header", {
								className: TokenHud_module_css_default.head,
								children: [
									(0, react_jsx_runtime.jsxs)("span", {
										className: TokenHud_module_css_default.title,
										...dragHandlers,
										title: t("dragHint"),
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: TokenHud_module_css_default.titleMark,
											"aria-hidden": true
										}), t("token")]
									}),
									(0, react_jsx_runtime.jsxs)("div", {
										className: TokenHud_module_css_default.viewBar,
										role: "group",
										"aria-label": t("viewSwitch"),
										onPointerDown: (event) => {
											event.stopPropagation();
										},
										children: [(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: TokenHud_module_css_default.viewButton,
											"data-active": view === "live",
											onClick: () => {
												setView("live");
											},
											children: t("live")
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: TokenHud_module_css_default.viewButton,
											"data-active": view === "stats",
											onClick: () => {
												setView("stats");
											},
											children: t("stats")
										})]
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: TokenHud_module_css_default.closeButton,
										onClick: () => {
											setOpen(false);
										},
										onPointerDown: (event) => {
											event.stopPropagation();
										},
										"aria-label": t("close"),
										children: "✕"
									})
								]
							}),
							view === "live" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [topHistory.length >= 2 && (0, react_jsx_runtime.jsxs)("div", {
								className: TokenHud_module_css_default.sparkWrap,
								children: [(0, react_jsx_runtime.jsx)("div", {
									className: TokenHud_module_css_default.rangeBar,
									role: "group",
									"aria-label": t("timeRange"),
									children: RANGES.map((range) => (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: TokenHud_module_css_default.rangeButton,
										"data-active": range.ms === rangeMs,
										onClick: () => {
											setRangeMs(range.ms);
										},
										children: range.label
									}, range.label))
								}), (0, react_jsx_runtime.jsx)(Sparkline, {
									points: topHistory,
									now,
									t
								})]
							}), (0, react_jsx_runtime.jsx)("div", {
								className: TokenHud_module_css_default.body,
								children: (() => {
									const current = currentSessionId !== void 0 ? snapshot.sessions.find((row) => row.sessionId === currentSessionId) : void 0;
									const others = snapshot.sessions.filter((row) => row.sessionId !== current?.sessionId);
									const rows = current !== void 0 ? [current, ...showAll ? others : []] : showAll ? snapshot.sessions : snapshot.sessions.slice(0, 3);
									if (rows.length === 0 && others.length === 0) return (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.empty,
										children: t("noSessions")
									});
									return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
										rows.map((row) => (0, react_jsx_runtime.jsx)(SessionRow, {
											row,
											prices,
											rangeMs,
											now,
											t
										}, row.sessionId)),
										!showAll && others.length > 0 && (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: TokenHud_module_css_default.moreButton,
											onClick: () => {
												setShowAll(true);
											},
											children: fill(t("expandAll"), { count: others.length })
										}),
										showAll && others.length > 0 && (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: TokenHud_module_css_default.moreButton,
											onClick: () => {
												setShowAll(false);
											},
											children: t("collapseAll")
										})
									] });
								})()
							})] }) : (0, react_jsx_runtime.jsx)("div", {
								className: TokenHud_module_css_default.body,
								children: (0, react_jsx_runtime.jsx)(StatsView, {
									stats,
									t,
									balance,
									budgetMonthly
								})
							}),
							(0, react_jsx_runtime.jsxs)("footer", {
								className: TokenHud_module_css_default.foot,
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.footHint,
									children: [
										error !== null ? fill(t("disconnected"), { error }) : view === "live" ? fill(t("pollLive"), {
											total: formatNumber(totals.total),
											out: formatNumber(totals.output)
										}) : t("pollStats"),
										tps > 0 && (0, react_jsx_runtime.jsxs)("span", {
											className: TokenHud_module_css_default.footTps,
											children: [
												" · ",
												tps >= 10 ? Math.round(tps) : tps.toFixed(1),
												" t/s"
											]
										}),
										prices.mode !== void 0 && prices.mode !== "flat" && (0, react_jsx_runtime.jsx)("span", {
											className: TokenHud_module_css_default.footPrice,
											"data-mode": prices.mode,
											children: prices.mode === "peak" ? t("pricePeak") : t("priceOffpeak")
										})
									]
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.footRight,
									children: [balance?.available === true && balance.value !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
										className: TokenHud_module_css_default.footBalance,
										title: t("balanceTitle"),
										children: ["¥", balance.value.toFixed(2)]
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: new Date(snapshot.generatedAt).toLocaleTimeString()
									})]
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/client/index.js
		/** Locale namespace for the HUD copy. */
		const NS = "token-panel";
		/** Required client services. */
		const inject = [
			"slots",
			"locale",
			"sessions"
		];
		/**
		* Mount the token HUD through a body portal: a fixed glass panel showing
		* live token consumption across sessions, polling the host snapshot route.
		* Copy follows the DSH locale (en/zh) via `ctx.locale`.
		*/
		function apply(ctx) {
			const en = {
				token: "TOKEN HUD",
				live: "Live",
				stats: "Stats",
				close: "Close",
				byDay: "Daily",
				byMonth: "Monthly",
				all: "All",
				totalLabel: "Cumulative",
				totalSub: "token",
				approx: "≈",
				currentPressure: "Current context pressure",
				cumulativeUsage: "Cumulative usage",
				expandAll: "Show all {count} sessions",
				collapseAll: "Collapse to top 3",
				noSessions: "No active sessions",
				waiting: "Waiting for data…",
				noStats: "No stats yet (recorded automatically once sessions run)",
				noDaily: "No daily data",
				noMonthly: "No monthly data",
				loading: "Loading stats…",
				input: "Input",
				output: "Output",
				cacheRead: "Cache read",
				cacheWrite: "Cache write",
				pressure: "Pressure",
				projected: "Projected",
				capacity: "Capacity",
				cost: "Cost",
				today: "Today",
				yesterday: "Yesterday",
				thisMonth: "This month",
				monthFmt: "{m}/{y}",
				pollLive: "Live · TOTAL {total} · OUT {out}",
				pollStats: "Daily & monthly stats",
				pricePeak: "peak rate",
				priceOffpeak: "off-peak rate",
				balanceTitle: "DeepSeek account balance",
				balanceLabel: "Balance",
				budgetLabel: "Monthly budget",
				budgetOver: "over budget",
				disconnected: "Disconnected · {error}",
				timeRange: "Time range",
				viewSwitch: "View switch",
				granularity: "Granularity",
				openPanel: "Open Token panel",
				dragHint: "Drag to move the panel",
				backToDefault: "Back to default",
				backToCustom: "Back to custom position",
				backToCustomDone: "Back to custom position",
				backToCorner: "Bottom-right corner",
				backToCornerDone: "Reset to bottom-right",
				positionMenu: "Position",
				cornerTL: "Top-left corner",
				cornerTR: "Top-right corner",
				cornerBL: "Bottom-left corner",
				cornerBR: "Bottom-right corner",
				customPos: "Custom position…",
				setAsDefault: "Change default position",
				setDefaultHint: "Drag the panel to a new spot and release to save as default",
				defaultSaved: "Default position saved",
				defaultSetTo: "Default set to {pos}",
				cancelMenu: "Cancel",
				contextBar: "Context usage {pct}%"
			};
			const zh = {
				token: "TOKEN HUD",
				live: "实时",
				stats: "统计",
				close: "收起",
				byDay: "按日",
				byMonth: "按月",
				all: "全部",
				totalLabel: "累计消耗",
				totalSub: "token",
				approx: "≈",
				currentPressure: "当前上下文压力",
				cumulativeUsage: "累计消耗",
				expandAll: "展开全部 {count} 个会话",
				collapseAll: "收起，只看前 3 个",
				noSessions: "无活动会话",
				waiting: "等待数据…",
				noStats: "暂无统计数据（使用会话后自动记录）",
				noDaily: "暂无按日数据",
				noMonthly: "暂无按月数据",
				loading: "统计数据加载中…",
				input: "输入",
				output: "输出",
				cacheRead: "缓存读",
				cacheWrite: "缓存写",
				pressure: "压力",
				projected: "预计",
				capacity: "容量",
				cost: "成本",
				today: "今天",
				yesterday: "昨天",
				thisMonth: "本月",
				monthFmt: "{y}年{m}月",
				pollLive: "实时 TOTAL {total} · OUT {out}",
				pollStats: "按日按月统计",
				pricePeak: "高峰价",
				priceOffpeak: "空闲价",
				balanceTitle: "DeepSeek 账户余额",
				balanceLabel: "余额",
				budgetLabel: "本月预算",
				budgetOver: "超支",
				disconnected: "连接中断 · {error}",
				timeRange: "时间范围",
				viewSwitch: "视图切换",
				granularity: "统计粒度",
				openPanel: "打开 Token 面板",
				dragHint: "拖拽标题可移动面板",
				backToDefault: "回到默认位置",
				backToCustom: "回到自定义位置",
				backToCustomDone: "已回到自定义位置",
				backToCorner: "右下角",
				backToCornerDone: "已回到右下角",
				positionMenu: "位置",
				cornerTL: "左上角",
				cornerTR: "右上角",
				cornerBL: "左下角",
				cornerBR: "右下角",
				customPos: "自定义位置…",
				setAsDefault: "更改默认位置",
				setDefaultHint: "把面板拖到新位置，松手保存为默认",
				defaultSaved: "默认位置已更新",
				defaultSetTo: "默认位置已设为 {pos}",
				cancelMenu: "取消",
				contextBar: "上下文占用 {pct}%"
			};
			ctx.effect(() => ctx.locale.register(NS, {
				en,
				zh
			}), "token-panel: locale");
			const t = ctx.locale.bind(NS);
			const host = document.createElement("div");
			host.dataset.tokenPanelHost = "";
			document.body.appendChild(host);
			const root = (0, react_dom_client.createRoot)(host);
			root.render((0, react_jsx_runtime.jsx)(TokenHud, {
				t,
				sessionsList: ctx.sessions.list
			}));
			ctx.effect(() => () => {
				root.unmount();
				host.remove();
			}, "token-panel: hud");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map