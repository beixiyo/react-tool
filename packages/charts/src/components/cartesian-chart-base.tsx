'use client'

import type { ReactElement, ReactNode, RefObject } from 'react'
import type { LineConfig, Margin } from './types/chart'
import type {
  ChartInteractionState,
  ChartStaticState,
  ChartVirtualContextState,
} from './types/context'
import type { ChartVirtualConfig } from './types/virtual'
import { ParentSize } from '@visx/responsive'
import { scaleLinear, scaleTime } from '@visx/scale'
import { bisector } from 'd3-array'
import { Children, isValidElement, memo, useCallback, useMemo, useRef } from 'react'
import { cn } from 'utils'
import { ChartProvider } from './chart-context'
import { DEFAULT_CHART_ASPECT_RATIO, DEFAULT_CHART_MARGIN } from './constants'
import { getBrowserLocale } from './locale'
import { useChartAnimation } from './use-chart-animation'
import { useChartInteraction } from './use-chart-interaction'
import { categorizeChildren, isComponentType } from './utils'

export interface CartesianChartBaseProps {
  data: Record<string, unknown>[]
  xDataKey?: string
  margin?: Partial<Margin>
  animationDuration?: number
  className?: string
  style?: React.CSSProperties
  children?: ReactNode
  extractConfigs: (children: ReactNode) => LineConfig[]
  /** 虚拟滚动配置 */
  virtual?: ChartVirtualConfig
}

function isPostOverlayComponent(child: ReactElement): boolean {
  return isComponentType(child, ['__isChartMarkers', 'ChartMarkers', 'MarkerGroup'])
}

