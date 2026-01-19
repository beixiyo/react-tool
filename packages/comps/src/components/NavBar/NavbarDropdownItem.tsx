'use client'

import { motion } from 'motion/react'
import React, { useCallback } from 'react'
import { cn } from 'utils'

/**
 * Individual item within a dropdown menu
 */
export const NavbarDropdownItem = memo((
  {
    className,
    active = false,
    icon,
    children,
    onClick,
    style,
  }: NavbarDropdownItemProps,
) => {
  const id = useId()
  const handleClick = useCallback(() => {
    if (onClick)
      onClick()
  }, [onClick])

  return (
    <motion.button
      className={ cn(
        'w-full px-4 py-2 text-sm flex items-center gap-2',
        'transition-all duration-150 group',
        className,
      ) }
      onClick={ handleClick }
      whileTap={ { scale: 0.98 } }
      style={ style }
    >
      { icon && <span>{ icon }</span> }
      <span className="transition-all duration-300 group-hover:translate-x-2">{ children }</span>

      {/* Dot */ }
      { active && (
        <motion.span
          className="ml-auto h-1.5 w-1.5 rounded-full bg-current"
          layoutId={ id }
          transition={ { type: 'spring', stiffness: 300, damping: 30 } }
        />
      ) }
    </motion.button>
  )
})

NavbarDropdownItem.displayName = 'NavbarDropdownItem'

export type NavbarDropdownItemProps = {
  /** CSS class to apply to the item */
  className?: string
  /** Whether this item is currently active */
  active?: boolean
  /** Icon to display before the text */
  icon?: React.ReactNode
  /** Children elements */
  children?: React.ReactNode
  /** Click handler */
  onClick?: () => void
  /** Additional styles */
  style?: React.CSSProperties
}
