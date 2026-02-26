'use client'

import type { AutoScrollContainerProps } from './types'
import { memo, useCallback, useEffect, useRef } from 'react'
import { cn } from 'utils'

function AutoScrollContainerInner({
  minContentWidth = 0,
  scrollThreshold = 100,
  maxScrollSpeed = 15,
  height = 400,
  className,
  onScroll,
  children,
}: AutoScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const requestRef = useRef<number>(0)
  const mousePosRef = useRef<{ x: number, rect: DOMRect | null }>({ x: 0, rect: null })

  const onScrollRef = useRef(onScroll)
  onScrollRef.current = onScroll

  const handleScroll = useCallback(() => {
    if (scrollRef.current && onScrollRef.current) {
      const { scrollLeft, offsetWidth, scrollWidth } = scrollRef.current
      onScrollRef.current({
        scrollLeft,
        containerWidth: offsetWidth,
        contentWidth: scrollWidth,
        isScrolling: scrollWidth > offsetWidth,
      })
    }
  }, [])

  const animate = useCallback(() => {
    if (!scrollRef.current || !mousePosRef.current.rect)
      return

    const { x, rect } = mousePosRef.current
    const scrollContainer = scrollRef.current

    /** 鼠标相对于容器左边缘的距离 */
    const relativeX = x - rect.left
    const containerWidth = rect.width
    const isScrollable = scrollContainer.scrollWidth > containerWidth

    if (!isScrollable)
      return

    let speed = 0

    if (relativeX < scrollThreshold) {
      /** 靠近左侧，向左滚动 (relativeX 越小速度越快) */
      speed = -maxScrollSpeed * (1 - relativeX / scrollThreshold)
    }
    else if (relativeX > containerWidth - scrollThreshold) {
      /** 靠近右侧，向右滚动 */
      const rightDist = containerWidth - relativeX
      speed = maxScrollSpeed * (1 - rightDist / scrollThreshold)
    }

    if (speed !== 0) {
      scrollContainer.scrollLeft += speed
      handleScroll()
    }

    requestRef.current = requestAnimationFrame(animate)
  }, [maxScrollSpeed, scrollThreshold, handleScroll])

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePosRef.current = {
      x: e.clientX,
      rect: scrollRef.current?.getBoundingClientRect() || null,
    }
  }

  const handleMouseEnter = () => {
    requestRef.current = requestAnimationFrame(animate)
  }

  const handleMouseLeave = () => {
    cancelAnimationFrame(requestRef.current)
    mousePosRef.current.rect = null
  }

  useEffect(() => {
    /** 初始通知一次 */
    handleScroll()
    return () => cancelAnimationFrame(requestRef.current)
  }, [handleScroll, minContentWidth])

  return (
    <div
      ref={ scrollRef }
      className={ cn(
        'w-full overflow-x-auto overflow-y-hidden custom-scrollbar select-none',
        className,
      ) }
      style={ { height } }
      onMouseMove={ handleMouseMove }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      onScroll={ handleScroll }
    >
      <div style={ { width: Math.max(minContentWidth, 0), minWidth: '100%', height: '100%' } }>
        { children }
      </div>
    </div>
  )
}

export const AutoScrollContainer = memo(AutoScrollContainerInner)
AutoScrollContainer.displayName = 'AutoScrollContainer'
