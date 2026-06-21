'use client'

import type React from 'react'
import type { InfiniteScrollProps } from '../InfiniteScroll'
import { useLatestCallback } from 'hooks'
import { motion } from 'motion/react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { InfiniteScroll } from '../InfiniteScroll'
import { SidebarHeader } from './SidebarHeader'
import { SidebarItem } from './SidebarItem'

export const Sidebar = memo((
  {
    expandedWidth = 320,
    collapsedWidth = 68,
    disableHeader,
    disableItem,

    className,
    itemClassName,
    headerClassName,
    style,
    data = [],

    onItemClick,
    onAddClick,
    loadMore,
    hasMore,

    activeId,
    emptyContent,

    headerTitle = 'New Chat',
    hoverDelay = 0,
    leaveDelay = 300,

    expanded,
    defaultExpanded = false,
    onExpandedChange,
  }: SidebarProps,
) => {
  const isControlled = expanded !== undefined
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const isExpanded = isControlled
    ? expanded
    : internalExpanded
  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  /** 统一更新展开状态：非受控时改内部 state，始终通知外部 */
  const updateExpanded = useLatestCallback((next: boolean) => {
    if (!isControlled) {
      setInternalExpanded(next)
    }
    onExpandedChange?.(next)
  })

  const handleMouseEnter = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }

    if (hoverDelay <= 0) {
      updateExpanded(true)
    }
    else {
      expandTimeoutRef.current = setTimeout(() => {
        updateExpanded(true)
      }, hoverDelay)
    }
  }, [hoverDelay])

  const handleMouseLeave = useCallback(() => {
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current)
      expandTimeoutRef.current = null
    }

    collapseTimeoutRef.current = setTimeout(() => {
      updateExpanded(false)
    }, leaveDelay)
  }, [leaveDelay])

  const handleItemClick = useLatestCallback((id: string) => {
    onItemClick?.(id)
  })

  const handleAddClick = useLatestCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering sidebar expansion/collapse
    onAddClick?.()
  })

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (expandTimeoutRef.current)
        clearTimeout(expandTimeoutRef.current)
      if (collapseTimeoutRef.current)
        clearTimeout(collapseTimeoutRef.current)
    }
  }, [])

  return (
    <motion.div
      ref={ sidebarRef }
      className={ cn(
        'flex flex-col bg-background overflow-hidden rounded-lg border border-border shadow-lg',
        className,
      ) }
      style={ style }
      animate={ {
        width: isExpanded
          ? expandedWidth
          : collapsedWidth,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 30,
          mass: 0.8, // Lower mass for faster response
        },
      } }
      initial={ false }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
    >
      <SidebarHeader
        isExpanded={ isExpanded }
        title={ headerTitle }
        onClick={ handleAddClick }
        disabled={ disableHeader }
        className={ headerClassName }
      />

      <InfiniteScroll
        className={ cn(
          { 'overflow-hidden': !isExpanded },
        ) }
        contentClassName="flex flex-col gap-1 p-2"
        loadMore={ loadMore }
        hasMore={ hasMore }
      >
        { data.length === 0 && emptyContent }

        { data.map(item => (
          <SidebarItem
            disabled={ disableItem }
            className={ itemClassName }
            key={ item.id }
            id={ item.id }
            img={ item.img }
            title={ item.title }
            subtitle={ item.subtitle }
            timestamp={ item.timestamp }
            isExpanded={ isExpanded }
            active={ activeId !== undefined && item.id === activeId }
            onClick={ handleItemClick }
          />
        )) }
      </InfiniteScroll>
    </motion.div>
  )
})

Sidebar.displayName = 'Sidebar'

export type SidebarProps = Pick<InfiniteScrollProps, 'loadMore' | 'hasMore'> & {
  /**
   * Custom width when expanded
   */
  expandedWidth?: number
  /**
   * Custom width when collapsed
   */
  collapsedWidth?: number

  disableHeader?: boolean
  disableItem?: boolean

  className?: string
  itemClassName?: string
  headerClassName?: string
  style?: React.CSSProperties

  /**
   * Items to display in the sidebar
   */
  data: Array<{
    id: string
    img: string
    title: string
    subtitle?: string
    timestamp: string
  }>
  /**
   * Callback when an item is clicked
   */
  onItemClick?: (id: string) => void
  /**
   * Callback when add button is clicked
   */
  onAddClick?: () => void
  /**
   * Custom header title
   */
  headerTitle?: string
  /**
   * Hover delay in milliseconds before expanding
   */
  hoverDelay?: number
  /**
   * Hover delay in milliseconds before collapsing
   */
  leaveDelay?: number

  /**
   * 受控展开状态。传入后由外部完全控制展开 / 收起，内部 hover 仅触发 `onExpandedChange`
   */
  expanded?: boolean
  /**
   * 非受控模式下的初始展开状态
   * @default false
   */
  defaultExpanded?: boolean
  /**
   * 展开状态变化回调（hover 触发或外部需要切换时）
   */
  onExpandedChange?: (expanded: boolean) => void

  /**
   * 当前选中项的 id，匹配的 `SidebarItem` 会显示选中高亮
   */
  activeId?: string
  /**
   * 列表为空（`data.length === 0`）时渲染的占位内容
   */
  emptyContent?: React.ReactNode
}
