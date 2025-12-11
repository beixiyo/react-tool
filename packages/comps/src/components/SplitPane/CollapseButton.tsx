import { memo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CollapseButtonProps } from './types'

/**
 * 收起/展开按钮组件
 */
export const CollapseButton = memo(function CollapseButton({
  direction,
  collapsed,
  onClick,
  theme,
}: CollapseButtonProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onClick()
    },
    [onClick]
  )

  // 根据方向和收起状态决定图标
  const getIcon = () => {
    if (direction === 'left') {
      return collapsed ? (
        <ChevronRight className="w-3 h-3" />
      ) : (
        <ChevronLeft className="w-3 h-3" />
      )
    }
    return collapsed ? (
      <ChevronLeft className="w-3 h-3" />
    ) : (
      <ChevronRight className="w-3 h-3" />
    )
  }

  return (
    <motion.button
      type="button"
      onClick={ handleClick }
      className="absolute z-10 flex items-center justify-center size-6 rounded-full transition-all duration-300"
      style={ {
        backgroundColor: theme?.buttonBackground ?? 'rgb(var(--backgroundSubtle) / 1)',
        color: theme?.buttonIconColor ?? 'rgb(var(--textPrimary) / 1)',
        ...(direction === 'left' ? {
          left: 0,
          transform: 'translateX(-50%)',
        } : {
          right: 0,
          transform: 'translateX(50%)',
        }),
      } }
      initial={ { opacity: 0 } }
      animate={ { opacity: 1 } }
      exit={ { opacity: 0 } }
      whileHover={ {
        backgroundColor: theme?.buttonHoverBackground ?? 'rgb(var(--background) / 1)',
      } }
    >
      { getIcon() }
    </motion.button>
  )
})
