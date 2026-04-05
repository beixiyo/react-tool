'use client'

import type { LegendItemProps } from './types'
import { cn } from 'utils'
import { useLegend, useLegendItem } from './legend-context'

export function LegendItem({ className = '', children }: LegendItemProps) {
  const { setHoveredIndex } = useLegend()
  const { index, isHovered, isFaded } = useLegendItem()

  return (
    <div
      className={ cn(
        'cursor-pointer rounded-lg px-2 py-1.5 transition-all duration-150 ease-out',
        isHovered && 'bg-background2',
        isFaded && 'opacity-45',
        className,
      ) }
      onMouseEnter={ () => setHoveredIndex(index) }
      onMouseLeave={ () => setHoveredIndex(null) }
      role="listitem"
    >
      { children }
    </div>
  )
}

LegendItem.displayName = 'LegendItem'
