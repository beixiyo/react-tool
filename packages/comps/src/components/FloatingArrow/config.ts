import type { CSSProperties } from 'react'

const DEFAULT_OPTIONS: FloatingArrowOptions = {}

/** 将箭头开关统一归一化为配置对象 */
export function resolveFloatingArrowOptions(
  arrow?: FloatingArrowConfig | null,
): FloatingArrowOptions | null {
  if (!arrow)
    return null

  return arrow === true
    ? DEFAULT_OPTIONS
    : arrow
}

/** 提供箭头能力的浮层组件共享配置 */
export interface FloatingArrowOptions {
  /**
   * 箭头宽度，单位 px
   * @default 12
   */
  size?: number
  /** 箭头中心到浮层交叉轴起始边的距离，单位 px；不传时自动对齐 reference */
  offset?: number
  /** 箭头元素类名 */
  className?: string
  /** 箭头元素样式 */
  style?: CSSProperties
}

/** 箭头开关或详细配置 */
export type FloatingArrowConfig = boolean | FloatingArrowOptions
