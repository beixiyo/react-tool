'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'

export const SeamlessScroll = memo<SeamlessScrollProps>(({
  children,
  speed = 50,
  direction = 'left',
  className = '',
  pauseOnHover = true,
  gap = 20,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const isPausedRef = useRef(false)
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 })
  const lastTimeRef = useRef(performance.now())
  const positionRef = useRef(0)

  const isVertical = direction === 'up' || direction === 'down'
  const isReverse = direction === 'right' || direction === 'down'

  useEffect(() => {
    if (!contentRef.current)
      return

    const updateSize = () => {
      if (contentRef.current) {
        setContentSize({
          width: contentRef.current.offsetWidth,
          height: contentRef.current.offsetHeight,
        })
      }
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [children])

  useEffect(() => {
    if (!containerRef.current || !contentRef.current)
      return

    let animationFrameId: number

    if (isReverse) {
      const maxOffset = isVertical
        ? contentSize.height + gap
        : contentSize.width + gap
      positionRef.current = -maxOffset
    }

    const animate = (currentTime: number) => {
      if (!containerRef.current || !contentRef.current)
        return

      if (!isPausedRef.current) {
        const deltaTime = currentTime - lastTimeRef.current
        const pixelsToMove = (speed * deltaTime) / 1000

        if (isReverse) {
          positionRef.current += pixelsToMove
        }
        else {
          positionRef.current -= pixelsToMove
        }

        const maxOffset = isVertical
          ? contentSize.height + gap
          : contentSize.width + gap

        if (Math.abs(positionRef.current) >= maxOffset) {
          positionRef.current = 0
        }

        if (isReverse && positionRef.current >= 0) {
          positionRef.current = -maxOffset
        }

        const transform = isVertical
          ? `translateY(${positionRef.current}px)`
          : `translateX(${positionRef.current}px)`

        containerRef.current.style.transform = transform
      }

      lastTimeRef.current = currentTime
      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrameId)
  }, [speed, direction, contentSize, gap, isVertical, isReverse])

  const Item = <div
    className="flex"
    style={ {
      gap: `${gap}px`,
      flexDirection: isVertical
        ? 'column'
        : 'row',
    } }
  >
    { children }
  </div>

  return (
    <div
      className={ cn(
        'overflow-hidden relative',
        className,
      ) }
      onMouseEnter={ () => {
        if (pauseOnHover) {
          isPausedRef.current = true
          setIsPaused(true)
        }
      } }
      onMouseLeave={ () => {
        if (pauseOnHover) {
          isPausedRef.current = false
          setIsPaused(false)
        }
      } }
    >
      <div
        ref={ containerRef }
        className={ cn(
          isVertical
            ? 'flex-col'
            : 'flex',
          'flex',
        ) }
        style={ { gap: `${gap}px` } }
      >
        <div ref={ contentRef } className="shrink-0">
          { Item }
        </div>

        <div className="shrink-0">
          { Item }
        </div>
      </div>
    </div>
  )
})

interface SeamlessScrollProps {
  children: React.ReactNode
  speed?: number // pixels per second
  /** @default 'left' */
  direction?: 'left' | 'right' | 'up' | 'down'
  className?: string
  pauseOnHover?: boolean
  gap?: number // gap between items in pixels
}
