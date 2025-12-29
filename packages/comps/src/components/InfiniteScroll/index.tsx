'use client'

import type { CSSProperties } from 'react'
import { onMounted, useScrollReachBottom } from 'hooks'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'

export const InfiniteScroll = memo<InfiniteScrollProps>((
  {
    style,
    className,
    contentStyle,
    contentClassName,

    loadMore,
    immediate = true,
    hasMore,
    showLoading,
    children,
  },
) => {
  const [isLoading, setIsLoading] = useState(false)

  const isFirst = useRef(true)
  const refScroller = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  /** 触底加载处理 */
  const handleReachBottom = () => {
    if (!hasMore || isLoading) {
      return
    }

    setIsLoading(true)
    loadMore().finally(() => {
      isFirst.current = false
      setIsLoading(false)
    })
  }

  /** 使用触底检测 hook */
  const { getScrollSize } = useScrollReachBottom(
    refScroller as React.RefObject<HTMLElement | null>,
    handleReachBottom,
    {
      threshold: 50,
      enabled: hasMore && !isLoading,
    },
  )

  // ======================
  // * Effects
  // ======================
  /** 检查内容是否填满容器，如果没有填满且还有更多数据，则加载更多 */
  useEffect(() => {
    if (
      !refScroller.current
      || !contentRef.current
      || !hasMore
      || isLoading
      || isFirst.current
    ) {
      return
    }

    const { clientHeight, scrollHeight, isReachedBottom } = getScrollSize()
    /** 如果内容高度小于容器高度，说明内容没有填满，需要加载更多 */
    if (scrollHeight <= clientHeight && !isReachedBottom) {
      setIsLoading(true)
      loadMore().finally(() => {
        isFirst.current = false
        setIsLoading(false)
      })
    }
  }, [hasMore, isLoading, children, getScrollSize, loadMore])

  onMounted(() => {
    if (immediate && hasMore && !isLoading) {
      /** 立即检查是否需要加载 */
      const { clientHeight, scrollHeight } = getScrollSize()
      if (scrollHeight <= clientHeight) {
        setIsLoading(true)
        loadMore().finally(() => {
          isFirst.current = false
          setIsLoading(false)
        })
      }
    }
  })

  return (
    <div
      className={ cn(
        'overflow-auto relative scrollerContainer h-full',
        className,
      ) }
      style={ style }
      ref={ refScroller }
    >

      <div
        ref={ contentRef }
        style={ contentStyle }
        className={ cn(
          'relative contentContainer',
          contentClassName,
        ) }
      >
        { children }

        <div className="absolute bottom-1 left-0 w-full flex items-center justify-center">
          { isLoading && showLoading && <LoadingIcon size={ 30 } /> }
        </div>
      </div>

    </div>
  )
})

InfiniteScroll.displayName = 'InfiniteScroll'

export interface InfiniteScrollProps {
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties

  keyField?: string
  showLoading?: boolean

  loadMore: () => Promise<void>
  immediate?: boolean
  hasMore?: boolean
  children: React.ReactNode
}
