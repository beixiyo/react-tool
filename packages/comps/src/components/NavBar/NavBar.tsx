'use client'

import { motion } from 'motion/react'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
import { NavbarDropdownItem } from './subcomponents/NavbarDropdownItem'
import { NavbarItem } from './subcomponents/NavbarItem'
import type { NavItem } from './types'
import type { NavbarProps } from './types'

/**
 * Main Navbar component that serves as the container for navigation items
 */
export const Navbar = memo(({
  className,
  children,
  style,
  items,
  activeItem,
  onItemClick,
  dropdownRenderer,
}: NavbarProps) => {
  /** 检查一个父项是否应该被标记为active（当它自己或它的任何子项被选中时） */
  const isParentActive = useCallback(
    (item: NavItem) => {
      if (activeItem === item.id) return true
      if (item.dropdownItems?.some((subItem) => activeItem === subItem.id)) return true
      return false
    },
    [activeItem],
  )

  return (
    <motion.nav
      initial={ { y: -20, opacity: 0 } }
      animate={ { y: 0, opacity: 1 } }
      transition={ { duration: 0.4, ease: 'easeOut' } }
      className={ cn('flex items-center justify-center', className) }
      style={ style }
    >
      <ul className="flex items-center gap-8">
        { items
          ? items.map((item) => (
            <NavbarItem
              item={ item }
              dropdownRenderer={ dropdownRenderer }
              key={ item.id }
              active={ isParentActive(item) }
              hasDropdown={ !!item.dropdownItems?.length }
              onClick={ () => onItemClick?.(item.id) }
              className={ item.className }
              dropdownContent={ item.dropdownItems?.length
                ? (
                  <>
                    { item.dropdownItems.map((dropdownItem) => (
                      <NavbarDropdownItem
                        key={ dropdownItem.id }
                        icon={ dropdownItem.icon }
                        active={ activeItem === dropdownItem.id }
                        onClick={ () => onItemClick?.(dropdownItem.id) }
                        className={ dropdownItem.className }
                      >
                        { dropdownItem.label }
                      </NavbarDropdownItem>
                    )) }
                  </>
                )
                : undefined }
            >
              { item.icon && <>{ item.icon }</> }
              { item.label }
            </NavbarItem>
          ))
          : children }
      </ul>
    </motion.nav>
  )
})

Navbar.displayName = 'Navbar'
