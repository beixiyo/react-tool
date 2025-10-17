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
    focusedClassName,
    actualError,
    isFocused,
  } = props

  /** 尺寸样式映射 */
  const sizeClasses = {
    sm: 'px-0.5 py-0.5 text-sm',
    md: 'px-1 py-1 text-base',
    lg: 'px-1.5 py-1.5 text-lg',
  }

  /** 组合所有样式 */
  const textareaClasses = cn(
    'w-full h-full outline-hidden bg-transparent text-textPrimary',
    'transition-all duration-200 ease-in-out resize-none',
    autoResize && 'overflow-y-hidden',
    sizeClasses[size],
    disabled && 'cursor-not-allowed text-textDisabled',
    className,
  )

  /** 容器样式 */
  const containerClasses = cn(
    'relative w-full rounded-lg border',
    sizeClasses[size],
    {
      'border-border bg-background': !actualError && !disabled,
      'border-rose-500 hover:border-rose-600 focus-within:border-rose-500': actualError && !disabled,
      'border-border bg-backgroundSubtle text-textDisabled cursor-not-allowed': disabled,
      '': isFocused && !actualError && !disabled,
      'hover:border-borderStrong': !isFocused && !actualError && !disabled,
    },
    isFocused && focusedClassName,
  )

  return {
    textareaClasses,
    containerClasses,
  }
}
