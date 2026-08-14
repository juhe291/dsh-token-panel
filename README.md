<div align="center">

# dsh-token-panel

[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.3.0-blue?style=flat-square)](https://github.com/juhe291/dsh-token-panel/releases)
[![Platform](https://img.shields.io/badge/platform-web-cyan?style=flat-square)](https://github.com/juhe291/dsh-token-panel)
[![Topic: dsh-plugin](https://img.shields.io/badge/topic-dsh--plugin-8A2BE2?style=flat-square)](https://github.com/topics/dsh-plugin)

**实时 Token 消耗 HUD 插件 —— 为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 提供右下角常驻的 Token 仪表盘：实时会话压力、会话花费、历史曲线、按日/按月统计，面板跟随当前对话，可拖拽、可设默认位置。**

🌐 **中文** ｜ [**English**](README.en.md)

</div>

<p align="center">
  <img src="assets/hero.png" alt="dsh-token-panel 封面" width="100%">
</p>

> 📷 封面中的两张面板均为**真实界面截图**（左：实时视图；右：统计视图）。

---

## 安装

### 从 GitHub 安装（推荐）

```sh
dsh plugin --profile web add github:juhe291/dsh-token-panel
```

### 从本地路径安装

```sh
dsh plugin --profile web add C:\path\to\dsh-token-panel
```

安装完成后 **重启 profile**，刷新浏览器，右下角出现 TOKEN 胶囊。

> ⚠️ **pnpm ≥ 10 拦截 Git 构建脚本**：首次安装若提示 `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`，按提示把报错中的 `allowBuilds` 条目加入 profile 目录下的 `pnpm-workspace.yaml`，然后重跑安装命令。这是 pnpm 的安全机制（Git 依赖需要显式允许执行构建脚本），本包已自带 `prepare` 构建脚本与提交好的 `lib/` 产物，允许后即可正常安装。

---

## 使用说明

### 面板交互（三种手势互不干扰）

1. **单击胶囊**：打开面板（胶囊显示 压力 + ≈累计 + TPS）
2. **拖动**：按住胶囊或面板头部栏拖动——可以把面板**拖出屏幕边缘**（上下左右都能覆盖出去），但**始终留一条头部栏可见**，随时能抓回来；位置自动记忆，刷新不丢
3. **长按 0.6 秒**（胶囊或面板头部）：弹出位置菜单：

```
┌──────────────────────┐
│ ⌟ 右下角             │ ← 第一项图标/文字随默认位置自动更新
│ ✛ 位置 ▸            │
│ 取消                 │
└──────────────────────┘
   位置二级菜单：
   ├ ⌜ 左上角 / ⌝ 右上角 / ⌞ 左下角 / ⌟ 右下角   ← 预设角落，点即设默认并跳转
   └ ✛ 自定义位置…                               ← 之后拖动面板到任意处松手即保存
```

- **回到默认位置**：第一项文字随已设默认动态变化（如「回到默认位置 · 右上角」「回到自定义位置」），点击跳回
- **预设角落**：点即把面板移到该角并设为默认（用面板实际尺寸，精确贴边）
- **自定义位置**：选择后拖动面板，松手保存为新默认，之后每次刷新都从那里出现
- 点「✕」收起面板时**位置保持不变**（要回默认用长按菜单）

### 实时视图

- 会话行：**主数字 = 当前上下文压力**（k 单位）；灰色 `≈` 小字 = 累计消耗（M 单位，含缓存读）；**绿色 `¥` 数字 = 该会话估算花费**（按会话实际使用的模型计价）
- 点会话行展开详情（输入/输出/缓存读/缓存写、压力/预计/容量、成本、占用进度条）与消耗曲线
- 曲线：**Y 轴自动刻度**（1/2/2.5/5×10ⁿ 取整 + 滞回，空闲时归零，单位标签常驻）+ 网格线 + 最新点虚线引导线与浮动数值标签 + X 轴时间刻度
- 顶部显示窗口内**峰值消耗速率**（t/s）；2m / 5m / 15m 切换曲线时间窗口
- 面板跟随当前对话；「展开全部」显示历史会话（重启后仍保留）

### 统计视图

- 顶部**累计消耗**大字单行显示（token 总数 + ≈¥ 成本）
- **本月预算 / 账户余额可编辑**：点击数值行内编辑（回车保存 / Esc 取消）；余额随 token 消耗**本地估算递减**（刷新后保持），未设置时回退 API 拉取的官网余额
- 「按日 / 按月」切换粒度：趋势曲线 + 明细列表（默认收起，点「展开全部」查看）
- 数据按天持久化（JSONL），重启不丢

---

## 功能总览

右下角一枚迷你胶囊实时显示总 Token 压力，点击展开为可切换的 **实时** / **统计** 双视图仪表盘，配色跟随 DSH 主题（浅色 / 深色自动适配）。面板**跟随当前对话**：切换会话时只显示当前会话；空会话与历史会话默认隐藏，点「展开全部」才显示。

### 🟢 实时视图

| 能力 | 说明 |
|---|---|
| 会话列表 | 每个会话一行：**标题 + 当前上下文压力 + 累计消耗 + 会话花费**，标题来自 DSH 会话标题服务 |
| 会话详情 | 点击展开：输入 / 输出 / 缓存读 / 缓存写、压力 / 预计 / 容量、估算成本、上下文占用进度条（>85% 变红） |
| 实时曲线 | 每会话独立 SVG 面积曲线，带 Y 轴自动刻度（1/2/2.5/5×10ⁿ 取整 + 滞回，空闲归零，单位标签常驻）、X 轴时间刻度、最新点虚线引导线和浮动数值标签，支持 **2m / 5m / 15m** 范围切换 |
| 峰值速率 | 曲线区顶部显示窗口内峰值消耗速率（t/s） |
| 跟随当前会话 | 默认只显示当前打开的对话；历史会话折叠在「展开全部」后面（重启后仍保留） |
| 空会话过滤 | 新开但 0 token 的对话完全不显示 |
| TPS | 底部栏实时显示生成速度（t/s） |

### 📊 统计视图

| 能力 | 说明 |
|---|---|
| 按日 / 按月 | 独立切换，趋势曲线 + 明细列表（默认收起，点「展开全部」查看全部日期 / 月份） |
| 趋势曲线 | 每日 / 每月消耗的 SVG 曲线，刻度显示日期（M/D），含 Y 轴刻度 |
| 累计消耗 | 顶部大字单行汇总：累计 token 总数 + ≈¥ 估算成本 |
| 预算与余额 | **点击数值行内编辑**（回车保存 / Esc 取消）；预算显示本月已用 / 总额进度条（超支变红）；余额随 token 消耗本地估算递减，未设置时回退 API 拉取的官网余额 |
| 持久化 | 数据按天写入磁盘（JSONL），**重启不丢**，越用越完整 |

> ⚠️ **数字口径提示**：统计视图的「按日 / 按月」是**历史累计消耗**（输入 + 输出 + **缓存读**全部累加），缓存读通常是最大头，所以单日就可能上亿 token（显示 M 单位）；而实时视图的数字是**当前上下文压力**（此刻占用的 token，几十万级，显示 k 单位）。**两个数字不是同一个量**，看到「实时 400k / 统计 100M」的差异是正常的，不要担心。
> 会话行上的 `≈` 小字就是该会话的累计消耗，`¥` 数字是该会话的估算花费，和统计视图口径一致。

### 💰 成本估算

- **按模型分别计价**：内置 `deepseek-v4-flash` 与 `deepseek-v4-pro` 两套官方价表（缓存命中 / 未命中输入 / 输出分别计费），会话和统计都按实际使用的模型套价，切换过模型的会话不会整段按单一模型计价
- **auto 价格模式**（默认）：2026-08-17 零时（北京时间）前自动使用 flat 旧价，之后自动切换 DeepSeek 官方峰谷价（高峰 9-12、14-18），底部徽章同步显示「标准价 / 高峰价 / 空闲价」，无需手动改配置
- 估算仅作展示参考，实际以官网账单为准

---

## 配置

配置位于 profile 的 `cordis.patch.yml`（或 `settings.yaml` 的插件分节）：

```yaml
- id: token-panel
  name: dsh-token-panel
  config:
    pollInterval: 1500          # 实时轮询间隔 (ms)
    priceMode: auto             # auto = 8/17 前 flat 旧价、之后自动切峰谷；flat / peak-offpeak 固定模式
    # 全局兜底价格（模型未在 modelPrices 中列出时使用；默认 = flash 价）
    pricePerMInput: 1           # 未命中输入价格 (CNY / 百万 token)
    pricePerMCacheRead: 0.02    # 缓存命中价格 (CNY / 百万 token)
    pricePerMOutput: 2          # 输出价格 (CNY / 百万 token)
    # 峰谷价（priceMode 切到 peak-offpeak 或 8/17 后 auto 生效）
    pricePeakInput: 3           # 高峰未命中输入价
    pricePeakCacheRead: 0.1     # 高峰缓存命中价
    pricePeakOutput: 9          # 高峰输出价
    priceOffpeakInput: 1.5      # 空闲未命中输入价
    priceOffpeakCacheRead: 0.05 # 空闲缓存命中价
    priceOffpeakOutput: 4.5     # 空闲输出价
    # 按模型价表（CNY / 百万 token）：会话和统计按实际使用模型套价
    modelPrices:
      deepseek-v4-flash:
        flat:    { hit: 0.02,  miss: 1,   output: 2 }
        peak:    { hit: 0.10,  miss: 3,   output: 9 }
        offpeak: { hit: 0.05,  miss: 1.5, output: 4.5 }
      deepseek-v4-pro:
        flat:    { hit: 0.025, miss: 3,   output: 6 }
        peak:    { hit: 0.30,  miss: 9,   output: 27 }
        offpeak: { hit: 0.15,  miss: 4.5, output: 13.5 }
    budgetMonthly: 0            # 月预算 (CNY)；0 = 关闭（也可在统计视图点击数值直接设置）
    # dataDir: ~/.dsh/cache/dsh-token-panel   # 持久化目录（可选）
```

| 键 | 默认 | 说明 |
|---|---|---|
| `pollInterval` | `1500` | 浏览器实时轮询间隔（毫秒） |
| `priceMode` | `auto` | 计价模式：`auto` 在 2026-08-17 零时自动从 flat 切到峰谷价；`flat` / `peak-offpeak` 固定 |
| `pricePerM*` | `1 / 0.02 / 2` | 全局兜底价格（每百万 token，CNY，仅展示） |
| `pricePeak*` | `3 / 0.1 / 9` | 高峰时段兜底价格（北京时间 9-12、14-18） |
| `priceOffpeak*` | `1.5 / 0.05 / 4.5` | 空闲时段兜底价格 |
| `modelPrices` | 内置 flash + pro | 按模型价表（flat / peak / offpeak 三档），覆盖或新增模型 |
| `budgetMonthly` | `0` | 月预算（CNY），>0 显示预算进度条；也可在统计视图点击数值直接设置 |
| `dataDir` | `~/.dsh/cache/dsh-token-panel` | 持久化用量日志目录 |

> 默认内置 DeepSeek 官方价表（2026-08-17 前 flat 旧价 + 之后峰谷新价），其他模型 / 供应商请按自己的计价调整 `modelPrices`。

---

## 数据存储

统计日志按天追加写入（每行一条用量增量，JSON）：

```
~/.dsh/cache/dsh-token-panel/
├── usage-2026-08-14.jsonl   # 每日用量日志
└── state.json               # 上次用量基线（重启续接，防重复/防丢失）
```

记录维度：未命中输入、输出、缓存读、缓存写、**模型**（增量）。首次观察到会话时写入完整基线，之后记录增量——**累计从真实起点算起，重启不丢不重**。

---

## 工作原理

- **Host 面**（`src/index.ts`）：
  - 聚合 `ctx.tokenMeter.measure()`（压力/表面积）+ `ctx.sessionProjections.snapshot()`（provider 实测用量/容量/构成）+ `ctx.sessionTitle.get()`（会话标题）
  - 注册两条 HTTP 路由：`/plugins/dsh-token-panel/snapshot`（实时）、`/plugins/dsh-token-panel/stats`（持久化统计）
  - 用量增量按天持久化（崩溃安全：tmp + rename 原子写）
  - 过滤 0 token 的空会话
- **Client 面**（`src/client/`）：body portal 右下角面板，1.5s 轮询实时数据、10s 轮询统计，SVG 曲线 + 设计令牌配色，**中英文 locale** 跟随 DSH 语言设置，通过 `ctx.sessions.list` 跟踪当前会话

---

## 开发

```sh
pnpm install
pnpm build            # tsc host + tsc client + tsdown
pnpm verify           # 产物一致性检查（exports/patch/client bundle）
```

### 发布新版本

```sh
pnpm build && pnpm verify
git add -A
git commit -m "feat: ..."
git push
```

---

## 常见问题

**Q: 实时数字和统计数字怎么不一样？**
A: 实时显示的是**当前上下文压力**（几十万级，k 单位）；统计显示的是**历史累计消耗**（含缓存读，上亿级，M 单位）。两个指标口径不同，面板已同时展示（压力 + ≈累计）。

**Q: 成本估算准吗？**
A: 按 DeepSeek 官方价分级估算（缓存命中按 ¥0.02/M），仅作参考。权威账单请以 [DeepSeek 官网](https://platform.deepseek.com) 为准。

**Q: 曲线怎么只有最近几分钟？**
A: 实时曲线是滚动内存窗口（600 点 ≈ 15 分钟），重启清零；统计视图的日/月曲线基于磁盘日志，长期保留。

**Q: 面板里有些会话不见了？**
A: 面板跟随当前对话，且隐藏 0 token 的空会话；历史会话点「展开全部」即可看到。

---

## 许可

[MIT](LICENSE) ｜ 更新记录见 [CHANGELOG.md](CHANGELOG.md)

---

*Made with 🐋 for the DeepSeek Harness plugin ecosystem.*
