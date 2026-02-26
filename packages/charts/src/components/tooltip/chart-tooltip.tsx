'use client'

import type { ChartTooltipProps } from './types'
import { motion, useSpring } from 'motion/react'
import { memo, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  chartCssVars,
  useChartInteraction,
  useChartStatic,
  useChartVirtual,
} from '../chart-context'
import { getBrowserLocale } from '../locale'
import { DateTicker } from './date-ticker'
import { TooltipBox } from './tooltip-box'
import { TooltipContent } from './tooltip-content'
import { TooltipDot } from './tooltip-dot'
import { TooltipIndicator } from './tooltip-indicator'
import { CROSSHAIR_SPRING_CONFIG } from '../constants';

function ChartTooltipInner({
  showDatePill = true,
  showCrosshair = true,
  showDots = true,
  content,
  rows: rowsRenderer,
  children,
  className = '',
}: ChartTooltipProps) {
  const {
    width,
    height,
    innerHeight,
    margin,
    columnWidth,
    lines,
    xAccessor,
    dateLabels,
    containerRef,
    orientation,
    barXAccessor,
  } = useChartStatic()
  const virtual = useChartVirtual()
  const { tooltipData } = useChartInteraction()

  const isHorizontal = orientation === 'horizontal'

  const [mounted, setMounted] = useState(false)

  /** 仅在客户端挂载后渲染 portals */
  useEffect(() => {
    setMounted(true)
  }, [])

  const visible = tooltipData !== null
  const x = tooltipData?.x ?? 0
  const xWithMargin = x + margin.left

  /** 对于水平图表，从第一行的 yPosition 获取 y 位置（柱子中心） */
  const firstLineDataKey = lines[0]?.dataKey
  const firstLineY = firstLineDataKey
    ? (tooltipData?.yPositions[firstLineDataKey] ?? 0)
    : 0
  const yWithMargin = firstLineY + margin.top

  /** 动画十字线位置 */
  const animatedX = useSpring(xWithMargin, CROSSHAIR_SPRING_CONFIG)

  useEffect(() => {
    animatedX.set(xWithMargin)
  }, [xWithMargin, animatedX])

  /** 从线条生成行 */
  const tooltipRows = useMemo(() => {
    if (!tooltipData) {
      return []
    }

    if (rowsRenderer) {
      return rowsRenderer(tooltipData.point)
    }

    /** 默认：从注册的线条生成行 */
    return lines.map(line => ({
      color: line.stroke,
      label: line.dataKey,
      value: (tooltipData.point[line.dataKey] as number) ?? 0,
    }))
  }, [tooltipData, lines, rowsRenderer])

  /** 标题来自日期或类别 */
  const title = useMemo(() => {
    if (!tooltipData) {
      return undefined
    }
    /** 对于柱状图（水平或垂直），使用类别名称 */
    if (barXAccessor) {
      return barXAccessor(tooltipData.point)
    }
    /** 对于折线/面积图，使用日期 */
    return xAccessor(tooltipData.point).toLocaleDateString(getBrowserLocale(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }, [tooltipData, barXAccessor, xAccessor])

  /**
   * 使用 portal 渲染到图表容器
   * 仅在客户端挂载后渲染
   */
  const container = containerRef.current
  if (!(mounted && container)) {
    return null
  }

  const tooltipContent = (
    <>
      {/* 十字线指示器 - 渲染为 SVG 覆盖层 */ }
      { showCrosshair && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          height="100%"
          width="100%"
        >
          <g transform={ `translate(${margin.left},${margin.top})` }>
            <TooltipIndicator
              colorEdge={ chartCssVars.crosshair }
              colorMid={ chartCssVars.crosshair }
              columnWidth={ columnWidth }
              fadeEdges
              height={ innerHeight }
              visible={ visible }
              width="line"
              x={ x }
            />
          </g>
        </svg>
      ) }

      {/* 柱子/线条上的点 - 仅用于垂直图表 */ }
      { showDots && visible && !isHorizontal && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          height="100%"
          width="100%"
        >
          <g transform={ `translate(${margin.left},${margin.top})` }>
            { lines.map(line => (
              <TooltipDot
                color={ line.stroke }
                key={ line.dataKey }
                strokeColor={ chartCssVars.background }
                visible={ visible }
                x={ tooltipData?.xPositions?.[line.dataKey] ?? x }
                y={ tooltipData?.yPositions[line.dataKey] ?? 0 }
              />
            )) }
          </g>
        </svg>
      ) }

      {/* 提示框 */ }
      <TooltipBox
        className={ className }
        containerHeight={ height }
        containerRef={ containerRef }
        containerWidth={ width }
        top={ isHorizontal
          ? undefined
          : margin.top }
        visible={ visible }
        x={ xWithMargin }
        y={ isHorizontal
          ? yWithMargin
          : margin.top }
      >
        { content
          ? (
              content({
                point: tooltipData?.point ?? {},
                index: tooltipData?.index ?? 0,
              })
            )
          : (
              <TooltipContent rows={ tooltipRows } title={ title }>
                { children }
              </TooltipContent>
            ) }
      </TooltipBox>

      {/* 日期/类别标签 - 仅用于垂直图表 */ }
      { showDatePill && dateLabels.length > 0 && visible && !isHorizontal && (
        <motion.div
          className="pointer-events-none absolute z-50"
          style={ {
            left: animatedX,
            transform: 'translateX(-50%)',
            bottom: 4,
          } }
        >
          <DateTicker
            currentIndex={ (tooltipData?.index ?? 0) + (virtual?.startIndex ?? 0) }
            labels={ dateLabels }
            visible={ visible }
          />
        </motion.div>
      ) }
    </>
  )

  return createPortal(tooltipContent, container)
}

export const ChartTooltip = memo(ChartTooltipInner)

ChartTooltip.displayName = 'ChartTooltip'
