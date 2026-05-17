import type { ChatVirtualListProps, VirtualItem } from '../core/types'
import { useLatestCallback, useStable } from 'hooks'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DeviationController } from '../core/deviation'
import { detectMutation } from '../core/diff'
import { OffsetMap } from '../core/offsetMap'
import { useFollowOutput } from './useFollowOutput'
import { useMeasurePipeline } from './useMeasurePipeline'
import { useScrollAnchor } from './useScrollAnchor'
import { useScrollStateMachine } from './useScrollStateMachine'

const AUTO_SCROLL_THRESHOLD = 5

export function useChatVirtualizer<T>(props: ChatVirtualListProps<T>) {
  const {
    data,
    computeItemKey,
    estimatedItemSize = 100,
    getItemEstimate,
    overscan = 8,
    followOutput = 'auto',
    scrollModifier,
    onStartReached,
    startReachedThreshold = 100,
    initialAlignment = 'top',
  } = props

  const scrollerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const isAutoScrollingRef = useRef(followOutput !== false)
  const initializedRef = useRef(false)
  const isLoadingRef = useRef(false)

  const dataRef = useRef(data)
  dataRef.current = data
  const computeItemKeyRef = useRef(computeItemKey)
  computeItemKeyRef.current = computeItemKey
  const getItemEstimateRef = useRef(getItemEstimate)
  getItemEstimateRef.current = getItemEstimate
  const onStartReachedRef = useRef(onStartReached)
  onStartReachedRef.current = onStartReached
  const startReachedThresholdRef = useRef(startReachedThreshold)
  startReachedThresholdRef.current = startReachedThreshold
  const followOutputRef = useRef(followOutput)
  followOutputRef.current = followOutput

  // --- OffsetMap ---
  const offsetMapRef = useRef<OffsetMap | null>(null)
  if (!offsetMapRef.current) {
    offsetMapRef.current = new OffsetMap(estimatedItemSize)
  }

  // --- Key Mappings ---
  const keyToIndexRef = useRef(new Map<string | number, number>())
  const prevKeysRef = useRef<(string | number)[]>([])

  // --- State ---
  const [virtualItems, setVirtualItems] = useState<VirtualItem[]>([])
  const [totalSize, setTotalSize] = useState(0)

  // --- State Machine ---
  const stateMachine = useScrollStateMachine()

  // --- Deviation Controller ---
  const deviationRef = useRef<DeviationController | null>(null)
  if (!deviationRef.current) {
    deviationRef.current = new DeviationController(
      () => scrollerRef.current,
      () => innerRef.current,
    )
  }

  // --- Derive Keys（useStable 引用稳定化：key 值不变时不产生新引用） ---
  const rawKeys = useMemo(
    () => data.map((item, i) => computeItemKey(i, item)),
    [data, computeItemKey],
  )
  const currentKeys = useStable(rawKeys)

  // --- Compute Visible Range ---
  const computeRange = useLatestCallback(() => {
    const el = scrollerRef.current
    if (!el)
      return

    const om = offsetMapRef.current!
    const d = dataRef.current
    const ck = computeItemKeyRef.current
    const n = d.length

    if (n === 0) {
      setVirtualItems([])
      setTotalSize(0)
      return
    }

    const { scrollTop, clientHeight } = el
    const firstVisible = om.findIndexAtOffset(scrollTop)
    const lastVisible = om.findIndexAtOffset(scrollTop + clientHeight)
    const start = Math.max(0, firstVisible - overscan)
    const end = Math.min(n - 1, lastVisible + overscan)

    const items: VirtualItem[] = []
    for (let i = start; i <= end; i++) {
      items.push({
        index: i,
        key: ck(i, d[i]),
        start: om.getOffset(i),
        size: om.getSize(i),
      })
    }

    setVirtualItems(items)
    setTotalSize(om.getTotalSize())
  })

  // --- Measure Pipeline ---
  const onMeasureUpdate = useLatestCallback(() => {
    const om = offsetMapRef.current!
    const newTotal = om.getTotalSize()
    if (innerRef.current) {
      innerRef.current.style.height = `${newTotal}px`
    }

    computeRange()

    if (isAutoScrollingRef.current && followOutputRef.current !== false) {
      const el = scrollerRef.current
      if (el) {
        el.scrollTop = el.scrollHeight
      }
    }
  })

  const { measureItem, flushPendingMeasures } = useMeasurePipeline({
    offsetMapRef: offsetMapRef as React.RefObject<OffsetMap>,
    keyToIndexRef,
    scrollerRef,
    deviation: deviationRef.current!,
    stateMachine,
    onUpdate: onMeasureUpdate,
  })

  // ============================================================
  // Effects — 顺序关键，决定了 useLayoutEffect 的执行时序
  // ============================================================

  // --- 1. Sync Data → OffsetMap（最先执行） ---
  useLayoutEffect(() => {
    const om = offsetMapRef.current!
    const prevKeys = prevKeysRef.current
    const mutation = detectMutation(prevKeys, currentKeys)

    const newKeyToIndex = new Map<string | number, number>()
    currentKeys.forEach((key, index) => newKeyToIndex.set(key, index))
    keyToIndexRef.current = newKeyToIndex

    const gse = getItemEstimateRef.current

    if (prevKeys.length === 0) {
      om.reset(data.length, i => gse?.(data[i], i) ?? estimatedItemSize)
    }
    else if (mutation.type === 'append') {
      const oldSizes = [...om.sizes]
      om.reset(data.length, i =>
        i < oldSizes.length
          ? oldSizes[i]
          : (gse?.(data[i], i) ?? estimatedItemSize))
    }
    else if (mutation.type === 'prepend') {
      const oldSizes = [...om.sizes]
      om.reset(data.length, i =>
        i < mutation.count
          ? (gse?.(data[i], i) ?? estimatedItemSize)
          : oldSizes[i - mutation.count])
    }
    else {
      om.reset(data.length, i => gse?.(data[i], i) ?? estimatedItemSize)
    }

    prevKeysRef.current = currentKeys

    const newTotal = om.getTotalSize()
    if (innerRef.current) {
      innerRef.current.style.height = `${newTotal}px`
    }
    setTotalSize(newTotal)
  }, [currentKeys, estimatedItemSize])

  // --- 2. Follow Output（sync 之后执行） ---
  useFollowOutput({
    currentKeys,
    followOutput,
    isAutoScrollingRef,
    scrollerRef,
    stateMachine,
  })

  // --- 3. Scroll Anchor（follow 之后执行） ---
  useScrollAnchor({
    data,
    scrollModifier,
    scrollerRef,
    offsetMapRef: offsetMapRef as React.RefObject<OffsetMap>,
    keyToIndexRef,
    computeItemKeyRef,
    deviation: deviationRef.current!,
    stateMachine,
    flushPendingMeasures,
    computeRange,
  })

  // --- 4. Initial Alignment ---
  useLayoutEffect(() => {
    if (initializedRef.current)
      return
    if (data.length === 0)
      return
    initializedRef.current = true

    if (initialAlignment === 'bottom') {
      const el = scrollerRef.current
      if (!el)
        return

      el.scrollTop = el.scrollHeight
      stateMachine.beginAnimate(1500)

      let frames = 0
      const settle = () => {
        if (innerRef.current) {
          innerRef.current.style.height = `${offsetMapRef.current!.getTotalSize()}px`
        }
        el.scrollTop = el.scrollHeight
        computeRange()
        frames++
        if (frames < 10) {
          requestAnimationFrame(settle)
        }
        else {
          stateMachine.endAnimate()
        }
      }
      requestAnimationFrame(settle)
    }
  }, [data.length, initialAlignment, stateMachine, computeRange])

  // --- 5. Recompute Range（最后执行） ---
  useLayoutEffect(() => {
    if (!initializedRef.current)
      return
    computeRange()
  }, [currentKeys, computeRange])

  // --- Scroll Handler ---
  const handleScroll = useLatestCallback(() => {
    const el = scrollerRef.current
    if (!el)
      return

    computeRange()

    const state = stateMachine.getState()
    if (state !== 'restoring' && state !== 'animating') {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      isAutoScrollingRef.current = distanceFromBottom <= AUTO_SCROLL_THRESHOLD
    }

    if (
      el.scrollTop <= startReachedThresholdRef.current
      && !isLoadingRef.current
      && onStartReachedRef.current
    ) {
      isLoadingRef.current = true
      onStartReachedRef.current()
    }
  })

  useEffect(() => {
    isLoadingRef.current = false
  }, [data.length])

  useEffect(() => {
    return () => {
      deviationRef.current?.destroy()
    }
  }, [])

  return {
    scrollerRef,
    innerRef,
    virtualItems,
    totalSize,
    measureItem,
    handleScroll,
    isAutoScrollingRef,
  }
}
