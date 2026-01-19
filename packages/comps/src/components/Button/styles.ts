import type { RoundedStyle, SizeStyle } from '../../types'
import type { ButtonProps, ButtonVariant } from './types'
import { cva } from 'class-variance-authority'

/**
 * 按钮基础样式变体
 */
export const buttonVariants = cva(
  'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-buttonTertiary text-textPrimary border border-border hover:bg-backgroundSecondary hover:border-borderSecondary active:bg-backgroundTertiary active:border-borderStrong',
        primary: 'bg-buttonPrimary text-buttonTertiary border border-transparent hover:opacity-90 active:opacity-80',
        success: 'bg-success text-white hover:opacity-90 active:opacity-80',
        warning: 'bg-warning text-white hover:opacity-90 active:opacity-80',
        danger: 'bg-danger text-white hover:opacity-90 active:opacity-80',
        info: 'bg-info text-white hover:opacity-90 active:opacity-80',
        link: 'bg-transparent text-info hover:underline active:text-info',
        ghost: 'bg-transparent text-textPrimary hover:bg-backgroundSecondary active:bg-backgroundTertiary',
      } as Record<ButtonVariant, string>,
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      } as SizeStyle,
      rounded: {
        'none': 'rounded-none',
        'sm': 'rounded-xs',
        'md': 'rounded-md',
        'lg': 'rounded-lg',
        'xl': 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
        'full': 'rounded-full',
      } as RoundedStyle,
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
    },
  },
)

/**
 * 获取扁平风格按钮样式
 */
export function getDefaultStyles(props: Props) {
  const { variant = 'default', size, ...rest } = props
  // 如果 size 是 number，不传递给 cva（cva 不支持 number）
  if (typeof size === 'number') {
    return buttonVariants({ variant, ...rest })
  }
  return buttonVariants({ variant, size, ...rest })
}

/**
 * 获取新拟态风格按钮样式
 * - 浅色模式背景色建议：#e8e8e8
 * - 深色模式背景色建议：#262626
 */
export function getNeumorphicStyles(props: Props) {
  const { variant = 'default' } = props

  // Light Mode Neumorphic Styles
  // Base color: bg-[#f0f0f0]
  // Shadow colors: #d1d1d1 (darker), #ffffff (lighter)
  const baseNeumorphicLight = 'shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] bg-[#f0f0f0] text-gray-700 border-none'
  const activeNeumorphicLight = 'active:shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] active:bg-[#e8e8e8]'
  const disabledNeumorphicLight = 'disabled:opacity-70 disabled:shadow-[inset_2px_2px_5px_#d1d1d1,inset_-2px_-2px_5px_#ffffff]'
  const hoverNeumorphicLight = 'hover:shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] hover:bg-[#f0f0f0]'

  // Dark Mode Neumorphic Styles
  // Base color: bg-neutral-800 (approx #262626 or similar dark gray)
  // Shadow colors: #1c1c1c (very dark), #3a3a3a (slightly lighter dark)
  const baseNeumorphicDark = 'dark:shadow-[5px_5px_10px_#1c1c1c,-5px_-5px_10px_#3a3a3a] dark:bg-[#262626] dark:text-neutral-300'
  const activeNeumorphicDark = 'dark:active:shadow-[inset_5px_5px_10px_#1c1c1c,inset_-5px_-5px_10px_#3a3a3a] dark:active:bg-neutral-900'
  const disabledNeumorphicDark = 'dark:disabled:opacity-70 dark:disabled:shadow-[inset_2px_2px_5px_#1c1c1c,inset_-2px_-2px_5px_#3a3a3a]'
  const hoverNeumorphicDark = 'dark:hover:shadow-[6px_6px_12px_#1c1c1c,-6px_-6px_12px_#3a3a3a] dark:hover:bg-neutral-900'

  const neumorphicBase = `${baseNeumorphicLight} ${activeNeumorphicLight} ${disabledNeumorphicLight} ${hoverNeumorphicLight} ${baseNeumorphicDark} ${activeNeumorphicDark} ${disabledNeumorphicDark} ${hoverNeumorphicDark}`

  const variantTextStyles: Record<string, string> = {
    default: 'text-neutral-900 dark:text-neutral-100',
    primary: 'text-neutral-900 dark:text-neutral-100',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
    link: 'text-blue-600 dark:text-blue-400 hover:underline',
    ghost: 'text-gray-600 dark:text-gray-400',
  }

  const { size, ...restProps } = props
  // 如果 size 是 number，不传递给 cva（cva 不支持 number）
  const cvaProps = typeof size === 'number'
    ? restProps
    : { size, ...restProps }

  return buttonVariants({
    ...cvaProps,
    variant: undefined,
    className: `${neumorphicBase} ${variantTextStyles[variant!] || ''}`,
  })
}

/**
 * 获取图标按钮样式
 */
export function getIconButtonStyles(size: string | number) {
  if (typeof size === 'number') {
    return undefined // 返回 undefined，使用行内样式
  }
  const sizeStyles: Record<string, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return sizeStyles[size] || sizeStyles.md
}

type Props = Pick<ButtonProps, 'variant' | 'size' | 'rounded'>
