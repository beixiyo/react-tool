# Context Handoff Summary

## 1. 背景与目标 (Background & Goals)

**背景**：为项目新增 `@preact/signals-react` 功能演示页，参考 [npm](https://www.npmjs.com/package/@preact/signals-react) 和 [GitHub](https://github.com/preactjs/signals)，系统演示 Signals 的核心能力。

**目标**：
- 在 `packages/app/src/views/signals` 下搭建模块化演示页面
- 每个功能一个组件，最后汇总到 `page.tsx`
- 使用 Babel transform 自动订阅，而不是手动 `useSignals()`
- 参照 `jotaiTest`，用颜色变化和渲染计数展示组件是否重新渲染

---

## 2. 当前进度与现状 (Current Progress)

### 已完成

| 任务 | 状态 |
|------|------|
| 安装 `@preact/signals-react` | ✅ |
| 安装并配置 `@preact/signals-react-transform` | ✅ |
| 移除所有手动 `useSignals()` 调用 | ✅ |
| 创建 12 个模块化演示组件 | ✅ |
| 使用 `getColor()` 展示重渲染（背景色变化 + 渲染次数） | ✅ |

### 演示组件列表

| 组件 | 功能 |
|------|------|
| `SignalBasic` | signal + Babel transform 基础用法 |
| `SignalHooks` | useSignal / useComputed / useSignalEffect |
| `SignalComputed` | computed 派生状态 |
| `SignalEffect` | effect 副作用 |
| `SignalBatch` | batch 批量更新 |
| `SignalPeek` | signal.peek() |
| `SignalUntracked` | untracked(fn) |
| `RenderingOptimization` | 直接传 signal 的渲染优化（对比未优化 vs 优化） |
| `ShowComponent` | Show 条件渲染 |
| `ForComponent` | For 列表渲染 |
| `UseLiveSignal` | useLiveSignal |
| `UseSignalRef` | useSignalRef |

### 技术实现

- **Vite 配置**：`signals-react-transform` 与 `babel-plugin-react-compiler` 不能在同一文件上同时使用（会破坏响应式，见 [preactjs/signals#652](https://github.com/preactjs/signals/issues/652)）。在 `vite.config.ts` 中通过 `babel(id)` 按路径分流：`views/signals` 下仅用 `@preact/signals-react-transform`，其余文件仅用 `babel-plugin-react-compiler`。
- **重渲染可视化**：使用 `getColor()` 和 `renderCountRef`，展示背景色与“渲染 N 次 · 最后渲染时间”
- **路由**：`/signals` 对应 `packages/app/src/views/signals/page.tsx`

---

## 3. 重要文件引用 (Key File References)

| 文件路径 | 作用 |
|----------|------|
| `packages/app/src/views/signals/page.tsx` | 演示页主入口，汇总所有组件 |
| `packages/app/src/views/signals/components/index.ts` | 组件统一导出 |
| `packages/app/src/views/signals/components/*.tsx` | 各 Signal 功能演示组件 |
| `packages/app/vite.config.ts` | Babel 插件配置（约第 34–41 行） |
| `packages/app/package.json` | `@preact/signals-react`、`@preact/signals-react-transform` 依赖 |
| `packages/app/src/views/jotaiTest/components/RenderOptimizationDemo.tsx` | `getColor()` 使用参考 |
