'use client'

import { useLatestCallback } from 'hooks'
import { motion } from 'motion/react'
import { memo, useId } from 'react'
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
    layoutId,
  }: NavbarDropdownItemProps,
) => {
  const autoId = useId()
  /**
   * 默认每项独立 layoutId（仅淡入）；
   * 若父级传入统一 layoutId，激活圆点可在项间平滑滑动
   */
  const dotLayoutId = layoutId ?? autoId
  const handleClick = useLatestCallback(() => {
    if (onClick)
      onClick()
  })

  return (
    <motion.button
      role="menuitem"
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
          layoutId={ dotLayoutId }
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
  /**
   * 激活圆点的 motion layoutId；
   * 传入统一值可让圆点在多个 item 间平滑滑动，
   * 不传则每项独立（仅淡入）
   */
  layoutId?: string
}
