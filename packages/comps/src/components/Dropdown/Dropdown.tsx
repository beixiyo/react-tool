'use client'

import type { DropdownItem, DropdownProps, DropdownSection } from './types'
import { ChevronDown } from 'lucide-react'
import { LayoutGroup, motion } from 'motion/react'
import { isValidElement, memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { StackedCards } from '../Card'

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
  onExpandedChange,
  renderItem,
  sectionMaxHeight,
  collapsedPreview = false,
  collapsedMaxLayers = 3,
  collapsedOffsetX = 0,
  collapsedOffsetY = 10,
  collapsedScaleStep = 0.02,
  collapsedOpacityStep = 0.06,
  collapsedPreviewClickable = true,
  collapsedPreviewClassName,
  collapsedCardClassName = 'bg-backgroundSecondary/60 border-border/60',
  collapsedTopCardClassName = 'bg-background border-border/80 shadow-card',
  collapsedContentClassName,
  renderCollapsedItem,
  renderCollapsedContent,
}) => {
  const layoutBaseId = useId()
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
      let newState: Record<string, boolean> = {}
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

        normalizedSections.forEach((s) => {
          newState[s.name] = s.name === section
            ? !prev[section]
            : false
        })
      }
      else {
        /** 非手风琴模式，保持原有行为 */
        newState = {
          ...prev,
          [section]: !prev[section],
        }
      }

      /** 通知外部状态变化 */
      if (onExpandedChange) {
        const expandedNames = Object.entries(newState)
          .filter(([_, expanded]) => expanded)
          .map(([name]) => name)
        onExpandedChange(expandedNames)
      }

      return newState
    })
  }

  /** 获取指定 section 的最大高度 */
  const getSectionMaxHeight = (sectionName: string): string | undefined => {
    /** 优先使用 section 自身的 maxHeight */
    const section = normalizedSections.find(s => s.name === sectionName)
    if (section?.maxHeight !== undefined) {
      return typeof section.maxHeight === 'number'
        ? `${section.maxHeight}px`
        : section.maxHeight
    }

    /** 如果没有设置 sectionMaxHeight，返回 undefined */
    if (!sectionMaxHeight) {
      return undefined
    }

    /** 如果是字符串或数字，所有 section 使用统一高度 */
    if (typeof sectionMaxHeight === 'string' || typeof sectionMaxHeight === 'number') {
      return typeof sectionMaxHeight === 'number'
        ? `${sectionMaxHeight}px`
        : sectionMaxHeight
    }

    /** 如果是对象，根据 section name 获取对应高度 */
    const height = sectionMaxHeight[sectionName]
    if (height !== undefined) {
      return typeof height === 'number'
        ? `${height}px`
        : height
    }

    return undefined
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

  const normalizedCollapsedLayers = Math.min(Math.max(collapsedMaxLayers, 1), 3) as 1 | 2 | 3

  const renderDropdownItem = (item: DropdownItem) => {
    if (item.customContent)
      return item.customContent
    if (renderItem)
      return renderItem(item)
    return defaultRenderItem(item)
  }

  const getItemClassName = (item: DropdownItem) => cn(
    'px-4 py-3 cursor-pointer border-l-4 transition-all duration-300',
    selectedId === item.id
      ? ['bg-blue-50 border-blue-500 dark:bg-blue-500/15 dark:border-blue-500/50', itemActiveClassName]
      : ['border-transparent hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-700/50 dark:hover:border-slate-600', itemInactiveClassName],
  )

  const getPreviewItem = (items: DropdownItem[]) => {
    if (items.length === 0)
      return null
    if (!selectedId)
      return items[0]
    return items.find(item => item.id === selectedId) ?? items[0]
  }

  const getOrderedItems = (items: DropdownItem[], previewItem: DropdownItem | null) => {
    if (!collapsedPreview || !previewItem)
      return items
    if (items[0]?.id === previewItem.id)
      return items
    return [previewItem, ...items.filter(item => item.id !== previewItem.id)]
  }

  return (
    <div className={ cn('overflow-y-auto h-full transition-all duration-300', className) }>
      { normalizedSections.map((item) => {
        const sectionLayoutId = `${layoutBaseId}-${item.name}`

        return (
          <LayoutGroup key={ item.name } id={ sectionLayoutId }>
            <div
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

              { collapsedPreview && (
                <AnimateShow
                  show={ !expandedSections[item.name] }
                  className={ cn('px-4 pb-4 pt-1', collapsedPreviewClassName) }
                  visibilityMode
                >
                  { (() => {
                    const isExpanded = expandedSections[item.name]
                    if (isExpanded)
                      return null

                    const items = Array.isArray(item.items)
                      ? item.items
                      : []
                    const previewItem = getPreviewItem(items)
                    const orderedItems = getOrderedItems(items, previewItem)
                    const previewItems = orderedItems.slice(0, Math.min(normalizedCollapsedLayers, orderedItems.length))
                    const fallbackContent = renderCollapsedContent
                      ? renderCollapsedContent(item)
                      : null
                    const previewLayers = previewItems.length > 0
                      ? previewItems.length
                      : (fallbackContent
                          ? 1
                          : 0)
                    const previewLayersContent = previewItems.length > 0
                      ? previewItems.map((previewRow, index) => {
                          const isTopLayer = index === 0

                          return (
                            <motion.div
                              key={ previewRow.id }
                              layout
                              layoutId={ `${sectionLayoutId}-${previewRow.id}` }
                              className={ cn(
                                getItemClassName(previewRow),
                                !isTopLayer && 'opacity-0',
                              ) }
                            >
                              { renderCollapsedItem
                                ? renderCollapsedItem(previewRow)
                                : renderDropdownItem(previewRow) }
                            </motion.div>
                          )
                        })
                      : (fallbackContent
                          ? [fallbackContent]
                          : [])

                    if (previewLayers === 0 || previewLayersContent.length === 0)
                      return null

                    return (
                      <div
                        onClick={ () => {
                          if (collapsedPreviewClickable)
                            toggleSection(item.name)
                        } }
                        className={ cn(
                          collapsedPreviewClickable && 'cursor-pointer',
                        ) }
                      >
                        <StackedCards
                          autoHeight
                          layers={ previewLayers as 1 | 2 | 3 }
                          layersContent={ previewLayersContent }
                          offsetX={ collapsedOffsetX }
                          offsetY={ collapsedOffsetY }
                          scaleStep={ collapsedScaleStep }
                          opacityStep={ collapsedOpacityStep }
                          className="w-full"
                          layerClassName={ collapsedCardClassName }
                          topLayerClassName={ cn('shadow-sm', collapsedTopCardClassName) }
                          contentClassName={ cn('p-0', collapsedContentClassName) }
                        />
                      </div>
                    )
                  })() }
                </AnimateShow>
              ) }

              <AnimateShow
                show={ expandedSections[item.name] }
                className="overflow-hidden"
                visibilityMode
              >
                { (() => {
                  const maxHeight = getSectionMaxHeight(item.name)
                  const rawItems = Array.isArray(item.items)
                    ? item.items
                    : []
                  const previewItem = getPreviewItem(rawItems)
                  const orderedItems = getOrderedItems(rawItems, previewItem)
                  const previewItems = orderedItems.slice(0, Math.min(normalizedCollapsedLayers, orderedItems.length))
                  const previewItemIds = new Set(previewItems.map(previewItem => previewItem.id))
                  const content = isValidElement(item.items)
                    ? item.items
                    : orderedItems.length > 0

                      ? orderedItems.map((rowItem) => {
                          const isBoundLayer = collapsedPreview
                            && expandedSections[item.name]
                            && previewItemIds.has(rowItem.id)
                          const layoutId = isBoundLayer
                            ? `${sectionLayoutId}-${rowItem.id}`
                            : undefined
                          const initial = isBoundLayer
                            ? false
                            : (collapsedPreview
                                ? { y: 12, opacity: 0 }
                                : { x: -20, opacity: 0 })
                          const animate = isBoundLayer
                            ? { opacity: 1 }
                            : (collapsedPreview
                                ? { y: 0, opacity: 1 }
                                : { x: 0, opacity: 1 })
                          const exit = collapsedPreview
                            ? { y: 12, opacity: 0 }
                            : { x: -20, opacity: 0 }

                          return (
                            <motion.div
                              key={ rowItem.id }
                              layout={ collapsedPreview }
                              layoutId={ layoutId }
                              initial={ initial }
                              animate={ animate }
                              exit={ exit }
                              transition={ { duration: 0.2 } }
                              className={ getItemClassName(rowItem) }
                              onClick={ () => onClick?.(rowItem.id) }
                            >
                              { renderDropdownItem(rowItem) }
                            </motion.div>
                          )
                        })
                      : null

                  /** 如果没有设置高度，直接返回内容，不需要额外容器 */
                  if (!maxHeight) {
                    return content
                  }

                  /** 如果内容是 ReactNode（自定义组件），直接应用高度样式，让子组件自己处理滚动 */
                  if (isValidElement(item.items)) {
                    return (
                      <div
                        style={ {
                          height: maxHeight,
                        } }
                      >
                        { content }
                      </div>
                    )
                  }

                  /** 如果是数组类型的 items，添加滚动容器 */
                  return (
                    <div
                      className="overflow-y-auto"
                      style={ {
                        maxHeight,
                      } }
                    >
                      { content }
                    </div>
                  )
                })() }
              </AnimateShow>
            </div>
          </LayoutGroup>
        )
      }) }
    </div>
  )
})
