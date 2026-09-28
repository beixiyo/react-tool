import { memo } from 'react'
import { cn } from 'utils'
import { LiquidGlassBase } from '../LiquidGlass'
import type { LiquidGlassMenuProps } from '../types'

/**
 * 流体玻璃菜单组件
 */
export const LiquidGlassMenu = memo<LiquidGlassMenuProps>(({
  items = [],
  className,
  style,
  onItemClick,
  itemClassName,
  ...props
}) => {
  return (
    <LiquidGlassBase
      className={ cn(
        'p-2 rounded-3xl hover:p-3 shadow-md',
        className,
      ) }
      rounded="3xl"
      style={ style }
      { ...props }
    >
      <div className="space-y-1">
        { items.map((item, index) => (
          <div
            key={ `${item}-${index}` }
            className={ cn(
              'text-xl text-white px-3 py-2 rounded-xl',
              'transition-all duration-100 ease-in',
              'hover:bg-white/50 hover:shadow-inner hover:backdrop-blur-xs',
              'cursor-pointer',
              itemClassName,
            ) }
            onClick={ () => onItemClick?.(item, index) }
          >
            { item }
          </div>
        )) }
      </div>
    </LiquidGlassBase>
  )
})

LiquidGlassMenu.displayName = 'LiquidGlassMenu'
