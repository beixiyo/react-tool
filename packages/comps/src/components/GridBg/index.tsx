import { memo } from 'react'
import themeColors from 'styles/variable'
import { cn } from 'utils'

export const GridBg = memo<GridBgProps>((
  {
    style,
    className,
    theme,
  },
) => {
  /** 根据主题选择 mask 颜色：深色主题用白色，浅色主题用黑色 */
  const maskColor = theme === 'dark'
    ? '#fff'
    : '#000'

  /**
   * 根据主题选择边框颜色
   * 如果传递了 theme，使用 variable.ts 中定义的值
   * 否则使用 CSS 变量，自动跟随全局主题
   */
  const borderColor = theme
    ? `rgb(${themeColors[theme].border} / 1)`
    : 'rgb(var(--border) / 1)'

  const gridBgStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${borderColor} 1px, transparent 1px), linear-gradient(to bottom, ${borderColor} 1px, transparent 1px)`,
    backgroundSize: '2rem 2rem',
    maskImage: `radial-gradient(ellipse 60% 50% at 50% 0%, ${maskColor} 70%, transparent 110%)`,
    WebkitMaskImage: `radial-gradient(ellipse 60% 50% at 50% 0%, ${maskColor} 70%, transparent 110%)`,
    ...style,
  }

  return <div
    className={ cn(
      'GridBgContainer',
      'absolute inset-0 z-0 h-full w-full',
      className,
    ) }
    style={ gridBgStyle }
  >

  </div>
})

GridBg.displayName = 'GridBg'

export type GridBgProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  theme?: 'dark' | 'light'
}
