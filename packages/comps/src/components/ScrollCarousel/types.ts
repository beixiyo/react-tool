import type { RefObject } from 'react'

export type ScrollCarouselProps = {
  /**
   * 卡片之间的间距（px）
   * @default 16
   */
  gap?: number
  /**
   * 拖拽切换的阈值，相对于单张卡片宽度的比例
   * @default 0.15
   */
  threshold?: number
  /**
   * 滚动进度变化回调（0 ~ 1）
   */
  onProgressChange?: (progress: number) => void
  /**
   * 当前活动索引变化回调
   */
  onIndexChange?: (index: number) => void
  /**
   * 是否禁用拖拽手势
   * @default false
   */
  disableDrag?: boolean
  /**
   * 是否在可滚动方向显示导航箭头
   * @default false
   */
  showNavigation?: boolean
  /**
   * 点击导航箭头时移动的卡片数量
   * @default 1
   */
  navigationStep?: number
  /**
   * 是否在仍有隐藏内容的边缘显示渐变遮罩
   * @default false
   */
  showGradientBoundary?: boolean
  /**
   * 切换动画的 CSS transition 值（应用于轨道的 transform）
   * @default 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
   */
  transition?: string
  /**
   * 组件引用
   */
  ref?: RefObject<ScrollCarouselRef | null>
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export type ScrollCarouselRef = {
  /** 下一张 */
  next: () => void
  /** 上一张 */
  prev: () => void
  /** 跳转到指定索引 */
  goToIndex: (index: number) => void
  /** 获取当前滚动进度（0 ~ 1） */
  getProgress: () => number
  /** 获取子元素数量 */
  getChildrenLength: () => number
  /** 获取是否溢出（是否需要轮播） */
  getIsOverflow: () => boolean
}
