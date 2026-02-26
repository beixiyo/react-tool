'use client'

import type { ReactElement, ReactNode, RefObject } from 'react'
import type { LineConfig, Margin, TooltipData } from '../types/chart'
import type {
  ChartInteractionState,
  ChartStaticState,
  ChartVirtualContextState,
} from '../types/context'
import type { BarChartProps } from './types'
import { localPoint } from '@visx/event'
import { ParentSize } from '@visx/responsive'
import { scaleBand, scaleLinear } from '@visx/scale'
import { Children, isValidElement, memo, useCallback, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { ChartProvider } from '../chart-context'
import { DEFAULT_CHART_ASPECT_RATIO } from '../constants'
import { getBrowserLocale } from '../locale'
import { useChartAnimation } from '../use-chart-animation'
import { categorizeChildren, isComponentType } from '../utils'
import { Bar } from './bar'

const DEFAULT_MARGIN: Margin = { top: 40, right: 40, bottom: 40, left: 40 }

function ChartInner({
  width,
  height,
  data,
  xDataKey,
  margin,
  animationDuration,
  barGap,
  barWidthProp,
  orientation,
  stacked,
  stackGap,
  children,
  containerRef,
}: {
  width: number
  height: number
  data: Record<string, unknown>[]
  xDataKey: string
  margin: Margin
  animationDuration: number
  barGap: number
  barWidthProp?: number
  orientation: 'vertical' | 'horizontal'
  stacked: boolean
  stackGap: number
  children: ReactNode
  containerRef: RefObject<HTMLDivElement | null>
}) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const { isLoaded } = useChartAnimation({ duration: animationDuration })

  const isHorizontal = orientation === 'horizontal'
  const lines = useMemo(() => extractBarConfigs(children), [children])

  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const categoryAccessor = useCallback(
    (d: Record<string, unknown>): string => {
      const value = d[xDataKey]
      if (value instanceof Date) {
        return value.toLocaleDateString(getBrowserLocale(), {
          month: 'short',
          day: 'numeric',
        })
      }
      return String(value ?? '')
    },
    [xDataKey],
  )

  const xAccessorDate = useCallback(
    (d: Record<string, unknown>): Date => {
      const value = d[xDataKey]
      return value instanceof Date
        ? value
        : new Date()
    },
    [xDataKey],
  )

  const categoryScale = useMemo(() => {
    const domain = data.map(d => categoryAccessor(d))
    const range: [number, number] = isHorizontal
      ? [0, innerHeight]
      : [0, innerWidth]
    return scaleBand<string>({ range, domain, padding: barGap })
  }, [innerWidth, innerHeight, data, categoryAccessor, barGap, isHorizontal])

  const bandWidth = barWidthProp ?? categoryScale.bandwidth()

  const maxValue = useMemo(() => {
    if (stacked) {
      let max = 0
      for (const d of data) {
        let sum = 0
        for (const line of lines) {
          const value = d[line.dataKey]
          if (typeof value === 'number')
            sum += value
        }
        if (sum > max)
          max = sum
      }
      return max || 100
    }
    let max = 0
    for (const line of lines) {
      for (const d of data) {
        const value = d[line.dataKey]
        if (typeof value === 'number' && value > max)
          max = value
      }
    }
    return max || 100
  }, [data, lines, stacked])

  const valueScale = useMemo(() => {
    const range = isHorizontal
      ? [0, innerWidth]
      : [innerHeight, 0]
    return scaleLinear({ range, domain: [0, maxValue * 1.1], nice: true })
  }, [innerWidth, innerHeight, maxValue, isHorizontal])

  const stackOffsets = useMemo(() => {
    if (!stacked)
      return undefined
    const offsets = new Map<number, Map<string, number>>()
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      if (!d)
        continue
      const pointOffsets = new Map<string, number>()
      let cumulative = 0
      for (const line of lines) {
        pointOffsets.set(line.dataKey, cumulative)
        const value = d[line.dataKey]
        if (typeof value === 'number')
          cumulative += value
      }
      offsets.set(i, pointOffsets)
    }
    return offsets
  }, [data, lines, stacked])

  const columnWidth = useMemo(() => {
    if (data.length < 1)
      return 0
    return isHorizontal
      ? innerHeight / data.length
      : innerWidth / data.length
  }, [innerWidth, innerHeight, data.length, isHorizontal])

  const dateLabels = useMemo(() => data.map(d => categoryAccessor(d)), [data, categoryAccessor])

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      const point = localPoint(event)
      if (!point)
        return

      const pos = isHorizontal
        ? point.y - margin.top
        : point.x - margin.left
      const bandIndex = Math.floor(pos / columnWidth)
      const clampedIndex = Math.max(0, Math.min(data.length - 1, bandIndex))
      const d = data[clampedIndex]

      if (!d)
        return

      const yPositions: Record<string, number> = {}
      const xPositions: Record<string, number> = {}
      const barPos = categoryScale(categoryAccessor(d)) ?? 0

      if (isHorizontal) {
        const seriesCount = lines.length
        const groupGap = seriesCount > 1
          ? 4
          : 0
        const individualBarHeight = seriesCount > 0
          ? (bandWidth - groupGap * (seriesCount - 1)) / seriesCount
          : bandWidth

        if (stacked) {
          let cumulative = 0
          for (const line of lines) {
            const value = d[line.dataKey]
            if (typeof value === 'number') {
              cumulative += value
              xPositions[line.dataKey] = valueScale(cumulative) ?? 0
              yPositions[line.dataKey] = barPos + bandWidth / 2
            }
          }
        }
        else {
          lines.forEach((line, idx) => {
            const value = d[line.dataKey]
            if (typeof value === 'number') {
              xPositions[line.dataKey] = valueScale(value) ?? 0
              yPositions[line.dataKey] = barPos + idx * (individualBarHeight + groupGap) + individualBarHeight / 2
            }
          })
        }
      }
      else if (stacked) {
        let cumulative = 0
        let seriesIdx = 0
        for (const line of lines) {
          const value = d[line.dataKey]
          if (typeof value === 'number') {
            cumulative += value
            const gapOffset = seriesIdx * stackGap
            yPositions[line.dataKey] = (valueScale(cumulative) ?? 0) - gapOffset
            seriesIdx++
          }
        }
      }
      else {
        const seriesCount = lines.length
        const groupGap = seriesCount > 1
          ? 4
          : 0
        const individualBarWidth = seriesCount > 0
          ? (bandWidth - groupGap * (seriesCount - 1)) / seriesCount
          : bandWidth

        lines.forEach((line, idx) => {
          const value = d[line.dataKey]
          if (typeof value === 'number') {
            yPositions[line.dataKey] = valueScale(value) ?? 0
            xPositions[line.dataKey] = barPos + idx * (individualBarWidth + groupGap) + individualBarWidth / 2
          }
        })
      }

      setTooltipData({
        point: d,
        index: clampedIndex,
        x: isHorizontal
          ? Math.max(...Object.values(xPositions), 0)
          : barPos + bandWidth / 2,
        yPositions,
        xPositions: Object.keys(xPositions).length > 0
          ? xPositions
          : undefined,
      })
      setHoveredBarIndex(clampedIndex)
    },
    [categoryScale, valueScale, data, lines, margin, categoryAccessor, columnWidth, bandWidth, isHorizontal, stacked, stackGap],
  )

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null)
    setHoveredBarIndex(null)
  }, [])

  const { defs, postOverlay } = categorizeChildren(children, {
    defs: isDefsComponent,
    postOverlay: isPostOverlayComponent,
  })

  const staticValue: ChartStaticState = useMemo(
    () => ({
      data,
      xScale: categoryScale as any, // Mock for context compatibility
      yScale: valueScale,
      width,
      height,
      innerWidth,
      innerHeight,
      margin,
      columnWidth,
      containerRef,
      lines,
      isLoaded,
      animationDuration,
      xAccessor: xAccessorDate,
      dateLabels,
      barScale: categoryScale,
      bandWidth,
      barXAccessor: categoryAccessor,
      orientation,
      stacked,
      stackOffsets,
    }),
    [data, categoryScale, valueScale, width, height, innerWidth, innerHeight, margin, columnWidth, containerRef, lines, isLoaded, animationDuration, xAccessorDate, dateLabels, bandWidth, categoryAccessor, orientation, stacked, stackOffsets],
  )

  const interactionValue: ChartInteractionState = useMemo(
    () => ({
      tooltipData,
      setTooltipData,
      hoveredBarIndex,
      setHoveredBarIndex,
      selection: null
    }),
    [tooltipData, hoveredBarIndex],
  )

  const virtualValue: ChartVirtualContextState = useMemo(() => ({
    startIndex: 0,
    endIndex: data.length - 1,
    isVirtual: false,
  }), [data.length])

  if (width < 10 || height < 10)
    return null

  return (
    <ChartProvider
      interactionValue={ interactionValue }
      staticValue={ staticValue }
      virtualValue={ virtualValue }
    >
      <svg aria-hidden="true" height={ height } width={ width }>
        { defs.length > 0 && <defs>{ defs }</defs> }
        <rect fill="transparent" height={ height } width={ width } x={ 0 } y={ 0 } />
        <g
          onMouseLeave={ isLoaded
            ? handleMouseLeave
            : undefined }
          onMouseMove={ isLoaded
            ? handleMouseMove
            : undefined }
          style={ { cursor: isLoaded
            ? 'crosshair'
            : 'default' } }
          transform={ `translate(${margin.left},${margin.top})` }
        >
          <rect fill="transparent" height={ innerHeight } width={ innerWidth } x={ 0 } y={ 0 } />
          { Children.map(children, (child) => {
            if (!isValidElement(child))
              return null
            return isPostOverlayComponent(child) || isDefsComponent(child)
              ? null
              : child
          }) }
          { postOverlay }
        </g>
      </svg>
    </ChartProvider>
  )
}

