'use client'

import type { VirtualItem, Virtualizer } from '@tanstack/react-virtual'
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual'
import { onMounted, onUnmounted, useComposedRef } from 'hooks'
import type { Transition } from 'motion/react'
import { AnimatePresence, LayoutGroup, motion, usePresence, useReducedMotion } from 'motion/react'
import type { AnimationEvent, DragEvent, ReactNode } from 'react'
import { memo, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { INTERNAL_DATA_ATTR } from '../../constants/dataAttributes'
import { LoadingIcon } from '../Loading/LoadingIcon'
import { clampPersistentProjectionToViewport, resolveLayoutExit, resolveLayoutInitial } from './layoutAnimation'
import type { LayoutPresenceState, PersistentProjection } from './layoutAnimation'
import type { TanstackVirtualListProps } from './types'

const DEFAULT_LAYOUT_ANIMATE = { opacity: 1 } as const
const IMMEDIATE_LAYOUT_EXIT = {
  opacity: 1,
  transition: { duration: 0 },
} as const

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
    layoutAnimation,
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
    onAnimationStart,
    onAnimationStartCapture,
    onDrag,
    onDragCapture,
    onDragEnd,
    onDragEndCapture,
    onDragStart,
    onDragStartCapture,
    ...rest
  } = props

  const { elementRef: scrollRef, setRef: setScrollRef } = useComposedRef<HTMLDivElement>({
    ref: scrollRefProp ?? undefined,
  })
  const [loading, setLoading] = useState(false)
  const layoutGroupId = useId()
  const reduceMotion = useReducedMotion()
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

  const dataKeys = useMemo(
    () =>
      data.map((item, index) =>
        getItemKey
          ? getItemKey(item, index)
          : ((item as { id?: string | number })?.id ?? index)
      ),
    [data, getItemKey],
  )
  const dataKeySet = useMemo(() => new Set(dataKeys), [dataKeys])
  const dataKeySignature = useMemo(() => JSON.stringify(dataKeys), [dataKeys])
  const previousDataKeySignatureRef = useRef(dataKeySignature)
  const dataStructureChanged = previousDataKeySignatureRef.current !== dataKeySignature
  const dataLayoutIds = useMemo(
    () =>
      layoutAnimation?.getLayoutId
        ? data.map((item, index) => layoutAnimation.getLayoutId?.(item, index))
        : [],
    [data, layoutAnimation],
  )
  const dataLayoutIdSet = useMemo(
    () => new Set(dataLayoutIds.filter((layoutId) => layoutId !== undefined)),
    [dataLayoutIds],
  )
  const persistentIndexes = useMemo(() => {
    if (!layoutAnimation?.shouldKeepMounted) return []

    return data.reduce<number[]>((indexes, item, index) => {
      if (layoutAnimation.shouldKeepMounted?.(item, index)) indexes.push(index)

      return indexes
    }, [])
  }, [data, layoutAnimation])
  const persistentIndexSet = useMemo(
    () => new Set(persistentIndexes),
    [persistentIndexes],
  )
  const previousDataKeysRef = useRef<ReadonlySet<string | number>>(dataKeySet)
  const previousLayoutIdsRef = useRef<ReadonlySet<string>>(dataLayoutIdSet)
  const persistentProjectionRef = useRef(new Map<string | number, PersistentProjection>())

  useLayoutEffect(() => {
    previousDataKeySignatureRef.current = dataKeySignature
    previousDataKeysRef.current = dataKeySet
    previousLayoutIdsRef.current = dataLayoutIdSet

    for (const rowKey of persistentProjectionRef.current.keys()) {
      if (!dataKeySet.has(rowKey)) persistentProjectionRef.current.delete(rowKey)
    }
  }, [dataKeySet, dataKeySignature, dataLayoutIdSet])

  const triggerLoadMore = () => {
    if (!hasMore || !loadMore || loadingRef.current) return

    loadingRef.current = true
    setLoading(true)
    loadMore().finally(() => {
      loadingRef.current = false
      if (!mountedRef.current) return
      setLoading(false)
    })
  }

  const handleChange = (instance: Virtualizer<HTMLDivElement, Element>) => {
    if (!instance.range) return

    /**
     * rangeExtractor 可能额外挂载离屏结构行；可视范围和加载判断必须继续只看
     * TanStack 原始范围（含 overscan），否则常驻的末尾分组头会误触发加载更多
     */
    const visibleIndexes = defaultRangeExtractor({
      ...instance.range,
      count: data.length,
      overscan: instance.options.overscan,
    })
    if (visibleIndexes.length === 0) return

    const firstIndex = visibleIndexes[0]
    const lastIndex = visibleIndexes[visibleIndexes.length - 1]
    onVisibleRangeChange?.(firstIndex, lastIndex)

    if (lastIndex >= data.length - 1 - endReachedRemain) {
      triggerLoadMore()
    }
  }

  const rangeExtractor = (range: Parameters<typeof defaultRangeExtractor>[0]) => {
    const indexes = defaultRangeExtractor(range)
    if (persistentIndexes.length === 0) return indexes

    return [...new Set([...indexes, ...persistentIndexes])]
      .sort((first, second) => first - second)
  }

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    useCachedMeasurements,
    getItemKey: resolveKey,
    rangeExtractor: persistentIndexes.length > 0
      ? rangeExtractor
      : defaultRangeExtractor,
    onChange: (instance) => handleChange(instance),
  })

  onMounted(() => {
    if (immediate) triggerLoadMore()
  })

  useImperativeHandle(listRef, () => ({
    scrollToIndex: (index, options) => virtualizer.scrollToIndex(index, options),
    scrollToOffset: (offset, options) => virtualizer.scrollToOffset(offset, options),
  }), [virtualizer])

  const virtualItems = virtualizer.getVirtualItems()
  const presenceState: LayoutPresenceState = {
    presentKeys: dataKeySet,
    presentLayoutIds: dataLayoutIdSet,
  }
  const animationTransition = layoutAnimation?.transition as
    | (
      Transition & { height?: Transition; layout?: Transition }
    )
    | undefined
  const layoutTransition = animationTransition?.layout
  const defaultGroupDuration = layoutTransition?.visualDuration
    ?? layoutTransition?.duration
    ?? 0.3
  const heightTransition = animationTransition?.height ?? {
    type: 'tween',
    duration: defaultGroupDuration,
    ease: 'easeInOut',
  }
  const groupDuration = heightTransition.visualDuration
    ?? heightTransition.duration
    ?? defaultGroupDuration
  const groupTransition = {
    ...(animationTransition ?? {}),
    height: layoutAnimation?.animateSizeChanges === false && !dataStructureChanged
      ? { duration: 0 }
      : heightTransition,
  }

  const animatedRows: AnimatedVirtualRow<T>[] = layoutAnimation
    ? virtualItems.map((virtualRow) => {
      const item = data[virtualRow.index]
      const rowKey = virtualRow.key as string | number

      return {
        virtualRow,
        item,
        rowKey,
        anchorKey: layoutAnimation.getAnimationAnchorKey?.(item, virtualRow.index),
      }
    })
    : []
  const anchorRows = animatedRows
    .filter((row) => row.anchorKey === row.rowKey)
    .sort((first, second) => first.virtualRow.start - second.virtualRow.start)
  const anchorKeySet = new Set(anchorRows.map((row) => row.rowKey))
  const groupedRows = new Map<string | number, AnimatedVirtualRow<T>[]>()
  const directAnimatedRows: AnimatedVirtualRow<T>[] = []

  for (const row of animatedRows) {
    if (
      row.anchorKey !== undefined
      && row.anchorKey !== row.rowKey
      && anchorKeySet.has(row.anchorKey)
    ) {
      const groupRows = groupedRows.get(row.anchorKey) ?? []
      groupRows.push(row)
      groupedRows.set(row.anchorKey, groupRows)
    }
    else {
      directAnimatedRows.push(row)
    }
  }

  const renderAnimatedRow = (
    row: AnimatedVirtualRow<T>,
    top: number,
    isGroupedContent: boolean,
  ) => {
    const {
      virtualRow,
      item,
      rowKey,
    } = row
    const rowClassName = typeof itemClassName === 'function'
      ? itemClassName(item, virtualRow.index)
      : itemClassName
    const isAddedDataItem = !previousDataKeysRef.current.has(rowKey)
    const isPersistentRow = persistentIndexSet.has(virtualRow.index)
    const layoutId = dataLayoutIds[virtualRow.index]
    /**
     * 滚动期间新挂载行会立即测量真实高度，TanStack 随后修正 top
     * 这是虚拟化坐标校正，不是数据换序；若交给 Motion 会让滚动中的行漂移
     * 常驻结构行没有挂载切换，仍需保留动画，否则滚动后立即折叠会直接跳变
     */
    const shouldAnimate = !reduceMotion
      && (!virtualizer.isScrolling || isPersistentRow)
      && (layoutAnimation?.animateSizeChanges !== false || dataStructureChanged)

    return (
      <motion.div
        key={ virtualRow.key }
        data-index={ virtualRow.index }
        { ...{ [INTERNAL_DATA_ATTR.virtual.itemIndex]: virtualRow.index } }
        ref={ virtualizer.measureElement }
        layout={ shouldAnimate
          ? 'position'
          : false }
        layoutDependency={ shouldAnimate
          ? dataKeySignature
          : undefined }
        layoutId={ shouldAnimate
          ? layoutId
          : undefined }
        initial={ shouldAnimate && isAddedDataItem
          ? resolveLayoutInitial(layoutAnimation?.initial, isGroupedContent)
          : false }
        animate={ shouldAnimate
          ? (layoutAnimation?.animate ?? DEFAULT_LAYOUT_ANIMATE)
          : undefined }
        exit={ shouldAnimate
          ? 'data-exit'
          : undefined }
        variants={ shouldAnimate
          ? {
            'data-exit': (presence: LayoutPresenceState) =>
              presence.presentKeys.has(rowKey)
                ? IMMEDIATE_LAYOUT_EXIT
                : resolveLayoutExit({
                  exit: layoutAnimation?.exit,
                  layoutId,
                  presence,
                }),
          }
          : undefined }
        transition={ animationTransition }
        transformTemplate={ shouldAnimate
            && isPersistentRow
            && layoutAnimation?.clampPersistentLayoutToViewport !== false
          ? (_, generatedTransform) =>
            clampPersistentProjectionToViewport({
              generatedTransform,
              rowKey,
              targetStart: virtualRow.start,
              rowSize: virtualRow.size,
              scrollElement: scrollRef.current,
              projections: persistentProjectionRef.current,
            })
          : undefined }
        className={ cn('absolute left-0 w-full', rowClassName) }
        style={ {
          top,
          /** 分组容器收放时，常驻组头始终覆盖在被裁切的内容边界之上 */
          zIndex: isPersistentRow
            ? 1
            : undefined,
        } }
        onClick={ onItemClick
          ? () => onItemClick(item, virtualRow.index)
          : undefined }
      >
        { children(item, virtualRow.index) }
      </motion.div>
    )
  }

  const animatedNodes = directAnimatedRows.map((row) => ({
    key: `row-${String(row.rowKey)}`,
    start: row.virtualRow.start,
    node: renderAnimatedRow(row, row.virtualRow.start, false),
  }))
  const totalSize = virtualizer.getTotalSize()

  anchorRows.forEach((anchorRow, index) => {
    const contentStart = anchorRow.virtualRow.end
    const contentEnd = anchorRows[index + 1]?.virtualRow.start ?? totalSize
    const contentHeight = Math.max(contentEnd - contentStart, 0)
    const rows = groupedRows.get(anchorRow.rowKey) ?? []

    animatedNodes.push({
      key: `group-${String(anchorRow.rowKey)}`,
      start: contentStart,
      node: (
        <motion.div
          key={ `group-${String(anchorRow.rowKey)}` }
          data-vv-virtual-animation-group={ String(anchorRow.rowKey) }
          layout={ reduceMotion
            ? false
            : 'position' }
          layoutDependency={ reduceMotion
            ? undefined
            : dataKeySignature }
          initial={ false }
          animate={ { height: contentHeight } }
          transition={ reduceMotion
            ? { duration: 0 }
            : groupTransition }
          className="absolute left-0 w-full overflow-hidden"
          style={ { top: contentStart } }
        >
          <AnimatePresence
            initial={ false }
          >
            { rows.length > 0 && (
              <RetainedGroupContent
                key="group-content"
                duration={ reduceMotion
                  ? 0
                  : groupDuration }
              >
                <AnimatePresence
                  initial={ false }
                  mode="popLayout"
                  custom={ presenceState }
                >
                  { rows.map((row) =>
                    renderAnimatedRow(
                      row,
                      row.virtualRow.start - contentStart,
                      true,
                    )
                  ) }
                </AnimatePresence>
              </RetainedGroupContent>
            ) }
          </AnimatePresence>
        </motion.div>
      ),
    })
  })

  const virtualRows = virtualItems.map((virtualRow) => {
    const item = data[virtualRow.index]
    const rowClassName = typeof itemClassName === 'function'
      ? itemClassName(item, virtualRow.index)
      : itemClassName

    return (
      <div
        key={ virtualRow.key }
        data-index={ virtualRow.index }
        { ...{ [INTERNAL_DATA_ATTR.virtual.itemIndex]: virtualRow.index } }
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
  })

  const content = (
    <>
      <div
        className={ cn('relative w-full', contentClassName) }
        style={ { height: totalSize } }
      >
        { layoutAnimation
          ? (
            <AnimatePresence
              initial={ false }
              mode="popLayout"
              custom={ presenceState }
            >
              { animatedNodes
                .sort((first, second) => first.start - second.start)
                .map(({ node }) => node) }
            </AnimatePresence>
          )
          : virtualRows }
      </div>

      { data.length === 0 && !loading && empty }

      { loading && showLoading && (
        <div className="flex items-center justify-center py-2">
          <LoadingIcon size={ 24 } />
        </div>
      ) }

      { footer }
    </>
  )

  /** Motion 占用的同名属性改由捕获阶段转发，保留原生 DOM 事件契约 */
  const handleAnimationStartCapture = mergeNativeEventHandlers<AnimationEvent<HTMLDivElement>>(
    onAnimationStartCapture,
    onAnimationStart,
  )
  const handleDragCapture = mergeNativeEventHandlers<DragEvent<HTMLDivElement>>(
    onDragCapture,
    onDrag,
  )
  const handleDragEndCapture = mergeNativeEventHandlers<DragEvent<HTMLDivElement>>(
    onDragEndCapture,
    onDragEnd,
  )
  const handleDragStartCapture = mergeNativeEventHandlers<DragEvent<HTMLDivElement>>(
    onDragStartCapture,
    onDragStart,
  )

  if (layoutAnimation) {
    return (
      <LayoutGroup id={ layoutGroupId }>
        <motion.div
          ref={ setScrollRef }
          layoutScroll
          className={ cn('relative overflow-y-auto', className) }
          { ...rest }
          onAnimationStartCapture={ handleAnimationStartCapture }
          onDragCapture={ handleDragCapture }
          onDragEndCapture={ handleDragEndCapture }
          onDragStartCapture={ handleDragStartCapture }
        >
          { content }
        </motion.div>
      </LayoutGroup>
    )
  }

  return (
    <div
      ref={ setScrollRef }
      className={ cn('relative overflow-y-auto', className) }
      { ...rest }
      onAnimationStart={ onAnimationStart }
      onAnimationStartCapture={ onAnimationStartCapture }
      onDrag={ onDrag }
      onDragCapture={ onDragCapture }
      onDragEnd={ onDragEnd }
      onDragEndCapture={ onDragEndCapture }
      onDragStart={ onDragStart }
      onDragStartCapture={ onDragStartCapture }
    >
      { content }
    </div>
  )
}

