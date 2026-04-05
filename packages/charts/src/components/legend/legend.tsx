'use client'

import type { ReactElement } from 'react'
import type { LegendProps } from './types'
import {
  cloneElement,
  isValidElement,

  useState,
} from 'react'
import { cn } from 'utils'
import { LegendItemProvider, LegendProvider } from './legend-context'

export function Legend({
  items,
  hoveredIndex: controlledHoveredIndex,
  onHoverChange,
  title,
  titleClassName = 'text-sm font-semibold',
  className = '',
  children,
}: LegendProps) {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null)

  const isControlled = controlledHoveredIndex !== undefined
  const hoveredIndex = isControlled
    ? controlledHoveredIndex
    : internalHoveredIndex
  const setHoveredIndex = (index: number | null) => {
    if (isControlled)
      onHoverChange?.(index)
    else
      setInternalHoveredIndex(index)
  }

  const contextValue = {
    items,
    hoveredIndex,
    setHoveredIndex,
  }

  return (
    <LegendProvider value={ contextValue }>
      <div className={ cn('flex flex-col gap-2', className) } role="list">
        { title && (
          <h3 className={ cn('mb-1 text-text', titleClassName) }>
            { title }
          </h3>
        ) }
        { items.map((item, index) => {
          const isHovered = hoveredIndex === index
          const isFaded = hoveredIndex !== null && hoveredIndex !== index
          const percentage = item.maxValue
            ? (item.value / item.maxValue) * 100
            : 0

          const itemContext = {
            item,
            index,
            isHovered,
            isFaded,
            percentage,
          }

          if (isValidElement(children)) {
            return (
              <LegendItemProvider key={ `${item.label}-${index}` } value={ itemContext }>
                { cloneElement(children as ReactElement) }
              </LegendItemProvider>
            )
          }

          return null
        }) }
      </div>
    </LegendProvider>
  )
}

Legend.displayName = 'Legend'
