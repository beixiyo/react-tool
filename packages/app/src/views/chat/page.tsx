/**
 * Chat 页面
 *
 * 消息列表虚拟化方案（实现见 components/ChatHistory.tsx）：
 *
 * ✅ 当前采用：react-virtuoso
 *    - 顶部加载更多 prepend 不跳（firstItemIndex）、流式钉底（followOutput）、动态高度自动测量，
 *      开箱即用、对现有包装层改造量最小
 *    - 智能跟随由 hooks 的 useAutoScrollBottom 控制（基于滚轮意图，不与用户向上滚动对抗）
 *    - 踩坑备忘：虚拟条目间距必须用 padding 不能用 margin —— offsetHeight 不含 margin，
 *      会导致总高被低估、scrollToIndex 永远差一个 margin 到不了底
 *
 * 🔁 可选方案：TanStack Virtual（@tanstack/react-virtual ≥ 3.14.2 + @tanstack/virtual-core ≥ 3.17.0）
 *    - 2026-05 起 `anchorTo: 'end'` 一等公民支持聊天反向滚动（prepend 稳定 + 流式钉底）
 *    - headless、核心更小（~5KB）、契合 TanStack 生态；代价：自己写渲染层 + 给条目 memo 防卡顿、
 *      顶部加载没有专用回调需手写 onScroll 阈值
 *    - 启用前需在 app 装回 @tanstack/react-virtual；注意本仓 comps 的虚拟表格已依赖 react-virtual，
 *      务必让 virtual-core 解析到单一 3.17.0，避免重复版本被 Vite 去重串包（anchorTo/scrollToEnd 会丢失）
 *
 * ❌ 已评估淘汰：react-window（reverse infinite scroll 不开箱）、自研 react-anchorlist 移植（滚动漂移/维护成本高）
 */
import { ChatPage } from './components/ChatPage'
import { SideBar } from './components/SideBar'

function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-background2 dark:bg-background">
      <SideBar className="shrink-0 bg-background dark:bg-background" />
      <ChatPage className="flex-1" />
    </div>
  )
}

export default App
