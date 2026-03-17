import { clamp } from '@jl-org/tool'
import { memo } from 'react'
import { cn } from 'utils'

export const ProgressBar = memo<ProgressBarProps>((
  {
    style,
    className,
    value,
    colors = ['rgb(var(--brand) / 0.1)', 'rgb(var(--brand) / 1)'],
    height = 5,
    animationDuration = 0.8,
    animationEase = 'easeOut',
  },
) => {
  const formatVal = clamp(value, 0, 1)

  /** 根据 colors 数组生成渐变背景 */
  const gradientBackground = `linear-gradient(to right, ${colors.join(', ')})`

  return <div className={ cn('ProgressBarContainer w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700', className) }>
    <div
      className={ cn('rounded-full w-full') }
      style={ {
        background: gradientBackground,
        height,
        transition: `${animationDuration}s ${animationEase}`,
        transform: `scaleX(${formatVal})`,
        transformOrigin: 'left center',
        ...style,
      } }
    />
  </div>
})

ProgressBar.displayName = 'ProgressBar'

export type ProgressBarProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  /**
   * Progress value between 0 and 1
   */
  value: number
  /**
   * 渐变颜色数组，支持多个颜色
   * @default ['rgb(var(--brand) / 0.1)', 'rgb(var(--brand) / 1)']
   */
  colors?: string[]
  /**
   * 进度条高度
   * @default 5
   */
  height?: number
  /**
   * 是否启用动画
   * @default true
   */
  animated?: boolean
  /**
   * 动画持续时间（秒）
   * @default 0.8
   */
  animationDuration?: number
  /**
   * 动画缓动函数
   * @default 'easeOut'
   */
  animationEase?: string
}
