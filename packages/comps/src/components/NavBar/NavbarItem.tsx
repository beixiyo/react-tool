'use client'

import type { NavItem } from '.'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from 'utils'
import { NavbarDropdown } from './NavbarDropdown'

export const NavbarItem = memo(
  ({
    className,
    active = false,
    hasDropdown = false,
    item,
    dropdownRenderer,
    dropdownContent,
    dropdownPosition = 'center',
    children,
    onClick,
    style,
  }: NavbarItemProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
    const itemRef = useRef<HTMLLIElement>(null)

    /** 清除定时器的辅助函数 */
    const clearCloseTimer = useCallback(() => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }, [])

    /** 处理整个导航项（包括下拉菜单）的鼠标进入 */
    const handleMouseEnter = useCallback(() => {
      clearCloseTimer()
      setIsHovering(true)
      if (hasDropdown) {
        setIsOpen(true)
      }
    }, [hasDropdown, clearCloseTimer])

    /** 处理整个导航项（包括下拉菜单）的鼠标离开 */
    const handleMouseLeave = useCallback(() => {
      setIsHovering(false)
      if (hasDropdown) {
        closeTimerRef.current = setTimeout(() => {
          setIsOpen(false)
        }, 150)
      }
    }, [hasDropdown, clearCloseTimer])

    const handleClick = useCallback(() => {
      if (onClick)
        onClick()
      if (!hasDropdown)
        setIsOpen(false)
    }, [onClick, hasDropdown])

    const closeDropdown = useCallback(() => {
      setIsOpen(false)
      setIsHovering(false)
    }, [])

    /** 组件卸载时清除定时器 */
    useEffect(() => {
      return () => {
        clearCloseTimer()
      }
    }, [clearCloseTimer])

    return (
      <li ref={ itemRef } className="relative" onMouseEnter={ handleMouseEnter } onMouseLeave={ handleMouseLeave }>
        <motion.button
          className={ cn(
            'rounded-md text-sm font-medium relative',
            'transition-colors duration-200 ease-in-out',
            active
              ? 'text-blue-600'
              : 'text-textPrimary hover:text-blue-600',
            className,
          ) }
          onClick={ handleClick }
          whileTap={ { scale: 0.97 } }
          style={ style }
        >
          <div className="h-8 flex items-center gap-1">
            { children }

            { hasDropdown && (
              <motion.span
                animate={ {
                  rotate: isOpen
                    ? 180
                    : 0,
                } }
                transition={ { duration: 0.2 } }>
                <ChevronDown size={ 16 } />
              </motion.span>
            ) }
          </div>

          {/* Active/hover Line */ }
          <AnimatePresence>
            { (active || isHovering) && (
              <motion.span
                className="absolute left-0 h-px rounded-full bg-current -bottom-1"
                initial={ { width: 0, opacity: 0 } }
                animate={ { width: '100%', opacity: 1 } }
                exit={ { width: 0, opacity: 0 } }
                transition={ { duration: 0.2 } }
              />
            ) }
          </AnimatePresence>
        </motion.button>

        {/* Dropdown */ }
        { hasDropdown && (
          <AnimatePresence>
            { isOpen && (
              <div
                className={ cn(
                  'absolute top-full mt-3',
                  dropdownPosition === 'left' && 'left-0',
                  dropdownPosition === 'center' && 'left-1/2 -translate-x-1/2',
                  dropdownPosition === 'right' && 'right-0',
                ) }
                style={ { zIndex: 9999 } }
              >
                { dropdownRenderer
                  ? (
                      dropdownRenderer({ item, isOpen })
                    )
                  : (
                      <NavbarDropdown onItemClick={ closeDropdown } className={ className }>
                        { dropdownContent }
                      </NavbarDropdown>
                    ) }
              </div>
            ) }
          </AnimatePresence>
        ) }
      </li>
    )
  },
)

export interface NavbarItemProps {
  className?: string
  active?: boolean
  hasDropdown?: boolean
  item?: NavItem
  dropdownRenderer?: (data: {
    isOpen: boolean
    item?: NavItem
  }) => React.ReactNode
  dropdownContent?: React.ReactNode
  dropdownPosition?: 'left' | 'center' | 'right'
  children: React.ReactNode
  onClick?: () => void
  style?: React.CSSProperties
}
