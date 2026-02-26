'use client'

import type { scaleLinear, scaleTime } from '@visx/scale'
import type { LineConfig, Margin, TooltipData } from './types/chart'
import { localPoint } from '@visx/event'
import { useCallback, useEffect, useRef, useState } from 'react'

type ScaleTime = ReturnType<typeof scaleTime<number>>
type ScaleLinear = ReturnType<typeof scaleLinear<number>>

export interface ChartSelection {
  startX: number
  endX: number
  startIndex: number
  endIndex: number
  active: boolean
}

interface UseChartInteractionParams {
  xScale: ScaleTime
  yScale: ScaleLinear
  data: Record<string, unknown>[]
  lines: LineConfig[]
  margin: Margin
  xAccessor: (d: Record<string, unknown>) => Date
  bisectDate: (
    data: Record<string, unknown>[],
    date: Date,
    lo: number,
  ) => number
  canInteract: boolean
}

interface ChartInteractionResult {
  tooltipData: TooltipData | null
  setTooltipData: React.Dispatch<React.SetStateAction<TooltipData | null>>
  selection: ChartSelection | null
  clearSelection: () => void
  interactionHandlers: {
    onMouseMove?: (event: React.MouseEvent<SVGGElement>) => void
    onMouseLeave?: () => void
    onMouseDown?: (event: React.MouseEvent<SVGGElement>) => void
    onMouseUp?: () => void
    onTouchStart?: (event: React.TouchEvent<SVGGElement>) => void
    onTouchMove?: (event: React.TouchEvent<SVGGElement>) => void
    onTouchEnd?: () => void
  }
  interactionStyle: React.CSSProperties
}

