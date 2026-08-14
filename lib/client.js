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
		const css = "html{--token-panel-mono:\"Cascadia Code\", \"Consolas\", \"SF Mono\", \"JetBrains Mono\", monospace}._7TU4uW_host{z-index:2147483000;font-family:var(--token-panel-mono);position:fixed;bottom:18px;right:18px}._7TU4uW_chip{box-sizing:border-box;border:1px solid var(--dsw-alias-line-normal);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 92%, transparent);backdrop-filter:blur(14px);height:34px;box-shadow:0 8px 28px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);color:var(--dsw-alias-label-secondary);font:inherit;letter-spacing:.12em;cursor:pointer;border-radius:999px;align-items:center;gap:8px;padding:0 14px;font-size:11px;font-weight:600;transition:border-color .15s,box-shadow .15s,transform .12s;display:inline-flex}._7TU4uW_chip:hover{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 20px color-mix(in srgb, var(--dsw-alias-state-business-primary) 30%, transparent);transform:translateY(-1px)}._7TU4uW_chip:focus-visible,._7TU4uW_closeButton:focus-visible,._7TU4uW_rowHead:focus-visible,._7TU4uW_rangeButton:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}._7TU4uW_chipDot{background:var(--dsw-alias-state-business-primary);width:7px;height:7px;box-shadow:0 0 8px var(--dsw-alias-state-business-primary);border-radius:50%;animation:1.4s ease-in-out infinite _7TU4uW_tokenPanelPulse}._7TU4uW_chipLabel{color:var(--dsw-alias-label-tertiary)}._7TU4uW_chipValue{color:var(--dsw-alias-state-business-primary);font-weight:700}@keyframes _7TU4uW_tokenPanelPulse{0%,to{opacity:.45}50%{opacity:1}}@keyframes _7TU4uW_tokenPanelIn{0%{opacity:0;transform:translateY(8px)scale(.985)}to{opacity:1;transform:translateY(0)scale(1)}}._7TU4uW_panel{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-line-strong) 58%, transparent);background:color-mix(in srgb, var(--dsw-alias-bg-module-platform) 95%, transparent);backdrop-filter:blur(18px)saturate(1.08);width:360px;max-height:min(72dvh,560px);box-shadow:0 12px 32px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent), 0 32px 72px color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent);border-radius:14px;flex-direction:column;animation:.18s ease-out _7TU4uW_tokenPanelIn;display:flex;overflow:hidden}._7TU4uW_head{border-bottom:1px solid var(--dsw-alias-line-normal);align-items:center;gap:10px;padding:12px 16px;display:flex}._7TU4uW_title{color:var(--dsw-alias-label-primary);letter-spacing:.18em;align-items:center;gap:7px;font-size:12px;font-weight:700;display:inline-flex}._7TU4uW_titleMark{background:var(--dsw-alias-state-business-primary);width:8px;height:8px;box-shadow:0 0 8px var(--dsw-alias-state-business-primary);transform:rotate(45deg)}._7TU4uW_viewBar{border:1px solid var(--dsw-alias-line-normal);background:color-mix(in srgb, var(--dsw-alias-bg-module) 60%, transparent);border-radius:999px;gap:2px;margin-left:auto;padding:2px;display:inline-flex}._7TU4uW_viewButton{color:var(--dsw-alias-label-tertiary);font:inherit;letter-spacing:.08em;cursor:pointer;background:0 0;border:none;border-radius:999px;padding:2px 10px;font-size:10px;transition:color .12s,background .12s}._7TU4uW_viewButton:hover{color:var(--dsw-alias-label-primary)}._7TU4uW_viewButton[data-active=true]{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-on-fill);font-weight:700}._7TU4uW_closeButton{width:24px;height:24px;color:var(--dsw-alias-label-tertiary);font:inherit;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;justify-content:center;align-items:center;font-size:11px;transition:color .12s,border-color .12s;display:inline-flex}._7TU4uW_closeButton:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-line-normal)}._7TU4uW_sparkWrap{border-bottom:1px solid var(--dsw-alias-line-normal);padding:10px 14px 6px}._7TU4uW_rangeBar{gap:4px;margin-bottom:6px;display:flex}._7TU4uW_rangeButton{border:1px solid var(--dsw-alias-line-normal);color:var(--dsw-alias-label-tertiary);font:inherit;letter-spacing:.08em;cursor:pointer;background:0 0;border-radius:999px;padding:2px 10px;font-size:10px;transition:border-color .12s,color .12s,background .12s}._7TU4uW_rangeButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}._7TU4uW_rangeButton[data-active=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 14%, transparent);color:var(--dsw-alias-state-business-primary);font-weight:700}._7TU4uW_spark{display:block;overflow:visible}._7TU4uW_sparkTick{fill:var(--dsw-alias-label-tertiary);font-size:9px;font-family:var(--token-panel-mono);letter-spacing:.02em}._7TU4uW_sparkEmpty{color:var(--dsw-alias-label-tertiary);letter-spacing:.08em;justify-content:center;align-items:center;font-size:10px;display:flex}._7TU4uW_body{flex:1;min-height:0;padding:6px 10px;overflow-y:auto}._7TU4uW_empty{text-align:center;color:var(--dsw-alias-label-tertiary);letter-spacing:.1em;padding:18px 8px;font-size:11px;display:block}._7TU4uW_row{border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-line-normal) 60%, transparent);padding:2px 0}._7TU4uW_row:last-child{border-bottom:none}._7TU4uW_rowHead{box-sizing:border-box;width:100%;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;text-align:left;background:0 0;border:none;border-radius:8px;align-items:center;gap:10px;padding:9px 8px;font-size:12px;display:flex}._7TU4uW_rowHead:hover{background:var(--dsw-alias-interactive-bg-hover)}._7TU4uW_rowName{min-width:0;color:var(--dsw-alias-label-secondary);letter-spacing:.04em;flex:1;align-items:baseline;gap:6px;display:flex;overflow:hidden}._7TU4uW_rowTitle{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-primary);overflow:hidden}._7TU4uW_rowSub{color:var(--dsw-alias-label-tertiary);letter-spacing:.06em;flex:none;font-size:9px}._7TU4uW_rowTokensWrap{flex:none;align-items:baseline;gap:6px;display:inline-flex}._7TU4uW_rowTokens{color:var(--dsw-alias-label-primary);font-weight:700}._7TU4uW_rowCumulative{color:var(--dsw-alias-label-tertiary);letter-spacing:.04em;font-size:9px}._7TU4uW_moreButton{box-sizing:border-box;border:1px dashed var(--dsw-alias-line-normal);width:calc(100% - 16px);color:var(--dsw-alias-label-tertiary);font:inherit;letter-spacing:.06em;cursor:pointer;background:0 0;border-radius:8px;margin:8px 8px 4px;padding:7px 10px;font-size:11px;transition:border-color .12s,color .12s,background .12s;display:block}._7TU4uW_moreButton:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 6%, transparent)}._7TU4uW_rowPulse{background:var(--dsw-alias-label-tertiary);border-radius:50%;flex:none;width:6px;height:6px}._7TU4uW_rowPulse[data-live=true]{background:var(--dsw-alias-state-business-primary);box-shadow:0 0 6px var(--dsw-alias-state-business-primary);animation:1.4s ease-in-out infinite _7TU4uW_tokenPanelPulse}._7TU4uW_rowDetail{padding:4px 10px 12px}._7TU4uW_detailLine{grid-template-columns:1fr 1fr;gap:8px 18px;margin-bottom:10px;display:grid}._7TU4uW_detailItem{justify-content:space-between;align-items:baseline;gap:8px;display:flex}._7TU4uW_detailLabel{color:var(--dsw-alias-label-tertiary);letter-spacing:.06em;flex:none;font-size:10px}._7TU4uW_detailItem ._7TU4uW_mono{color:var(--dsw-alias-label-secondary);text-align:right;font-size:11px}._7TU4uW_barTrack{background:var(--dsw-alias-bg-fill-neutral);border-radius:2px;height:4px;margin-top:2px;overflow:hidden}._7TU4uW_barFill{background:var(--dsw-alias-state-business-primary);height:100%;box-shadow:0 0 6px color-mix(in srgb, var(--dsw-alias-state-business-primary) 40%, transparent);border-radius:2px;transition:width .4s;display:block}._7TU4uW_barFill[data-hot=true]{background:var(--dsw-alias-state-danger);box-shadow:0 0 8px color-mix(in srgb, var(--dsw-alias-state-danger) 50%, transparent)}._7TU4uW_foot{border-top:1px solid var(--dsw-alias-line-normal);color:var(--dsw-alias-label-tertiary);letter-spacing:.1em;justify-content:space-between;align-items:center;gap:8px;padding:8px 16px;font-size:9px;display:flex}._7TU4uW_foot ._7TU4uW_mono{color:var(--dsw-alias-label-tertiary);font-size:9px}._7TU4uW_mono{font-variant-numeric:tabular-nums}._7TU4uW_statsBody{padding:4px 2px}._7TU4uW_statsBody ._7TU4uW_viewBar{margin:0 10px 10px}._7TU4uW_statsSparkWrap{padding:0 10px 8px}._7TU4uW_statsTotal{border-bottom:1px solid var(--dsw-alias-line-normal);align-items:baseline;gap:8px;margin-bottom:8px;padding:6px 10px 10px;display:flex}._7TU4uW_statsTotalLabel{color:var(--dsw-alias-label-tertiary);letter-spacing:.1em;font-size:10px}._7TU4uW_statsTotal ._7TU4uW_mono{color:var(--dsw-alias-state-business-primary);font-size:16px;font-weight:700}._7TU4uW_statsTotalSub{color:var(--dsw-alias-label-tertiary);font-size:10px}._7TU4uW_statsSection{margin-bottom:10px}._7TU4uW_statsSectionHead{color:var(--dsw-alias-label-tertiary);letter-spacing:.14em;padding:4px 10px 6px;font-size:10px}._7TU4uW_statRow{align-items:center;gap:10px;padding:3px 10px;display:flex}._7TU4uW_statLabel{width:64px;color:var(--dsw-alias-label-secondary);letter-spacing:.04em;text-overflow:ellipsis;white-space:nowrap;flex:none;font-size:10px;overflow:hidden}._7TU4uW_statBarTrack{background:var(--dsw-alias-bg-fill-neutral);border-radius:3px;flex:1;height:10px;overflow:hidden}._7TU4uW_statBarFill{background:linear-gradient(90deg, color-mix(in srgb, var(--dsw-alias-state-business-primary) 45%, transparent), var(--dsw-alias-state-business-primary));border-radius:3px;height:100%;transition:width .4s;display:block}._7TU4uW_statValue{text-align:right;width:52px;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;flex:none;font-size:11px;font-weight:700}._7TU4uW_statCost{text-align:right;width:70px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;font-size:9px}";
		const tagId = "dsh-token-panel/TokenHud.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-token-panel";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TokenHud_module_css_default = {
			"host": "_7TU4uW_host",
			"title": "_7TU4uW_title",
			"chipValue": "_7TU4uW_chipValue",
			"statsTotal": "_7TU4uW_statsTotal",
			"rowTitle": "_7TU4uW_rowTitle",
			"body": "_7TU4uW_body",
			"panel": "_7TU4uW_panel",
			"sparkTick": "_7TU4uW_sparkTick",
			"rowCumulative": "_7TU4uW_rowCumulative",
			"rowDetail": "_7TU4uW_rowDetail",
			"row": "_7TU4uW_row",
			"rowHead": "_7TU4uW_rowHead",
			"viewBar": "_7TU4uW_viewBar",
			"barTrack": "_7TU4uW_barTrack",
			"statsBody": "_7TU4uW_statsBody",
			"rowPulse": "_7TU4uW_rowPulse",
			"statsSection": "_7TU4uW_statsSection",
			"rowSub": "_7TU4uW_rowSub",
			"statsTotalLabel": "_7TU4uW_statsTotalLabel",
			"rangeBar": "_7TU4uW_rangeBar",
			"statLabel": "_7TU4uW_statLabel",
			"statValue": "_7TU4uW_statValue",
			"detailItem": "_7TU4uW_detailItem",
			"mono": "_7TU4uW_mono",
			"rowName": "_7TU4uW_rowName",
			"sparkEmpty": "_7TU4uW_sparkEmpty",
			"chipDot": "_7TU4uW_chipDot",
			"foot": "_7TU4uW_foot",
			"statCost": "_7TU4uW_statCost",
			"tokenPanelIn": "_7TU4uW_tokenPanelIn",
			"chip": "_7TU4uW_chip",
			"closeButton": "_7TU4uW_closeButton",
			"rangeButton": "_7TU4uW_rangeButton",
			"statsSectionHead": "_7TU4uW_statsSectionHead",
			"statBarFill": "_7TU4uW_statBarFill",
			"empty": "_7TU4uW_empty",
			"barFill": "_7TU4uW_barFill",
			"rowTokensWrap": "_7TU4uW_rowTokensWrap",
			"tokenPanelPulse": "_7TU4uW_tokenPanelPulse",
			"statsSparkWrap": "_7TU4uW_statsSparkWrap",
			"detailLine": "_7TU4uW_detailLine",
			"spark": "_7TU4uW_spark",
			"rowTokens": "_7TU4uW_rowTokens",
			"statsTotalSub": "_7TU4uW_statsTotalSub",
			"viewButton": "_7TU4uW_viewButton",
			"statBarTrack": "_7TU4uW_statBarTrack",
			"statRow": "_7TU4uW_statRow",
			"titleMark": "_7TU4uW_titleMark",
			"moreButton": "_7TU4uW_moreButton",
			"sparkWrap": "_7TU4uW_sparkWrap",
			"head": "_7TU4uW_head",
			"chipLabel": "_7TU4uW_chipLabel",
			"detailLabel": "_7TU4uW_detailLabel"
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
		/** Poll cadence (ms); keep in sync with the host default. */
		const POLL_MS = 1500;
		/** Stats poll cadence (ms) — daily totals move slowly. */
		const STATS_POLL_MS = 1e4;
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
		function formatNumber(value) {
			if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
			if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
			if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
			return String(Math.round(value));
		}
		/** Format a timestamp as HH:MM:SS. */
		function formatTime(t) {
			const date = new Date(t);
			return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
		}
		/** Short Chinese date label for a YYYY-MM-DD key. */
		function dateLabel(date) {
			const [y, m, d] = date.split("-");
			const now = /* @__PURE__ */ new Date();
			if (date === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`) return "今天";
			return `${Number(m)}月${Number(d)}日`;
		}
		/** Month label for a YYYY-MM key. */
		function monthLabel(month) {
			const [y, m] = month.split("-");
			const now = /* @__PURE__ */ new Date();
			if (Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1) return "本月";
			return `${y}年${Number(m)}月`;
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
		/** Format a timestamp for a date-scale axis (M/D). */
		function formatDateTick(t) {
			const date = new Date(t);
			return `${date.getMonth() + 1}/${date.getDate()}`;
		}
		/**
		* Sparkline: renders the timestamped history as an SVG area chart with
		* ticks on the bottom axis. Pass `tickFormat` for non-time scales (e.g.
		* daily/monthly stats).
		*/
		function Sparkline({ points, now, width = 336, height = 72, tickFormat = formatTime }) {
			const path = (0, react.useMemo)(() => {
				if (points.length < 2) return null;
				const max = Math.max(...points.map((point) => point.total), 1);
				const min = Math.min(...points.map((point) => point.total), 0);
				const span = Math.max(max - min, 1);
				const t0 = points[0]?.t ?? now;
				const t1 = points[points.length - 1]?.t ?? now;
				const tSpan = Math.max(t1 - t0, 1);
				const y = (value) => height - 16 - (value - min) / span * (height - 24);
				const x = (t) => (t - t0) / tSpan * width;
				const coords = points.map((point) => [x(point.t), y(point.total)]);
				const line = coords.map(([xValue, yValue], index) => `${index === 0 ? "M" : "L"}${xValue.toFixed(1)},${yValue.toFixed(1)}`).join(" ");
				const area = `${line} L${width},${height - 12} L0,${height - 12} Z`;
				const last = coords[coords.length - 1];
				if (last === void 0) return null;
				return {
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
					})
				};
			}, [
				points,
				width,
				height,
				now
			]);
			if (path === null) return (0, react_jsx_runtime.jsx)("div", {
				className: TokenHud_module_css_default.sparkEmpty,
				style: {
					width,
					height
				},
				children: "等待数据…"
			});
			return (0, react_jsx_runtime.jsxs)("svg", {
				className: TokenHud_module_css_default.spark,
				viewBox: `0 0 ${width} ${height}`,
				width: "100%",
				height,
				preserveAspectRatio: "none",
				role: "img",
				"aria-label": "token 消耗曲线",
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
					(0, react_jsx_runtime.jsx)("path", {
						d: path.area,
						fill: "url(#tokenSparkFill)"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: path.line,
						fill: "none",
						stroke: "var(--dsw-alias-state-business-primary)",
						strokeWidth: "1.6",
						vectorEffect: "non-scaling-stroke",
						strokeLinejoin: "round",
						strokeLinecap: "round"
					}),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: path.last[0],
						cy: path.last[1],
						r: "2.6",
						fill: "var(--dsw-alias-bg-module-platform)",
						stroke: "var(--dsw-alias-state-business-primary)",
						strokeWidth: "1.4"
					}),
					path.ticks.map((tick) => (0, react_jsx_runtime.jsx)("text", {
						x: tick.x,
						y: height - 3,
						textAnchor: tick.x < width * .15 ? "start" : tick.x > width * .85 ? "end" : "middle",
						className: TokenHud_module_css_default.sparkTick,
						children: tickFormat(tick.t)
					}, tick.t))
				]
			});
		}
		/** Collapsed pill shown when the panel is closed. */
		function CollapsedChip({ total, onClick }) {
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: TokenHud_module_css_default.chip,
				onClick,
				"aria-label": "打开 Token 面板",
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
					})
				]
			});
		}
		/** One session row inside the live view. */
		function SessionRow({ row, prices, rangeMs, now }) {
			const [open, setOpen] = (0, react.useState)(false);
			const usage = row.usage;
			const cost = estimateRowCost(row, prices);
			const used = occupancy(row);
			const label = row.label !== "" ? row.label : row.sessionId.slice(-8);
			const history = filterRange(row.history ?? [], now, rangeMs);
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
								title: "当前上下文压力",
								children: formatNumber(row.totalTokens)
							}), cumulative !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
								className: TokenHud_module_css_default.rowCumulative,
								title: "累计消耗",
								children: ["≈", formatNumber(cumulative)]
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
							now
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: TokenHud_module_css_default.detailLine,
							children: [
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: "输入"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: usage === void 0 ? "—" : formatNumber(usage.uncachedInputTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: "输出"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: usage === void 0 ? "—" : formatNumber(usage.outputTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: "缓存读"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: usage === void 0 ? "—" : formatNumber(usage.cacheReadTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: "缓存写"
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
										children: "压力"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: row.pressureTokens === void 0 ? "—" : formatNumber(row.pressureTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: "预计"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: row.projectedTokens === void 0 ? "—" : formatNumber(row.projectedTokens)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: "容量"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: row.contextWindow === void 0 ? "—" : formatNumber(row.contextWindow)
									})]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.detailItem,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.detailLabel,
										children: "成本"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.mono,
										children: formatCost(cost)
									})]
								})
							]
						}),
						used !== void 0 && (0, react_jsx_runtime.jsx)("div", {
							className: TokenHud_module_css_default.barTrack,
							"aria-label": `上下文占用 ${used.toFixed(0)}%`,
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
		function StatsView({ stats }) {
			const [subView, setSubView] = (0, react.useState)("days");
			if (stats === null) return (0, react_jsx_runtime.jsx)("span", {
				className: TokenHud_module_css_default.empty,
				children: "统计数据加载中…"
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
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TokenHud_module_css_default.statsBody,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: TokenHud_module_css_default.statsTotal,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.statsTotalLabel,
								children: "累计消耗"
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.mono,
								children: formatNumber(totalAll)
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TokenHud_module_css_default.statsTotalSub,
								children: ["token · 约 ", formatCost(totalCost)]
							})
						]
					}),
					hasData && (0, react_jsx_runtime.jsxs)("div", {
						className: TokenHud_module_css_default.viewBar,
						role: "group",
						"aria-label": "统计粒度",
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TokenHud_module_css_default.viewButton,
							"data-active": subView === "days",
							onClick: () => {
								setSubView("days");
							},
							children: "按日"
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: TokenHud_module_css_default.viewButton,
							"data-active": subView === "months",
							onClick: () => {
								setSubView("months");
							},
							children: "按月"
						})]
					}),
					subView === "months" ? stats.months.length > 0 ? (0, react_jsx_runtime.jsxs)("section", {
						className: TokenHud_module_css_default.statsSection,
						children: [
							(0, react_jsx_runtime.jsx)("header", {
								className: TokenHud_module_css_default.statsSectionHead,
								children: "按月 · 全部"
							}),
							monthPoints.length >= 2 && (0, react_jsx_runtime.jsx)("div", {
								className: TokenHud_module_css_default.statsSparkWrap,
								children: (0, react_jsx_runtime.jsx)(Sparkline, {
									points: monthPoints,
									now: Date.now(),
									height: 64,
									tickFormat: formatDateTick
								})
							}),
							stats.months.map((month) => (0, react_jsx_runtime.jsx)(StatBar, {
								label: monthLabel(month.month),
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
						children: "暂无按月数据"
					}) : stats.days.length > 0 ? (0, react_jsx_runtime.jsxs)("section", {
						className: TokenHud_module_css_default.statsSection,
						children: [
							(0, react_jsx_runtime.jsx)("header", {
								className: TokenHud_module_css_default.statsSectionHead,
								children: "按日 · 全部"
							}),
							dayPoints.length >= 2 && (0, react_jsx_runtime.jsx)("div", {
								className: TokenHud_module_css_default.statsSparkWrap,
								children: (0, react_jsx_runtime.jsx)(Sparkline, {
									points: dayPoints,
									now: Date.now(),
									height: 64,
									tickFormat: formatDateTick
								})
							}),
							stats.days.map((day) => (0, react_jsx_runtime.jsx)(StatBar, {
								label: dateLabel(day.date),
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
						children: "暂无按日数据"
					}),
					!hasData && (0, react_jsx_runtime.jsx)("span", {
						className: TokenHud_module_css_default.empty,
						children: "暂无统计数据（使用会话后自动记录）"
					})
				]
			});
		}
		/** The top-level HUD: polling, view switching and layout. */
		function TokenHud() {
			const [snapshot, setSnapshot] = (0, react.useState)(null);
			const [stats, setStats] = (0, react.useState)(null);
			const [view, setView] = (0, react.useState)("live");
			const [open, setOpen] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const [rangeMs, setRangeMs] = (0, react.useState)(RANGES[1]?.ms ?? 5 * 6e4);
			const [now, setNow] = (0, react.useState)(Date.now());
			const [showAll, setShowAll] = (0, react.useState)(false);
			const inFlight = (0, react.useRef)(false);
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
			(0, react.useEffect)(() => {
				let cancelled = false;
				const tick = async () => {
					try {
						const response = await fetch(STATS_URL, { cache: "no-store" });
						if (!response.ok) return;
						const body = await response.json();
						if (!cancelled && Array.isArray(body.days)) setStats(body);
					} catch {}
				};
				tick();
				const timer = setInterval(() => {
					tick();
				}, STATS_POLL_MS);
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
				for (const row of snapshot.sessions) {
					total += row.totalTokens;
					output += row.usage?.outputTokens ?? 0;
				}
				return {
					total,
					output
				};
			}, [snapshot]);
			const prices = snapshot?.prices ?? {
				input: 1,
				cacheRead: .02,
				output: 2
			};
			const topHistory = (0, react.useMemo)(() => {
				if (snapshot === null || snapshot.sessions.length === 0) return [];
				return filterRange(snapshot.sessions[0]?.history ?? [], now, rangeMs);
			}, [
				snapshot,
				now,
				rangeMs
			]);
			if (snapshot === null) return (0, react_jsx_runtime.jsx)("div", {
				className: TokenHud_module_css_default.host,
				children: (0, react_jsx_runtime.jsx)(CollapsedChip, {
					total: 0,
					onClick: () => {
						setOpen(true);
					}
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TokenHud_module_css_default.host,
				children: [!open && (0, react_jsx_runtime.jsx)(CollapsedChip, {
					total: totals.total,
					onClick: () => {
						setOpen(true);
					}
				}), open && (0, react_jsx_runtime.jsxs)("aside", {
					className: TokenHud_module_css_default.panel,
					"data-token-panel": true,
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: TokenHud_module_css_default.head,
							children: [
								(0, react_jsx_runtime.jsxs)("span", {
									className: TokenHud_module_css_default.title,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: TokenHud_module_css_default.titleMark,
										"aria-hidden": true
									}), "TOKEN\xA0HUD"]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: TokenHud_module_css_default.viewBar,
									role: "group",
									"aria-label": "视图切换",
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: TokenHud_module_css_default.viewButton,
										"data-active": view === "live",
										onClick: () => {
											setView("live");
										},
										children: "实时"
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: TokenHud_module_css_default.viewButton,
										"data-active": view === "stats",
										onClick: () => {
											setView("stats");
										},
										children: "统计"
									})]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TokenHud_module_css_default.closeButton,
									onClick: () => {
										setOpen(false);
									},
									"aria-label": "收起",
									children: "✕"
								})
							]
						}),
						view === "live" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [topHistory.length >= 2 && (0, react_jsx_runtime.jsxs)("div", {
							className: TokenHud_module_css_default.sparkWrap,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: TokenHud_module_css_default.rangeBar,
								role: "group",
								"aria-label": "时间范围",
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
								now
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: TokenHud_module_css_default.body,
							children: [
								snapshot.sessions.length === 0 && (0, react_jsx_runtime.jsx)("span", {
									className: TokenHud_module_css_default.empty,
									children: "无活动会话"
								}),
								snapshot.sessions.slice(0, showAll ? void 0 : 3).map((row) => (0, react_jsx_runtime.jsx)(SessionRow, {
									row,
									prices,
									rangeMs,
									now
								}, row.sessionId)),
								!showAll && snapshot.sessions.length > 3 && (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: TokenHud_module_css_default.moreButton,
									onClick: () => {
										setShowAll(true);
									},
									children: [
										"展开全部 ",
										snapshot.sessions.length,
										" 个会话"
									]
								}),
								showAll && snapshot.sessions.length > 3 && (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: TokenHud_module_css_default.moreButton,
									onClick: () => {
										setShowAll(false);
									},
									children: "收起，只看前 3 个"
								})
							]
						})] }) : (0, react_jsx_runtime.jsx)("div", {
							className: TokenHud_module_css_default.body,
							children: (0, react_jsx_runtime.jsx)(StatsView, { stats })
						}),
						(0, react_jsx_runtime.jsxs)("footer", {
							className: TokenHud_module_css_default.foot,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.footHint,
								children: error !== null ? `连接中断 · ${error}` : view === "live" ? `实时 TOTAL ${formatNumber(totals.total)} · OUT ${formatNumber(totals.output)}` : "按日按月统计"
							}), (0, react_jsx_runtime.jsx)("span", {
								className: TokenHud_module_css_default.mono,
								children: new Date(snapshot.generatedAt).toLocaleTimeString()
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region lib/client/index.js
		/** Required services: the client runtime only (panel is a body portal). */
		const inject = ["slots"];
		/**
		* Mount the token HUD through a body portal: a fixed glass panel showing
		* live token consumption across sessions, polling the host snapshot route.
		*/
		function apply(ctx) {
			const host = document.createElement("div");
			host.dataset.tokenPanelHost = "";
			document.body.appendChild(host);
			const root = (0, react_dom_client.createRoot)(host);
			root.render((0, react_jsx_runtime.jsx)(TokenHud, {}));
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