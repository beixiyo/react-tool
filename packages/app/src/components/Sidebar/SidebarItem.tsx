import type { SidebarProps } from '.'
import { AnimatePresence, motion } from 'framer-motion'
import { memo } from 'react'
import { cn } from 'utils'

export const SidebarItem = memo((
  {
    id,
    img,
    title,
    subtitle,
    timestamp,
    isExpanded,
    disabled,
    className,
    onClick,
  }: SidebarItemProps,
) => {
  const handleClick = () => {
    if (disabled)
      return
    onClick?.(id)
  }

  const textVariants = {
    hidden: { opacity: 0, width: 0, x: -10 },
    visible: { opacity: 1, width: 'auto', x: 0 },
  }

  return (
    <motion.div
      layout="position"
      className={ cn(
        'flex cursor-pointer items-center rounded-md p-2 transition-colors hover:bg-gray-200/50 dark:hover:bg-gray-700/50',
        isExpanded
          ? 'justify-start'
          : 'justify-center',
        { 'cursor-not-allowed': disabled },
        className,
      ) }
      onClick={ handleClick }
      whileHover={ { scale: 1.02 } }
      whileTap={ { scale: 0.98 } }
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-gray-200 rounded-md bg-white dark:border-gray-700 dark:bg-gray-800">
        <img src={ img || '/placeholder.svg' } alt={ title } className="object-cover" />
      </div>

      <AnimatePresence mode="popLayout">
        { isExpanded && (
          <motion.div
            variants={ textVariants }
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={ { duration: 0.15, ease: 'easeOut' } }
            className="ml-3 flex flex-1 flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">{ timestamp }</span>
            </div>
            <h3 className="truncate text-sm text-gray-900 font-medium dark:text-gray-100">{ title }</h3>

            { subtitle && (
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{ subtitle }</p>
            ) }
          </motion.div>
        ) }
      </AnimatePresence>
    </motion.div>
  )
})

SidebarItem.displayName = 'SidebarItem'

export type SidebarItemProps = SidebarProps['data'][0] & {
  isExpanded: boolean
  /**
   * Callback when item is clicked
   */
  onClick?: (id: string) => void
  className?: string
  disabled?: boolean
}
