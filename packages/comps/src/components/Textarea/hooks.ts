import type { PartRequired } from '@jl-org/ts-tool'
import type { TextareaProps } from './types'
import { cn } from 'utils'

export function useStyles(
  props: PartRequired<
    TextareaProps,
    'autoResize'
    | 'size'
    | 'disabled'
    | 'bordered'
    | 'shadowed'
    | 'className'
    | 'focusedClassName'
    | 'inputContainerClassName'
    | 'showCount'
  > & {
    actualError?: boolean
    isFocused: boolean
  },
) {
  const {
    autoResize,
    showCount,
    size,
    disabled,
    bordered,
    shadowed,
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
    /**
     * 计数器为右下角 absolute 浮层:恒定预留底部 padding 让文字永远不进入浮层区域,
     * 预留不随计数器显隐切换,高度只随内容行数变化,不产生布局跳动
     *
     * 必须放在调用方 `className` 之后:cn 的 tailwind-merge 后者胜出,
     * ChatInput 等传入的 `py-2` 会把前面的 `pb-6` 合并掉,预留就失效了
     */
    showCount && 'pb-6',
  )

  /** 容器样式 */
  const containerClasses = cn(
    'relative w-full rounded-lg',
    bordered && 'border',
    sizeStyles.className,
    {
      'bg-background': !actualError && !disabled,
      'border-border': bordered && (!actualError || disabled),
      'focus-within:ring-1 focus-within:ring-danger/20': actualError && !disabled,
      'border-danger': bordered && actualError && !disabled,
      'bg-background2 text-textDisabled cursor-not-allowed': disabled,
      'border-border2': bordered && isFocused && !actualError && !disabled,
      'hover:border-border2': bordered && !isFocused && !actualError && !disabled,
    },
    shadowed && 'shadow-card',
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
