export type VirtualItem = {
  index: number
  key: string | number
  start: number
  size: number
}

export type AnchorSnapshot = {
  key: string | number | null
  offsetWithinItem: number
  candidates: Array<{
    key: string | number
    offsetWithinItem: number
  }>
  scrollTop: number
  scrollHeight: number
}

export type ListMutation
  = | { type: 'prepend', count: number }
    | { type: 'append', count: number }
    | { type: 'mixed' }

export type ScrollState = 'idle' | 'scrolling' | 'restoring' | 'animating'

export type AtBottomHysteresis = {
  enter: number
  leave: number
}

export type ChatScrollModifier = {
  id: string
  type: 'prepend'
}

export type ChatVirtualListHandle = {
  scrollToBottom: (behavior?: ScrollBehavior) => void
  setAutoScroll: (enabled: boolean) => void
  isAutoScrolling: () => boolean
}

export type ChatVirtualListProps<T> = {
  /** 数据数组 */
  data: T[]
  /** 从 item 提取唯一 key */
  computeItemKey: (index: number, item: T) => string | number
  /** 渲染 item 内容 */
  itemContent: (index: number, item: T) => React.ReactNode
  /**
   * 默认估算高度
   * @default 100
   */
  estimatedItemSize?: number
  /** 按 item 动态估算高度，优先级高于 estimatedItemSize */
  getItemEstimate?: (item: T, index: number) => number
  /**
   * 可视区域外额外渲染的 item 数量
   * @default 8
   */
  overscan?: number
  /**
   * 自动追底模式
   * - `'auto'`：append 时若在底部则自动追底
   * - `'smooth'`：同 auto 但平滑滚动
   * - `false`：禁用
   * @default 'auto'
   */
  followOutput?: 'auto' | 'smooth' | false
  /** prepend 操作修饰符，变更 id 触发锚定快照 */
  scrollModifier?: ChatScrollModifier | null
  /**
   * 显示顶部加载指示器
   * @default false
   */
  showLoading?: boolean
  /** 滚动到顶部附近时触发（加载更多历史） */
  onStartReached?: () => void
  /**
   * 触发 onStartReached 的阈值（px）
   * @default 100
   */
  startReachedThreshold?: number
  /**
   * 初始对齐方式
   * @default 'top'
   */
  initialAlignment?: 'top' | 'bottom'
  className?: string
  style?: React.CSSProperties
}
