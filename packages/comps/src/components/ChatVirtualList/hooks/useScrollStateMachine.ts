import type { ScrollState } from '../core/types'
import { useLatestCallback } from 'hooks'
import { useMemo, useRef } from 'react'

export function useScrollStateMachine() {
  const stateRef = useRef<ScrollState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const getState = useLatestCallback(() => stateRef.current)

  const beginRestore = useLatestCallback((durationMs: number) => {
    clearTimer()
    stateRef.current = 'restoring'
    timerRef.current = setTimeout(() => {
      stateRef.current = 'idle'
      timerRef.current = null
    }, durationMs)
  })

  const endRestore = useLatestCallback(() => {
    clearTimer()
    stateRef.current = 'idle'
  })

  const beginAnimate = useLatestCallback((durationMs = 500) => {
    clearTimer()
    stateRef.current = 'animating'
    timerRef.current = setTimeout(() => {
      stateRef.current = 'idle'
      timerRef.current = null
    }, durationMs)
  })

  const endAnimate = useLatestCallback(() => {
    clearTimer()
    stateRef.current = 'idle'
  })

  return useMemo(
    () => ({ getState, beginRestore, endRestore, beginAnimate, endAnimate }),
    [getState, beginRestore, endRestore, beginAnimate, endAnimate],
  )
}

export type ScrollStateMachineAPI = ReturnType<typeof useScrollStateMachine>
