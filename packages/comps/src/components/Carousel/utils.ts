/**
 * 轮播图工具函数
 */

/**
 * 计算切换方向
 * @param targetIndex - 目标索引
 * @param currentIndex - 当前索引
 * @returns 1 表示向右（下一张），-1 表示向左（上一张）
 */
export function calculateDirection(targetIndex: number, currentIndex: number): number {
  return targetIndex > currentIndex
    ? 1
    : -1
}

/**
 * 计算滑动力度
 * @param offset - 偏移量
 * @param velocity - 速度
 * @returns 滑动力度值
 */
export function swipePower(offset: number, velocity: number): number {
  return Math.abs(offset) * velocity
}

/**
 * 处理图片加载错误
 *
 * 幂等保护：仅在首次加载失败时替换为占位图，避免占位图本身加载失败时
 * 反复触发 onError -> setSrc 的死循环
 *
 * @param e - 图片错误事件
 * @param placeholder - 占位图 URL
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  placeholder: string,
): void {
  const target = e.target as HTMLImageElement

  /** 已经替换过占位图（或占位图自身加载失败），不再重复设置，防止死循环 */
  if (target.dataset.fallbackApplied === 'true' || target.src === placeholder) {
    return
  }

  target.dataset.fallbackApplied = 'true'
  target.src = placeholder
}

/**
 * 计算下一个索引（支持循环）
 * @param currentIndex - 当前索引
 * @param total - 总数
 * @param direction - 方向：1 表示下一张，-1 表示上一张
 * @returns 新的索引
 */
export function calculateNextIndex(
  currentIndex: number,
  total: number,
  direction: number,
): number {
  if (direction === 1) {
    return currentIndex === total - 1
      ? 0
      : currentIndex + 1
  }
  return currentIndex === 0
    ? total - 1
    : currentIndex - 1
}

/**
 * 获取预览图列表
 * @param currentIndex - 当前索引
 * @param imgs - 图片数组
 * @param previewCount - 预览图数量
 * @returns 预览图数组，包含索引和图片地址
 */
export function getPreviewImages(
  currentIndex: number,
  imgs: string[],
  previewCount: number,
): Array<{ index: number; src: string }> {
  if (imgs.length <= 1) {
    return []
  }

  const previews: Array<{ index: number; src: string }> = []
  for (let i = 1; i <= previewCount; i++) {
    const index = (currentIndex + i) % imgs.length
    previews.push({ index, src: imgs[index] })
  }
  return previews
}

/**
 * 轮播图动画变体配置
 */

/**
 * 滑动动画变体
 * 图片从左右两侧滑入，当前图片滑出
 */
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0
      ? '100%'
      : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0
      ? '100%'
      : '-100%',
    opacity: 0,
  }),
}

/**
 * 淡入淡出动画变体
 * 图片通过透明度变化实现切换效果
 */
export const fadeVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
}

/**
 * 缩放动画变体
 * 图片通过缩放和透明度变化实现切换效果
 */
export const zoomVariants = {
  enter: {
    opacity: 0,
    scale: 0.8,
  },
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.2,
  },
}

/**
 * 根据过渡类型选择对应的动画变体
 * @param transitionType - 过渡类型
 * @returns 对应的动画变体配置
 */
export function getVariants(transitionType: 'slide' | 'fade' | 'zoom' | 'continuous') {
  switch (transitionType) {
    case 'fade':
      return fadeVariants
    case 'zoom':
      return zoomVariants
    case 'slide':
    default:
      return slideVariants
  }
}

/**
 * 获取过渡动画配置
 * @param transitionType - 过渡类型
 * @param animationDuration - 动画持续时间
 * @returns 过渡动画配置
 */
export function getTransition(
  transitionType: 'slide' | 'fade' | 'zoom' | 'continuous',
  animationDuration: number,
) {
  const baseTransition = {
    opacity: { duration: animationDuration },
  }

  if (transitionType === 'slide') {
    return {
      ...baseTransition,
      x: { duration: animationDuration },
    }
  }

  if (transitionType === 'zoom') {
    return {
      ...baseTransition,
      scale: { duration: animationDuration },
    }
  }

  return baseTransition
}
