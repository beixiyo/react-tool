import type { TabItemType } from '.'
import { MoreHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from 'utils'
import { Popover } from '../Popover'

interface MoreTabsProps<T extends string> {
  items: TabItemType<T>[]
  onChange?: (item: TabItemType<T>) => void
  active: boolean
  headerId: string
  headerClass?: string
  activeClassName?: string
  inactiveClassName?: string
  colors?: string[]
}

export function MoreTabs<T extends string>({
  items,
  onChange,
  active,
  headerId,
  headerClass,
  activeClassName,
  inactiveClassName,
  colors = ['#3b82f6', '#8b5cf6'],
}: MoreTabsProps<T>) {
  return (
    <Popover content={
      <>
        { items.map(item => (
          <div
            key={ item.value }
            onClick={ () => {
              onChange?.(item)
            } }
            className={ cn(
              'flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-sm',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-700 dark:text-gray-300',
            ) }
          >
            { item.icon }
            { item.label }
          </div>
        )) }
      </>
    }>
      <div
        className={ cn(
          'px-4 py-2 cursor-pointer transition-all duration-300 relative shrink-0',
          active
            ? activeClassName
            : inactiveClassName,
          headerClass,
        ) }
      >
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <MoreHorizontal size={ 16 } />
        </div>

        { active && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 w-full"
            layoutId={ headerId }
            style={ {
              background:
                colors.length > 1
                  ? `linear-gradient(to right, ${colors.join(', ')})`
                  : colors[0],
            } }
            transition={ {
              type: 'spring',
              stiffness: 500,
              damping: 30,
            } }
          />
        ) }
      </div>
    </Popover>
  )
}
