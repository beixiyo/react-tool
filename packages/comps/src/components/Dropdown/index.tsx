'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { isValidElement, memo, useEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'

export const Dropdown = memo<DropdownProps>(({
  items,
  selectedId,
  onClick,
  accordion = true,

  className,
  itemClassName,
  sectionHeaderClassName,
  itemTitleClassName,
  itemDescClassName,
  itemActiveClassName,
  itemInactiveClassName,

  defaultExpanded = [],
  renderItem,
}) => {
  // Normalize sections to array format if it's an object
  const normalizedSections: DropdownSection[] = useMemo(() => {
    return Array.isArray(items)
      ? items
      : Object.entries(items).map(([name, items]) => ({ name, items }))
  }, [items])

  /** 跟踪用户是否手动修改过某个 section 的状态 */
  const userModifiedRef = useRef<Set<string>>(new Set())

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    normalizedSections.forEach((section) => {
      initial[section.name] = defaultExpanded.includes(section.name)
    })
    return initial
  })

  /** 同步 defaultExpanded 和 normalizedSections 的变化 */
  useEffect(() => {
    setExpandedSections((prev) => {
      const newState: Record<string, boolean> = {}
      let hasChanges = false

      /** 获取当前所有 section 名称 */
      const currentSectionNames = new Set(normalizedSections.map(s => s.name))

      /** 检查是否有任何 section 被用户修改过 */
      const hasUserModifications = normalizedSections.some(section =>
        userModifiedRef.current.has(section.name),
      )

      /** 在手风琴模式下，如果用户没有修改过任何 section，且 defaultExpanded 有值，只打开第一个匹配的 section */
      let firstMatchingSection: string | null = null
      if (accordion && !hasUserModifications && defaultExpanded.length > 0) {
        firstMatchingSection = normalizedSections.find(section =>
          defaultExpanded.includes(section.name),
        )?.name ?? null
      }

      normalizedSections.forEach((section) => {
        const shouldBeExpanded = accordion && firstMatchingSection
          ? section.name === firstMatchingSection
          : defaultExpanded.includes(section.name)
        const wasInPrev = section.name in prev
        const isCurrentlyExpanded = prev[section.name] ?? false
        const wasUserModified = userModifiedRef.current.has(section.name)

        /** 如果 section 不存在于 prev 中，根据 defaultExpanded 初始化 */
        if (!wasInPrev) {
          newState[section.name] = shouldBeExpanded
          hasChanges = true
        }
        /** 如果 section 已存在，但状态与 defaultExpanded 不一致，且用户未手动修改过，则同步 */
        else if (shouldBeExpanded !== isCurrentlyExpanded && !wasUserModified) {
          newState[section.name] = shouldBeExpanded
          hasChanges = true
        }
        /** 如果用户已修改过，保持当前状态 */
        else {
          newState[section.name] = isCurrentlyExpanded
        }
      })

      /** 清理已经不存在的 section 的 userModified 标记 */
      userModifiedRef.current.forEach((name) => {
        if (!currentSectionNames.has(name)) {
          userModifiedRef.current.delete(name)
        }
      })

      /** 只有在有变化时才返回新状态，避免不必要的重新渲染 */
      if (!hasChanges) {
        /** 检查是否有 section 被删除 */
        const prevKeys = Object.keys(prev)
        const newKeys = Object.keys(newState)
        if (prevKeys.length !== newKeys.length) {
          return newState
        }
        /** 检查所有 key 是否相同 */
        const keysMatch = prevKeys.every(key => newKeys.includes(key))
        if (!keysMatch) {
          return newState
        }
        return prev
      }

      return newState
    })
  }, [normalizedSections, defaultExpanded, accordion])

  const toggleSection = (section: string) => {
    /** 标记用户已手动修改过此 section */
    userModifiedRef.current.add(section)

    setExpandedSections((prev) => {
      /** 如果是手风琴模式，则关闭其他所有部分 */
      if (accordion) {
        /**
         * 在手风琴模式下，标记所有被影响的 section 为用户修改过
         * 这样可以防止 useEffect 重新打开它们
         */
        normalizedSections.forEach((s) => {
          if (s.name !== section) {
            /** 如果这个 section 之前是展开的，现在被关闭了，标记为用户修改过 */
            if (prev[s.name]) {
              userModifiedRef.current.add(s.name)
            }
          }
        })

        const newState: Record<string, boolean> = {}
        normalizedSections.forEach((s) => {
          newState[s.name] = s.name === section
            ? !prev[section]
            : false
        })
        return newState
      }

      /** 非手风琴模式，保持原有行为 */
      return {
        ...prev,
        [section]: !prev[section],
      }
    })
  }

  // Default item renderer
  const defaultRenderItem = useMemo(() => (item: DropdownItem) => (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          { item.label && (
            <h3 className={ cn('truncate text-sm font-medium text-gray-900 dark:text-gray-100', itemTitleClassName) }>
              { item.label }
            </h3>
          ) }
          { item.timestamp && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              { new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }) }
            </span>
          ) }
        </div>

        <div className="mt-1 flex items-center gap-2">
          { item.tag && (
            <span
              className={ cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                item.tagColor || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
              ) }
            >
              { item.tag }
            </span>
          ) }
          { item.desc && (
            <p className={ cn('truncate text-sm text-gray-500 dark:text-gray-400', itemDescClassName) }>
              { item.desc }
            </p>
          ) }
        </div>
      </div>
    </div>
  ), [itemDescClassName, itemTitleClassName])

  return (
    <div className={ cn('overflow-y-auto h-full transition-all duration-300', className) }>
      { normalizedSections.map(item => (
        <div
          key={ item.name }
          className={ itemClassName }
        >
          { item.header
            ? (
                <div onClick={ () => toggleSection(item.name) }>
                  { typeof item.header === 'function'
                    ? item.header(expandedSections[item.name])
                    : item.header }
                </div>
              )
            : (
                <div
                  onClick={ () => toggleSection(item.name) }
                  className={ cn(
                    'w-full flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-gray-600 transition-all duration-300 hover:opacity-50 dark:text-gray-300',
                  ) }
                >
                  <span className={ sectionHeaderClassName }>{ item.name }</span>
                  <motion.div
                    animate={ {
                      rotate: expandedSections[item.name]
                        ? 180
                        : 0,
                    } }
                    transition={ { duration: 0.2 } }
                  >
                    <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                </div>
              ) }

          <AnimateShow
            show={ expandedSections[item.name] }
            className="overflow-hidden"
            visibilityMode
          >
            { isValidElement(item.items)
              ? item.items
              : Array.isArray(item.items) && item.items.length > 0

                ? item.items.map(item => (
                    <motion.div
                      key={ item.id }
                      initial={ { x: -20, opacity: 0 } }
                      animate={ { x: 0, opacity: 1 } }
                      exit={ { x: -20, opacity: 0 } }
                      transition={ { duration: 0.2 } }
                      className={ cn(
                        'px-4 py-3 cursor-pointer border-l-4 transition-all duration-300',
                        selectedId === item.id
                          ? ['bg-blue-50 border-blue-500 dark:bg-blue-500/15 dark:border-blue-500/50', itemActiveClassName]
                          : ['border-transparent hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-700/50 dark:hover:border-slate-600', itemInactiveClassName],
                      ) }
                      onClick={ () => onClick?.(item.id) }
                    >
                      { item.customContent || (renderItem
                        ? renderItem(item)
                        : defaultRenderItem(item)) }
                    </motion.div>
                  ))
                : null }
          </AnimateShow>
        </div>
      )) }
    </div>
  )
})

