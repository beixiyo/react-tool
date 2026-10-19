import type { CSSProperties } from 'react'
import type { FloatingArrowPlacement } from './base'

/** 提供箭头能力的浮层组件共享配置 */
export interface FloatingArrowOptions {
  /**
   * 箭头宽度，单位 px；不传时按 height 与默认宽高比推算
   * @default 24
   */
  size?: number
  /**
   * 箭头尖端凸出浮层边缘的高度，单位 px；不传时按 size 与默认宽高比推算
   * @default 7
   */
  height?: number
  /** 箭头中心到浮层交叉轴起始边的距离，单位 px；不传时自动对齐 reference */
  offset?: number
  /**
   * 箭头外缘与浮层交叉轴边界的最小距离，单位 px
   * @default 16
   */
  padding?: number
  /** 箭头元素类名 */
  className?: string
  /** 箭头元素样式 */
  style?: CSSProperties
  /**
   * 箭头填充色，优先于 `style.backgroundColor`
   *
   * 浮层背景不是纯色（如渐变）时传函数，按箭头实际落点算出与浮层边缘一致的颜色
   */
  fill?: CSSProperties['fill'] | ((context: FloatingArrowFillContext) => CSSProperties['fill'])
}

/** {@link FloatingArrowOptions.fill} 回调拿到的箭头落点 */
export type FloatingArrowFillContext = {
  /** 浮层相对 reference 的最终方向；箭头在其反方向的浮层边上，如 `right` 时箭头贴浮层左边 */
  placement: FloatingArrowPlacement
  /** 箭头中心到浮层交叉轴起始边的距离，单位 px */
  centerOffset: number
}

/** 箭头开关或详细配置 */
export type FloatingArrowConfig = boolean | FloatingArrowOptions

export interface ResolveFloatingOffsetOptions {
  /** 目标元素到浮层可见边缘的间距，单位 px */
  offset: number
  /** 箭头配置，关闭时不做换算 */
  arrow?: FloatingArrowConfig | null
  /**
   * 箭头压入浮层的距离，需与 FloatingArrow 的 seamOverlap 保持一致
   * @default 1
   */
  seamOverlap?: number
}
