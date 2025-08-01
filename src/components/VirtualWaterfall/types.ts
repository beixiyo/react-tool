import type { CSSProperties } from 'react'

export interface VirtualWaterFallProps<T extends WaterfallItem> {
  data: T[]
  /**
   * 卡片之间的间距
   * @default 10
   */
  gap?: number
  /**
   * 瀑布流列数
   * @default 5
   */
  col?: number
  /**
   * 一次请求的数据量
   */
  pageSize: number
  hasMore: boolean

  /**
   * 上面额外加载的缓冲距离
   * @default 400
   */
  prevBuffer?: number
  /**
   * 下面额外加载的缓冲距离
   * @default 400
   */
  nextBuffer?: number

  loadMore: () => Promise<any>

  children: (detail: WaterfallItem & T, index: number) => React.ReactElement
  className?: string
  style?: CSSProperties
}

export interface WaterfallItem {
  id: number | string
  width: number
  height: number
  [key: string]: any
}

export interface ColumnQueue {
  list: RenderItem[]
  height: number
}

/** 渲染视图项 */
export interface RenderItem<T = any> {
  /** 数据源 */
  item: WaterfallItem & T
  /** 卡片距离列表顶部的距离 */
  y: number
  /** 卡片自身高度 */
  h: number
  /** 用于渲染视图上的样式（宽、高、偏移量） */
  style: CSSProperties
}

export interface ItemRect {
  width: number
  height: number
}
