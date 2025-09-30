import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Globe, MessageCircle, Plus } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { cn } from 'utils'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { Switch } from '@/components/Switch'
import { ThemeToggle } from '@/components/ThemeToggle'
import { changeLanguage, getCurrentLanguage } from '@/locales'
import { mockSideBarHistory } from '../mockData'
import { groupChatsByDate } from '../tool'

export const SideBar = memo<SideBarProps>((
  {
    style,
    className,
    expandedWidth = 250,
    collapsedWidth = 70,
  },
) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [isGlobalLang, setIsGlobalLang] = useState(getCurrentLanguage() === 'en-US')
  const groupedHistories = groupChatsByDate(mockSideBarHistory)

  const dropdownItems = Object.entries(groupedHistories).reduce((acc, [groupName, histories]) => {
    if (histories.length > 0) {
      acc[groupName] = histories
    }
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
    <motion.div
      initial={ { x: -300, opacity: 0 } }
      animate={ {
        x: 0,
        opacity: 1,
        width: collapsed
          ? collapsedWidth
          : expandedWidth,
      } }
      className={ cn(
        'SideBarContainer flex flex-col overflow-x-hidden overflow-y-auto h-full',
        className,
      ) }
      style={ style }
    >
      <div className={ cn('flex flex-col items-center mt-4', collapsed
        ? 'space-y-2'
        : 'space-y-4') }>
        <ThemeToggle size={ 60 } />

        <div className={ cn('flex items-center justify-center', collapsed
          ? 'w-full'
          : 'w-auto') }>
          <Switch
            checked={ isGlobalLang }
            onChange={ handleLanguageChange }
            checkedIcon={ <Globe /> }
            uncheckedIcon={ <MessageCircle /> }
            size={ collapsed
              ? 'sm'
              : 'md' }
          />
          { !collapsed && (
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              { isGlobalLang
                ? 'English'
                : '中文' }
            </span>
          ) }
        </div>
      </div>

      <div className="flex items-center border-b border-slate-200 p-4 dark:border-slate-800">
        <Button
          variant="primary"
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
        { !collapsed && (
          <Button
            className="ml-2 px-2"
            onClick={ () => setCollapsed(!collapsed) }
            leftIcon={ <ChevronLeft strokeWidth={ 1.5 } /> }
            iconOnly
          />
        ) }
      </div>

      { collapsed && (
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <Button
            className="w-full"
            onClick={ () => setCollapsed(!collapsed) }
            leftIcon={ <ChevronRight strokeWidth={ 1.5 } /> }
          />
        </div>
      ) }

      { !collapsed && (
        <Dropdown
          className="flex-1"
          items={ dropdownItems }
          onClick={ setSelectedChat }
          selectedId={ selectedChat }
        />
      ) }
    </motion.div>
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
