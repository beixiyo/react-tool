'use client'

import type { CSSProperties } from 'react'
import { rafThrottle } from '@jl-org/tool'
import { onMounted, useMemoFn } from 'hooks'
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

  /***************************************************
   *                    Fns
   ***************************************************/
  const getSize = useMemoFn((threshold = 50) => {
    if (!refScroller.current || !contentRef.current) {
      return {
        scrollTop: 0,
        clientHeight: 0,
        scrollHeight: 0,
        isReachedBottom: false,
      }
    }

    const scrollTop = refScroller.current.scrollTop
    const clientHeight = refScroller.current.clientHeight
    const scrollHeight = refScroller.current.scrollHeight

    /** 检查是否触底：滚动位置 + 可视高度 >= 总高度 - 阈值 */
    const isReachedBottom = scrollTop + clientHeight >= scrollHeight - threshold

    return {
      scrollTop,
      clientHeight,
      scrollHeight,
      isReachedBottom,
    }
  })

  const onScroll = rafThrottle(() => {
    if (
      !hasMore
      || isLoading
      || !refScroller.current
      || !contentRef.current
    ) {
      return
    }

    const { isReachedBottom } = getSize()
    if (isReachedBottom) {
      setIsLoading(true)

      loadMore().finally(() => {
        isFirst.current = false
        setIsLoading(false)
      })
    }
  })

  /***************************************************
   *                    Effects
   ***************************************************/
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

    const { clientHeight, scrollHeight, isReachedBottom } = getSize()
    /** 如果内容高度小于容器高度，说明内容没有填满，需要加载更多 */
    if (scrollHeight <= clientHeight && !isReachedBottom) {
      setIsLoading(true)
      loadMore().finally(() => {
        isFirst.current = false
        setIsLoading(false)
      })
    }
  }, [hasMore, isLoading, children, getSize, loadMore])

  onMounted(() => {
    if (immediate && hasMore && !isLoading) {
      /** 立即检查是否需要加载 */
      const { clientHeight, scrollHeight } = getSize()
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
      onScroll={ onScroll }
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
