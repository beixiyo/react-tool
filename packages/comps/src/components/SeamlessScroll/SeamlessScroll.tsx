'use client'

import { memo } from 'react'
import { cn } from 'utils'
import { useSeamlessScroll } from './hooks/useSeamlessScroll'
import type { SeamlessScrollProps } from './types'

export const SeamlessScroll = memo<SeamlessScrollProps>((props) => {
  const {
    children,
    speed = 50,
    direction = 'left',
    className,
    pauseOnHover = true,
    gap = 20,
    style,
    ...rest
  } = props

  const {
    containerRef,
    trackRef,
    unitRef,
    copies,
    isVertical,
    onMouseEnter,
    onMouseLeave,
  } = useSeamlessScroll({ speed, direction, gap, pauseOnHover })

  return (
    <div
      { ...rest }
      ref={ containerRef }
      className={ cn('relative overflow-hidden', className) }
      style={ style }
      onMouseEnter={ onMouseEnter }
      onMouseLeave={ onMouseLeave }
    >
      <div
        ref={ trackRef }
        className={ cn(
          'flex will-change-transform',
          isVertical
            ? 'h-max w-full flex-col'
            : 'w-max',
        ) }
        style={ { gap: `${gap}px` } }
      >
        { Array.from({ length: copies }).map((_, i) => (
          <div
            key={ i }
            ref={ i === 0
              ? unitRef
              : undefined }
            className={ cn('flex shrink-0', isVertical && 'flex-col') }
            style={ { gap: `${gap}px` } }
          >
            { children }
          </div>
        )) }
      </div>
    </div>
  )
})

SeamlessScroll.displayName = 'SeamlessScroll'
