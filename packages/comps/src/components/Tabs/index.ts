import { Tabs as InnerTabs } from './Tabs'
import { TabsContent } from './TabsContent'

export const Tabs = Object.assign(
  InnerTabs,
  { TabsContent },
)
export type { TabItemType, TabsContentItem, TabsContentProps, TabsProps } from './types'
