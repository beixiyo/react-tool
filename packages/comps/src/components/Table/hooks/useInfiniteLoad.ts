import type { TableProps } from '../types'
import { useScrollReachBottom } from 'hooks'
import { useCallback, useEffect, useRef, useState } from 'react'

export type UseInfiniteLoadOptions = {
  enabled: boolean
  hasMore: boolean
  loadMore?: () => Promise<void>
  container: HTMLDivElement | null
  getScrollSize: () => {
    clientHeight: number
    scrollHeight: number
    isReachedBottom: boolean
  }
  dataLength: number
} & Pick<TableProps<unknown>, 'scrollReachBottomThreshold'>

/**
 * 处理无限滚动加载的 Hook
 * 统一管理触底加载、内容填满检查和初始加载逻辑
 */
export function useInfiniteLoad({
  enabled,
  hasMore,
  loadMore,
  container,
  getScrollSize,
  dataLength,
  scrollReachBottomThreshold = 50,
}: UseInfiniteLoadOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const isFirstLoadRef = useRef(true)

  /** 执行加载更多 */
  const executeLoadMore = useCallback(async () => {
    if (!hasMore || isLoading || !loadMore) {
      return
    }

    setIsLoading(true)
    try {
      await loadMore()
    }
    finally {
      isFirstLoadRef.current = false
      setIsLoading(false)
    }
  }, [hasMore, isLoading, loadMore])

  /** 触底加载处理 */
  const handleReachBottom = useCallback(() => {
    executeLoadMore()
  }, [executeLoadMore])

  const { getScrollSize: getScrollSizeFromHook } = useScrollReachBottom(
    { current: container } as React.RefObject<HTMLElement | null>,
    handleReachBottom,
    {
      threshold: scrollReachBottomThreshold,
      enabled: enabled && !!loadMore && hasMore && !isLoading,
    },
  )

  /** 统一的滚动大小获取函数 */
  const getScrollSizeFn = getScrollSize || getScrollSizeFromHook

  /** 检查是否需要加载更多（内容未填满容器） */
  useEffect(() => {
    if (
      !container
      || !enabled
      || !loadMore
      || !hasMore
      || isLoading
      || isFirstLoadRef.current
    ) {
      return
    }

    const { clientHeight, scrollHeight, isReachedBottom } = getScrollSizeFn()
    /** 如果内容高度小于容器高度，说明内容没有填满，需要加载更多 */
    if (scrollHeight <= clientHeight && !isReachedBottom) {
      executeLoadMore()
    }
  }, [container, enabled, loadMore, hasMore, isLoading, dataLength, getScrollSizeFn, executeLoadMore])

  /** 初始加载检查 */
  useEffect(() => {
    if (!container || !enabled || !loadMore || !hasMore || isLoading) {
      return
    }

    const { clientHeight, scrollHeight } = getScrollSizeFn()
    if (scrollHeight <= clientHeight && isFirstLoadRef.current) {
      executeLoadMore()
    }
  }, [container, enabled, loadMore, hasMore, isLoading, getScrollSizeFn, executeLoadMore])

  return {
    isLoading,
  }
}
