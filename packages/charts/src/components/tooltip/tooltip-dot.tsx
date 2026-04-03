'use client'

import type { TooltipDotProps } from './types'
import { motion, useSpring } from 'motion/react'
import { memo, useEffect } from 'react'
import { chartCssVars } from '../chart-context'
import { CROSSHAIR_SPRING_CONFIG } from '../constants'

function TooltipDotInner({
  x,
  y,
  visible,
  color,
  size = 5,
  strokeColor = chartCssVars.background,
  strokeWidth = 2,
}: TooltipDotProps) {
  const animatedX = useSpring(x, CROSSHAIR_SPRING_CONFIG)
  const animatedY = useSpring(y, CROSSHAIR_SPRING_CONFIG)

  useEffect(() => {
    animatedX.set(x)
    animatedY.set(y)
  }, [x, y, animatedX, animatedY])

  if (!visible) {
    return null
  }

  return (
    <motion.circle
      cx={ animatedX }
      cy={ animatedY }
      fill={ color }
      r={ size }
      stroke={ strokeColor }
      strokeWidth={ strokeWidth }
    />
  )
}

export const TooltipDot = memo(TooltipDotInner)

TooltipDot.displayName = 'TooltipDot'
