import { Button, CollapsibleSidebar, Dropdown, ThemeToggle } from 'comps'

import { Plus } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { cn } from 'utils'
import { changeLanguage, getCurrentLanguage } from '@/locales'
import { mockSideBarHistory } from '../mockData'
import { resetChat } from '../store'
import { groupChatsByDate } from '../tool'

export const SideBar = memo<SideBarProps>((
  {
    style,
    className,
    expandedWidth = 250,
    collapsedWidth = 70,
  },
) => {
  const [collapsed, setCollapsed] = useState(false)
  const [isGlobalLang, setIsGlobalLang] = useState(getCurrentLanguage() === 'en-US')
  const groupNameMap: Record<string, string> = {
    today: '今天',
    yesterday: '昨天',
    last7Days: '最近7天',
    last30Days: '最近30天',
    older: '更早',
  }

  const groupedHistories = groupChatsByDate(mockSideBarHistory)
  const dropdownItems = Object.entries(groupedHistories)
    .reduce((acc, [groupKey, histories]) => {
      acc[groupNameMap[groupKey] || groupKey] = histories
      return acc
    }, {} as Record<string, any>)

  /** 处理语言切换 */
  const handleLanguageChange = (checked: boolean) => {
    setIsGlobalLang(checked)
    const newLang = checked
      ? 'en-US'
      : 'zh-CN'
    changeLanguage(newLang)
  }

  /** 初始化时根据当前语言设置状态 */
  useEffect(() => {
    const currentLang = getCurrentLanguage()
    setIsGlobalLang(currentLang === 'en-US')
  }, [])

  return (
    <CollapsibleSidebar
      isCollapsed={ collapsed }
      onToggle={ () => setCollapsed(!collapsed) }
      expandedWidth={ +expandedWidth }
      collapsedWidth={ +collapsedWidth }
      position="left"
      showToggleButton
      animationType="spring"
      className={ className }
      style={ style }
      contentClassName="overflow-x-hidden overflow-y-auto"
    >
      {/* 顶部工具栏 - 增加留白 */ }
      <div className={ cn('flex flex-col items-center px-4', collapsed
        ? 'space-y-3 py-6'
        : 'space-y-6 py-8') }>
        <ThemeToggle size={ 60 } />
      </div>

      <div className="flex items-center px-4 pb-6">
        <Button
          variant="primary"
          onClick={ () => resetChat() }
          className={ cn(
            collapsed
              ? 'w-full p-2'
              : 'flex-1',
          ) }
          iconOnly={ collapsed }
          leftIcon={ <Plus strokeWidth={ 1.5 } /> }
        >
          { !collapsed && <span className="ml-2">New Chat</span> }
        </Button>
      </div>

      {/* 历史记录列表 */ }
      { !collapsed && (
        <Dropdown
          className="flex-1 px-2"
          items={ dropdownItems }
        />
      ) }
    </CollapsibleSidebar>
  )
})

SideBar.displayName = 'SideBar'

export interface SideBarProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  expandedWidth?: number | string
  collapsedWidth?: number | string
}
