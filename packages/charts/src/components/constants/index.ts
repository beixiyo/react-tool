import type { Easing } from 'motion'

/**
 * 默认图表外层容器的比例
 */
export const DEFAULT_CHART_ASPECT_RATIO = '2 / 1'

export const BAR_EASING = 'cubic-bezier(0.85, 0, 0.15, 1)'
export const BAR_EASING_ARR = BAR_EASING
  .replace(/cubic-bezier|\(|\)/g, '')
  .split(', ')
  .map(Number) as unknown as Easing[]

/** 十字准线的弹簧配置 */
export const CROSSHAIR_SPRING_CONFIG = { stiffness: 300, damping: 30 }

/** 平滑提示框移动的弹簧配置 */
export const TOOLTIP_SPRING_CONFIG = { stiffness: 100, damping: 20 }

/**
 * 默认图表动画持续时间（毫秒）
 */
export const DEFAULT_ANIMATION_DURATION = 1100

/**
 * 默认图表边距
 */
export const DEFAULT_CHART_MARGIN = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
}
