'use client'

import type { LegendProgressProps } from './types'
import { cn } from 'utils'
import { useLegendItem } from './legend-context'

export function LegendProgress({
  trackClassName = '',
  indicatorClassName = '',
  height = 'h-1.5',
}: LegendProgressProps) {
  const { item } = useLegendItem()

  if (!item.maxValue)
    return null

  const pct = Math.min(100, Math.max(0, (item.value / item.maxValue) * 100))

  return (
    <div
      className={ cn(
        'w-full overflow-hidden rounded-full bg-border2',
        height,
        trackClassName,
      ) }
    >
      <div
        className={ cn('h-full rounded-full transition-all duration-500', indicatorClassName) }
        style={ {
          width: `${pct}%`,
          backgroundColor: item.color,
        } }
      />
    </div>
  )
}

LegendProgress.displayName = 'LegendProgress'