InnerTanstackVirtualList.displayName = 'TanstackVirtualList'

export const TanstackVirtualList = memo(InnerTanstackVirtualList) as typeof InnerTanstackVirtualList

/** 折叠期间保留完整内容树，卸载时机与外层高度动画同步 */
function RetainedGroupContent(props: RetainedGroupContentProps) {
  const {
    children,
    duration,
  } = props
  const [isPresent, safeToRemove] = usePresence()

  useEffect(() => {
    if (isPresent || !safeToRemove) return

    const timerId = window.setTimeout(safeToRemove, duration * 1000)
    return () => window.clearTimeout(timerId)
  }, [duration, isPresent, safeToRemove])

  return <div className="absolute left-0 top-0 w-full">{ children }</div>
}

type AnimatedVirtualRow<T> = {
  virtualRow: VirtualItem
  item: T
  rowKey: string | number
  anchorKey: string | number | undefined
}

type RetainedGroupContentProps = {
  duration: number
  children: ReactNode
}

function mergeNativeEventHandlers<Event>(
  captureHandler?: (event: Event) => void,
  bubbleHandler?: (event: Event) => void,
) {
  if (!captureHandler && !bubbleHandler) return undefined

  return (event: Event) => {
    captureHandler?.(event)
    bubbleHandler?.(event)
  }
}
