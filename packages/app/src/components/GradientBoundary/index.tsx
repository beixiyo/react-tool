import type { CSSProperties } from 'react'
import { cn } from '@/utils'
import { memo } from 'react'

/**
 * - 渐变边界，用于遮挡右侧边栏
 * - 父元素需要设置 position: relative
 */
export const GradientBoundary = memo<GradientBoundaryProps>((
  {
    style,
    className,
    fromColor = '#fff',
  },
) => {
  return <div
    className={ cn(
      'absolute right-0 bottom-0 h-full w-28 pointer-events-none',
      className,
    ) }
    style={ {
      backgroundImage: `linear-gradient(to left, ${fromColor}, transparent)`,
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
}
