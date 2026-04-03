'use client'

import type { XAxisLabelProps, XAxisProps } from './types'
import { motion } from 'motion/react'
import { memo, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { useChartInteraction, useChartStatic } from '../chart-context'
import { getBrowserLocale } from '../locale'

function XAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth,
}: XAxisLabelProps) {
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

  /**
   * 零宽度容器方法以实现完美居中
   * 包装器精确定位在 x 处，宽度为 0
   * 内部 span 溢出并通过 text-align 居中
   */
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
        className={ cn('whitespace-nowrap text-text2 text-xs') }
        initial={ { opacity: 1 } }
        transition={ { duration: 0.4, ease: 'easeInOut' } }
      >
        { label }
      </motion.span>
    </div>
  )
}

function XAxisInner({ numTicks = 5, tickerHalfWidth = 50 }: XAxisProps) {
  const { xScale, margin, containerRef } = useChartStatic()
  const { tooltipData } = useChartInteraction()
  const [mounted, setMounted] = useState(false)

  /** 仅在客户端挂载后渲染 */
  useEffect(() => {
    setMounted(true)
  }, [])

  /** 生成均匀分布的刻度值，始终包括第一个和最后一个日期 */
  const labelsToShow = useMemo(() => {
    const domain = xScale.domain()
    const startDate = domain[0] as Date | undefined | number | string
    const endDate = domain[1] as Date | undefined | number | string
    const browserLocale = getBrowserLocale()

    if (startDate == null || endDate == null) {
      return []
    }

    const startObj = startDate instanceof Date
      ? startDate
      : new Date(startDate)
    const endObj = endDate instanceof Date
      ? endDate
      : new Date(endDate)

    if (Number.isNaN(startObj.getTime()) || Number.isNaN(endObj.getTime())) {
      return []
    }

    const startTime = startObj.getTime()
    const endTime = endObj.getTime()
    const timeRange = endTime - startTime

    /** 创建从开始到结束的均匀分布日期 */
    const tickCount = Math.max(2, numTicks) // 至少包含第一个和最后一个
    const dates: Date[] = []

    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1) // 0 到 1 之间的比例
      const time = startTime + t * timeRange
      dates.push(new Date(time))
    }

    return dates.map(date => ({
      date,
      x: (xScale(date) ?? 0) + margin.left,
      label: date.toLocaleDateString(browserLocale, {
        month: 'short',
        day: 'numeric',
      }),
    }))
  }, [xScale, margin.left, numTicks])

  const isHovering = tooltipData !== null
  const crosshairX = tooltipData
    ? tooltipData.x + margin.left
    : null

  /**
   * 使用 portal 渲染到图表容器
   * 仅在客户端挂载后渲染
   */
  const container = containerRef.current
  if (!(mounted && container)) {
    return null
  }

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      { labelsToShow.map(item => (
        <XAxisLabel
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

export const XAxis = memo(XAxisInner)

XAxis.displayName = 'XAxis'
