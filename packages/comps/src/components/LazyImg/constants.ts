/**
 * WeakMap 用于存储 Observer 需要的数据 (主要是 src)
 */
export const observerMap = new WeakMap<HTMLImageElement, { src: string }>()

/**
 * 全局缓存：记录已经加载过的图片 URL，避免重复播放动画
 */
export const loadedImageCache = new Set<string>()

/**
 * IntersectionObserver 实例，用于懒加载图片
 */
export const ob = new IntersectionObserver(
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
        ob.unobserve(imgEl)
        observerMap.delete(imgEl)
      }
    })
  },
  {
    threshold: 0.01, // 元素可见 1% 时触发
    rootMargin: '20px', // 预加载范围扩大 20px
  },
)
