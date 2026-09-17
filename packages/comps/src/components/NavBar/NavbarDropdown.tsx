import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'

/**
 * Dropdown menu container for navbar items
 */
export const NavbarDropdown = memo(
  ({ className, children, onItemClick, style }: NavbarDropdownProps) => {
    return (
      <motion.div
        role="menu"
        className={ cn('flex w-48 flex-col gap-1 overflow-hidden rounded-[20px] border border-border bg-background/95 p-2 shadow-card backdrop-blur-md', className) }
        initial={ { opacity: 0, y: -5 } }
        animate={ { opacity: 1, y: 0 } }
        exit={ { opacity: 0, y: -5 } }
        transition={ { duration: 0.2 } }
        style={ style }
        onClick={ onItemClick }
      >
        { children }
      </motion.div>
    )
  },
)

NavbarDropdown.displayName = 'NavbarDropdown'

export type NavbarDropdownProps = {
  /** CSS class to apply to the dropdown */
  className?: string
  /** Children elements */
  children?: React.ReactNode
  /** Callback when an item is clicked */
  onItemClick?: () => void
  /** Additional styles */
  style?: React.CSSProperties
}
