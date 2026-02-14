import { memo } from 'react'
import { cn } from 'utils'
import { LiquidGlassBase } from './LiquidGlassBase'

/**
 * 流体玻璃工具栏组件
 */
export const LiquidGlassDock = memo<LiquidGlassDockProps>(({
  apps = [],
  className,
  style,
  onAppClick,
  href,
  target = '_blank',
  ...props
}) => {
  const DockContent = (
    <LiquidGlassBase
      className={ cn(
        'p-3 rounded-3xl hover:p-4 shadow-xl',
        className,
      ) }
      rounded="3xl"
      { ...props }
    >
      <div className="flex items-center justify-center gap-2">
        { apps.map((app, index) => (
          <img
            key={ index }
            src={ app.icon }
            alt={ app.name }
            className={ cn(
              'w-[75px] transition-all duration-400 ease-out',
              'hover:scale-95 cursor-pointer',
            ) }
            onClick={ () => onAppClick?.(app, index) }
          />
        )) }
      </div>
    </LiquidGlassBase>
  )

  if (href) {
    return (
      <a
        href={ href }
        target={ target }
        className="no-underline"
      >
        { DockContent }
      </a>
    )
  }

  return DockContent
})

LiquidGlassDock.displayName = 'LiquidGlassDock'

export type LiquidGlassDockProps = {
  /**
   * 应用程序列表
   * @default []
   */
  apps?: Array<{
    name: string
    icon: string
  }>
  /**
   * 应用程序点击事件
   */
  onAppClick?: (app: { name: string, icon: string }, index: number) => void
  /**
   * 链接地址
   */
  href?: string
  /**
   * 链接打开方式
   * @default '_blank'
   */
  target?: string
} & React.HTMLAttributes<HTMLDivElement>
