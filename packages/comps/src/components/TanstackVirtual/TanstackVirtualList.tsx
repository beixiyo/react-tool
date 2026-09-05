'use client'

import type { Virtualizer } from '@tanstack/react-virtual'
import { defaultRangeExtractor, measureElement as measureVirtualElement, useVirtualizer } from '@tanstack/react-virtual'
import { onMounted, onUnmounted, useComposedRef, useLatestCallback } from 'hooks'
import type { AnimationPlaybackControls, TargetAndTransition, Transition } from 'motion/react'
import { animate, motion, useReducedMotion } from 'motion/react'
import type { AnimationEvent, DragEvent, ReactNode } from 'react'
import { memo, useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { INTERNAL_DATA_ATTR } from '../../constants/dataAttributes'
import { LoadingIcon } from '../Loading/LoadingIcon'
import type {
  TanstackVirtualListProps,
  VirtualSizeTransitionDirection,
  VirtualSizeTransitionSpec,
} from './types'

const DEFAULT_LAYOUT_INITIAL = { opacity: 0 } as const
const DEFAULT_LAYOUT_ANIMATE = { opacity: 1 } as const
const DEFAULT_LAYOUT_EXIT = { opacity: 0 } as const
/** 退场动画完成回调未触发（如标签页隐藏）时的兜底清理时长 */
const EXIT_FALLBACK_MS = 1000

/**
 * 尺寸驱动动画的默认过渡
 *
 * 必须是 duration-first spring（visualDuration + bounce）：物理弹簧的时长随
 * 距离变化，分组越长收起越久；visualDuration 把时长和距离解耦，20 项和 200 项
 * 的收起手感一致
 */
const DEFAULT_SIZE_TRANSITION = {
  type: 'spring',
  visualDuration: 0.32,
  bounce: 0,
  /** Motion 默认阈值是给 opacity/scale 这类单位量级的值定的，像素量级会拖很久才判定静止 */
  restDelta: 0.5,
  restSpeed: 10,
} satisfies Transition

const EMPTY_SPECS: ReadonlyMap<number, VirtualSizeTransitionSpec> = new Map()
const EMPTY_GROUPS: ReadonlyMap<string | number, TransitionGroup> = new Map()
const EMPTY_EXITING: ReadonlyMap<string | number, ExitingRowSnapshot<unknown>> = new Map()

/**
 * 通用动态高度虚拟列表（基于 TanStack Virtual）
 *
 * - 自动测量行高，支持运行时高度变化（图片加载、展开等）
 * - hasMore + loadMore 实现滚动到底无限加载
 * - onVisibleRangeChange 暴露可视范围，供上层做分组级加载等编排（见 VirtualGroupList）
 * - layoutAnimation 让数据增删、换序产生可见行的出入场与位移动画
 * - sizeTransition 让一组行的尺寸由同一个进度逐帧驱动，使 virtualizer 的几何本身
 *   成为收放动画的唯一真相源（见 TanstackVirtualListProps.sizeTransition）
 *
 * 出入场不经 AnimatePresence：虚拟行的卸载绝大多数是滚出范围，必须同步消失；
 * AnimatePresence 至少多留一帧、且要等全部退场子项完成才卸载，实测会让离屏行
 * 长期停在旧坐标上。只有真正从数据里删除且当时挂载着的行，才由组件自己保留
 * 一份快照播退场动画
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
    sizeTransition,
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
  /**
   * 共享布局标识的命名空间，替代 Motion 的 LayoutGroup
   *
   * LayoutGroup 会在组内任一节点卸载时让其余所有节点重新快照（nodeGroup.remove
   * → dirtyAll），虚拟列表本来就在持续挂载 / 卸载行：展开时下方的行不断被推出
   * 范围，每卸掉一行，全部行都以旧坐标为起点 FLIP，与几何驱动互相追赶。
   * 这里只需要给 layoutId 加上列表级前缀，避免多个列表之间串号
   */
  const layoutIdPrefix = useId()
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
  const dataIndexByKey = useMemo(
    () => new Map(dataKeys.map((key, index) => [key, index] as const)),
    [dataKeys],
  )
  const dataKeySignature = useMemo(() => JSON.stringify(dataKeys), [dataKeys])
  const dataLayoutIds = useMemo(
    () =>
      layoutAnimation?.getLayoutId
        ? data.map((item, index) => layoutAnimation.getLayoutId?.(item, index))
        : [],
    [data, layoutAnimation],
  )
  const previousDataKeysRef = useRef<ReadonlySet<string | number>>(dataKeySet)

  useLayoutEffect(() => {
    previousDataKeysRef.current = dataKeySet
  }, [dataKeySet])

  /* ---------------------------- 尺寸驱动动画 ---------------------------- */

  /**
   * 驱动行必须在渲染期就识别出来，不能等 effect 回填 state：
   * 晚一帧就会有一帧按真实内容测量，把动画尺寸覆盖回去
   */
  const transitionSpecs = useMemo(() => {
    if (!sizeTransition) return EMPTY_SPECS

    const specs = new Map<number, VirtualSizeTransitionSpec>()
    data.forEach((item, index) => {
      const spec = sizeTransition.getSpec(item, index)
      if (spec) specs.set(index, spec)
    })

    return specs
  }, [data, sizeTransition])
  /** 同组的驱动行按索引升序归并，一组共用一个进度值 */
  const transitionGroups = useMemo(() => {
    if (transitionSpecs.size === 0) return EMPTY_GROUPS

    const groups = new Map<string | number, TransitionGroup>()
    transitionSpecs.forEach((spec, index) => {
      const group = groups.get(spec.group) ?? { direction: spec.direction, keys: [], indexes: [] }
      group.keys.push(dataKeys[index])
      group.indexes.push(index)
      groups.set(spec.group, group)
    })

    return groups
  }, [transitionSpecs, dataKeys])
  const isSizeTransitioning = transitionSpecs.size > 0

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

  /**
   * 展开中的驱动行首次进入行模型时只能靠 estimateSize 定尺寸：它必须从 0 起，
   * 否则几何会先按估算高度撑开一帧，把下方的行推出范围又立刻拉回来
   */
  const estimateRowSize = (index: number) =>
    transitionSpecs.get(index)?.direction === 'expand'
      ? 0
      : estimateSize

  const virtualizerRef = useRef<Virtualizer<HTMLDivElement, Element> | null>(null)
  /** 正在播放的驱动组：group -> 播放控制、方向与起播时定下的动画窗口 */
  const playbacksRef = useRef(new Map<string | number, SizePlayback>())

  /**
   * 动画距离之外的驱动行（被夹取瞬时归零、始终看不见）从可视范围里剔除
   *
   * 它们的尺寸是 0，全都叠在组尾同一个偏移上，按 TanStack 的连续区间判定会被
   * 一次性全部算作可见并挂载——长分组收起 / 展开时一口气挂上几十张卡片，
   * 正是起播那一帧的卡顿来源；窗口之内的行即使此刻高度为 0 也要保留，
   * 展开时它们得先挂载才能量出自然高度
   *
   * 窗口以起播时 effect 里定下的为准；起播前那一次渲染只能按估算判断，
   * 多放两行余量，免得真实行比估算矮时窗口内的行没被挂载
   */
  const rangeExtractor = (range: Parameters<typeof defaultRangeExtractor>[0]) => {
    const indexes = defaultRangeExtractor(range)
    if (transitionGroups.size === 0) return indexes

    const excluded = new Set<number>()
    transitionGroups.forEach((group, groupKey) => {
      const playback = playbacksRef.current.get(groupKey)
      const rowCount = playback?.window && playback.direction === group.direction
        ? playback.window.rowCount
        : resolveTransitionWindow({
          group,
          virtualizer: virtualizerRef.current,
          estimateSize,
          maxDistance: sizeTransition?.maxDistance,
          scrollElement: scrollRef.current,
        }).rowCount + 2
      group.indexes.forEach((index, position) => {
        if (position >= rowCount) excluded.add(index)
      })
    })

    return excluded.size === 0
      ? indexes
      : indexes.filter((index) => !excluded.has(index))
  }

  /**
   * 驱动行仍挂着 ResizeObserver（保持挂载、动画结束后无缝恢复测量），
   * 但它的盒子高度就是动画写进去的值，测量必须原样返回缓存，不能让盒子高度
   * 的四舍五入结果反过来覆盖动画尺寸
   */
  const measureRow: NonNullable<VirtualizerOptions['measureElement']> = (element, entry, instance) => {
    const index = instance.indexFromElement(element)
    if (transitionSpecs.has(index)) {
      return instance.itemSizeCache.get(instance.options.getItemKey(index)) ?? 0
    }

    return measureVirtualElement(element, entry, instance)
  }

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: estimateRowSize,
    measureElement: measureRow,
    overscan,
    useCachedMeasurements,
    getItemKey: resolveKey,
    rangeExtractor,
    onChange: (instance) => handleChange(instance),
  })
  virtualizerRef.current = virtualizer

  /** 动画帧回调里需要按 key 反查当前索引：行模型随时可能增删，不能闭包捕获 */
  const dataIndexByKeyRef = useRef(dataIndexByKey)

  useLayoutEffect(() => {
    dataIndexByKeyRef.current = dataIndexByKey

    const playbacks = playbacksRef.current

    /** 行模型里已不存在的驱动组：立即停止，避免继续 resize 不相干的行 */
    for (const [groupKey, playback] of playbacks) {
      if (transitionGroups.has(groupKey)) continue
      stopPlayback(playback)
      playbacks.delete(groupKey)
    }

    if (!sizeTransition) return

    transitionGroups.forEach((group, groupKey) => {
      /**
       * 同方向的驱动组只起播一次：播完后记录仍保留（settled），
       * 否则同一分组另一个驱动组 settle 引发的重渲染会让它从头再来一遍
       */
      const running = playbacks.get(groupKey)
      if (running?.direction === group.direction) return

      const { keys, direction } = group
      const window = resolveTransitionWindow({
        group,
        virtualizer,
        estimateSize,
        maxDistance: sizeTransition.maxDistance,
        scrollElement: scrollRef.current,
      })
      const { naturalSizes, offsets, distance } = window
      /** 中途反向时从当前尺寸接力，不回到 0 或满高重来 */
      const from = running
        ? keys.reduce<number>((total, rowKey) => total + (virtualizer.itemSizeCache.get(rowKey) ?? 0), 0)
        : (direction === 'collapse'
            ? distance
            : 0)
      const to = direction === 'collapse'
        ? 0
        : distance

      /**
       * 手风琴式裁切：进度 H 是整组当前高度，靠前的行保持满高、边缘行被裁、
       * 之后的行为 0；超出动画距离（夹取到视口之外）的行从一开始就按 0 处理
       */
      const applyHeight = (height: number) => {
        keys.forEach((rowKey, position) => {
          const index = dataIndexByKeyRef.current.get(rowKey)
          if (index === undefined) return

          const offset = offsets[position]
          const size = offset >= distance
            ? 0
            : Math.min(Math.max(height - offset, 0), naturalSizes[position])
          if (virtualizer.itemSizeCache.get(rowKey) !== size) virtualizer.resizeItem(index, size)
        })
      }

      if (running) stopPlayback(running)

      /** 起点须在 paint 前写进 virtualizer */
      applyHeight(from)

      const settle = () => {
        playbacks.set(groupKey, { direction, window })
        /**
         * 展开播完：把整组一次性放到自然高度再切回普通行。窗口外的行此前一直是 0、
         * 叠在组尾同一偏移上，若不先铺开，settle 那一帧它们会被整批判定为可见并挂载，
         * 随后再逐个测量、卸载；窗口边缘被裁的那一行也在这里补齐，否则它要等
         * ResizeObserver 再校正一次，与下一行叠一帧
         */
        if (direction === 'expand') {
          keys.forEach((rowKey, position) => {
            const index = dataIndexByKeyRef.current.get(rowKey)
            if (index !== undefined && virtualizer.itemSizeCache.get(rowKey) !== naturalSizes[position]) {
              virtualizer.resizeItem(index, naturalSizes[position])
            }
          })
        }
        sizeTransition.onSettled(groupKey)
      }

      if (reduceMotion || from === to) {
        applyHeight(to)
        settle()
        return
      }

      /**
       * 推迟到下一帧再起播：Motion 以帧循环的时间戳为动画起点，而此刻的时间戳还是
       * 点击前那一帧的；起播的这次 commit 耗时会被整个算进动画已播时长，第二帧
       * 直接跳过开头一大段。等首帧画出来再计时，起点才是真的起点
       */
      const playback: SizePlayback = { direction, window }
      playback.pendingFrameId = requestAnimationFrame(() => {
        playback.pendingFrameId = undefined
        playback.control = animate(from, to, {
          ...(sizeTransition.transition ?? DEFAULT_SIZE_TRANSITION),
          onUpdate: applyHeight,
          onComplete: () => {
            if (playbacks.get(groupKey) !== playback) return
            settle()
          },
        })
      })

      playbacks.set(groupKey, playback)
    })
  })

  onUnmounted(() => {
    for (const playback of playbacksRef.current.values()) stopPlayback(playback)
    playbacksRef.current.clear()
  })

  onMounted(() => {
    if (immediate) triggerLoadMore()
  })

  useImperativeHandle(listRef, () => ({
    scrollToIndex: (index, options) => virtualizer.scrollToIndex(index, options),
    scrollToOffset: (offset, options) => virtualizer.scrollToOffset(offset, options),
  }), [virtualizer])

  /* ------------------------------ 行渲染 ------------------------------ */

  const virtualItems = virtualizer.getVirtualItems()

  const resolveRowClassName = (item: T, index: number) =>
    typeof itemClassName === 'function'
      ? itemClassName(item, index)
      : itemClassName

  /* ------------------------------ 退场行 ------------------------------ */

  const [exitingRows, setExitingRows] = useState(
    EMPTY_EXITING as ReadonlyMap<string | number, ExitingRowSnapshot<T>>,
  )
  /** 上一次 commit 时挂载的行快照，用于识别「从数据里删除且当时可见」的行 */
  const mountedRowsRef = useRef(new Map<string | number, ExitingRowSnapshot<T>>())

  if (layoutAnimation && !reduceMotion) {
    let next: Map<string | number, ExitingRowSnapshot<T>> | undefined

    for (const [rowKey, snapshot] of mountedRowsRef.current) {
      if (dataKeySet.has(rowKey) || exitingRows.has(rowKey)) continue
      next ??= new Map(exitingRows)
      next.set(rowKey, snapshot)
    }
    /** 退场中的行又回到数据里（撤销删除）：立即结束退场，交回正常渲染 */
    for (const rowKey of exitingRows.keys()) {
      if (!dataKeySet.has(rowKey)) continue
      next ??= new Map(exitingRows)
      next.delete(rowKey)
    }

    if (next) setExitingRows(next)
  }

  useLayoutEffect(() => {
    const mounted = new Map<string | number, ExitingRowSnapshot<T>>()
    virtualItems.forEach((virtualRow) => {
      /** 驱动行收到 0 高时不该再以满高快照退场 */
      if (transitionSpecs.has(virtualRow.index)) return

      const item = data[virtualRow.index]
      mounted.set(virtualRow.key as string | number, {
        item,
        index: virtualRow.index,
        start: virtualRow.start,
        className: resolveRowClassName(item, virtualRow.index),
      })
    })
    mountedRowsRef.current = mounted
  })

  const removeExitingRow = useLatestCallback((rowKey: string | number) => {
    setExitingRows((prev) => {
      if (!prev.has(rowKey)) return prev
      const next = new Map(prev)
      next.delete(rowKey)
      return next
    })
  })

  /**
   * 位移动画只在数据结构真正变化、且几何不由动画驱动时播放。用 layoutDependency
   * 而不是切换 layout / layoutId 来控制：这两个 prop 每变一次 Motion 都要重挂测量
   * 组件、重新分配共享布局的主从，实测会让行闪一帧
   * - 滚动期间新挂载行会立即测量真实高度，TanStack 随后修正 top，
   *   这是虚拟化坐标校正而非数据换序，交给 Motion 会让滚动中的行漂移
   * - 尺寸驱动期间几何本身逐帧连续，FLIP 再叠一层位移只会互相追赶
   * 这些情况下把依赖钉在数据签名上，Motion 只在签名变化时才测量一次
   */
  const shouldFlip = Boolean(layoutAnimation) && !reduceMotion
  const isFlipFrozen = isSizeTransitioning || virtualizer.isScrolling
  /**
   * 冻结期间依赖必须纹丝不动：驱动途中别的分组翻页、加载行出现都会改数据签名，
   * 若把新签名交给 Motion，它会拿旧坐标做 FLIP 起点，把正在被几何推着走的行
   * 往回拽半秒，和长高中的行叠在一起。故冻结开始前的签名一直沿用到冻结结束
   */
  const frozenDependencyRef = useRef(dataKeySignature)
  useLayoutEffect(() => {
    if (!isFlipFrozen) frozenDependencyRef.current = dataKeySignature
  })
  const layoutDependency = isFlipFrozen
    ? frozenDependencyRef.current
    : (layoutAnimation?.animateSizeChanges === false
        ? dataKeySignature
        : undefined)
  const rowInitial = layoutAnimation?.initial ?? DEFAULT_LAYOUT_INITIAL
  const rowAnimate = layoutAnimation?.animate ?? DEFAULT_LAYOUT_ANIMATE
  const rowExit = layoutAnimation?.exit ?? DEFAULT_LAYOUT_EXIT

  const renderedRows = layoutAnimation
    ? virtualItems.map((virtualRow) => {
      const item = data[virtualRow.index]
      const rowKey = virtualRow.key as string | number
      const isDriven = transitionSpecs.has(virtualRow.index)
      /** 展开中的行刚回到数据里，像素由动画接管，不再叠一层淡入 */
      const isAddedDataItem = !isDriven && !previousDataKeysRef.current.has(rowKey)

      return (
        <AnimatedVirtualRow
          key={ virtualRow.key }
          item={ item }
          index={ virtualRow.index }
          start={ virtualRow.start }
          drivenSize={ isDriven
            ? virtualRow.size
            : undefined }
          className={ resolveRowClassName(item, virtualRow.index) }
          render={ children }
          onItemClick={ onItemClick }
          measureElement={ virtualizer.measureElement }
          shouldFlip={ shouldFlip }
          layoutDependency={ layoutDependency }
          mountLayoutId={ isAddedDataItem && dataLayoutIds[virtualRow.index] !== undefined
            ? `${layoutIdPrefix}${dataLayoutIds[virtualRow.index]}`
            : undefined }
          initial={ !reduceMotion && isAddedDataItem
            ? rowInitial
            : false }
          animateTarget={ rowAnimate }
          transition={ layoutAnimation.transition }
        />
      )
    })
    : virtualItems.map((virtualRow) => {
      const item = data[virtualRow.index]

      return (
        <PlainVirtualRow
          key={ virtualRow.key }
          item={ item }
          index={ virtualRow.index }
          start={ virtualRow.start }
          drivenSize={ transitionSpecs.has(virtualRow.index)
            ? virtualRow.size
            : undefined }
          className={ resolveRowClassName(item, virtualRow.index) }
          render={ children }
          onItemClick={ onItemClick }
          measureElement={ virtualizer.measureElement }
        />
      )
    })

  const content = (
    <>
      <div
        className={ cn('relative w-full', contentClassName) }
        style={ { height: virtualizer.getTotalSize() } }
      >
        { renderedRows }
        { layoutAnimation && [...exitingRows].map(([rowKey, snapshot]) => (
          <ExitingVirtualRow
            key={ `exit-${String(rowKey)}` }
            rowKey={ rowKey }
            snapshot={ snapshot }
            render={ children }
            from={ rowAnimate }
            exit={ rowExit }
            transition={ layoutAnimation.transition }
            onDone={ removeExitingRow }
          />
        )) }
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

/* ------------------------------ 行组件 ------------------------------ */

/** 驱动行的盒子：高度就是动画写进 virtualizer 的值，内容原样保留、由盒子裁切 */
function drivenRowStyle(size: number | undefined) {
  return size === undefined
    ? undefined
    : { height: size, overflow: 'hidden' as const }
}

/**
 * 行组件全部 memo：virtualizer 每次 tick（滚动、测量校正、尺寸驱动的每一帧）
 * 都会重渲染列表，行内容不该跟着重算。父级真正重渲染时 render 函数引用会变，
 * 行自然失效，选中态等外部状态不会滞后
 */
function InnerAnimatedVirtualRow<T>(props: AnimatedVirtualRowProps<T>) {
  const {
    item,
    index,
    start,
    drivenSize,
    className,
    render,
    onItemClick,
    measureElement,
    shouldFlip,
    layoutDependency,
    mountLayoutId,
    initial,
    animateTarget,
    transition,
  } = props
  /**
   * 共享布局标识只在「作为新增数据项挂载」的那一个实例上生效，并跟随实例终身
   *
   * 虚拟列表的行会因滚动反复卸载 / 挂载，若每次挂载都带 layoutId，Motion 会把
   * 它接到同 id 上一个节点残留的快照上做共享布局动画：展开中的行从旧坐标滑回来
   * 与邻行重叠、滚回视口的行闪一帧。只有数据层面真正新增（如跨组移动）的行
   * 才需要接上旧节点的位置
   */
  const [layoutId] = useState(mountLayoutId)

  return (
    <motion.div
      data-index={ index }
      { ...{
        [INTERNAL_DATA_ATTR.virtual.itemIndex]: index,
        ...(drivenSize === undefined
          ? {}
          : { [INTERNAL_DATA_ATTR.virtual.driven]: '' }),
      } }
      ref={ measureElement }
      layout={ shouldFlip
        ? 'position'
        : false }
      layoutDependency={ layoutDependency }
      layoutId={ shouldFlip
        ? layoutId
        : undefined }
      initial={ initial }
      animate={ animateTarget }
      transition={ transition }
      className={ cn('absolute left-0 w-full', className) }
      style={ { top: start, ...drivenRowStyle(drivenSize) } }
      onClick={ onItemClick
        ? () => onItemClick(item, index)
        : undefined }
    >
      { render(item, index) }
    </motion.div>
  )
}

const AnimatedVirtualRow = memo(InnerAnimatedVirtualRow) as typeof InnerAnimatedVirtualRow

function InnerPlainVirtualRow<T>(props: PlainVirtualRowProps<T>) {
  const {
    item,
    index,
    start,
    drivenSize,
    className,
    render,
    onItemClick,
    measureElement,
  } = props

  return (
    <div
      data-index={ index }
      { ...{
        [INTERNAL_DATA_ATTR.virtual.itemIndex]: index,
        ...(drivenSize === undefined
          ? {}
          : { [INTERNAL_DATA_ATTR.virtual.driven]: '' }),
      } }
      ref={ measureElement }
      className={ cn('absolute left-0 top-0 w-full', className) }
      style={ { transform: `translateY(${start}px)`, ...drivenRowStyle(drivenSize) } }
      onClick={ onItemClick
        ? () => onItemClick(item, index)
        : undefined }
    >
      { render(item, index) }
    </div>
  )
}

const PlainVirtualRow = memo(InnerPlainVirtualRow) as typeof InnerPlainVirtualRow

/**
 * 从数据里删除的行的退场：停在被删除时的坐标上播 exit，播完或超时后卸载
 */
function InnerExitingVirtualRow<T>(props: ExitingVirtualRowProps<T>) {
  const {
    rowKey,
    snapshot,
    render,
    from,
    exit,
    transition,
    onDone,
  } = props

  useEffect(() => {
    const timerId = window.setTimeout(() => onDone(rowKey), EXIT_FALLBACK_MS)
    return () => window.clearTimeout(timerId)
  }, [onDone, rowKey])

  return (
    <motion.div
      initial={ from }
      animate={ exit }
      transition={ transition }
      onAnimationComplete={ () => onDone(rowKey) }
      className={ cn('pointer-events-none absolute left-0 w-full', snapshot.className) }
      style={ { top: snapshot.start } }
    >
      { render(snapshot.item, snapshot.index) }
    </motion.div>
  )
}

const ExitingVirtualRow = memo(InnerExitingVirtualRow) as typeof InnerExitingVirtualRow

/* ------------------------------ 工具 ------------------------------ */

/**
 * 动画距离上限：调用方显式指定优先；否则取滚动容器的 clientHeight，
 * clientHeight 为 0 说明容器还没布局或已隐藏，此时视口不可信，不做夹取
 */
function resolveDistanceLimit(
  maxDistance: number | undefined,
  scrollElement: HTMLDivElement | null,
  fallback: number,
) {
  return maxDistance ?? (scrollElement?.clientHeight || fallback)
}

/**
 * 驱动行的自然高度（动画的满高）
 *
 * - 收起：行此刻就是按真实内容测量着的，直接用测量缓存；未挂载的行按估算，
 *   它们在动画距离之外，本来就会被瞬时归零
 * - 展开：缓存里多半是上一次收起留下的 0，只能量挂载节点的内容高度——
 *   盒子已经是 overflow hidden，scrollHeight 就是内容的自然高度；未挂载的行
 *   按估算，settle 后由正常测量校正（它们在视口之外）
 */
function measureNaturalSize(options: MeasureNaturalSizeOptions) {
  const {
    rowKey,
    direction,
    virtualizer,
    estimateSize,
  } = options
  const cached = virtualizer.itemSizeCache.get(rowKey)
  const node = virtualizer.elementsCache.get(rowKey)

  if (direction === 'collapse') return cached ?? node?.scrollHeight ?? estimateSize
  if (node) return node.scrollHeight
  return cached || estimateSize
}

/**
 * 驱动组的动画窗口：各行自然高度、组内偏移、夹取后的动画距离，
 * 以及处在距离之内的行数（之后的行被瞬时归零，不参与动画也不挂载）
 */
function resolveTransitionWindow(options: ResolveTransitionWindowOptions): TransitionWindow {
  const {
    group,
    virtualizer,
    estimateSize,
    maxDistance,
    scrollElement,
  } = options
  const naturalSizes = group.keys.map((rowKey) =>
    virtualizer
      ? measureNaturalSize({ rowKey, direction: group.direction, virtualizer, estimateSize })
      : estimateSize
  )
  const offsets: number[] = []
  let fullSize = 0
  naturalSizes.forEach((size) => {
    offsets.push(fullSize)
    fullSize += size
  })
  const distance = Math.min(fullSize, resolveDistanceLimit(maxDistance, scrollElement, fullSize))
  const rowCount = offsets.filter((offset) => offset < distance).length

  return { naturalSizes, offsets, distance, rowCount }
}

function stopPlayback(playback: SizePlayback) {
  if (playback.pendingFrameId !== undefined) cancelAnimationFrame(playback.pendingFrameId)
  playback.pendingFrameId = undefined
  playback.control?.stop()
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

type VirtualizerOptions = Virtualizer<HTMLDivElement, Element>['options']

type TransitionGroup = {
  direction: VirtualSizeTransitionDirection
  /** 组内行 key，按索引升序 */
  keys: (string | number)[]
  /** 与 keys 对应的当前索引 */
  indexes: number[]
}

type TransitionWindow = {
  naturalSizes: number[]
  offsets: number[]
  distance: number
  /** 处在动画距离之内的行数（从组首数起） */
  rowCount: number
}

type ResolveTransitionWindowOptions = {
  group: TransitionGroup
  virtualizer: Virtualizer<HTMLDivElement, Element> | null
  estimateSize: number
  maxDistance: number | undefined
  scrollElement: HTMLDivElement | null
}

type SizePlayback = {
  direction: VirtualSizeTransitionDirection
  /** 起播时定下的动画窗口，rangeExtractor 据此决定窗口外的行不挂载 */
  window?: TransitionWindow
  /** 等待下一帧起播的 rAF 句柄 */
  pendingFrameId?: number
  /** 已播完（或 reduced motion / 零距离下立即结束）的记录没有控制器 */
  control?: AnimationPlaybackControls
}

type ExitingRowSnapshot<T> = {
  item: T
  index: number
  start: number
  className: string | undefined
}

type RowRender<T> = (item: T, index: number) => ReactNode

type AnimatedVirtualRowProps<T> = {
  item: T
  index: number
  start: number
  /** 驱动行的当前高度；普通行为 undefined */
  drivenSize: number | undefined
  className: string | undefined
  render: RowRender<T>
  onItemClick: ((item: T, index: number) => void) | undefined
  measureElement: (node: HTMLDivElement | null) => void
  shouldFlip: boolean
  layoutDependency: string | undefined
  /** 该行作为新增数据项挂载时的共享布局标识；滚动挂载的行不传 */
  mountLayoutId: string | undefined
  initial: false | TargetAndTransition
  animateTarget: TargetAndTransition
  transition: Transition | undefined
}

type PlainVirtualRowProps<T> = {
  item: T
  index: number
  start: number
  drivenSize: number | undefined
  className: string | undefined
  render: RowRender<T>
  onItemClick: ((item: T, index: number) => void) | undefined
  measureElement: (node: HTMLDivElement | null) => void
}

type ExitingVirtualRowProps<T> = {
  rowKey: string | number
  snapshot: ExitingRowSnapshot<T>
  render: RowRender<T>
  from: TargetAndTransition
  exit: TargetAndTransition
  transition: Transition | undefined
  onDone: (rowKey: string | number) => void
}

type MeasureNaturalSizeOptions = {
  rowKey: string | number
  direction: VirtualSizeTransitionDirection
  virtualizer: Virtualizer<HTMLDivElement, Element>
  estimateSize: number
}
