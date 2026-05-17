import type { ScrollStateMachineAPI } from './useScrollStateMachine'
import { useLayoutEffect, useRef } from 'react'

export type FollowOutputOpts = {
  currentKeys: (string | number)[]
  followOutput: 'auto' | 'smooth' | false
  isAutoScrollingRef: React.MutableRefObject<boolean>
  scrollerRef: React.RefObject<HTMLDivElement | null>
  stateMachine: ScrollStateMachineAPI
}

/**
 * 自动追底 — 只追 append，永不追 prepend
 *
 * 在 useLayoutEffect 中同步执行（paint 前），消除闪烁
 * 通过 key 而非 index 区分 append 和 prepend
 */
export function useFollowOutput(opts: FollowOutputOpts) {
  const prevKeysRef = useRef<(string | number)[]>([])

  const optsRef = useRef(opts)
  optsRef.current = opts

  useLayoutEffect(() => {
    const { currentKeys, followOutput, isAutoScrollingRef, scrollerRef } = optsRef.current
    if (!followOutput) {
      prevKeysRef.current = currentKeys
      return
    }

    const prevKeys = prevKeysRef.current
    prevKeysRef.current = currentKeys

    if (prevKeys.length === 0)
      return

    const prevN = prevKeys.length
    const nextN = currentKeys.length
    if (nextN <= prevN)
      return

    const firstUnchanged = currentKeys[0] === prevKeys[0]
    const lastChanged = currentKeys[nextN - 1] !== prevKeys[prevN - 1]
    const isAppend = firstUnchanged && lastChanged

    if (!isAppend || !isAutoScrollingRef.current)
      return

    const el = scrollerRef.current
    if (!el)
      return

    el.scrollTop = el.scrollHeight

    requestAnimationFrame(() => {
      if (el.scrollHeight > el.scrollTop + el.clientHeight + 4) {
        el.scrollTop = el.scrollHeight
      }
    })
  }, [opts.currentKeys])
}
