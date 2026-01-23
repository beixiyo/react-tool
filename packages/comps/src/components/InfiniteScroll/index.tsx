'use client'

import type { InfiniteScrollProps } from './types'
import { memo } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'
import { useInfiniteScroll } from './useInfiniteScroll'

export const InfiniteScroll = memo<InfiniteScrollProps>((props) => {
  const {
    style,
    className,
    contentStyle,
    contentClassName,
    loadMore,
    hasMore,
    showLoading = true,
    loadingContent,
    children,
    mode = 'intersection',
    threshold,
  } = props

  const { scrollerRef, sentinelRef, isLoading } = useInfiniteScroll({
    loadMore,
    hasMore,
    mode,
    threshold,
  })

  return (
    <div
      ref={ scrollerRef }
      className={ cn(
        'overflow-auto relative scrollerContainer h-full',
        className,
      ) }
      style={ style }
    >
      <div
        style={ contentStyle }
        className={ cn(
          'relative contentContainer',
          contentClassName,
        ) }
      >
        { children }

        { /* 模式 1: 触底检测下的 Loading 展示 */ }
        { (mode === 'scroll' && isLoading && showLoading) && (
          <div className="w-full flex items-center justify-center p-4">
            { loadingContent || <LoadingIcon size={ 30 } /> }
          </div>
        ) }

        { /* 模式 2: 可视区域检测下的哨兵元素与 Loading 展示 */ }
        { /* 始终在底部显示，直到 hasMore 为 false */ }
        { mode === 'intersection' && hasMore && (
          <div
            ref={ sentinelRef }
            className="w-full flex items-center justify-center p-4 min-h-[40px]"
          >
            { loadingContent || <LoadingIcon size={ 30 } /> }
          </div>
        ) }

        { /* 兜底显示：如果正在加载但哨兵不存在（比如 hasMore 刚变 false），也显示一下 loading */ }
        { mode === 'intersection' && !hasMore && isLoading && showLoading && (
          <div className="w-full flex items-center justify-center p-4">
            { loadingContent || <LoadingIcon size={ 30 } /> }
          </div>
        ) }
      </div>
    </div>
  )
})

InfiniteScroll.displayName = 'InfiniteScroll'

export type { InfiniteScrollProps }
