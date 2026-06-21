import { memo } from 'react'
import themeColors from 'styles/variable'
import { cn } from 'utils'

export const GridBg = memo<GridBgProps>((
  {
    style,
    className,
    theme,
    children,
    cellSize = '2rem 2rem',
    maskImage,
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

  /** 遮罩淡出形状：未传则用默认椭圆渐变 */
  const resolvedMask = maskImage
    ?? `radial-gradient(ellipse 60% 50% at 50% 0%, ${maskColor} 70%, transparent 110%)`

  const gridBgStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${borderColor} 1px, transparent 1px), linear-gradient(to bottom, ${borderColor} 1px, transparent 1px)`,
    backgroundSize: cellSize,
    maskImage: resolvedMask,
    WebkitMaskImage: resolvedMask,
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
    { children }
  </div>
})

GridBg.displayName = 'GridBg'

export type GridBgProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  theme?: 'dark' | 'light'
  /**
   * 网格单元尺寸（CSS background-size），可调网格密度
   * @default '2rem 2rem'
   */
  cellSize?: string
  /**
   * 自定义遮罩淡出形状（CSS mask-image），不传则用默认椭圆渐变
   *
   * 注意：传入后会同时覆盖 maskImage 与 WebkitMaskImage，
   * 需自行包含 mask 颜色（默认遮罩会按 theme 自动取黑/白）
   */
  maskImage?: string
}
