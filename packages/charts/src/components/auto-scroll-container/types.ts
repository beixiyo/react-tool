/** 自动滚动容器的状态信息 */
export interface AutoScrollState {
  /** 当前滚动条左侧偏移距离（像素） */
  scrollLeft: number
  /** 容器的可视区域宽度（像素） */
  containerWidth: number
  /** 内容的总物理宽度（像素） */
  contentWidth: number
  /** 是否处于溢出滚动状态（contentWidth > containerWidth） */
  isScrolling: boolean
}

export interface AutoScrollContainerProps {
  /**
   * 最小内容宽度（像素）。
   * 传入此值可确保容器内容至少占据该宽度，从而触发溢出滚动。
   */
  minContentWidth?: number
  /** 自动滚动的触发阈值（距离边缘的像素） */
  scrollThreshold?: number
  /** 最大滚动速度（像素/帧） */
  maxScrollSpeed?: number
  /** 容器高度 */
  height?: number | string
  /** 样式类名 */
  className?: string
  /** 滚动时的状态回调 */
  onScroll?: (state: AutoScrollState) => void
  children: React.ReactNode
}
