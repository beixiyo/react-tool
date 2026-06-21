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

/**
 * 生成内联占位图 data-uri（不依赖外部网络，避免外链服务失效导致死链/死循环）
 */
function createPlaceholder(width: number, height: number, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" fill="#9ca3af" font-family="sans-serif" font-size="${Math.round(height / 12)}" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** 默认占位图（内联 SVG data-uri） */
export const DEFAULT_PLACEHOLDER_IMAGE = createPlaceholder(800, 450, 'Image Not Found')
export const DEFAULT_PREVIEW_PLACEHOLDER_IMAGE = createPlaceholder(100, 100, 'Preview')
