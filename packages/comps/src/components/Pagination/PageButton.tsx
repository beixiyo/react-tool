import type { PageButtonProps } from './types'
import { motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from 'utils'

export const PageButton = memo<PageButtonProps>(({
  page,
  isActive = false,
  disabled = false,
  children,
  onClick,
  size = 'md',
  variant = 'default',
}) => {
  const getSizeStyles = () => {
    const sizeMap = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    }
    return sizeMap[size]
  }

  const getVariantStyles = () => {
    if (isActive) {
      return 'bg-blue-500 text-white shadow-lg'
    }

    if (disabled) {
      return 'text-gray-400 cursor-not-allowed'
    }

    const variantMap = {
      default: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
      minimal: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
      filled: 'text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
    }
    return variantMap[variant]
  }

  return (
    <button
      onClick={ () => page && onClick?.(page) }
      disabled={ disabled }
      className={ cn(
        'relative font-medium rounded-lg transition-colors duration-200',
        getSizeStyles(),
        getVariantStyles(),
        !disabled && !isActive && 'hover:shadow-md',
      ) }
    >
      { children }
      { isActive && (
        <motion.div
          layoutId="activePage"
          className="absolute inset-0 rounded-lg bg-blue-500 -z-10"
          initial={ false }
          transition={ { type: 'spring', stiffness: 300, damping: 30 } }
        />
      ) }
    </button>
  )
})

PageButton.displayName = 'PageButton'
