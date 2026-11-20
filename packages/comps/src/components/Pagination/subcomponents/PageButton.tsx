import { motion } from 'motion/react'
import { memo } from 'react'
import { MOTION_TRANSITIONS } from '../../Animate'
import { Button } from '../../Button'
import type { PageButtonProps } from '../types'

export const PageButton = memo<PageButtonProps>(({
  page,
  isActive = false,
  disabled = false,
  children,
  onClick,
  layoutId,
  ariaCurrent,
}) => {
  return (
    <Button
      variant={ isActive
        ? 'primary'
        : 'default' }
      size="sm"
      onClick={ () => page && onClick?.(page) }
      disabled={ disabled }
      rounded="lg"
      aria-current={ ariaCurrent }
    >
      { children }
      { isActive && layoutId && (
        <motion.div
          layoutId={ layoutId }
          className="bg-button absolute inset-0 -z-10 rounded-lg"
          initial={ false }
          transition={ MOTION_TRANSITIONS.smooth }
        />
      ) }
    </Button>
  )
})

PageButton.displayName = 'PageButton'
