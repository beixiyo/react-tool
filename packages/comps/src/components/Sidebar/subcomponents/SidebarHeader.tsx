'use client'

import { Plus } from 'lucide-react'
import type React from 'react'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
import type { SidebarHeaderProps } from '../types'

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
      if (disabled) return
      onClick?.(e)
    },
    [onClick, disabled],
  )

  return (
    <div
      className={ cn(
        'flex items-center gap-4 border-b border-border py-3 justify-center',
        'hover:opacity-50 transition-all duration-300 cursor-pointer',
        { 'cursor-not-allowed': disabled },
        className,
      ) }
    >
      <div
        onClick={ onAddClick }
        className={ cn(
          'flex shrink-0 h-8 w-8 items-center justify-center rounded-full transition-colors bg-brand',
          'text-background hover:opacity-50 transition-all duration-300',
        ) }
      >
        <Plus className="size-5" />
      </div>

      { isExpanded && (
        <div className="overflow-hidden">
          <h2 className="whitespace-nowrap text-base text-text font-medium">{ title }</h2>
        </div>
      ) }
    </div>
  )
})

SidebarHeader.displayName = 'SidebarHeader'
