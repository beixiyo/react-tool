'use client'

import type { PieCenterNumberFormat, PieCenterProps } from './types'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { usePie } from './pie-context'

const defaultFormatOptions: PieCenterNumberFormat = {
  notation: 'standard',
  maximumFractionDigits: 0,
}

function toIntlOptions(
  f: PieCenterNumberFormat,
): Intl.NumberFormatOptions {
  return {
    notation: f.notation === 'compact'
      ? 'compact'
      : 'standard',
    compactDisplay: f.compactDisplay,
    minimumFractionDigits: f.minimumFractionDigits,
    maximumFractionDigits: f.maximumFractionDigits,
    minimumIntegerDigits: f.minimumIntegerDigits,
    minimumSignificantDigits: f.minimumSignificantDigits,
    maximumSignificantDigits: f.maximumSignificantDigits,
    style: f.style,
    currency: f.currency,
    currencyDisplay: f.currencyDisplay,
    unit: f.unit,
    unitDisplay: f.unitDisplay,
  }
}

function PieCenterInner({
  defaultLabel = '合计',
  formatOptions = defaultFormatOptions,
  children,
  className = '',
  valueClassName = 'text-2xl font-bold',
  labelClassName = 'text-xs',
  prefix,
  suffix,
}: PieCenterProps) {
  const { data, hoveredIndex, totalValue, innerRadius } = usePie()

  const hoveredData = hoveredIndex === null
    ? null
    : data[hoveredIndex]
  const displayValue = hoveredData
    ? hoveredData.value
    : totalValue
  const displayLabel = hoveredData
    ? hoveredData.label
    : defaultLabel
  const isHovered = hoveredIndex !== null

  const centerSize = innerRadius * 2 - 16

  const formatted = useMemo(() => {
    const fmt = new Intl.NumberFormat(undefined, toIntlOptions(formatOptions))
    const core = fmt.format(displayValue)
    return `${prefix ?? ''}${core}${suffix ?? ''}`
  }, [displayValue, formatOptions, prefix, suffix])

  if (innerRadius <= 0)
    return null

  if (children && hoveredData) {
    return (
      <div
        className={ cn('flex items-center justify-center', className) }
        style={ { width: centerSize, height: centerSize } }
      >
        { children({
          value: displayValue,
          label: displayLabel,
          isHovered,
          data: hoveredData,
        }) }
      </div>
    )
  }

  return (
    <div
      className={ cn(
        'flex flex-col items-center justify-center text-center',
        className,
      ) }
      style={ { width: centerSize, height: centerSize } }
    >
      <span className={ cn('tabular-nums text-text', valueClassName) }>
        { formatted }
      </span>
      <span className={ cn('mt-0.5 text-text2', labelClassName) }>
        { displayLabel }
      </span>
    </div>
  )
}

export const PieCenter = memo(PieCenterInner)

PieCenter.displayName = 'PieCenter'
