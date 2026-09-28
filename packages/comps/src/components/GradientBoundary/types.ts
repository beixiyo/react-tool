import type { CSSProperties } from 'react'

export interface GradientBoundaryProps {
  className?: string
  style?: CSSProperties
  /**
   * 渐变起始颜色
   * @default 'rgb(var(--background) / 1)'
   */
  fromColor?: string
  /**
   * 渐变方向
   * @default left
   */
  direction?: 'left' | 'right' | 'top' | 'bottom'
}
