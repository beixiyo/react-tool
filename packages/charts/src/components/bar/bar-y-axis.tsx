'use client'

import type { BarYAxisLabelProps, BarYAxisProps } from './types'
import { motion } from 'motion/react'
import { memo, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import {
  useChartInteraction,
  useChartStatic,
} from '../chart-context'

function BarYAxisLabel({
  label,
  y,
  bandHeight,
  isHovered,
}: BarYAxisLabelProps) {
  return (
    <div
      className="absolute right-0 flex items-center justify-end pr-2"
      style={ {
        top: y,
        height: bandHeight,
      } }
    >
      <motion.span
        animate={ {
          opacity: isHovered
            ? 1
            : 0.7,
          color: isHovered
            ? 'var(--foreground)'
            : 'var(--chart-label, var(--color-zinc-500))',
        } }
        className={ cn('truncate whitespace-nowrap text-right text-xs') }
        initial={ {
          opacity: 0.7,
          color: 'var(--chart-label, var(--color-zinc-500))',
        } }
        style={ { maxWidth: 70 } }
        transition={ { duration: 0.15 } }
      >
        { label }
      </motion.span>
    </div>
  )
}

function BarYAxisInner({
  showAllLabels = true,
  maxLabels = 20,
}: BarYAxisProps) {
  const {
    margin,
    containerRef,
    barScale,
    bandWidth,
    barXAccessor,
    data,
  } = useChartStatic()
  const { hoveredBarIndex } = useChartInteraction()
  const [mounted, setMounted] = useState(false)

  /** 仅在客户端挂载后渲染 */
  useEffect(() => {
    setMounted(true)
  }, [])

  /** 为每个柱子生成标签 */
  const labelsToShow = useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return []
    }

    const allLabels = data.map((d, i) => {
      const label = barXAccessor(d)
      const bandY = barScale(label) ?? 0
      /** 在条带中垂直居中标签 */
      const y = bandY + margin.top
      return { label, y, bandHeight: bandWidth, index: i }
    })

    /** 如果 showAllLabels 为 true 或者我们拥有的标签少于 maxLabels，则显示所有标签 */
    if (showAllLabels || allLabels.length <= maxLabels) {
      return allLabels
    }

    /** 否则，跳过一些标签以避免拥挤 */
    const step = Math.ceil(allLabels.length / maxLabels)
    return allLabels.filter((_, i) => i % step === 0)
  }, [
    barScale,
    bandWidth,
    barXAccessor,
    data,
    margin.top,
    showAllLabels,
    maxLabels,
  ])

  /** 使用 portal 渲染到图表容器 */
  const container = containerRef.current
  if (!(mounted && container)) {
    return null
  }

  /** 如果不在 BarChart 中则提前返回 */
  if (!barScale) {
    return null
  }

  return createPortal(
    <div
      className="pointer-events-none absolute top-0 bottom-0"
      style={ {
        left: 0,
        width: margin.left,
      } }
    >
      { labelsToShow.map(item => (
        <BarYAxisLabel
          bandHeight={ item.bandHeight }
          isHovered={ hoveredBarIndex === item.index }
          key={ `${item.label}-${item.y}` }
          label={ item.label }
          y={ item.y }
        />
      )) }
    </div>,
    container,
  )
}

export const BarYAxis = memo(BarYAxisInner)

BarYAxis.displayName = 'BarYAxis'
