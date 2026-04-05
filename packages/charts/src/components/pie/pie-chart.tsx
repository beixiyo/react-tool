'use client'

import type { ReactElement, ReactNode } from 'react'
import type {
  PieArcData,
  PieChartInnerProps,
  PieChartProps,
  PieContextValue,
  PieData,
} from './types'
import { Group } from '@visx/group'
import { ParentSize } from '@visx/responsive'
import { pie as d3Pie } from 'd3-shape'
import {
  Children,
  isValidElement,
  memo,

  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cn } from 'utils'
import { isComponentType } from '../utils'
import { defaultPieColors, PieProvider } from './pie-context'

/** 悬停外移默认像素，也作为防裁切边距 @default 10 */
export const DEFAULT_HOVER_OFFSET = 10

function isPieCenterChild(child: ReactElement): boolean {
  return isComponentType(child, ['PieCenter'])
}

function isDefsChild(child: ReactElement): boolean {
  return isComponentType(child, ['Gradient', 'Pattern', 'LinearGradient', 'RadialGradient'])
}

function isPieTooltipChild(child: ReactElement): boolean {
  return isComponentType(child, ['PieTooltip'])
}

function PieChartInner({
  width,
  height,
  data,
  innerRadius: innerRadiusProp,
  padAngle,
  cornerRadius,
  startAngle,
  endAngle,
  hoverOffset,
  children,
  containerRef,
  hoveredIndexProp,
  onHoverChange,
}: PieChartInnerProps) {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null)
  const [animationKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const isControlled = hoveredIndexProp !== undefined
  const hoveredIndex = isControlled
    ? hoveredIndexProp
    : internalHoveredIndex
  const setHoveredIndex = useCallback(
    (index: number | null) => {
      if (isControlled)
        onHoverChange?.(index)
      else
        setInternalHoveredIndex(index)
    },
    [isControlled, onHoverChange],
  )

  const setTooltipClientPoint = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el)
      return
    const r = el.getBoundingClientRect()
    setTooltipPos({
      x: clientX - r.left,
      y: clientY - r.top,
    })
  }, [containerRef])

  const size = Math.min(width, height)
  const center = size / 2
  const padding = hoverOffset
  const outerRadius = center - padding
  const innerRadius = innerRadiusProp

  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data],
  )

  const getColor = useCallback(
    (index: number) => {
      const item = data[index]
      if (item?.color)
        return item.color
      return defaultPieColors[index % defaultPieColors.length] as string
    },
    [data],
  )

  const getFill = useCallback(
    (index: number) => {
      const item = data[index]
      if (item?.fill)
        return item.fill
      return getColor(index)
    },
    [data, getColor],
  )

  const arcs = useMemo(() => {
    const pieGenerator = d3Pie<PieData>()
      .value(d => d.value)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .padAngle(padAngle)
      .sort(null)

    const computed = pieGenerator(data)

    return computed.map((arc, index) => ({
      data: arc.data,
      index,
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      padAngle: arc.padAngle,
      value: arc.value,
    })) as PieArcData[]
  }, [data, startAngle, endAngle, padAngle])

  const { svgChildren, centerChildren, defsChildren, tooltipChildren } = useMemo(() => {
    const svgNodes: ReactNode[] = []
    const centerNodes: ReactNode[] = []
    const defsNodes: ReactElement[] = []
    const tooltipNodes: ReactNode[] = []

    Children.forEach(children, (child) => {
      if (!isValidElement(child)) {
        svgNodes.push(child)
        return
      }

      if (isPieTooltipChild(child))
        tooltipNodes.push(child)
      else if (isPieCenterChild(child))
        centerNodes.push(child)
      else if (isDefsChild(child))
        defsNodes.push(child)
      else
        svgNodes.push(child)
    })

    return {
      svgChildren: svgNodes,
      centerChildren: centerNodes,
      defsChildren: defsNodes,
      tooltipChildren: tooltipNodes,
    }
  }, [children])

  if (size < 10)
    return null

  const contextValue: PieContextValue = {
    data,
    arcs,
    size,
    center,
    outerRadius,
    innerRadius,
    padAngle,
    cornerRadius,
    hoverOffset,
    hoveredIndex,
    setHoveredIndex,
    animationKey,
    isLoaded,
    containerRef,
    totalValue,
    getColor,
    getFill,
    tooltipPos,
    setTooltipClientPoint,
  }

  return (
    <PieProvider value={ contextValue }>
      <div
        className="grid"
        style={ {
          gridTemplateColumns: '1fr',
          gridTemplateRows: '1fr',
          width: size,
          height: size,
        } }
      >
        <svg
          aria-hidden="true"
          height={ size }
          style={ { gridArea: '1 / 1' } }
          width={ size }
        >
          { defsChildren.length > 0 && <defs>{ defsChildren }</defs> }
          <Group left={ center } top={ center }>
            { svgChildren }
          </Group>
        </svg>

        { centerChildren.length > 0 && (
          <div
            className="pointer-events-none flex items-center justify-center"
            style={ { gridArea: '1 / 1' } }
          >
            { centerChildren }
          </div>
        ) }
      </div>
      { tooltipChildren }
    </PieProvider>
  )
}

function PieChartOuter({
  data,
  size: fixedSize,
  innerRadius = 0,
  padAngle = 0,
  cornerRadius = 0,
  startAngle = -Math.PI / 2,
  endAngle = (3 * Math.PI) / 2,
  className = '',
  hoveredIndex,
  onHoverChange,
  hoverOffset = DEFAULT_HOVER_OFFSET,
  children,
}: PieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (fixedSize) {
    return (
      <div
        className={ cn('relative flex items-center justify-center', className) }
        ref={ containerRef }
        style={ { width: fixedSize, height: fixedSize } }
      >
        <PieChartInner
          containerRef={ containerRef }
          cornerRadius={ cornerRadius }
          data={ data }
          endAngle={ endAngle }
          height={ fixedSize }
          hoveredIndexProp={ hoveredIndex }
          hoverOffset={ hoverOffset }
          innerRadius={ innerRadius }
          onHoverChange={ onHoverChange }
          padAngle={ padAngle }
          startAngle={ startAngle }
          width={ fixedSize }
        >
          { children }
        </PieChartInner>
      </div>
    )
  }

  return (
    <div
      className={ cn('relative aspect-square w-full', className) }
      ref={ containerRef }
    >
      <ParentSize debounceTime={ 10 }>
        { ({ width, height }) => (
          <PieChartInner
            containerRef={ containerRef }
            cornerRadius={ cornerRadius }
            data={ data }
            endAngle={ endAngle }
            height={ height }
            hoveredIndexProp={ hoveredIndex }
            hoverOffset={ hoverOffset }
            innerRadius={ innerRadius }
            onHoverChange={ onHoverChange }
            padAngle={ padAngle }
            startAngle={ startAngle }
            width={ width }
          >
            { children }
          </PieChartInner>
        ) }
      </ParentSize>
    </div>
  )
}

export const PieChart = memo(PieChartOuter)

PieChart.displayName = 'PieChart'