export const BarChart = memo(({
  data,
  xDataKey = 'name',
  margin: marginProp,
  animationDuration = 1100,
  className = '',
  style,
  barGap = 0.2,
  barWidth,
  orientation = 'vertical',
  stacked = false,
  stackGap = 0,
  children,
}: BarChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const margin = useMemo(() => ({ ...DEFAULT_MARGIN, ...marginProp }), [marginProp])

  return (
    <div
      className={ cn('relative w-full', className) }
      ref={ containerRef }
      style={ { aspectRatio: DEFAULT_CHART_ASPECT_RATIO, touchAction: 'none', ...style } }
    >
      <ParentSize debounceTime={ 10 }>
        { ({ width, height }) => (
          <ChartInner
            animationDuration={ animationDuration }
            barGap={ barGap }
            barWidthProp={ barWidth }
            children={ children }
            containerRef={ containerRef }
            data={ data }
            height={ height }
            margin={ margin }
            orientation={ orientation }
            stackGap={ stackGap }
            stacked={ stacked }
            width={ width }
            xDataKey={ xDataKey }
          />
        ) }
      </ParentSize>
    </div>
  )
})

BarChart.displayName = 'BarChart'

function extractBarConfigs(children: ReactNode): LineConfig[] {
  const { barComps } = categorizeChildren(children, {
    barComps: (child) => {
      const props = child.props as any
      return child.type === Bar || (props && typeof props.dataKey === 'string' && props.dataKey.length > 0)
    },
  })

  return barComps.map((child) => {
    const props = child.props as any
    const dotColor = props.stroke || props.fill || 'rgb(var(--systemBlue) / 1)'
    return {
      dataKey: props.dataKey,
      stroke: dotColor,
      strokeWidth: 0,
    }
  })
}

function isPostOverlayComponent(child: ReactElement): boolean {
  return isComponentType(child, ['__isChartMarkers', 'ChartMarkers', 'MarkerGroup'])
}

function isDefsComponent(child: ReactElement): boolean {
  return isComponentType(child, ['Gradient', 'Pattern', 'LinearGradient', 'RadialGradient'])
}
