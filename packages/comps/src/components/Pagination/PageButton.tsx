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
      { isActive && (
        <motion.div
          layoutId="pagination-button-active"
          className="absolute inset-0 rounded-lg bg-buttonPrimary -z-10"
          initial={ false }
          transition={ { type: 'spring', stiffness: 300, damping: 30 } }
        />
      ) }
    </Button>
  )
})

PageButton.displayName = 'PageButton'
