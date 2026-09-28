/**
 * VirtualScroll 类型声明
 */

import type { CSSProperties, ReactNode } from 'react'

export interface VirtualScrollProps<T> {
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties

  data: T[]
  /**
   * 每一项的高度（像素）
   * @default 40
   */
  itemHeight?: number
  /**
   * 作为 key 的字段名，取自数据项；不传则使用索引
   */
  keyField?: keyof T
  /**
   * 前面多加载的数量
   * @default 6
   */
  prev?: number
  /**
   * 后面多加载的数量
   * @default 6
   */
  next?: number

  loadMore: () => Promise<any>
  /**
   * 是否还有更多数据可加载
   */
  hasMore?: boolean
  /**
   * 数据为空且非加载中时展示的占位内容
   */
  empty?: ReactNode
  /**
   * 自定义加载中渲染，不传则使用内置 LoadingIcon
   */
  renderLoading?: () => ReactNode
  children: (item: T, index: number) => ReactNode
}
