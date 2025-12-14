
export interface TabItem {
  id: string
  title: string
  content: React.ReactNode
}

export interface PaperStackTabsProps {
  items: TabItem[]
}