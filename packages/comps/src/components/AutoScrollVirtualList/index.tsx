'use client'

import { isToBottom } from '@jl-org/tool'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'

const InnerAutoScrollVirtualList = forwardRef<AutoScrollVirtualListRef, AutoScrollVirtualListProps<any>>((
  {
    data,
    children,
    itemHeight = 40,
    estimateItemHeight,
    overscan = 5,

    autoScroll = true,
    smooth = true,
    scrollBottomThreshold = 5,

    hasMore = false,
    showLoading = false,
    loadMore,
    loadMoreThreshold = 50,

    className,
    contentClassName,
    style,
    ...rest
  },
  ref,
) => {
  const [renderData, setRenderData] = useState<any[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [offsetTop, setOffsetTop] = useState(0)
  const [offsetBottom, setOffsetBottom] = useState(0)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(autoScroll)

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const heightCacheRef = useRef<Record<string, number>>({})
  const totalHeightRef = useRef(0)
  const isDownScrollRef = useRef(true)
  const shouldAutoScrollRef = useRef(autoScroll)
  const visibleRangeRef = useRef({ start: 0, end: 0 })

  const setAutoScrollState = (value: boolean) => {
    shouldAutoScrollRef.current = value
    setShouldAutoScroll(value)
  }

  const isLoadingRef = useRef(false)
  const loadingElRef = useRef<HTMLDivElement>(null)
  const loadingHeightRef = useRef(0)
  const prevShowLoadingRef = useRef(showLoading)

  const prevFirstIdRef = useRef<string | undefined>(data[0]?.id)
  const prevDataLenRef = useRef(data.length)

  const getLoadingHeight = (): number => {
    return loadingElRef.current?.offsetHeight || 0
  }

  const getItemId = (index: number): string => {
    return data[index]?.id || `__idx_${index}`
  }

  const getItemHeight = (index: number): number => {
    return heightCacheRef.current[getItemId(index)]
      || estimateItemHeight?.(data[index], index)
      || itemHeight
  }

  const calculateTotalHeight = () => {
    let height = 0
    for (let i = 0; i < data.length; i++) {
      height += getItemHeight(i)
    }
    return height
  }

  const calculateOffsetForIndex = (index: number): number => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i)
    }
    return offset
  }

  const calculateRenderedHeight = (start: number, end: number): number => {
    let h = 0
    for (let i = start; i < end; i++) {
      h += getItemHeight(i)
    }
    return h
  }

  const updateVisibleData = (scrollTop: number) => {
    const effectiveScrollTop = Math.max(0, scrollTop - getLoadingHeight())

    let currentOffset = 0
    let visibleStartIndex = 0

    for (let i = 0; i < data.length; i++) {
      const height = getItemHeight(i)
      if (currentOffset + height > effectiveScrollTop) {
        visibleStartIndex = i
        break
      }
      currentOffset += height
    }

    const start = Math.max(0, visibleStartIndex - overscan)
    const visibleCount = Math.ceil(
      (scrollRef.current?.clientHeight || 0) / itemHeight,
    )
    const end = Math.min(data.length, visibleStartIndex + visibleCount + overscan)

    const top = calculateOffsetForIndex(start)
    const renderedH = calculateRenderedHeight(start, end)
    const total = totalHeightRef.current
    const bottom = Math.max(0, total - top - renderedH)

    if (start === visibleRangeRef.current.start && end === visibleRangeRef.current.end) {
      return
    }

    visibleRangeRef.current = { start, end }
    setStartIndex(start)
    setRenderData(data.slice(start, end))
    setOffsetTop(top)
    setOffsetBottom(bottom)
  }

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el)
      return

    const { scrollHeight, clientHeight } = el
    if (scrollHeight > clientHeight) {
      el.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: smooth
          ? 'smooth'
          : 'instant',
      })
    }
  }, [smooth])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    isDownScrollRef.current = e.deltaY > 0
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current)
      return

    const { scrollTop } = scrollRef.current

    updateVisibleData(scrollTop)

    if (!isDownScrollRef.current) {
      setAutoScrollState(false)
    }
    else if (isToBottom(scrollRef.current, scrollBottomThreshold)) {
      setAutoScrollState(autoScroll)
    }

    if (
      hasMore
      && !isLoadingRef.current
      && scrollTop <= loadMoreThreshold
    ) {
      isLoadingRef.current = true
      loadMore?.()
    }
  }

  useEffect(() => {
    if (!showLoading) {
      isLoadingRef.current = false
    }
  }, [showLoading])

  useEffect(() => {
    totalHeightRef.current = calculateTotalHeight()

    const currentScroll = scrollRef.current?.scrollTop
    const clientH = scrollRef.current?.clientHeight || 0
    const targetScroll = shouldAutoScrollRef.current && currentScroll === 0
      ? Math.max(0, totalHeightRef.current - clientH)
      : (currentScroll || 0)

    updateVisibleData(targetScroll)
  }, [data])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el)
      return

    const firstId = data[0]?.id
    const prepended = data.length > prevDataLenRef.current && firstId !== prevFirstIdRef.current

    if (prepended && !shouldAutoScrollRef.current) {
      const prependedCount = data.length - prevDataLenRef.current
      let prependedHeight = 0
      for (let i = 0; i < prependedCount; i++) {
        prependedHeight += getItemHeight(i)
      }
      el.scrollTop += prependedHeight
    }

    prevFirstIdRef.current = firstId
    prevDataLenRef.current = data.length
  }, [data])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el)
      return

    let changed = false
    itemsRef.current.forEach((element, index) => {
      const actualIndex = startIndex + index
      const id = getItemId(actualIndex)
      const measured = element.offsetHeight
      if (measured && heightCacheRef.current[id] !== measured) {
        heightCacheRef.current[id] = measured
        changed = true
      }
    })

    if (changed) {
      totalHeightRef.current = calculateTotalHeight()
    }

    if (shouldAutoScrollRef.current && !isToBottom(el, scrollBottomThreshold)) {
      el.scrollTo({ top: el.scrollHeight - el.clientHeight, behavior: 'instant' })
    }
  }, [renderData])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el)
      return

    if (showLoading && !prevShowLoadingRef.current) {
      const h = loadingElRef.current?.offsetHeight || 0
      loadingHeightRef.current = h
      el.scrollTop += h
    }
    else if (!showLoading && prevShowLoadingRef.current) {
      el.scrollTop -= loadingHeightRef.current
      loadingHeightRef.current = 0
    }
    prevShowLoadingRef.current = showLoading
  }, [showLoading])

  useEffect(() => {
    setAutoScrollState(autoScroll)
  }, [autoScroll])

  useImperativeHandle(ref, () => ({
    scrollToBottom,
    setAutoScroll: (enabled: boolean) => {
      setAutoScrollState(enabled)
      isDownScrollRef.current = enabled
    },
    isAutoScrolling: () => shouldAutoScrollRef.current,
    getScrollElement: () => scrollRef.current,
  }))

  return (
    <div
      ref={ scrollRef }
      className={ cn('overflow-y-auto overflow-x-hidden relative', className) }
      style={ { overflowAnchor: 'none', ...style } }
      onScroll={ handleScroll }
      onWheel={ handleWheel }
      { ...rest }
    >
      { showLoading && (
        <div
          ref={ loadingElRef }
          className="sticky top-0 z-10 flex items-center justify-center py-3"
        >
          <LoadingIcon size={ 24 } />
        </div>
      ) }

      <div
        ref={ contentRef }
        className={ contentClassName }
        style={ {
          paddingTop: `${offsetTop}px`,
          paddingBottom: `${offsetBottom}px`,
          width: '100%',
          flexShrink: 0,
        } }
      >
        { renderData.map((item, index) => (
          <div
            key={ item.id || startIndex + index }
            ref={ (el) => {
              if (el) {
                itemsRef.current.set(index, el)
              }
              else {
                itemsRef.current.delete(index)
              }
            } }
            style={ { display: 'flow-root', overflowAnchor: 'auto' } }
          >
            { children(item, startIndex + index) }
          </div>
        )) }
      </div>
    </div>
  )
})

