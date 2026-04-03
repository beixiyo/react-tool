'use client'

import type { GridProps } from './types'
import { GridColumns, GridRows } from '@visx/grid'
import { memo, useId } from 'react'
import { chartCssVars, useChartStatic } from '../chart-context'

function GridInner({
  horizontal = true,
  vertical = false,
  numTicksRows = 5,
  numTicksColumns = 10,
  stroke = chartCssVars.grid,
  strokeOpacity = 1,
  strokeWidth = 1,
  strokeDasharray = '4,4',
  fadeHorizontal = true,
  fadeVertical = false,
}: GridProps) {
  const {
    xScale,
    yScale,
    innerWidth,
    innerHeight,
    orientation,
    barScale,
  } = useChartStatic()

  /**
   * 对于柱状图，确定网格线使用哪个比例尺
   * 水平柱状图：垂直网格应使用 yScale（值比例尺）
   * 垂直柱状图：水平网格使用 yScale（值比例尺）
   */
  const isHorizontalBarChart = orientation === 'horizontal' && barScale

  /**
   * 对于水平柱状图中的垂直网格线，使用 yScale（值比例尺）
   * 对于基于时间的图表，使用 xScale
   */
  const columnScale = isHorizontalBarChart
    ? yScale
    : xScale
  const uniqueId = useId().replace(/:/g, '_')

  /** 水平渐变遮罩（用于网格行 - 左右渐变） */
  const hMaskId = `grid-rows-fade-${uniqueId}`
  const hGradientId = `${hMaskId}-gradient`

  /** 垂直渐变遮罩（用于网格列 - 上下渐变） */
  const vMaskId = `grid-cols-fade-${uniqueId}`
  const vGradientId = `${vMaskId}-gradient`

  return (
    <g className="chart-grid">
      {/* 水平网格线的渐变遮罩 - 在左/右渐变 */ }
      { horizontal && fadeHorizontal && (
        <defs>
          <linearGradient id={ hGradientId } x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={ { stopColor: 'white', stopOpacity: 0 } } />
            <stop offset="10%" style={ { stopColor: 'white', stopOpacity: 1 } } />
            <stop offset="90%" style={ { stopColor: 'white', stopOpacity: 1 } } />
            <stop
              offset="100%"
              style={ { stopColor: 'white', stopOpacity: 0 } }
            />
          </linearGradient>
          <mask id={ hMaskId }>
            <rect
              fill={ `url(#${hGradientId})` }
              height={ innerHeight }
              width={ innerWidth }
              x="0"
              y="0"
            />
          </mask>
        </defs>
      ) }

      {/* 垂直网格线的渐变遮罩 - 在上/下渐变 */ }
      { vertical && fadeVertical && (
        <defs>
          <linearGradient id={ vGradientId } x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" style={ { stopColor: 'white', stopOpacity: 0 } } />
            <stop offset="10%" style={ { stopColor: 'white', stopOpacity: 1 } } />
            <stop offset="90%" style={ { stopColor: 'white', stopOpacity: 1 } } />
            <stop
              offset="100%"
              style={ { stopColor: 'white', stopOpacity: 0 } }
            />
          </linearGradient>
          <mask id={ vMaskId }>
            <rect
              fill={ `url(#${vGradientId})` }
              height={ innerHeight }
              width={ innerWidth }
              x="0"
              y="0"
            />
          </mask>
        </defs>
      ) }

      { horizontal && (
        <g mask={ fadeHorizontal
          ? `url(#${hMaskId})`
          : undefined }>
          <GridRows
            numTicks={ numTicksRows }
            scale={ yScale }
            stroke={ stroke }
            strokeDasharray={ strokeDasharray }
            strokeOpacity={ strokeOpacity }
            strokeWidth={ strokeWidth }
            width={ innerWidth }
          />
        </g>
      ) }
      { vertical && columnScale && typeof columnScale === 'function' && (
        <g mask={ fadeVertical
          ? `url(#${vMaskId})`
          : undefined }>
          <GridColumns
            height={ innerHeight }
            numTicks={ numTicksColumns }
            scale={ columnScale }
            stroke={ stroke }
            strokeDasharray={ strokeDasharray }
            strokeOpacity={ strokeOpacity }
            strokeWidth={ strokeWidth }
          />
        </g>
      ) }
    </g>
  )
}

GridInner.displayName = 'Grid'

export const Grid = memo(GridInner)
