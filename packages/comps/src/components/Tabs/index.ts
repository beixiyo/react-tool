import { Tabs as InnerTabs } from './Tabs.tsx'
import { TabsContent } from './TabsContent.tsx'

export const Tabs = Object.assign(
  InnerTabs,
  { TabsContent },
)
export type { TabItemType, TabsContentItem, TabsContentProps, TabsProps } from './types'
