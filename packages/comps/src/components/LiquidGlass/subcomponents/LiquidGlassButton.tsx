import { memo } from 'react'
import { cn } from 'utils'
import { LiquidGlassBase } from '../LiquidGlass'
import type { LiquidGlassButtonProps, LiquidGlassButtonSize } from '../types'

const SIZE_CLASSES: Record<LiquidGlassButtonSize, string> = {
  sm: 'px-4 py-2 rounded-2xl hover:px-5 hover:py-3',
  md: 'px-10 py-6 rounded-3xl hover:px-12 hover:py-7',
  lg: 'px-12 py-8 rounded-3xl hover:px-14 hover:py-10',
}

/**
 * 流体玻璃按钮组件
 */
export const LiquidGlassButton = memo<LiquidGlassButtonProps>(({
  children,
  className,
  style,
  onClick,
  href,
  target = '_blank',
  size = 'md',
  ...props
}) => {
  const ButtonContent = (
    <LiquidGlassBase
      className={ cn(
        'cursor-pointer shadow-2xl',
        SIZE_CLASSES[size],
        className,
      ) }
      style={ style }
      rounded="3xl"
      onClick={ onClick }
      { ...props }
    >
      { children }
    </LiquidGlassBase>
  )

  if (href) {
    return (
      <a
        href={ href }
        target={ target }
        className="no-underline"
      >
        { ButtonContent }
      </a>
    )
  }

  return ButtonContent
})

LiquidGlassButton.displayName = 'LiquidGlassButton'