function CartesianChartInner({
  width,
  height,
  data: rawData,
  xDataKey,
  margin,
  animationDuration,
  children,
  containerRef,
  extractConfigs,
  virtual,
}: {
  width: number
  height: number
  data: Record<string, unknown>[]
  xDataKey: string
  margin: Partial<Margin>
  animationDuration: number
  children: ReactNode
  containerRef: RefObject<HTMLDivElement | null>
  extractConfigs: (children: ReactNode) => LineConfig[]
  virtual?: ChartVirtualConfig
}) {
  const resolvedMargin = useMemo(() => ({ ...DEFAULT_CHART_MARGIN, ...margin }), [margin])
  const { isLoaded } = useChartAnimation({ duration: animationDuration })
  const lines = useMemo(() => extractConfigs(children), [children, extractConfigs])

  const innerWidth = width - resolvedMargin.left - resolvedMargin.right
  const innerHeight = height - resolvedMargin.top - resolvedMargin.bottom

  const xAccessor = useCallback(
    (d: Record<string, unknown>): Date => {
      const value = d[xDataKey]
      return value instanceof Date
        ? value
        : new Date(value as string | number)
    },
    [xDataKey],
  )

  /** 1. 虚拟滚动计算 (Virtual Context) */
  const virtualValue: ChartVirtualContextState = useMemo(() => {
    if (!virtual?.enabled || !virtual.containerWidth) {
      return { startIndex: 0, endIndex: rawData.length - 1, isVirtual: false }
    }

    const { scrollLeft, containerWidth, minPointWidth: manualMinPointWidth } = virtual
    const contentWidth = virtual.contentWidth || (rawData.length > 1
      ? innerWidth
      : 0)
    const minPointWidth = manualMinPointWidth || (rawData.length > 1
      ? contentWidth / (rawData.length - 1)
      : 0)

    if (minPointWidth <= 0) {
      return { startIndex: 0, endIndex: rawData.length - 1, isVirtual: false }
    }

    const visibleStartIdx = Math.floor(scrollLeft / minPointWidth)
    const visibleEndIdx = Math.ceil((scrollLeft + containerWidth) / minPointWidth)

    const buffer = 2
    const start = Math.max(0, visibleStartIdx - buffer)
    const end = Math.min(rawData.length - 1, visibleEndIdx + buffer)

    return {
      startIndex: start,
      endIndex: end,
      isVirtual: true,
      config: { ...virtual, minPointWidth },
    }
  }, [rawData.length, virtual, innerWidth])

  /** 2. 静态数据准备 (Static Context) */
  const slicedData = useMemo(() => {
    return rawData.slice(virtualValue.startIndex, virtualValue.endIndex + 1)
  }, [rawData, virtualValue.startIndex, virtualValue.endIndex])

  const bisectDate = useMemo(
    () => bisector<Record<string, unknown>, Date>(d => xAccessor(d)).left,
    [xAccessor],
  )

  const xScale = useMemo(() => {
    const dates = rawData.map(d => xAccessor(d))
    const minTime = Math.min(...dates.map(d => d.getTime()))
    const maxTime = Math.max(...dates.map(d => d.getTime()))

    return scaleTime({
      range: [0, innerWidth],
      domain: [minTime, maxTime],
    })
  }, [innerWidth, rawData, xAccessor])

  const yScale = useMemo(() => {
    let maxValue = 0
    for (const line of lines) {
      for (const d of rawData) {
        const value = d[line.dataKey]
        if (typeof value === 'number' && value > maxValue) {
          maxValue = value
        }
      }
    }
    if (maxValue === 0)
      maxValue = 100

    return scaleLinear({
      range: [innerHeight, 0],
      domain: [0, maxValue * 1.1],
      nice: true,
    })
  }, [innerHeight, rawData, lines])

  const columnWidth = useMemo(() => {
    if (rawData.length < 2)
      return 0
    return innerWidth / (rawData.length - 1)
  }, [innerWidth, rawData.length])

  const dateLabels = useMemo(
    () =>
      slicedData.map(d =>
        xAccessor(d).toLocaleDateString(getBrowserLocale(), {
          month: 'short',
          day: 'numeric',
        }),
      ),
    [slicedData, xAccessor],
  )

  const staticValue: ChartStaticState = useMemo(() => ({
    data: slicedData,
    rawData,
    xScale,
    yScale,
    width,
    height,
    innerWidth,
    innerHeight,
    margin: resolvedMargin,
    columnWidth,
    containerRef,
    lines,
    isLoaded,
    animationDuration,
    xAccessor,
    dateLabels,
    orientation: 'vertical',
  }), [slicedData, rawData, xScale, yScale, width, height, innerWidth, innerHeight, resolvedMargin, columnWidth, containerRef, lines, isLoaded, animationDuration, xAccessor, dateLabels])

  /** 3. 交互数据准备 (Interaction Context) */
  const {
    tooltipData,
    setTooltipData,
    selection,
    interactionHandlers,
    interactionStyle,
  } = useChartInteraction({
    xScale,
    yScale,
    data: slicedData,
    lines,
    margin: resolvedMargin,
    xAccessor,
    bisectDate,
    canInteract: isLoaded,
  })

  const interactionValue: ChartInteractionState = useMemo(() => ({
    tooltipData,
    setTooltipData,
    selection,
  }), [tooltipData, setTooltipData, selection])

  const { postOverlay } = categorizeChildren(children, {
    postOverlay: isPostOverlayComponent,
  })

  if (width < 10 || height < 10)
    return null

  return (
    <ChartProvider
      staticValue={ staticValue }
      interactionValue={ interactionValue }
      virtualValue={ virtualValue }
    >
      <svg aria-hidden="true" height={ height } width={ width }>
        <rect fill="transparent" height={ height } width={ width } x={ 0 } y={ 0 } />
        <g
          { ...interactionHandlers }
          style={ interactionStyle }
          transform={ `translate(${resolvedMargin.left},${resolvedMargin.top})` }
        >
          <rect fill="transparent" height={ innerHeight } width={ innerWidth } x={ 0 } y={ 0 } />
          { Children.map(children, (child) => {
            if (!isValidElement(child))
              return null
            return isPostOverlayComponent(child)
              ? null
              : child
          }) }
          { postOverlay }
        </g>
      </svg>
    </ChartProvider>
  )
}

export const CartesianChartBase = memo(({
  data,
  xDataKey = 'date',
  margin,
  animationDuration = 1100,
  className = '',
  style,
  children,
  extractConfigs,
  virtual,
}: CartesianChartBaseProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className={ cn('relative w-full', className) }
      ref={ containerRef }
      style={ { aspectRatio: DEFAULT_CHART_ASPECT_RATIO, touchAction: 'none', ...style } }
    >
      <ParentSize debounceTime={ 10 }>
        { ({ width, height }) => (
          <CartesianChartInner
            animationDuration={ animationDuration }
            children={ children }
            containerRef={ containerRef }
            data={ data }
            extractConfigs={ extractConfigs }
            height={ height }
            margin={ margin || {} }
            width={ width }
            xDataKey={ xDataKey }
            virtual={ virtual }
          />
        ) }
      </ParentSize>
    </div>
  )
})

CartesianChartBase.displayName = 'CartesianChartBase'
