'use client'

import type React from 'react'
import { Plus } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'

export const SidebarHeader = memo((
  {
    className,
    isExpanded,
    title = 'New Chat',
    onClick,
    disabled,
  }: SidebarHeaderProps,
) => {
  const onAddClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled)
        return
      onClick?.(e)
    },
    [onClick, disabled],
  )

  return (
    <div className={ cn(
      'flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 py-3 justify-center',
      'hover:opacity-50 transition-all duration-300 cursor-pointer',
      { 'cursor-not-allowed': disabled },
      className,
    ) }
    >
      <div
        onClick={ onAddClick }
        className={ cn(
          'flex shrink-0 h-8 w-8 items-center justify-center rounded-full transition-colors bg-primary',
          'text-white hover:opacity-50 transition-all duration-300',
        ) }
      >
        <Plus className="size-5" />
      </div>

      { isExpanded && <div
        className="overflow-hidden"
      >
        <h2 className="whitespace-nowrap text-base text-gray-900 font-medium dark:text-gray-100">{ title }</h2>
      </div> }
    </div>
  )
})

SidebarHeader.displayName = 'SidebarHeader'

export interface SidebarHeaderProps {
  className?: string
  disabled?: boolean
  /**
   * Whether the sidebar is expanded
   */
  isExpanded: boolean
  /**
   * Header title
   */
  title?: string
  /**
   * Callback when add button is clicked
   */
  onClick?: (e: React.MouseEvent) => void
}
