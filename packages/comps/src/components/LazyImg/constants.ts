/**
 * WeakMap 用于存储 Observer 需要的数据 (主要是 src)
 */
export const observerMap = new WeakMap<HTMLImageElement, { src: string }>()

/**
 * 全局缓存：记录已经加载过的图片 URL，避免重复播放动画
 */
export const loadedImageCache = new Set<string>()

/** loadedImageCache 容量上限，防止长会话下按 URL 无界增长（data URL 场景可达 MB 级） */
const LOADED_IMAGE_CACHE_LIMIT = 1000

/**
 * 记录已加载的图片 URL，超出上限时淘汰最早插入的记录（Set 迭代序即插入序）
 */
export function addLoadedImage(src: string): void {
  if (loadedImageCache.has(src))
    return

  if (loadedImageCache.size >= LOADED_IMAGE_CACHE_LIMIT) {
    const oldest = loadedImageCache.values().next().value
    if (oldest !== undefined) {
      loadedImageCache.delete(oldest)
    }
  }

  loadedImageCache.add(src)
}

/**
 * IntersectionObserver 实例，用于懒加载图片。
 * 懒初始化以兼容 SSR 环境（服务端无 IntersectionObserver）
 */
let _ob: IntersectionObserver | null = null

export function getOb(): IntersectionObserver {
  if (!_ob) {
    _ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting)
            return

          const imgEl = entry.target as HTMLImageElement
          const data = observerMap.get(imgEl)

          if (data) {
            /**
             * 当图片进入视口时，设置其 src 属性，触发浏览器加载
             * 后续的状态更新由 imgEl 的 onLoad 和 onError 事件处理
             */
            imgEl.src = data.src

            /** 处理完后取消观察并清理 Map */
            _ob!.unobserve(imgEl)
            observerMap.delete(imgEl)
          }
        })
      },
      {
        threshold: 0.01, // 元素可见 1% 时触发
        rootMargin: '20px', // 预加载范围扩大 20px
      },
    )
  }
  return _ob
}
