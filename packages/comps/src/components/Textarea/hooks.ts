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
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  }

  /** 组合所有样式 */
  const textareaClasses = cn(
    'w-full h-full border transition-all duration-200 ease-in-out outline-hidden',
    'resize-none dark:bg-slate-900 dark:text-slate-300 rounded-xl',
    autoResize && 'overflow-y-hidden',
    sizeClasses[size],
    {
      'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900': !actualError && !disabled,
      'border-rose-500 hover:border-rose-600 focus-within:border-rose-500': actualError && !disabled,
      'border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed': disabled,
      [focusedClassName || '']: isFocused,
    },
    className,
  )

  return {
    textareaClasses,
  }
}
