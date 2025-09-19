import { cn } from '@/utils'
import { motion } from 'framer-motion'

/**
 * Dropdown menu container for navbar items
 */
export const NavbarDropdown = memo(
  ({ className, children, onItemClick, style }: NavbarDropdownProps) => {
    return (
      <motion.div
        className={ cn('w-48 rounded-md border bg-black/50 border-gray-300/60 backdrop-blur-md overflow-hidden', className) }
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
