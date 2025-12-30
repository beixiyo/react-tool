import { loadedImageCache } from './constants'

/**
 * 检查图片是否已经在缓存中加载过
 */
export function isImageLoaded(src: string): boolean {
  return loadedImageCache.has(src)
}

/**
 * 标记图片为已加载
 */
export function markImageAsLoaded(src: string): void {
  loadedImageCache.add(src)
}

/**
 * 检查图片元素是否已经在浏览器缓存中加载完成
 */
export function isImageElementComplete(imgElement: HTMLImageElement, src: string): boolean {
  return imgElement.complete && imgElement.naturalWidth > 0 && imgElement.src === src
}

/**
 * 应用加载完成的动画效果（blur out）
 */
export function applyLoadAnimation(imgElement: HTMLImageElement): void {
  imgElement.style.filter = 'blur(5px)'
  imgElement.style.transition = '.2s'

  setTimeout(() => {
    imgElement.style.filter = 'none'
  }, 200)
}

/**
 * 清除图片样式，跳过动画直接显示
 */
export function skipAnimation(imgElement: HTMLImageElement): void {
  imgElement.style.filter = 'none'
  imgElement.style.transition = 'none'
}

/**
 * 重置图片样式
 */
export function resetImageStyles(imgElement: HTMLImageElement): void {
  imgElement.style.filter = 'none'
  imgElement.style.transition = 'none'
}
