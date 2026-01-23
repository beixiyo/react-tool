import type { CSSProperties, ReactNode } from 'react'

export interface InfiniteScrollProps {
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties

  /** 模式：scroll (触底检测，默认), intersection (可视区域检测) */
  mode?: 'scroll' | 'intersection'
  /** 触底阈值 (仅在 scroll 模式生效) */
  threshold?: number
  /** 是否显示加载中 */
  showLoading?: boolean
  /** 自定义加载中内容 */
  loadingContent?: ReactNode

  /** 加载更多回调 */
  loadMore: () => Promise<void>
  /** 是否立即触发检查 */
  immediate?: boolean
  /** 是否还有更多数据 */
  hasMore?: boolean
  /** 内容 */
  children: ReactNode
}
