/**
 * Arrow 组件类型声明
 */
import type { CSSProperties } from 'react'

export type ArrowDirection = 'up' | 'right' | 'down' | 'left'

export interface ArrowProps {
  className?: string
  style?: CSSProperties

  color?: string
  size?: number
  thickness?: number
  rotate?: number
  /**
   * 箭头方向，优先级高于rotate属性
   * @default undefined - 使用rotate属性
   */
  direction?: ArrowDirection
}
