import { genArr } from '@jl-org/tool'
import { memo } from 'react'
import { cn } from 'utils'

/**
 * 页面指示器组件
 *
 * 用于显示当前页面位置和总数量的小圆点指示器。
 * 当前激活的指示器会显示为更长的椭圆形，其他为小圆点。
 * 点击指示器可以跳转到对应的页面。
 *
 * @example
 * ```tsx
 * <Indicator
 *   activeIndex={0}
 *   length={5}
 *   onChange={(index) => console.log('跳转到页面:', index)}
 * />
 * ```
 */
export const Indicator = memo<IndicatorProps>((props) => {
  const {
    style,
    className,
    activeIndex,
    length,
    dotClassName,
    onChange,
  } = props
  // 生成索引数组 [0, 1, 2, ..., length-1]
  const arr = genArr(length, i => i)

  return (
    <div
      className={ cn(
        'IndicatorContainer',
        'absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-2 bg-background2/20 rounded-full backdrop-blur-xs',
        className,
      ) }
      style={ style }
    >
      {/* 渲染所有指示器圆点 */}
      { arr.map(index => (
        <div
          key={ index }
          onClick={ () => onChange?.(index) }
          className={ cn(
            // 基础样式：小圆点，支持过渡动画和悬停效果
            'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:bg-text/80',
            // 自定义样式类名
            dotClassName,
            // 激活状态：显示为更长的椭圆形（宽度变为 4）
            index === activeIndex
              ? 'bg-text w-4'
              : 'bg-text/50',
          ) }
        />
      )) }
    </div>
  )
})

Indicator.displayName = 'Indicator'

/**
 * Indicator 组件属性类型定义
 */
export type IndicatorProps = {
  /**
   * 当前激活的页面索引（从 0 开始）
   */
  activeIndex: number
  /**
   * 指示器总数（页面总数）
   */
  length: number
  /**
   * 自定义指示器圆点的样式类名
   */
  dotClassName?: string
  /**
   * 点击指示器时触发的回调函数
   * @param index - 被点击的指示器对应的页面索引（从 0 开始）
   */
  onChange?: (index: number) => void
}
& Omit<React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>, 'onChange'>
