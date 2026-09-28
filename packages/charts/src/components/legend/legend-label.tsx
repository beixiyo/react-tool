'use client'

import { cn } from 'utils'
import { useLegendItem } from './legend-context'
import type { LegendLabelProps } from './types'

export function LegendLabel({
  className = 'text-sm font-medium',
}: LegendLabelProps) {
  const { item } = useLegendItem()

  return (
    <span className={ cn('text-text', className) }>
      { item.label }
    </span>
  )
}

LegendLabel.displayName = 'LegendLabel'
