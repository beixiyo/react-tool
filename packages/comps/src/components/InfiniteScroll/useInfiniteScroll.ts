import { useIntersectionObserver, useScrollReachBottom } from 'hooks'
import { useCallback, useEffect, useRef, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

export interface UseInfiniteScrollOptions {
  loadMore: () => Promise<void>
  hasMore?: boolean
  mode?: 'scroll' | 'intersection'
  threshold?: number
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { loadMore, hasMore, mode = 'scroll', threshold = 50 } = options
  const [isLoading, setIsLoading] = useState(false)
  /** 使用 ref 维护加载状态，避免重复触发 */
  const loadingRef = useRef(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  /**
   * 用于 Intersection 模式的 root 元素
   * 如果 scrollerRef 不是滚动容器（不定高），则使用 null (视口)
   */
  const [obsRoot, setObsRoot] = useState<HTMLElement | null | undefined>(undefined)

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingRef.current) {
      return
    }

    loadingRef.current = true
    setIsLoading(true)
    try {
      await loadMore()
    }
    finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  }, [hasMore, loadMore])

  /** 模式 1: 触底检测 (Scroll) */
  useScrollReachBottom(
    scrollerRef,
    handleLoadMore,
    {
      threshold,
      enabled: mode === 'scroll' && hasMore && !isLoading,
    },
  )

  /** 自动探测合适的 IntersectionRoot */
  useEffect(() => {
    if (mode !== 'intersection' || !isBrowser || !scrollerRef.current) {
      return
    }

    const el = scrollerRef.current
    const style = window.getComputedStyle(el)
    const isScroll = /(auto|scroll)/.test(style.overflowY)
    // 只有当它是滚动容器且确实有内容溢出时，才作为 root
    const shouldBeRoot = isScroll && el.scrollHeight > el.clientHeight

    setObsRoot(shouldBeRoot ? el : null)
  }, [mode, isLoading, hasMore])

  /** 模式 2: 可视区域检测 (Intersection) */
  useIntersectionObserver(
    [sentinelRef],
    (entry) => {
      if (mode === 'intersection' && entry.isIntersecting) {
        handleLoadMore()
      }
    },
    {
      root: obsRoot,
      threshold: 0.01,
    },
  )

  /** 如果加载完成后，哨兵仍然在可视区域（比如返回数据太少没填满），则继续触发 */
  useEffect(() => {
    if (mode === 'intersection' && hasMore && !isLoading && sentinelRef.current && scrollerRef.current) {
      const sentinelRect = sentinelRef.current.getBoundingClientRect()

      // 如果没有指定 root (使用视口)，则检查是否在视口内
      // 如果指定了 root，检查是否在 root 底部上方
      const isVisible = obsRoot === null
        ? sentinelRect.top < (isBrowser ? window.innerHeight : 0)
        : sentinelRect.top < (scrollerRef.current?.getBoundingClientRect().bottom ?? 0)

      if (isVisible) {
        handleLoadMore()
      }
    }
  }, [isLoading, hasMore, mode, handleLoadMore, obsRoot])

  return {
    scrollerRef,
    sentinelRef,
    isLoading,
  }
}
