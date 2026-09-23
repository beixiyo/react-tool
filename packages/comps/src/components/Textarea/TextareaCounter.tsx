import { memo } from 'react'
import { cn } from 'utils'
import { useTextarea } from './TextareaContext'

export interface TextareaCounterProps {
  /**
   * 计数器文本对齐方式
   * @default 'right'
   */
  position?: 'left' | 'right'
  /**
   * 类名
   */
  className?: string
  /**
   * 自定义显示文本格式，接受当前字数和最大字数作为参数
   */
  format?: (current: number, max?: number) => React.ReactNode
  /**
   * 覆盖默认计数器颜色。传字符串时始终使用该 CSS 颜色；传函数时可按计数状态动态返回颜色
   * 返回 undefined 时沿用默认颜色规则
   */
  color?: TextareaCounterColor
}

export const TextareaCounter = memo<TextareaCounterProps>(
  ({ position = 'right', className, format, color }) => {
    const { value, maxLength, showCountFrom } = useTextarea()
    const count = value.length

    /** 未达到显示门槛时只隐藏内容，始终保留底栏高度，避免计数器出现时引发布局跳动 */
    const visible = showCountFrom == null || count >= showCountFrom

    const isNearLimit = Boolean(maxLength && count > maxLength * 0.8 && count < maxLength)
    const isAtLimit = Boolean(maxLength && count >= maxLength)
    const state: TextareaCounterState = isAtLimit
      ? 'at-limit'
      : isNearLimit
      ? 'near-limit'
      : 'default'
    const resolvedColor = typeof color === 'function'
      ? color({ current: count, max: maxLength, state })
      : color

    const defaultFormat = (current: number, max?: number) => {
      return max
        ? `${current}/${max}`
        : current
    }

    return (
      <div
        aria-hidden={ !visible }
        className={ cn(
          /** 独立底栏不覆盖可滚动文本；未达门槛时透明但继续占位，显隐使用 400ms 淡入淡出 */
          'pointer-events-none flex h-6 shrink-0 items-center px-3 text-xs transition-opacity duration-400',
          position === 'left'
            ? 'justify-start text-left'
            : 'justify-end text-right',
          visible
            ? 'opacity-100'
            : 'opacity-0',
          resolvedColor == null && {
            'text-text3': state === 'default',
            'text-warning': state === 'near-limit',
            'text-danger': state === 'at-limit',
          },
          className,
        ) }
        style={ resolvedColor == null
          ? undefined
          : { color: resolvedColor } }
      >
        { format
          ? format(count, maxLength)
          : defaultFormat(count, maxLength) }
      </div>
    )
  },
)

TextareaCounter.displayName = 'TextareaCounter'

export type TextareaCounterState = 'default' | 'near-limit' | 'at-limit'

export type TextareaCounterColorContext = {
  current: number
  max?: number
  state: TextareaCounterState
}

export type TextareaCounterColor = string | ((context: TextareaCounterColorContext) => string | undefined)
