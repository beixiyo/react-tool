export interface TabItem {
  id: string
  title: string
  content: React.ReactNode
}

export interface PaperStackTabsProps {
  items: TabItem[]
  activeIndex: number
  /** 卡片的基础样式类 */
  cardClassName?: string
  /** 活跃卡片的样式类 */
  activeCardClassName?: string
  /** 堆叠卡片的样式类 */
  stackedCardClassName?: string
  /**
   * 外层容器类名。默认 `w-full max-w-4xl mx-auto p-8`，
   * 可通过 tailwind-merge 覆盖宽度上限 / 内边距等
   */
  className?: string
  /** 外层容器内联样式 */
  style?: React.CSSProperties
}
