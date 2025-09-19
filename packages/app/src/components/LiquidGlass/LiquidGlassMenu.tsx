import { memo } from 'react'
import { cn } from 'utils'
import { LiquidGlassBase } from './LiquidGlassBase'

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
      borderRadius="3xl"
      { ...props }
    >
      <div className="space-y-1">
        { items.map((item, index) => (
          <div
            key={ index }
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

export type LiquidGlassMenuProps = {
  /**
   * 菜单项列表
   * @default []
   */
  items?: string[]
  /**
   * 菜单项点击事件
   */
  onItemClick?: (item: string, index: number) => void
  /**
   * 菜单项样式类名
   */
  itemClassName?: string
} & React.HTMLAttributes<HTMLDivElement>
