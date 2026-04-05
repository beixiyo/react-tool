'use client'

import type { LegendValueProps } from './types'
import { useMemo } from 'react'
import { cn } from 'utils'
import { useLegend, useLegendItem } from './legend-context'

export function LegendValue({
  className = 'text-sm tabular-nums',
  showPercentage = false,
  percentageClassName = 'text-xs tabular-nums',
  formatValue = v => v.toLocaleString(),
  formatPercentage = p => `${p.toFixed(0)}%`,
}: LegendValueProps) {
  const { items } = useLegend()
  const { item, percentage } = useLegendItem()

  const totalSum = useMemo(
    () => items.reduce((s, i) => s + i.value, 0),
    [items],
  )

  const sharePercent = item.maxValue
    ? percentage
    : totalSum > 0
      ? (item.value / totalSum) * 100
      : 0

  const showPct = showPercentage && (item.maxValue
    ? true
    : totalSum > 0)

  return (
    <span
      className={ cn(
        'flex items-center gap-2 text-text2',
        className,
      ) }
    >
      <span>{ formatValue(item.value) }</span>
      { showPct && (
        <span className={ percentageClassName }>
          { formatPercentage(sharePercent) }
        </span>
      ) }
    </span>
  )
}

LegendValue.displayName = 'LegendValue'
