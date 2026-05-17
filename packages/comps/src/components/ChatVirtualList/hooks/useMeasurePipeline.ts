import type { DeviationController } from '../core/deviation'
import type { OffsetMap } from '../core/offsetMap'
import type { ScrollStateMachineAPI } from './useScrollStateMachine'
import { useLatestCallback } from 'hooks'
import { useEffect, useRef } from 'react'

export type MeasurePipelineOpts = {
  offsetMapRef: React.RefObject<OffsetMap>
  keyToIndexRef: React.RefObject<Map<string | number, number>>
  scrollerRef: React.RefObject<HTMLDivElement | null>
  deviation: DeviationController
  stateMachine: ScrollStateMachineAPI
  onUpdate: () => void
}

/**
 * 测量批处理管线
 *
 * - 子组件通过 measureItem 上报尺寸 → 入队
 * - 每帧一次 RAF flush → 更新 OffsetMap → 触发 deviation → 通知重算范围
 * - flushPendingMeasures 供 scrollAnchor 同步 flush
 */
export function useMeasurePipeline(opts: MeasurePipelineOpts) {
  const pendingRef = useRef(new Map<string | number, number>())
  const rafRef = useRef<number | null>(null)

  const optsRef = useRef(opts)
  optsRef.current = opts

  const flush = useLatestCallback(() => {
    rafRef.current = null
    const pending = pendingRef.current
    if (pending.size === 0)
      return

    const { offsetMapRef, keyToIndexRef, scrollerRef, deviation, stateMachine, onUpdate } = optsRef.current
    const om = offsetMapRef.current
    const keyToIndex = keyToIndexRef.current
    const el = scrollerRef.current
    const state = stateMachine.getState()

    if (!om || !keyToIndex)
      return

    let scrollDelta = 0

    pending.forEach((size, key) => {
      const index = keyToIndex.get(key)
      if (index === undefined)
        return

      const oldSize = om.getSize(index)
      if (oldSize === size)
        return

      if (el && state !== 'restoring' && state !== 'animating') {
        const itemTop = om.getOffset(index)
        if (itemTop < el.scrollTop) {
          scrollDelta += size - oldSize
        }
      }

      om.setSize(index, size)
    })
    pending.clear()

    if (scrollDelta !== 0) {
      deviation.schedule(scrollDelta)
    }

    onUpdate()
  })

  const measureItem = useLatestCallback((key: string | number, size: number) => {
    if (size <= 0)
      return
    pendingRef.current.set(key, size)
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flush)
    }
  })

  const flushPendingMeasures = useLatestCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    flush()
  })

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return { measureItem, flushPendingMeasures }
}
