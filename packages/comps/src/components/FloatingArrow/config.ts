import type { CSSProperties } from 'react'

/** 箭头默认宽度，单位 px；高度固定为宽度的一半 */
export const DEFAULT_FLOATING_ARROW_SIZE = 12
/** 箭头默认压入浮层的距离，单位 px，用于消除亚像素接缝 */
export const DEFAULT_FLOATING_ARROW_SEAM_OVERLAP = 1

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

/**
 * 箭头尖端超出浮层边缘的可见距离，单位 px
 *
 * 箭头高度为宽度一半，再扣除压入浮层的接缝重叠；关闭箭头时为 0
 */
export function getFloatingArrowProtrusion(
  arrow?: FloatingArrowConfig | null,
  seamOverlap = DEFAULT_FLOATING_ARROW_SEAM_OVERLAP,
): number {
  const options = resolveFloatingArrowOptions(arrow)
  if (!options)
    return 0

  const size = options.size ?? DEFAULT_FLOATING_ARROW_SIZE
  return Math.max(size / 2 - seamOverlap, 0)
}

/**
 * 把「目标元素到浮层可见边缘」的间距换算为定位用的主轴偏移
 *
 * 设计稿标注的间距以可见边缘为准：开启箭头时是箭头尖端，
 * 关闭箭头时是面板边缘。定位 Hook 只认面板边缘，因此开启箭头时
 * 需要把箭头凸出的部分加回去，保证两种状态下视觉间距一致
 */
export function resolveFloatingOffset(options: ResolveFloatingOffsetOptions): number {
  const {
    offset,
    arrow,
    seamOverlap,
  } = options

  return offset + getFloatingArrowProtrusion(arrow, seamOverlap)
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
  /**
   * 箭头外缘与浮层交叉轴边界的最小距离，单位 px
   * @default 16
   */
  padding?: number
  /** 箭头元素类名 */
  className?: string
  /** 箭头元素样式 */
  style?: CSSProperties
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