export interface DropdownItem {
  /** 唯一标识符 */
  id: string
  /** 标题/标签 */
  label?: string
  /** 描述文本 */
  desc?: string
  /** 时间戳 */
  timestamp?: Date | string | number
  /** 标签文本 */
  tag?: string
  /** 标签颜色 (Tailwind CSS 类名) */
  tagColor?: string
  /** 自定义渲染内容，如果提供，将覆盖默认渲染 */
  customContent?: React.ReactNode
}

export interface DropdownSection {
  /** 分区名称，将作为可折叠的标题显示 */
  name: string
  /** 分区下的项目，可以是项目数组或自定义的React节点 */
  items: DropdownItem[] | React.ReactNode
  /** 自定义分区头部，如果提供，将覆盖默认渲染 */
  header?: React.ReactNode | ((isExpanded: boolean) => React.ReactNode)
}

export interface DropdownProps {
  /**
   * 下拉菜单的数据源。
   * 可以是 `Record<string, DropdownItem[] | React.ReactNode>` 形式的对象，
   * 也可以是 `DropdownSection[]` 形式的数组。
   */
  items:
    | Record<string, DropdownItem[] | React.ReactNode>
    | DropdownSection[]

  /** 应用于根容器的自定义CSS类 */
  className?: string
  /** 应用于每个可折叠分区容器的自定义CSS类 */
  itemClassName?: string
  /** 应用于分区标题的自定义CSS类 */
  sectionHeaderClassName?: string
  /** 应用于项目标题的自定义CSS类 */
  itemTitleClassName?: string
  /** 应用于项目描述的自定义CSS类 */
  itemDescClassName?: string
  /** 应用于选中项目的自定义CSS类 */
  itemActiveClassName?: string
  /** 应用于未选中项目的自定义CSS类 */
  itemInactiveClassName?: string

  /** 当前选中的项目ID */
  selectedId?: string | null
  /** 项目点击事件的回调函数 */
  onClick?: (id: string) => void
  /**
   * 是否启用手风琴模式，一次只能展开一个部分。
   * @default true
   */
  accordion?: boolean

  /** 默认展开的分区名称数组 */
  defaultExpanded?: string[]
  /** 自定义项目渲染函数 */
  renderItem?: (item: DropdownItem) => React.ReactNode
}
