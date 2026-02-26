'use client'

import { motion } from 'motion/react'
import { memo, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { useChartInteraction, useChartStatic } from '../chart-context'
import type { BarXAxisLabelProps, BarXAxisProps } from './types'

function BarXAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth,
}: BarXAxisLabelProps) {
  const fadeBuffer = 20
  const fadeRadius = tickerHalfWidth + fadeBuffer

  let opacity = 1
  if (isHovering && crosshairX !== null) {
    const distance = Math.abs(x - crosshairX)
    if (distance < tickerHalfWidth) {
      opacity = 0
    }
    else if (distance < fadeRadius) {
      opacity = (distance - tickerHalfWidth) / fadeBuffer
    }
  }

  /** 零宽度容器方法以实现完美居中 */
  return (
    <div
      className="absolute"
      style={ {
        left: x,
        bottom: 12,
        width: 0,
        display: 'flex',
        justifyContent: 'center',
      } }
    >
      <motion.span
        animate={ { opacity } }
        className={ cn('whitespace-nowrap text-chart-label text-xs') }
        initial={ { opacity: 1 } }
        transition={ { duration: 0.4, ease: 'easeInOut' } }
      >
        { label }
      </motion.span>
    </div>
  )
}

function BarXAxisInner({
  tickerHalfWidth = 50,
  showAllLabels = false,
  maxLabels = 12,
}: BarXAxisProps) {
  const {
    margin,
    containerRef,
    barScale,
    bandWidth,
    barXAccessor,
    data,
  } = useChartStatic()
  const { tooltipData } = useChartInteraction()
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

    const allLabels = data.map((d) => {
      const label = barXAccessor(d)
      const bandX = barScale(label) ?? 0
      /** 在柱子组下方居中标签 */
      const x = bandX + bandWidth / 2 + margin.left
      return { label, x }
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
    margin.left,
    showAllLabels,
    maxLabels,
  ])

  const isHovering = tooltipData !== null
  const crosshairX = tooltipData
    ? tooltipData.x + margin.left
    : null

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
    <div className="pointer-events-none absolute inset-0">
      { labelsToShow.map(item => (
        <BarXAxisLabel
          crosshairX={ crosshairX }
          isHovering={ isHovering }
          key={ `${item.label}-${item.x}` }
          label={ item.label }
          tickerHalfWidth={ tickerHalfWidth }
          x={ item.x }
        />
      )) }
    </div>,
    container,
  )
}

export const BarXAxis = memo(BarXAxisInner)

BarXAxis.displayName = 'BarXAxis'
