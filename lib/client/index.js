import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import { TokenHud } from "./TokenHud.js";
/** Locale namespace for the HUD copy. */
const NS = 'token-panel';
/** Required client services. */
export const inject = ['slots', 'locale', 'sessions'];
/**
 * Mount the token HUD through a body portal: a fixed glass panel showing
 * live token consumption across sessions, polling the host snapshot route.
 * Copy follows the DSH locale (en/zh) via `ctx.locale`.
 */
export function apply(ctx) {
    const en = {
        token: 'TOKEN HUD',
        live: 'Live',
        stats: 'Stats',
        close: 'Close',
        byDay: 'Daily',
        byMonth: 'Monthly',
        all: 'All',
        totalLabel: 'Cumulative',
        totalSub: 'token',
        approx: '≈',
        currentPressure: 'Current context pressure',
        cumulativeUsage: 'Cumulative usage',
        expandAll: 'Show all {count} sessions',
        collapseAll: 'Collapse to top 3',
        noSessions: 'No active sessions',
        waiting: 'Waiting for data…',
        noStats: 'No stats yet (recorded automatically once sessions run)',
        noDaily: 'No daily data',
        noMonthly: 'No monthly data',
        loading: 'Loading stats…',
        input: 'Input',
        output: 'Output',
        cacheRead: 'Cache read',
        cacheWrite: 'Cache write',
        pressure: 'Pressure',
        projected: 'Projected',
        capacity: 'Capacity',
        cost: 'Cost',
        today: 'Today',
        yesterday: 'Yesterday',
        thisMonth: 'This month',
        monthFmt: '{m}/{y}',
        pollLive: 'Live · TOTAL {total} · OUT {out}',
        pollStats: 'Daily & monthly stats',
        pricePeak: 'peak rate',
        priceOffpeak: 'off-peak rate',
        balanceTitle: 'DeepSeek account balance',
        balanceLabel: 'Balance',
        budgetLabel: 'Monthly budget',
        budgetOver: 'over budget',
        disconnected: 'Disconnected · {error}',
        timeRange: 'Time range',
        viewSwitch: 'View switch',
        granularity: 'Granularity',
        openPanel: 'Open Token panel',
        dragHint: 'Drag to move the panel',
        backToCorner: 'Back to corner',
        cancelMenu: 'Cancel',
        contextBar: 'Context usage {pct}%',
    };
    const zh = {
        token: 'TOKEN HUD',
        live: '实时',
        stats: '统计',
        close: '收起',
        byDay: '按日',
        byMonth: '按月',
        all: '全部',
        totalLabel: '累计消耗',
        totalSub: 'token',
        approx: '≈',
        currentPressure: '当前上下文压力',
        cumulativeUsage: '累计消耗',
        expandAll: '展开全部 {count} 个会话',
        collapseAll: '收起，只看前 3 个',
        noSessions: '无活动会话',
        waiting: '等待数据…',
        noStats: '暂无统计数据（使用会话后自动记录）',
        noDaily: '暂无按日数据',
        noMonthly: '暂无按月数据',
        loading: '统计数据加载中…',
        input: '输入',
        output: '输出',
        cacheRead: '缓存读',
        cacheWrite: '缓存写',
        pressure: '压力',
        projected: '预计',
        capacity: '容量',
        cost: '成本',
        today: '今天',
        yesterday: '昨天',
        thisMonth: '本月',
        monthFmt: '{y}年{m}月',
        pollLive: '实时 TOTAL {total} · OUT {out}',
        pollStats: '按日按月统计',
        pricePeak: '高峰价',
        priceOffpeak: '空闲价',
        balanceTitle: 'DeepSeek 账户余额',
        balanceLabel: '余额',
        budgetLabel: '本月预算',
        budgetOver: '超支',
        disconnected: '连接中断 · {error}',
        timeRange: '时间范围',
        viewSwitch: '视图切换',
        granularity: '统计粒度',
        openPanel: '打开 Token 面板',
        dragHint: '拖拽标题可移动面板',
        backToCorner: '回到右下角',
        cancelMenu: '取消',
        contextBar: '上下文占用 {pct}%',
    };
    ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'token-panel: locale');
    const t = ctx.locale.bind(NS);
    const host = document.createElement('div');
    host.dataset.tokenPanelHost = '';
    document.body.appendChild(host);
    const root = createRoot(host);
    root.render(_jsx(TokenHud, { t: t, sessionsList: ctx.sessions.list }));
    ctx.effect(() => () => {
        root.unmount();
        host.remove();
    }, 'token-panel: hud');
}
