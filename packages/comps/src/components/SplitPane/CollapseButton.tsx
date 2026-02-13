import type { CollapseButtonProps } from './types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

/**
 * 收起/展开按钮组件
 */
export const CollapseButton = memo(({
  direction,
  collapsed,
  onClick,
  theme,
}: CollapseButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
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
        ? (
            <ChevronRight className="w-3 h-3" />
          )
        : (
            <ChevronLeft className="w-3 h-3" />
          )
    }
    return collapsed
      ? (
          <ChevronLeft className="w-3 h-3" />
        )
      : (
          <ChevronRight className="w-3 h-3" />
        )
  }

  const backgroundColor = isHovered
    ? (theme?.buttonHoverBackground ?? 'rgb(var(--background) / 1)')
    : (theme?.buttonBackground ?? 'rgb(var(--background2) / 1)')

  return (
    <button
      type="button"
      onClick={ handleClick }
      onMouseEnter={ handleMouseEnter }
      onMouseLeave={ handleMouseLeave }
      className="absolute z-10 flex items-center justify-center size-6 rounded-full transition-all duration-300 opacity-100"
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
