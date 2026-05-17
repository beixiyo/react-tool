import type { DeviationController } from '../core/deviation'
import type { OffsetMap } from '../core/offsetMap'
import type { AnchorSnapshot, ChatScrollModifier } from '../core/types'
import type { ScrollStateMachineAPI } from './useScrollStateMachine'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { captureAnchorSnapshot, resolveAnchorTarget } from '../core/scrollAnchor'

export type ScrollAnchorOpts = {
  data: any[]
  scrollModifier: ChatScrollModifier | null | undefined
  scrollerRef: React.RefObject<HTMLDivElement | null>
  offsetMapRef: React.RefObject<OffsetMap>
  keyToIndexRef: React.RefObject<Map<string | number, number>>
  computeItemKeyRef: React.RefObject<(index: number, item: any) => string | number>
  deviation: DeviationController
  stateMachine: ScrollStateMachineAPI
  flushPendingMeasures: () => void
  computeRange: () => void
}

/**
 * Prepend 锚定恢复
 *
 * 三阶段流程：
 * 1. scrollModifier 变化时捕获快照
 * 2. itemCount 增长后在 useLayoutEffect 中同步恢复
 * 3. 4 帧 settle loop 修正迟到的测量变化
 */
export function useScrollAnchor(opts: ScrollAnchorOpts) {
  const snapshotRef = useRef<AnchorSnapshot | null>(null)
  const prevModifierIdRef = useRef<string | null>(null)
  const prevItemCountRef = useRef(0)

  const optsRef = useRef(opts)
  optsRef.current = opts

  useEffect(() => {
    const { scrollModifier, scrollerRef, offsetMapRef, computeItemKeyRef, data } = optsRef.current
    if (!scrollModifier || scrollModifier.id === prevModifierIdRef.current)
      return
    prevModifierIdRef.current = scrollModifier.id

    if (scrollModifier.type !== 'prepend')
      return

    const el = scrollerRef.current
    const om = offsetMapRef.current
    const ck = computeItemKeyRef.current
    if (!el || !om || !ck)
      return

    snapshotRef.current = captureAnchorSnapshot({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      itemCount: data.length,
      getKeyAtIndex: i => ck(i, data[i]),
      offsetMap: om,
    })
  }, [opts.scrollModifier?.id])

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current
    const itemCount = opts.data.length

    if (!snapshot) {
      prevItemCountRef.current = itemCount
      return
    }

    if (itemCount <= prevItemCountRef.current) {
      prevItemCountRef.current = itemCount
      return
    }

    snapshotRef.current = null
    prevItemCountRef.current = itemCount

    const { scrollerRef, offsetMapRef, keyToIndexRef, deviation, stateMachine, flushPendingMeasures, computeRange } = optsRef.current
    const el = scrollerRef.current
    const om = offsetMapRef.current
    const keyToIndex = keyToIndexRef.current
    if (!el || !om || !keyToIndex)
      return

    deviation.isLocked = true
    deviation.reset()

    flushPendingMeasures()

    const makeResolver = () =>
      (key: string | number, offsetWithinItem: number): number | null => {
        const index = keyToIndex.get(key)
        if (index === undefined)
          return null
        return om.getOffset(index) + offsetWithinItem
      }

    const target = resolveAnchorTarget({
      snapshot,
      currentScrollHeight: el.scrollHeight,
      resolveAnchorTop: makeResolver(),
    })
    el.scrollTop = target

    stateMachine.beginRestore(800)
    let frames = 0

    const settle = () => {
      flushPendingMeasures()
      const newTarget = resolveAnchorTarget({
        snapshot,
        currentScrollHeight: el.scrollHeight,
        resolveAnchorTop: makeResolver(),
      })
      if (Math.abs(el.scrollTop - newTarget) > 1) {
        el.scrollTop = newTarget
      }
      frames++
      if (frames < 4) {
        requestAnimationFrame(settle)
      }
      else {
        stateMachine.endRestore()
        deviation.isLocked = false
        computeRange()
      }
    }
    requestAnimationFrame(settle)
  }, [opts.data.length])
}
