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
}
