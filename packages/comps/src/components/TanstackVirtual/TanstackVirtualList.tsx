'use client'

import type { Virtualizer } from '@tanstack/react-virtual'
import type { TanstackVirtualListProps } from './types'
import { useVirtualizer } from '@tanstack/react-virtual'
import { onMounted, onUnmounted, useComposedRef } from 'hooks'
import { memo, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'

/**
 * 通用动态高度虚拟列表（基于 TanStack Virtual）
 *
 * - 自动测量行高，支持运行时高度变化（图片加载、展开等）
 * - hasMore + loadMore 实现滚动到底无限加载
 * - onVisibleRangeChange 暴露可视范围，供上层做分组级加载等编排（见 VirtualGroupList）
 *
 * 行的内容与样式完全由 children / itemClassName 注入，组件不掺杂业务
 */
function InnerTanstackVirtualList<T>(props: TanstackVirtualListProps<T>) {
  const {
    data,
    children,
    getItemKey,
    estimateSize = 64,
    overscan = 5,
    useCachedMeasurements = false,
    itemClassName,
    onItemClick,
    hasMore = false,
    loadMore,
    endReachedRemain = 0,
    showLoading = true,
    immediate = false,
    onVisibleRangeChange,
    footer,
    empty,
    contentClassName,
    scrollRef: scrollRefProp,
    listRef,
    className,
    ...rest
  } = props

  const { elementRef: scrollRef, setRef: setScrollRef } = useComposedRef<HTMLDivElement>({
    ref: scrollRefProp ?? undefined,
  })
  const [loading, setLoading] = useState(false)
  /** 同步守卫，防止 onChange 高频触发时重复发起请求 */
  const loadingRef = useRef(false)
  /** 卸载守卫，防止 loadMore 在途时组件卸载后仍 setState */
  const mountedRef = useRef(true)
  onUnmounted(() => {
    mountedRef.current = false
  })

  /**
   * 以下函数会在渲染期/layout-effect 期被 virtualizer 同步调用，
   * 必须是每次渲染新建的普通闭包：
   * - 不能用 useLatestCallback/useCallback 稳定化（其 ref 在 passive effect
   *   才更新，数据增长的当次渲染会读到旧数组导致越界）
   * - getItemKey 的引用刷新同时是 TanStack measurements memo 的失效依据
   */
  const resolveKey = (index: number) => {
    const item = data[index]
    return getItemKey
      ? getItemKey(item, index)
      : ((item as { id?: string | number })?.id ?? index)
  }

  const triggerLoadMore = () => {
    if (!hasMore || !loadMore || loadingRef.current)
      return

    loadingRef.current = true
    setLoading(true)
    loadMore().finally(() => {
      loadingRef.current = false
      if (!mountedRef.current)
        return
      setLoading(false)
    })
  }

  const handleChange = (instance: Virtualizer<HTMLDivElement, Element>) => {
    const virtualItems = instance.getVirtualItems()
    if (virtualItems.length === 0)
      return

    const first = virtualItems[0]
    const last = virtualItems[virtualItems.length - 1]
    onVisibleRangeChange?.(first.index, last.index)

    if (last.index >= data.length - 1 - endReachedRemain) {
      triggerLoadMore()
    }
  }

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    useCachedMeasurements,
    getItemKey: resolveKey,
    onChange: instance => handleChange(instance),
  })

  onMounted(() => {
    if (immediate)
      triggerLoadMore()
  })

  useImperativeHandle(listRef, () => ({
    scrollToIndex: (index, options) => virtualizer.scrollToIndex(index, options),
    scrollToOffset: (offset, options) => virtualizer.scrollToOffset(offset, options),
  }), [virtualizer])

  return (
    <div
      ref={ setScrollRef }
      className={ cn('relative overflow-y-auto', className) }
      { ...rest }
    >
      <div
        className={ cn('relative w-full', contentClassName) }
        style={ { height: virtualizer.getTotalSize() } }
      >
        { virtualizer.getVirtualItems().map((virtualRow) => {
          const item = data[virtualRow.index]
          const rowClassName = typeof itemClassName === 'function'
            ? itemClassName(item, virtualRow.index)
            : itemClassName

          return (
            <div
              key={ virtualRow.key }
              data-index={ virtualRow.index }
              ref={ virtualizer.measureElement }
              className={ cn('absolute left-0 top-0 w-full', rowClassName) }
              style={ { transform: `translateY(${virtualRow.start}px)` } }
              onClick={ onItemClick
                ? () => onItemClick(item, virtualRow.index)
                : undefined }
            >
              { children(item, virtualRow.index) }
            </div>
          )
        }) }
      </div>

      { data.length === 0 && !loading && empty }

      { loading && showLoading && (
        <div className="flex items-center justify-center py-2">
          <LoadingIcon size={ 24 } />
        </div>
      ) }

      { footer }
    </div>
  )
}

InnerTanstackVirtualList.displayName = 'TanstackVirtualList'

export const TanstackVirtualList = memo(InnerTanstackVirtualList) as typeof InnerTanstackVirtualList
