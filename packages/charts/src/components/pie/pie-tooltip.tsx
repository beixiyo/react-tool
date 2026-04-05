'use client'

import type { PieTooltipProps } from './types'
import { memo, useEffect, useMemo, useState } from 'react'
import { chartCssVars } from '../chart-context'
import { TooltipBox } from '../tooltip/tooltip-box'
import { TooltipContent } from '../tooltip/tooltip-content'
import { usePie } from './pie-context'

function PieTooltipInner({ content, className }: PieTooltipProps) {
  const {
    hoveredIndex,
    data,
    getColor,
    totalValue,
    containerRef,
    tooltipPos,
    arcs,
    center,
    innerRadius,
    outerRadius,
  } = usePie()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const rowData = useMemo(() => {
    if (hoveredIndex === null)
      return null
    return data[hoveredIndex] ?? null
  }, [hoveredIndex, data])

  /** 仅从图例悬停时没有指针坐标，用扇区中径锚点（对齐 Bklit 联动体验） */
  const anchorFromArc = useMemo(() => {
    if (hoveredIndex === null)
      return null
    const arc = arcs[hoveredIndex]
    if (!arc)
      return null
    const mid = (arc.startAngle + arc.endAngle) / 2
    const r = (innerRadius + outerRadius) / 2
    return {
      x: center + Math.sin(mid) * r,
      y: center - Math.cos(mid) * r,
    }
  }, [hoveredIndex, arcs, center, innerRadius, outerRadius])

  const pos = tooltipPos ?? anchorFromArc

  const visible = hoveredIndex !== null && pos !== null && rowData !== null

  const container = containerRef.current
  if (!(mounted && container))
    return null

  const w = container.offsetWidth
  const h = container.offsetHeight

  if (!visible || pos === null || hoveredIndex === null || !rowData)
    return null

  const pct = totalValue > 0
    ? Math.round((rowData.value / totalValue) * 1000) / 10
    : 0
  const sliceColor = getColor(hoveredIndex)

  return (
    <TooltipBox
      className={ className }
      containerHeight={ h }
      containerRef={ containerRef }
      containerWidth={ w }
      visible
      x={ pos.x }
      y={ pos.y }
    >
      { content
        ? (
            content({ data: rowData, index: hoveredIndex })
          )
        : (
            <TooltipContent
              rows={ [
                {
                  color: sliceColor,
                  label: '数值',
                  value: rowData.value,
                },
                {
                  color: chartCssVars.grid,
                  label: '占比',
                  value: `${pct}%`,
                },
              ] }
              title={ rowData.label }
            />
          ) }
    </TooltipBox>
  )
}

export const PieTooltip = memo(PieTooltipInner)

PieTooltip.displayName = 'PieTooltip'
