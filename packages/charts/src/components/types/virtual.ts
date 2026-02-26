/** 虚拟滚动配置 */
export interface ChartVirtualConfig {
  /** 当前容器的滚动位置（像素） */
  scrollLeft: number
  /** 容器的可视区域宽度（像素） */
  containerWidth: number
  /** 内容的总物理宽度（像素） */
  contentWidth?: number
  /**
   * 每个数据点在 X 轴上占据的物理宽度（像素）。
   * 如果未指定，将根据 contentWidth 和数据量自动计算。
   */
  minPointWidth?: number
  /** 是否开启虚拟化切片渲染。建议在内容宽度超过容器宽度时开启。 */
  enabled?: boolean
}

/** 虚拟滚动内部计算状态 */
export interface ChartVirtualState {
  /** 当前切片在原始数据中的起始索引 */
  startIndex: number
  /** 当前切片在原始数据中的结束索引 */
  endIndex: number
  /** 是否处于虚拟渲染模式 */
  isVirtual: boolean
  /** 原始配置快照 */
  config?: ChartVirtualConfig
}
