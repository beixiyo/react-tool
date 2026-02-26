'use client'

import type { LineProps } from './types'
import { curveNatural } from '@visx/curve'

import { LinePath } from '@visx/shape'
import { motion, useMotionTemplate, useSpring } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { chartCssVars, useChartInteraction, useChartStatic } from '../chart-context'
import { BAR_EASING_ARR } from '../constants'

function LineInner({
  dataKey,
  stroke = chartCssVars.linePrimary,
  strokeWidth = 2.5,
  curve = curveNatural,
  animate = true,
  fadeEdges = true,
  showHighlight = true,
}: LineProps) {
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

  /** 此线条的唯一渐变 ID */
  const gradientId = useMemo(
    () => `line-gradient-${dataKey}-${Math.random().toString(36).slice(2, 9)}`,
    [dataKey],
  )

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

  /** 使用 motion 模板创建动画的 strokeDasharray */
  const animatedDasharray = useMotionTemplate`${segmentLengthSpring} ${pathLength}`

  /** 获取数据点的 y 值 */
  const getY = useCallback(
    (d: Record<string, unknown>) => {
      const value = d[dataKey]
      return typeof value === 'number'
        ? yScale(value) ?? 0
        : 0
    },
    [dataKey, yScale],
  )

  const isHovering = tooltipData !== null || selection?.active === true

  return (
    <>
      {/* 边缘渐变的渐变定义 */ }
      { fadeEdges && (
        <defs>
          <linearGradient id={ gradientId } x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" style={ { stopColor: stroke, stopOpacity: 0 } } />
            <stop offset="15%" style={ { stopColor: stroke, stopOpacity: 1 } } />
            <stop offset="85%" style={ { stopColor: stroke, stopOpacity: 1 } } />
            <stop offset="100%" style={ { stopColor: stroke, stopOpacity: 0 } } />
          </linearGradient>
        </defs>
      ) }

      {/* 生长动画的裁剪路径 - 每条线唯一 */ }
      { animate && (
        <defs>
          <clipPath id={ `grow-clip-${dataKey}` }>
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

      {/* 带裁剪路径的主线条 */ }
      <g clipPath={ animate
        ? `url(#grow-clip-${dataKey})`
        : undefined }>
        <motion.g
          animate={ { opacity: isHovering && showHighlight
            ? 0.3
            : 1 } }
          initial={ { opacity: 1 } }
          transition={ { duration: 0.4, ease: 'easeInOut' } }
        >
          <LinePath
            curve={ curve }
            data={ data }
            innerRef={ pathRef }
            stroke={ fadeEdges
              ? `url(#${gradientId})`
              : stroke }
            strokeLinecap="round"
            strokeWidth={ strokeWidth }
            x={ d => xScale(xAccessor(d)) ?? 0 }
            y={ getY }
          />
        </motion.g>
      </g>

      {/* 悬停时高亮显示段 */ }
      { showHighlight && isHovering && isLoaded && pathRef.current && (
        <motion.path
          animate={ { opacity: 1 } }
          d={ pathRef.current.getAttribute('d') || '' }
          exit={ { opacity: 0 } }
          fill="none"
          initial={ { opacity: 0 } }
          stroke={ stroke }
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

export const Line = memo(LineInner)

Line.displayName = 'Line'
