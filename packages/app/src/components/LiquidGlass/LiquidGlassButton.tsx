import { memo } from 'react'
import { cn } from 'utils'
import { LiquidGlassBase } from './LiquidGlassBase'

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
  size = 'default',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-4 py-2 rounded-2xl hover:px-5 hover:py-3',
    default: 'px-10 py-6 rounded-3xl hover:px-12 hover:py-7',
    lg: 'px-12 py-8 rounded-3xl hover:px-14 hover:py-10',
  }

  const ButtonContent = (
    <LiquidGlassBase
      className={ cn(
        'cursor-pointer shadow-2xl',
        sizeStyles[size],
        className,
      ) }
      borderRadius="3xl"
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

export type LiquidGlassButtonProps = {
  /**
   * 按钮大小
   * @default 'default'
   */
  size?: 'sm' | 'default' | 'lg'
  /**
   * 点击事件
   */
  onClick?: () => void
  /**
   * 链接地址
   */
  href?: string
  /**
   * 链接打开方式
   * @default '_blank'
   */
  target?: string
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>
