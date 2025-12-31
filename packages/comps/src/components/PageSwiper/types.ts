import type { RefObject } from 'react'

export type PageSwiperProps = {
  /**
   * 是否显示预览模式，左右两侧留白能看到预览内容
   * @default false
   */
  showPreview?: boolean
  /**
   * 预览宽度
   * @default 100
   */
  previewWidth?: number

  /**
   * 当前页面索引
   * 传入时为受控模式，不传入时为非受控模式（默认从 0 开始）
   */
  index?: number
  /**
   * 当页面切换时触发的回调
   */
  onIndexChange?: (index: number) => void
  /**
   * 滑动切换的阈值，相对于容器宽度的比例
   * @default 0.05
   */
  threshold?: number
  /**
   * 是否显示两侧切换按钮
   * @default false
   */
  showButtons?: boolean
  /**
   * 是否显示底部指示器
   * @default true
   */
  showIndicator?: boolean
  /**
   * 每个页面之间的间隔（像素）
   * @default 0
   */
  gap?: number
  /**
   * 组件引用对象
   */
  ref?: RefObject<PageSwiperRef | null>
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export type PageSwiperRef = {
  next: () => void
  prev: () => void
  goToIndex: (index: number) => void
  getCurrentIndex: () => number
  getChildrenLength: () => number
}
