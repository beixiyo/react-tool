import type { PartRequired } from '@jl-org/ts-tool'
import type { TextareaProps } from './types'
import { cn } from 'utils'

export function useStyles(
  props: PartRequired<
    TextareaProps,
    'autoResize'
    | 'size'
    | 'disabled'
    | 'className'
    | 'focusedClassName'
    | 'inputContainerClassName'
  > & {
    actualError?: boolean
    isFocused: boolean
  },
) {
  const {
    autoResize,
    size,
    disabled,
    className,
    disabledClass,
    disabledContainerClass,
    focusClass,
    focusContainerClass,
    errorClass,
    errorContainerClass,
    focusedClassName,
    inputContainerClassName,
    actualError,
    isFocused,
  } = props

  /** 尺寸样式映射 */
  const sizeClasses = {
    sm: 'px-0.5 py-0.5 text-sm',
    md: 'px-1 py-1 text-base',
    lg: 'px-1.5 py-1.5 text-lg',
  }

  /** 获取尺寸相关的样式 */
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      const padding = size * 0.1 // 根据高度计算 padding
      return {
        className: undefined,
        style: {
          padding: `${padding}px`,
          fontSize: `${size * 0.4}px`, // 根据高度计算字体大小
        },
      }
    }
    return {
      className: sizeClasses[size],
      style: undefined,
    }
  }

  const sizeStyles = getSizeStyles()

  /** 组合所有样式 */
  const textareaClasses = cn(
    'w-full h-full outline-hidden bg-transparent text-text',
    'transition-all duration-200 ease-in-out resize-none',
    autoResize && 'overflow-y-hidden',
    sizeStyles.className,
    disabled && 'cursor-not-allowed text-textDisabled',
    disabled && disabledClass,
    actualError && errorClass,
    isFocused && focusClass,
    className,
  )

  /** 容器样式 */
  const containerClasses = cn(
    'relative w-full rounded-lg border',
    sizeStyles.className,
    {
      'border-border bg-white dark:bg-neutral-900': !actualError && !disabled,
      'border-rose-500 hover:border-rose-600 focus-within:border-rose-500': actualError && !disabled,
      'border-border bg-background2 text-textDisabled cursor-not-allowed': disabled,
      'border-primary': isFocused && !actualError && !disabled,
      'hover:border-border3': !isFocused && !actualError && !disabled,
    },
    disabled && disabledContainerClass,
    actualError && errorContainerClass,
    isFocused && focusContainerClass,
    isFocused && focusedClassName,
    inputContainerClassName,
  )

  return {
    textareaClasses,
    containerClasses,
    sizeInlineStyle: sizeStyles.style,
  }
}