export function useChartInteraction({
  xScale,
  yScale,
  data,
  lines,
  margin,
  xAccessor,
  bisectDate,
  canInteract,
}: UseChartInteractionParams): ChartInteractionResult {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [selection, setSelection] = useState<ChartSelection | null>(null)

  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef<number>(0)
  // requestAnimationFrame id for coalescing high-frequency pointer events
  const rafIdRef = useRef<number | null>(null)

  // 卸载时清理任何待处理的动画帧
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [])

  const resolveTooltipFromX = useCallback(
    (pixelX: number): TooltipData | null => {
      const x0 = xScale.invert(pixelX)
      const index = bisectDate(data, x0, 1)
      const d0 = data[index - 1]
      const d1 = data[index]

      if (!d0) {
        return null
      }

      let d = d0
      let finalIndex = index - 1
      if (d1) {
        const d0Time = xAccessor(d0).getTime()
        const d1Time = xAccessor(d1).getTime()
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          d = d1
          finalIndex = index
        }
      }

      const yPositions: Record<string, number> = {}
      for (const line of lines) {
        const value = d[line.dataKey]
        if (typeof value === 'number') {
          yPositions[line.dataKey] = yScale(value) ?? 0
        }
      }

      /** 十字线的位置改为跟随鼠标的实际像素，而不是“对齐到数据点” */
      const [rangeStart, rangeEnd] = xScale.range()
      const clampedX = Math.max(rangeStart, Math.min(pixelX, rangeEnd))

      return {
        point: d,
        index: finalIndex,
        x: clampedX,
        yPositions,
      }
    },
    [xScale, yScale, data, lines, xAccessor, bisectDate],
  )

  const updateTooltipData = useCallback((tooltip?: TooltipData | null) => {
    if (tooltip) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        setTooltipData((prev) => {
          if (!tooltip)
            return null

          // 如果 index + x 完全一样，就不要触发新的 render
          if (prev && prev.index === tooltip.index && prev.x === tooltip.x) {
            return prev
          }

          return tooltip
        })
      })
    }
  }, [])

  const resolveIndexFromX = useCallback(
    (pixelX: number): number => {
      const x0 = xScale.invert(pixelX)
      const index = bisectDate(data, x0, 1)
      const d0 = data[index - 1]
      const d1 = data[index]
      if (!d0) {
        return 0
      }
      if (d1) {
        const d0Time = xAccessor(d0).getTime()
        const d1Time = xAccessor(d1).getTime()
        if (x0.getTime() - d0Time > d1Time - x0.getTime()) {
          return index
        }
      }
      return index - 1
    },
    [xScale, data, xAccessor, bisectDate],
  )

  const getChartX = useCallback(
    (
      event: React.MouseEvent<SVGGElement> | React.TouchEvent<SVGGElement>,
      touchIndex = 0,
    ): number | null => {
      let point: { x: number, y: number } | null = null

      if ('touches' in event) {
        const touch = event.touches[touchIndex]
        if (!touch) {
          return null
        }
        const svg = event.currentTarget.ownerSVGElement
        if (!svg) {
          return null
        }
        point = localPoint(svg, touch as unknown as MouseEvent)
      }
      else {
        point = localPoint(event)
      }

      if (!point) {
        return null
      }
      return point.x - margin.left
    },
    [margin.left],
  )

  // --- 鼠标处理程序 ---

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      const chartX = getChartX(event)
      if (chartX === null) {
        return
      }

      if (isDraggingRef.current) {
        const startX = Math.min(dragStartXRef.current, chartX)
        const endX = Math.max(dragStartXRef.current, chartX)
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        })
        return
      }

      const tooltip = resolveTooltipFromX(chartX)
      updateTooltipData(tooltip)
    },
    [getChartX, resolveTooltipFromX, resolveIndexFromX, updateTooltipData],
  )

  const handleMouseLeave = useCallback(() => {
    setTooltipData(null)
    if (isDraggingRef.current) {
      isDraggingRef.current = false
    }
    setSelection(null)
  }, [])

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      const chartX = getChartX(event)
      if (chartX === null) {
        return
      }
      isDraggingRef.current = true
      dragStartXRef.current = chartX
      setTooltipData(null)
      setSelection(null)
    },
    [getChartX],
  )

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
    }
    setSelection(null)
  }, [])

  // --- 触摸处理程序 ---

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<SVGGElement>) => {
      if (event.touches.length === 1) {
        event.preventDefault()
        const chartX = getChartX(event, 0)
        if (chartX === null) {
          return
        }
        const tooltip = resolveTooltipFromX(chartX)
        if (tooltip) {
          setTooltipData(tooltip)
        }
      }
      else if (event.touches.length === 2) {
        event.preventDefault()
        setTooltipData(null)
        const x0 = getChartX(event, 0)
        const x1 = getChartX(event, 1)
        if (x0 === null || x1 === null) {
          return
        }
        const startX = Math.min(x0, x1)
        const endX = Math.max(x0, x1)
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        })
      }
    },
    [getChartX, resolveTooltipFromX, resolveIndexFromX, updateTooltipData],
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<SVGGElement>) => {
      if (event.touches.length === 1) {
        event.preventDefault()
        const chartX = getChartX(event, 0)
        if (chartX === null) {
          return
        }
        const tooltip = resolveTooltipFromX(chartX)
        updateTooltipData(tooltip)
      }
      else if (event.touches.length === 2) {
        event.preventDefault()
        const x0 = getChartX(event, 0)
        const x1 = getChartX(event, 1)
        if (x0 === null || x1 === null) {
          return
        }
        const startX = Math.min(x0, x1)
        const endX = Math.max(x0, x1)
        setSelection({
          startX,
          endX,
          startIndex: resolveIndexFromX(startX),
          endIndex: resolveIndexFromX(endX),
          active: true,
        })
      }
    },
    [getChartX, resolveTooltipFromX, resolveIndexFromX],
  )

  const handleTouchEnd = useCallback(() => {
    setTooltipData(null)
    setSelection(null)
  }, [])

  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])

  const interactionHandlers = canInteract
    ? {
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        onMouseDown: handleMouseDown,
        onMouseUp: handleMouseUp,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
      }
    : {}

  const interactionStyle: React.CSSProperties = {
    cursor: canInteract
      ? 'crosshair'
      : 'default',
    touchAction: 'none',
  }

  return {
    tooltipData,
    setTooltipData,
    selection,
    clearSelection,
    interactionHandlers,
    interactionStyle,
  }
}
