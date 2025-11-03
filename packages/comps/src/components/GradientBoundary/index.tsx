import type { CSSProperties } from 'react'
import { memo } from 'react'
import { cn } from 'utils'

/**
 * - 渐变边界，用于遮挡边界内容
 * - 父元素需要设置 position: relative
 */
export const GradientBoundary = memo<GradientBoundaryProps>((
  {
    style,
    className,
    fromColor = '#fff',
    direction = 'left',
  },
) => {
  const getGradientDirection = () => {
    switch (direction) {
      case 'left':
        /** 左侧渐变：左侧是纯色，向右渐变到透明 */
        return 'linear-gradient(to right, {fromColor}, transparent)'
      case 'right':
        /** 右侧渐变：右侧是纯色，向左渐变到透明 */
        return 'linear-gradient(to left, {fromColor}, transparent)'
      case 'top':
        /** 顶部渐变：顶部是纯色，向下渐变到透明 */
        return 'linear-gradient(to bottom, {fromColor}, transparent)'
      case 'bottom':
        /** 底部渐变：底部是纯色，向上渐变到透明 */
        return 'linear-gradient(to top, {fromColor}, transparent)'
      default:
        return 'linear-gradient(to left, {fromColor}, transparent)'
    }
  }

  const getClassName = () => {
    switch (direction) {
      case 'left':
        return 'absolute left-0 bottom-0 h-full w-28 pointer-events-none'
      case 'right':
        return 'absolute right-0 bottom-0 h-full w-28 pointer-events-none'
      case 'top':
        return 'absolute top-0 left-0 right-0 h-28 pointer-events-none'
      case 'bottom':
        return 'absolute bottom-0 left-0 right-0 h-28 pointer-events-none'
      default:
        return 'absolute right-0 bottom-0 h-full w-28 pointer-events-none'
    }
  }

  return <div
    className={ cn(
      getClassName(),
      className,
    ) }
    style={ {
      backgroundImage: getGradientDirection().replace('{fromColor}', fromColor),
      ...style,
    } }
  >

  </div>
})

GradientBoundary.displayName = 'GradientBoundary'

export interface GradientBoundaryProps {
  className?: string
  style?: CSSProperties
  /**
   * 渐变起始颜色
   * @default #fff
   */
  fromColor?: string
  /**
   * 渐变方向
   * @default left
   */
  direction?: 'left' | 'right' | 'top' | 'bottom'
}
