/**
 * 轮播图组件常量配置
 */

/** 滑动置信度阈值，超过此值才触发切换 */
export const SWIPE_CONFIDENCE_THRESHOLD = 10000

/** 预览图动画延迟系数（秒） */
export const PREVIEW_ANIMATION_DELAY = 0.1

/** 预览图尺寸配置 */
export const PREVIEW_SIZES = {
  right: { width: '80px', height: '100px' },
  bottom: { width: '100px', height: '80px' },
} as const

/** 默认占位图 URL */
export const DEFAULT_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/800x450?text=Image+Not+Found'
export const DEFAULT_PREVIEW_PLACEHOLDER_IMAGE = 'https://via.placeholder.com/100x100?text=Preview'
