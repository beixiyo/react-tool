import { motion } from 'motion/react'
import { cn } from 'utils'

/**
 * Dropdown menu container for navbar items
 */
export const NavbarDropdown = memo(
  ({ className, children, onItemClick, style }: NavbarDropdownProps) => {
    return (
      <motion.div
        className={ cn('w-48 rounded-md border bg-background/95 border-border backdrop-blur-md overflow-hidden shadow-lg', className) }
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
