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
 * 重置图片样式
 * 注意：不修改 transition，以免覆盖 LazyImg 的 style 中由调用方控制的过渡效果
 */
export function resetImageStyles(imgElement: HTMLImageElement): void {
  imgElement.style.filter = 'none'
}
