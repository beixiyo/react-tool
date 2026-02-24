import type { Rounded, RoundedStyle, Size } from '../../types'
import { memo } from 'react'
import { cn } from 'utils'

/**
 * 流体玻璃基础组件
 */
export const LiquidGlassBase = memo<LiquidGlassBaseProps>(({
  children,
  className,
  style,
  blur = 'sm',
  tintOpacity = 0.25,
  glowIntensity = 'normal',
  rounded = 'lg',
  hoverScale = false,
  borderOpacity = 0.3,
  ...props
}) => {
  const blurStyles = {
    none: '',
    sm: 'backdrop-blur-xs',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }

  /** 获取模糊样式 */
  const getBlurStyles = () => {
    if (typeof blur === 'number') {
      return {
        className: undefined,
        style: {
          backdropFilter: `blur(${blur}px)`,
        },
      }
    }
    return {
      className: blurStyles[blur],
      style: undefined,
    }
  }

  const blurStylesResult = getBlurStyles()

  const radiusStyles: RoundedStyle = {
    'none': 'rounded-none',
    'sm': 'rounded-xs',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    'full': 'rounded-full',
  }

  const glowStyles = {
    none: '',
    light: 'shadow-2xs',
    normal: 'shadow-md shadow-black/20',
    intense: 'shadow-lg shadow-black/30',
  }

  return (
    <div
      className={ cn(
        'relative flex font-semibold overflow-hidden',
        'transition-all duration-400 ease-out',
        hoverScale && 'hover:scale-105',
        glowStyles[glowIntensity],
        radiusStyles[rounded],
        className,
      ) }
      style={ {
        border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
        ...style,
      } }
      { ...props }
    >
      {/* 玻璃扭曲效果层 */ }
      <div
        className={ cn(
          'absolute inset-0 z-0 overflow-hidden isolate',
          blurStylesResult.className,
        ) }
        style={ {
          filter: 'url(#glass-distortion)',
          ...blurStylesResult.style,
        } }
      />

      {/* 透明度层 */ }
      <div
        className="absolute inset-0 z-10"
        style={ {
          background: `rgba(255, 255, 255, ${tintOpacity})`,
        } }
      />

      {/* 光泽效果层 */ }
      <div
        className="absolute inset-0 z-20 overflow-hidden"
        style={ {
          boxShadow: `
            inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5),
            inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5)
          `,
        } }
      />

      {/* 内边框高光 */ }
      <div
        className={ cn(
          'absolute inset-0 z-25 pointer-events-none',
          radiusStyles[rounded],
        ) }
        style={ {
          border: `1px solid rgba(255, 255, 255, ${borderOpacity * 1.5})`,
          borderTopColor: `rgba(255, 255, 255, ${borderOpacity * 2})`,
          borderLeftColor: `rgba(255, 255, 255, ${borderOpacity * 1.8})`,
          borderBottomColor: `rgba(255, 255, 255, ${borderOpacity * 0.8})`,
          borderRightColor: `rgba(255, 255, 255, ${borderOpacity * 0.8})`,
        } }
      />

      {/* 内容层 */ }
      <div className="relative z-30 text-black font-semibold">
        { children }
      </div>
    </div>
  )
})

LiquidGlassBase.displayName = 'LiquidGlassBase'

export type LiquidGlassBaseProps = {
  /**
   * 背景模糊程度
   * @default 'sm'
   */
  blur?: 'none' | Size
  /**
   * 透明度层的不透明度
   * @default 0.25
   */
  tintOpacity?: number
  /**
   * 发光强度
   * @default 'normal'
   */
  glowIntensity?: 'none' | 'light' | 'normal' | 'intense'
  /**
   * Tailwind 边框圆角
   * @default 'lg'
   */
  rounded?: Rounded
  /**
   * 是否启用悬停缩放效果
   * @default false
   */
  hoverScale?: boolean
  /**
   * 边框透明度
   * @default 0.3
   */
  borderOpacity?: number
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
