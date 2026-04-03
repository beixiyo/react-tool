'use client'

import type { AreaProps } from './types'
import { curveMonotoneX } from '@visx/curve'

import { AreaClosed, LinePath } from '@visx/shape'
import { motion, useMotionTemplate, useSpring } from 'motion/react'
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { chartCssVars, useChartInteraction, useChartStatic } from '../chart-context'
import { BAR_EASING_ARR } from '../constants'

function AreaInner({
  dataKey,
  fill = chartCssVars.linePrimary,
  fillOpacity = 0.4,
  stroke,
  strokeWidth = 2,
  curve = curveMonotoneX,
  animate = true,
  showLine = true,
  showHighlight = true,
  gradientToOpacity = 0,
  fadeEdges = false,
}: AreaProps) {
  const {
    data,
    xScale,
    yScale,
    innerHeight,
    innerWidth,
    isLoaded,
    animationDuration,
    xAccessor,
  } = useChartStatic()
  const {
    tooltipData,
    selection,
  } = useChartInteraction()

  const pathRef = useRef<SVGPathElement>(null)
  const [pathLength, setPathLength] = useState(0)

  /** 当前区域的唯一 ID */
  const uniqueId = useId().replace(/:/g, '_')
  const gradientId = useMemo(
    () => `area-gradient-${dataKey}-${uniqueId}`,
    [dataKey, uniqueId],
  )
  const strokeGradientId = useMemo(
    () =>
      `area-stroke-gradient-${dataKey}-${uniqueId}`,
    [dataKey, uniqueId],
  )
  const edgeMaskId = `area-edge-mask-${dataKey}-${uniqueId}`
  const edgeGradientId = `${edgeMaskId}-gradient`

  /** 解析后的描边颜色（默认为填充颜色） */
  const resolvedStroke = stroke || fill

  /** 测量路径长度并触发动画 */
  useEffect(() => {
    if (pathRef.current && animate) {
      const len = pathRef.current.getTotalLength()
      if (len > 0) {
        setPathLength(len)
      }
    }
  }, [animate])

  /** 二分查找以在给定 X 坐标处查找路径长度 */
  const findLengthAtX = useCallback(
    (targetX: number): number => {
      const path = pathRef.current
      if (!path || pathLength === 0) {
        return 0
      }
      let low = 0
      let high = pathLength
      const tolerance = 0.5

      while (high - low > tolerance) {
        const mid = (low + high) / 2
        const point = path.getPointAtLength(mid)
        if (point.x < targetX) {
          low = mid
        }
        else {
          high = mid
        }
      }
      return (low + high) / 2
    },
    [pathLength],
  )

  /** 从选择或悬停计算高亮显示的段边界 */
  const segmentBounds = useMemo(() => {
    /** 当不需要高亮时，直接返回空段并跳过所有基于 pathLength 的计算 */
    if (!showHighlight) {
      return { startLength: 0, segmentLength: 0, isActive: false }
    }

    if (!pathRef.current || pathLength === 0) {
      return { startLength: 0, segmentLength: 0, isActive: false }
    }

    /** 选择优先于悬停 */
    if (selection?.active) {
      const startLength = findLengthAtX(selection.startX)
      const endLength = findLengthAtX(selection.endX)
      return {
        startLength,
        segmentLength: endLength - startLength,
        isActive: true,
      }
    }

    if (!tooltipData) {
      return { startLength: 0, segmentLength: 0, isActive: false }
    }

    const idx = tooltipData.index
    const startIdx = Math.max(0, idx - 1)
    const endIdx = Math.min(data.length - 1, idx + 1)

    const startPoint = data[startIdx]
    const endPoint = data[endIdx]
    if (!(startPoint && endPoint)) {
      return { startLength: 0, segmentLength: 0, isActive: false }
    }

    const startX = xScale(xAccessor(startPoint)) ?? 0
    const endX = xScale(xAccessor(endPoint)) ?? 0

    const startLength = findLengthAtX(startX)
    const endLength = findLengthAtX(endX)

    return {
      startLength,
      segmentLength: endLength - startLength,
      isActive: true,
    }
  }, [
    showHighlight,
    tooltipData,
    selection,
    data,
    xScale,
    pathLength,
    xAccessor,
    findLengthAtX,
  ])

  /** 用于平滑高亮动画的弹簧（偏移和段长度） */
  const springConfig = { stiffness: 180, damping: 28 }
  const offsetSpring = useSpring(0, springConfig)
  const segmentLengthSpring = useSpring(0, springConfig)

  /** 使用 motion 模板创建动画的 strokeDasharray */
  const animatedDasharray = useMotionTemplate`${segmentLengthSpring} ${pathLength}`

  /** 当段边界改变时更新弹簧 */
  useEffect(() => {
    offsetSpring.set(-segmentBounds.startLength)
    segmentLengthSpring.set(segmentBounds.segmentLength)
  }, [
    segmentBounds.startLength,
    segmentBounds.segmentLength,
    offsetSpring,
    segmentLengthSpring,
  ])

  /** 获取数据点的 y 值 */
  const getY = useCallback(
    (d: Record<string, unknown>) => {
      const value = d[dataKey]
      const numValue = Number(value)
      return !Number.isNaN(numValue) && value != null && value !== ''
        ? yScale(numValue) ?? 0
        : 0
    },
    [dataKey, yScale],
  )

  const isHovering = tooltipData !== null || selection?.active === true

  return (
    <>
      {/* 渐变定义 */ }
      <defs>
        {/* 填充渐变 - 从顶部的 fillOpacity 渐变到底部的 gradientToOpacity */ }
        <linearGradient id={ gradientId } x1="0%" x2="0%" y1="0%" y2="100%">
          <stop
            offset="0%"
            style={ { stopColor: fill, stopOpacity: fillOpacity } }
          />
          <stop
            offset="100%"
            style={ { stopColor: fill, stopOpacity: gradientToOpacity } }
          />
        </linearGradient>

        {/* 描边渐变 - 在边缘渐变 */ }
        <linearGradient id={ strokeGradientId } x1="0%" x2="100%" y1="0%" y2="0%">
          <stop
            offset="0%"
            style={ { stopColor: resolvedStroke, stopOpacity: 0 } }
          />
          <stop
            offset="15%"
            style={ { stopColor: resolvedStroke, stopOpacity: 1 } }
          />
          <stop
            offset="85%"
            style={ { stopColor: resolvedStroke, stopOpacity: 1 } }
          />
          <stop
            offset="100%"
            style={ { stopColor: resolvedStroke, stopOpacity: 0 } }
          />
        </linearGradient>

        {/* 区域填充的边缘渐变遮罩 */ }
        { fadeEdges && (
          <>
            <linearGradient
              id={ edgeGradientId }
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
            >
              <stop
                offset="0%"
                style={ { stopColor: 'white', stopOpacity: 0 } }
              />
              <stop
                offset="20%"
                style={ { stopColor: 'white', stopOpacity: 1 } }
              />
              <stop
                offset="80%"
                style={ { stopColor: 'white', stopOpacity: 1 } }
              />
              <stop
                offset="100%"
                style={ { stopColor: 'white', stopOpacity: 0 } }
              />
            </linearGradient>
            <mask id={ edgeMaskId }>
              <rect
                fill={ `url(#${edgeGradientId})` }
                height={ innerHeight }
                width={ innerWidth }
                x="0"
                y="0"
              />
            </mask>
          </>
        ) }
      </defs>

      {/* 生长动画的裁剪路径 - 每个区域唯一 */ }
      { animate && (
        <defs>
          <clipPath id={ `grow-clip-area-${dataKey}-${uniqueId}` }>
            <motion.rect
              animate={ { width: innerWidth } }
              height={ innerHeight + 20 }
              initial={ { width: 0 } }
              transition={ { duration: animationDuration / 1000, ease: BAR_EASING_ARR } }
              x={ 0 }
              y={ 0 }
            />
          </clipPath>
        </defs>
      ) }

      {/* 带裁剪路径的主区域 */ }
      <g clipPath={ animate
        ? `url(#grow-clip-area-${dataKey}-${uniqueId})`
        : undefined }>
        <motion.g
          animate={ { opacity: isHovering && showHighlight
            ? 0.6
            : 1 } }
          initial={ { opacity: 1 } }
          transition={ { duration: 0.4, ease: 'easeInOut' } }
        >
          {/* 区域填充 */ }
          <g mask={ fadeEdges
            ? `url(#${edgeMaskId})`
            : undefined }>
            <AreaClosed
              curve={ curve }
              data={ data }
              fill={ `url(#${gradientId})` }
              x={ d => xScale(xAccessor(d)) ?? 0 }
              y={ getY }
              yScale={ yScale }
            />
          </g>

          {/* 区域上方的描边线 */ }
          { showLine && (
            <LinePath
              curve={ curve }
              data={ data }
              innerRef={ pathRef }
              stroke={ fadeEdges
                ? `url(#${strokeGradientId})`
                : resolvedStroke }
              strokeLinecap="round"
              strokeWidth={ strokeWidth }
              x={ d => xScale(xAccessor(d)) ?? 0 }
              y={ getY }
            />
          ) }
        </motion.g>
      </g>

      {/* 悬停时高亮显示段，仅在 showHighlight 为 true 的 Area 上启用 */ }
      { showHighlight
        && showLine
        && isHovering
        && isLoaded && (
        <motion.path
          animate={ { opacity: 1 } }
          d={ pathRef.current?.getAttribute('d') || '' }
          exit={ { opacity: 0 } }
          fill="none"
          initial={ { opacity: 0 } }
          stroke={ resolvedStroke }
          strokeLinecap="round"
          strokeWidth={ strokeWidth }
          style={ {
            strokeDasharray: animatedDasharray,
            strokeDashoffset: offsetSpring,
          } }
          transition={ { duration: 0.4, ease: 'easeInOut' } }
        />
      ) }
    </>
  )
}

export const Area = memo(AreaInner)

Area.displayName = 'Area'
