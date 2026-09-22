import { memo } from 'react'
import { cn } from 'utils'
import { useTextarea } from './TextareaContext'

export interface TextareaCounterProps {
  /**
   * 计数器停靠边(输入框内部浮层)
   * @default 'right'
   */
  position?: 'left' | 'right'
  /**
   * 类名,覆盖默认停靠位置与配色
   */
  className?: string
  /**
   * 自定义显示文本格式，接受当前字数和最大字数作为参数
   */
  format?: (current: number, max?: number) => React.ReactNode
}

export const TextareaCounter = memo<TextareaCounterProps>(
  ({ position = 'right', className, format }) => {
    const { value, maxLength, showCountFrom } = useTextarea()
    const count = value.length

    /** 显示门槛:字数未达到 `showCountFrom` 时不渲染(「接近上限才提醒」交互) */
    if (showCountFrom != null && count < showCountFrom) {
      return null
    }

    const isNearLimit = maxLength && count > maxLength * 0.8 && count < maxLength
    const isAtLimit = maxLength && count >= maxLength

    const defaultFormat = (current: number, max?: number) => {
      return max
        ? `${current}/${max}`
        : current
    }

    return (
      <div
        className={ cn(
          /** 浮层定位:不占流内高度,出现 / 消失不引起输入区布局跳动 */
          'pointer-events-none absolute bottom-1.5 text-xs',
          position === 'left' 
		? 'left-3' 
		: 'right-3',
          {
            'text-text3': !isNearLimit && !isAtLimit,
            'text-warning': isNearLimit,
            'text-danger': isAtLimit,
          },
          className,
        ) }
      >
        { format
          ? format(count, maxLength)
          : defaultFormat(count, maxLength) }
      </div>
    )
  },
)

TextareaCounter.displayName = 'TextareaCounter'
