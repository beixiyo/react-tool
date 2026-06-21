import { useIntersectionObserver, useLatestCallback, useScrollReachBottom } from 'hooks'
import { useEffect, useRef, useState } from 'react'

const isBrowser = typeof window !== 'undefined'

/**
 * 兜底再触发的最大连续次数，防止后端持续返回少量数据时形成连环请求/死循环
 */
const MAX_CONSECUTIVE_AUTO_LOADS = 30

export interface UseInfiniteScrollOptions {
  loadMore: () => Promise<void>
  hasMore?: boolean
  mode?: 'scroll' | 'intersection'
  threshold?: number
  /** 加载失败回调，失败后会暂停自动加载直至成功或重置 */
  onError?: (err: unknown) => void
}

export function useInfiniteScroll(options: UseInfiniteScrollOptions) {
  const { loadMore, hasMore, mode = 'scroll', threshold = 50, onError } = options
  const [isLoading, setIsLoading] = useState(false)
  /** 加载失败标记，置位后暂停自动续拉，避免错误风暴 */
  const [hasError, setHasError] = useState(false)
  /** 同步镜像 hasError，供同一 tick 内的重试逻辑读取最新值 */
  const errorRef = useRef(false)
  /** 使用 ref 维护加载状态，避免重复触发 */
  const loadingRef = useRef(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  /** 连续自动加载计数，超过上限则暂停兜底再触发 */
  const consecutiveAutoLoadsRef = useRef(0)

  const latestLoadMore = useLatestCallback(loadMore)
  const handleError = useLatestCallback((err: unknown) => onError?.(err))

  /**
   * 用于 Intersection 模式的 root 元素
   * 如果 scrollerRef 不是滚动容器（不定高），则使用 null (视口)
   */
  const [obsRoot, setObsRoot] = useState<HTMLElement | null | undefined>(undefined)

  const handleLoadMore = useLatestCallback(async () => {
    if (!hasMore || loadingRef.current || errorRef.current) {
      return
    }

    loadingRef.current = true
    setIsLoading(true)
    try {
      await latestLoadMore()
    }
    catch (err) {
      errorRef.current = true
      setHasError(true)
      handleError(err)
      console.error('[InfiniteScroll] loadMore failed:', err)
    }
    finally {
      loadingRef.current = false
      setIsLoading(false)
    }
  })

  /** 重置错误态与自动加载计数，供失败重试 / 数据源刷新场景调用 */
  const reset = useLatestCallback(() => {
    errorRef.current = false
    setHasError(false)
    consecutiveAutoLoadsRef.current = 0
  })

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
    /** 只有当它是滚动容器且确实有内容溢出时，才作为 root */
    const shouldBeRoot = isScroll && el.scrollHeight > el.clientHeight

    setObsRoot(shouldBeRoot
      ? el
      : null)
  }, [mode, isLoading, hasMore])

  /** 模式 2: 可视区域检测 (Intersection) */
  useIntersectionObserver(
    [sentinelRef],
    (entry) => {
      if (mode === 'intersection' && entry.isIntersecting) {
        /** 由用户滚动驱动的真实进入视口，重置连续兜底计数 */
        consecutiveAutoLoadsRef.current = 0
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
    if (mode === 'intersection' && hasMore && !isLoading && !hasError && sentinelRef.current && scrollerRef.current) {
      const sentinelRect = sentinelRef.current.getBoundingClientRect()

      /**
       * 如果没有指定 root (使用视口)，则检查是否在视口内
       * 如果指定了 root，检查是否在 root 底部上方
       */
      const isVisible = obsRoot === null
        ? sentinelRect.top < (isBrowser
          ? window.innerHeight
          : 0)
        : sentinelRect.top < (scrollerRef.current?.getBoundingClientRect().bottom ?? 0)

      if (isVisible) {
        /** 哨兵仍可见，累加连续自动加载次数，超过上限则停止兜底，防止连环请求/死循环 */
        if (consecutiveAutoLoadsRef.current < MAX_CONSECUTIVE_AUTO_LOADS) {
          consecutiveAutoLoadsRef.current += 1
          handleLoadMore()
        }
      }
      else {
        /** 哨兵已不可见，说明内容已填满或用户已停止下拉，重置连续计数 */
        consecutiveAutoLoadsRef.current = 0
      }
    }
  }, [isLoading, hasMore, mode, hasError, obsRoot])

  return {
    scrollerRef,
    sentinelRef,
    isLoading,
    hasError,
    /** 清除错误态并恢复自动加载（用于失败重试） */
    reset,
    /** 手动重试：清错后立即再拉一次 */
    retry: useLatestCallback(() => {
      reset()
      handleLoadMore()
    }),
  }
}
