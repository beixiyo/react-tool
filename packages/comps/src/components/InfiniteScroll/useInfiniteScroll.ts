import { useIntersectionObserver, useScrollReachBottom } from 'hooks'
import { useCallback, useEffect, useRef, useState } from 'react'

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

  /** 模式 2: 可视区域检测 (Intersection) */
  useIntersectionObserver(
    [sentinelRef],
    (entry) => {
      if (mode === 'intersection' && entry.isIntersecting) {
        handleLoadMore()
      }
    },
    {
      root: scrollerRef.current,
      threshold: 0.01,
    },
  )

  /** 如果加载完成后，哨兵仍然在可视区域（比如返回数据太少没填满），则继续触发 */
  useEffect(() => {
    if (mode === 'intersection' && hasMore && !isLoading && sentinelRef.current && scrollerRef.current) {
      const sentinelRect = sentinelRef.current.getBoundingClientRect()
      const scrollerRect = scrollerRef.current.getBoundingClientRect()
      if (sentinelRect.top < scrollerRect.bottom) {
        handleLoadMore()
      }
    }
  }, [isLoading, hasMore, mode, handleLoadMore])

  return {
    scrollerRef,
    sentinelRef,
    isLoading,
  }
}
