import type { CSSProperties } from 'react'
import type { Size } from '../../types'
import { isStr } from '@jl-org/tool'
import { memo, useEffect, useRef } from 'react'
import { cn } from 'utils'

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
}

export const LoadingIcon = memo<LoadingIconProps>((
  {
    style,
    className,
    size = 'md',
    color,
    borderWidth,
  },
) => {
  const spinnerRef = useRef<HTMLDivElement>(null)

  const resolved = isStr(size)
    ? sizeMap[size]
    : size
  const resolvedBorder = borderWidth ?? Math.max(2, Math.round(resolved / 10))

  useEffect(() => {
    const el = spinnerRef.current
    if (!el)
      return

    const animation = el.animate(
      [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' },
      ],
      {
        duration: 800,
        iterations: Infinity,
        easing: 'linear',
      },
    )

    return () => {
      animation.cancel()
    }
  }, [])

  return (
    <div
      ref={ spinnerRef }
      className={ cn(
        'LoadingIconContainer rounded-full shrink-0',
        className,
      ) }
      style={ {
        width: resolved,
        height: resolved,
        border: `${resolvedBorder}px solid rgb(var(--text) / 0.12)`,
        borderTopColor: color ?? 'rgb(var(--text) / 0.5)',
        ...style,
      } }
    />
  )
})

LoadingIcon.displayName = 'LoadingIcon'

export type LoadingIconProps = {
  className?: string
  style?: CSSProperties
  /**
   * @default 'md'
   */
  size?: Size
  /**
   * 自定义旋转部分颜色
   */
  color?: string
  /**
   * 自定义边框宽度，默认根据 size 自动计算
   */
  borderWidth?: number
}
