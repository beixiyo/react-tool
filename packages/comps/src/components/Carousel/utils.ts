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
  return targetIndex > currentIndex ? 1 : -1
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
 * @param e - 图片错误事件
 * @param placeholder - 占位图 URL
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  placeholder: string,
): void {
  const target = e.target as HTMLImageElement
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
    return currentIndex === total - 1 ? 0 : currentIndex + 1
  }
  return currentIndex === 0 ? total - 1 : currentIndex - 1
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
): Array<{ index: number, src: string }> {
  if (imgs.length <= 1) {
    return []
  }

  const previews = []
  for (let i = 1; i <= previewCount; i++) {
    const index = (currentIndex + i) % imgs.length
    previews.push({ index, src: imgs[index] })
  }
  return previews
}
