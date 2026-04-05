'use client'

import type { TooltipBoxProps } from './types'
import { motion, useSpring } from 'motion/react'
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { TOOLTIP_SPRING_CONFIG } from '../constants'

function TooltipBoxInner({
  x,
  y,
  visible,
  containerRef,
  containerWidth,
  containerHeight,
  flipViewport,
  offset = 16,
  className = '',
  children,
  left: leftOverride,
  top: topOverride,
  flipped: flippedOverride,
}: TooltipBoxProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipWidth, setTooltipWidth] = useState(180)
  const [tooltipHeight, setTooltipHeight] = useState(80)
  const [mounted, setMounted] = useState(false)

  /** 仅在客户端挂载后渲染 portals */
  useEffect(() => {
    setMounted(true)
  }, [])

  /** 测量提示框尺寸 */
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const w = tooltipRef.current.offsetWidth
      const h = tooltipRef.current.offsetHeight
      if (w > 0 && w !== tooltipWidth) {
        setTooltipWidth(w)
      }
      if (h > 0 && h !== tooltipHeight) {
        setTooltipHeight(h)
      }
    }
  }, [tooltipWidth, tooltipHeight])

  /** 计算带有翻转检测的位置（虚拟横向滚动时按视口宽度判断，避免误用整图宽度） */
  const anchorInViewport = flipViewport
    ? x - flipViewport.scrollLeft
    : x
  const flipBoundaryWidth = flipViewport?.width ?? containerWidth
  const shouldFlipX = anchorInViewport + tooltipWidth + offset > flipBoundaryWidth
  const targetX = shouldFlipX
    ? x - offset - tooltipWidth
    : x + offset

  /** 带有边界限制的垂直定位 */
  const targetY = Math.max(
    offset,
    Math.min(y - tooltipHeight / 2, containerHeight - tooltipHeight - offset),
  )

  /** 跟踪翻转状态用于动画 */
  const prevFlipRef = useRef(shouldFlipX)
  const [flipKey, setFlipKey] = useState(0)

  useEffect(() => {
    if (prevFlipRef.current !== shouldFlipX) {
      setFlipKey(k => k + 1)
      prevFlipRef.current = shouldFlipX
    }
  }, [shouldFlipX])

  /** 动画位置 */
  const animatedLeft = useSpring(targetX, TOOLTIP_SPRING_CONFIG)
  const animatedTop = useSpring(targetY, TOOLTIP_SPRING_CONFIG)

  useEffect(() => {
    animatedLeft.set(targetX)
  }, [targetX, animatedLeft])

  useEffect(() => {
    animatedTop.set(targetY)
  }, [targetY, animatedTop])

  /** 提供时使用覆盖值 */
  const finalLeft = leftOverride ?? animatedLeft
  const finalTop = topOverride ?? animatedTop
  const isFlipped = flippedOverride ?? shouldFlipX
  const transformOrigin = isFlipped
    ? 'right top'
    : 'left top'

  /** 使用 portal 渲染到容器 */
  const container = containerRef.current
  if (!(mounted && container)) {
    return null
  }

  if (!visible) {
    return null
  }

  return createPortal(
    <motion.div
      animate={ { opacity: 1 } }
      className={ cn('pointer-events-none absolute z-50', className) }
      exit={ { opacity: 0 } }
      initial={ { opacity: 0 } }
      ref={ tooltipRef }
      style={ { left: finalLeft, top: finalTop } }
      transition={ { duration: 0.1 } }
    >
      <motion.div
        animate={ { scale: 1, opacity: 1, x: 0 } }
        className="min-w-[140px] overflow-hidden rounded-lg bg-background/40 text-text shadow-lg backdrop-blur-md"
        initial={ { scale: 0.85, opacity: 0, x: isFlipped
          ? 20
          : -20 } }
        key={ flipKey }
        style={ { transformOrigin } }
        transition={ { type: 'spring', stiffness: 300, damping: 25 } }
      >
        { children }
      </motion.div>
    </motion.div>,
    container,
  )
}

export const TooltipBox = memo(TooltipBoxInner)

TooltipBox.displayName = 'TooltipBox'
