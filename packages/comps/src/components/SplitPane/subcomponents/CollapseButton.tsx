'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useAriaT } from '../../../i18n'

/** 一次按压超过此位移后，即使回到起点也不再视为点击 */
const CLICK_DRAG_TOLERANCE = 3
import type { CollapseButtonProps } from '../types'

/**
 * 收起/展开按钮组件
 */
export const CollapseButton = memo(({
  direction,
  panelId,
  collapsed,
  onClick,
  theme,
}: CollapseButtonProps) => {
  const t = useAriaT()
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const pointerStartRef = useRef<number | null>(null)
  const hasDraggedRef = useRef(false)

  useEffect(() => {
    if (!isPressed) return
    const trackMove = (event: MouseEvent) => {
      if (pointerStartRef.current !== null && Math.abs(event.clientX - pointerStartRef.current) > CLICK_DRAG_TOLERANCE) {
        hasDraggedRef.current = true
      }
    }
    const stopTracking = () => setIsPressed(false)
    document.addEventListener('mousemove', trackMove)
    document.addEventListener('mouseup', stopTracking)
    window.addEventListener('blur', stopTracking)
    return () => {
      document.removeEventListener('mousemove', trackMove)
      document.removeEventListener('mouseup', stopTracking)
      window.removeEventListener('blur', stopTracking)
    }
  }, [isPressed])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const startX = pointerStartRef.current
      const dragged = hasDraggedRef.current || (startX !== null && Math.abs(e.clientX - startX) > CLICK_DRAG_TOLERANCE)
      pointerStartRef.current = null
      hasDraggedRef.current = false
      if (e.detail > 0 && dragged) return
      onClick()
    },
    [onClick],
  )

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  /** 根据方向和收起状态决定图标 */
  const getIcon = () => {
    if (direction === 'left') {
      return collapsed
        ? <ChevronRight className="h-3 w-3" />
        : <ChevronLeft className="h-3 w-3" />
    }
    return collapsed
      ? <ChevronLeft className="h-3 w-3" />
      : <ChevronRight className="h-3 w-3" />
  }

  const backgroundColor = isHovered
    ? (theme?.buttonHoverBackground ?? 'rgb(var(--background) / 1)')
    : (theme?.buttonBackground ?? 'rgb(var(--background2) / 1)')

  return (
    <button
      type="button"
      aria-label={ direction === 'left'
        ? t(
          collapsed
            ? 'expandLeftPanel'
            : 'collapseLeftPanel',
        )
        : t(
          collapsed
            ? 'expandRightPanel'
            : 'collapseRightPanel',
        ) }
      aria-expanded={ !collapsed }
      aria-controls={ panelId }
      onMouseDown={ (e) => {
        if (e.button !== 0) return
        pointerStartRef.current = e.clientX
        hasDraggedRef.current = false
        setIsPressed(true)
      } }
      onClick={ handleClick }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      className="absolute z-10 flex size-6 items-center justify-center rounded-full opacity-100 transition-all duration-300"
      style={ {
        backgroundColor,
        color: theme?.buttonIconColor ?? 'rgb(var(--text) / 1)',
        ...(direction === 'left'
          ? {
            left: 0,
            transform: 'translateX(-50%)',
          }
          : {
            right: 0,
            transform: 'translateX(50%)',
          }),
      } }
    >
      { getIcon() }
    </button>
  )
})
