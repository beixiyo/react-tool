import type { PageButtonProps } from './types'
import { motion } from 'motion/react'
import { memo } from 'react'
import { Button } from '../Button'

export const PageButton = memo<PageButtonProps>(({
  page,
  isActive = false,
  disabled = false,
  children,
  onClick,
  layoutId,
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
    >
      { children }
      { isActive && layoutId && (
        <motion.div
          layoutId={ layoutId }
          className="absolute inset-0 rounded-lg bg-button -z-10"
          initial={ false }
          transition={ { type: 'spring', stiffness: 300, damping: 30 } }
        />
      ) }
    </Button>
  )
})

PageButton.displayName = 'PageButton'
