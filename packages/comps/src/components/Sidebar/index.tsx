'use client'

import type React from 'react'
import type { InfiniteScrollProps } from '../InfiniteScroll'
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

    headerTitle = 'New Chat',
    hoverDelay = 0,
    leaveDelay = 300,
  }: SidebarProps,
) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }

    if (hoverDelay <= 0) {
      setIsExpanded(true)
    }
    else {
      expandTimeoutRef.current = setTimeout(() => {
        setIsExpanded(true)
      }, hoverDelay)
    }
  }, [hoverDelay])

  const handleMouseLeave = useCallback(() => {
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current)
      expandTimeoutRef.current = null
    }

    collapseTimeoutRef.current = setTimeout(() => {
      setIsExpanded(false)
    }, leaveDelay)
  }, [leaveDelay])

  const handleItemClick = useCallback(
    (id: string) => {
      onItemClick?.(id)
    },
    [onItemClick],
  )

  const handleAddClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation() // Prevent triggering sidebar expansion/collapse
      onAddClick?.()
    },
    [onAddClick],
  )

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
}
