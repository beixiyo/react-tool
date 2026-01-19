import type { CSSProperties, HTMLAttributes } from 'react'
import type { TabItemType } from '.'
import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'

function InnerTabHeader<T extends string>(
  {
    style,
    className,
    headerId,
    item,
    active,
    dataId,
    activeClassName,
    inactiveClassName,
    colors = ['#3b82f6', '#8b5cf6'],
    ...rest
  }: TabHeaderProps<T>,
) {
  if (item.header) {
    return item.header(item)
  }

  return <div
    className={ cn(
      'px-4 py-2 cursor-pointer transition-all duration-300 relative shrink-0',
      active
        ? activeClassName
        : inactiveClassName,
      className,
    ) }
    style={ style }
    { ...rest }
    data-id={ dataId ?? '' }
  >
    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
      { item.icon }
      <span>{ item.label }</span>
    </div>

    { active && (
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 w-full"
        layoutId={ headerId }
        style={ {
          background: colors.length > 1
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
}

InnerTabHeader.displayName = 'TabHeader'
export const TabHeader = memo(InnerTabHeader) as typeof InnerTabHeader

export type TabHeaderProps<T extends string> = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
  headerId?: string

  active: boolean
  item: TabItemType<T>
  dataId?: string
  activeClassName?: string
  /** 非活跃标签的类名 */
  inactiveClassName?: string
  /** 底部横条的渐变色数组 */
  colors?: string[]
}
& HTMLAttributes<HTMLDivElement>