/**
 * 带自动滚动的动态高度虚拟列表
 * - 仅渲染可见区域 + overscan 缓冲，适合大量数据
 * - 自动滚动到底部（新内容追加时）
 * - 用户向上滚动时暂停自动滚动，回到底部后恢复
 * - 向上滚动到顶部时触发 loadMore 加载历史
 * - 使用 CSS overflow-anchor 实现原生滚动锚定，无抖动
 */
export const AutoScrollVirtualList = memo(InnerAutoScrollVirtualList) as AutoScrollVirtualListComponent

AutoScrollVirtualList.displayName = 'AutoScrollVirtualList'

export type AutoScrollVirtualListRef = {
  /** 滚动到底部 */
  scrollToBottom: () => void
  /** 设置是否自动滚动 */
  setAutoScroll: (enabled: boolean) => void
  /** 当前是否处于自动滚动状态 */
  isAutoScrolling: () => boolean
  /** 获取滚动容器 DOM 元素 */
  getScrollElement: () => HTMLDivElement | null
}

export type AutoScrollVirtualListProps<T extends { id?: string }> = {
  /** 要渲染的数据数组 */
  data: T[]
  /** 渲染每个项目的函数 */
  children: (item: T, index: number) => React.ReactNode
  /**
   * 项目的估计高度（像素），用于未测量项的初始计算
   * @default 40
   */
  itemHeight?: number
  /**
   * 按 item 动态估算高度，优先级高于 itemHeight
   */
  estimateItemHeight?: (item: T, index: number) => number
  /**
   * 可视区域外额外渲染的项目数量，防止快速滚动白屏
   * @default 5
   */
  overscan?: number

  /**
   * 是否自动滚动至底部
   * @default true
   */
  autoScroll?: boolean
  /**
   * 是否使用平滑滚动
   * @default true
   */
  smooth?: boolean
  /**
   * 滚动到底判断阈值（px）
   * @default 5
   */
  scrollBottomThreshold?: number

  /**
   * 是否有更多数据可加载（向上）
   * @default false
   */
  hasMore?: boolean
  /**
   * 展示顶部加载指示器（纯受控）
   * @default false
   */
  showLoading?: boolean
  /**
   * 滚动到顶部时触发的加载回调
   */
  loadMore?: () => void
  /**
   * 触发 loadMore 的滚动阈值（px），scrollTop <= 此值时触发
   * @default 50
   */
  loadMoreThreshold?: number

  className?: string
  contentClassName?: string
  style?: React.CSSProperties
}
& Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'children'
>

interface AutoScrollVirtualListComponent {
  <T extends { id?: string }>(
    props: AutoScrollVirtualListProps<T> & React.RefAttributes<AutoScrollVirtualListRef>,
  ): React.ReactNode
  displayName?: string
}
