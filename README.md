# dsh-token-panel

DeepSeek Harness 的实时 Token 消耗 HUD：右下角常驻迷你胶囊，展开后提供
**实时视图**（会话级上下文压力与累计消耗、可切换时间范围的消耗曲线）与
**统计视图**（按日 / 按月的持久化用量统计与趋势曲线），配色跟随 DSH 主题。

## 功能

- 右下角常驻胶囊显示总压力；点击展开面板；
- **实时**：每个会话一行（标题 + 压力 + 累计 ≈ 总量），点击展开查看
  输入 / 输出 / 缓存读 / 缓存写、上下文压力 / 预计 / 容量 / 估算成本、
  占用进度条与实时曲线；曲线支持 2m / 5m / 15m 时间范围；
- **统计**：按日 / 按月分开的用量柱状列表与曲线；累计消耗与估算成本；
  数据按天写入 `~/.dsh/cache/dsh-token-panel/usage-YYYY-MM-DD.jsonl`，
  重启不丢；
- 成本估算按 DeepSeek 官方价（CNY / 百万 token），仅展示，以官网账单为准。

## 安装

```sh
dsh plugin --profile web add <本包路径或 GitHub 仓库>
```

例如从 GitHub 安装：

```sh
dsh plugin --profile web add github:<owner>/<repo>
```

重启 profile 生效。面板默认出现在浏览器右下角。

> pnpm ≥ 10 默认拦截 Git 依赖的构建脚本（`prepare`）。若安装时提示
> build scripts 被忽略，在 profile 目录的 `pnpm-workspace.yaml` 中加入
> `allowBuilds` 后重跑 `dsh plugin --profile web add`（详见
> [dsh-plugin-development §7.1](../../.dsh/skills/vision-tools/SKILL.md)）。

## 数据来源

- `ctx.tokenMeter.measure(session)` —— 请求与响应压力、启发式表面积；
- `ctx.sessionProjections.snapshot(session)` —— provider 实测用量
  （tokenUsage）、上下文压力与容量（contextPressure）、上下文构成
  （contextBreakdown）；
- `ctx.sessionTitle.get(session)` —— 会话标题（实时视图的会话名）。

## 配置

| 键 | 默认 | 说明 |
|---|---|---|
| `pollInterval` | 1500 | 浏览器轮询间隔（ms） |
| `pricePerMInput` | 1 | 每百万未命中输入 token 的估算价格（CNY，仅展示） |
| `pricePerMCacheRead` | 0.02 | 每百万缓存命中 token 的估算价格（CNY，仅展示） |
| `pricePerMOutput` | 2 | 每百万输出 token 的估算价格（CNY，仅展示） |
| `dataDir` | `~/.dsh/cache/dsh-token-panel` | 持久化用量日志目录 |

DeepSeek 官方价（deepseek-v4-flash，2026-08 生效）：缓存命中 ¥0.02/M、
未命中 ¥1/M、输出 ¥2/M。8 月 17 日起改为峰谷定价，价格调整时同步更新
上述三项即可。

## 开发

```sh
pnpm install
pnpm build            # tsc host + tsc client + tsdown
pnpm verify           # 产物一致性检查
```

## 许可

MIT
