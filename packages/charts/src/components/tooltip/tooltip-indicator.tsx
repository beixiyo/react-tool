'use client'

import type { IndicatorWidth, TooltipIndicatorProps } from './types'
import { motion, useSpring } from 'motion/react'
import { memo, useEffect } from 'react'
import { chartCssVars } from '../chart-context'

/** 十字线使用更快的弹簧，使鼠标移动时响应更加灵敏 */
const crosshairSpringConfig = { stiffness: 300, damping: 30 }

function resolveWidth(width: IndicatorWidth): number {
  if (typeof width === 'number') {
    return width
  }
  switch (width) {
    case 'line':
      return 1
    case 'thin':
      return 2
    case 'medium':
      return 4
    case 'thick':
      return 8
    default:
      return 1
  }
}

function TooltipIndicatorInner({
  x,
  height,
  visible,
  width = 'line',
  span,
  columnWidth,
  colorEdge = chartCssVars.crosshair,
  colorMid = chartCssVars.crosshair,
  fadeEdges = true,
  gradientId = 'tooltip-indicator-gradient',
}: TooltipIndicatorProps) {
  const pixelWidth
    = span !== undefined && columnWidth !== undefined
      ? span * columnWidth
      : resolveWidth(width)

  const animatedX = useSpring(x - pixelWidth / 2, crosshairSpringConfig)

  useEffect(() => {
    animatedX.set(x - pixelWidth / 2)
  }, [x, animatedX, pixelWidth])

  if (!visible) {
    return null
  }

  const edgeOpacity = fadeEdges
    ? 0
    : 1

  return (
    <g>
      <defs>
        <linearGradient id={ gradientId } x1="0%" x2="0%" y1="0%" y2="100%">
          <stop
            offset="0%"
            style={ { stopColor: colorEdge, stopOpacity: edgeOpacity } }
          />
          <stop offset="10%" style={ { stopColor: colorEdge, stopOpacity: 1 } } />
          <stop offset="50%" style={ { stopColor: colorMid, stopOpacity: 1 } } />
          <stop offset="90%" style={ { stopColor: colorEdge, stopOpacity: 1 } } />
          <stop
            offset="100%"
            style={ { stopColor: colorEdge, stopOpacity: edgeOpacity } }
          />
        </linearGradient>
      </defs>
      <motion.rect
        fill={ `url(#${gradientId})` }
        height={ height }
        width={ pixelWidth }
        x={ animatedX }
        y={ 0 }
      />
    </g>
  )
}

export const TooltipIndicator = memo(TooltipIndicatorInner)

TooltipIndicator.displayName = 'TooltipIndicator'
