import type { KeyboardLayerController, UseKeyboardLayerOptions } from './types'
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { useLatestCallback } from '../../memo'
import { useLatestRef } from '../../ref'
import { keyboardLayerStore } from './keyboardLayerStore'

/**
 * 将交互区域注册到全局键盘响应栈
 *
 * 最高 priority 的层优先；同 priority 时，最近激活的层优先
 */
export function useKeyboardLayer(options: UseKeyboardLayerOptions): KeyboardLayerController {
  const {
    active,
    keys,
    ctrlKey,
    shiftKey,
    altKey,
    metaKey,
    when,
    priority = 0,
    onKeyDown,
    handlerEnabled = true,
    allowRepeat = true,
    consume = true,
  } = options

  const idRef = useRef<symbol>(undefined)
  if (!idRef.current)
    idRef.current = Symbol('keyboard-layer')
  const id = idRef.current
  const previousActiveRef = useRef(active)

  const matches = useLatestCallback((event: KeyboardEvent) => {
    if (keys && !keys.includes(event.key))
      return false

    if (ctrlKey !== undefined && event.ctrlKey !== ctrlKey)
      return false
    if (shiftKey !== undefined && event.shiftKey !== shiftKey)
      return false
    if (altKey !== undefined && event.altKey !== altKey)
      return false
    if (metaKey !== undefined && event.metaKey !== metaKey)
      return false

    return when?.(event) ?? true
  })

  const handleKeyDown = useLatestCallback((event: KeyboardEvent) => {
    onKeyDown?.(event)
  })

  const optionsRef = useLatestRef({
    active,
    priority,
    matches,
    onKeyDown: handleKeyDown,
    handlerEnabled,
    allowRepeat,
    consume,
  })

  useIsomorphicLayoutEffect(() => {
    keyboardLayerStore.register({
      id,
      order: 0,
      getOptions: () => optionsRef.current,
    })

    return () => keyboardLayerStore.unregister(id)
  }, [id, optionsRef])

  useIsomorphicLayoutEffect(() => {
    const wasActive = previousActiveRef.current
    previousActiveRef.current = active

    if (!wasActive && active)
      keyboardLayerStore.activate(id)
    else
      keyboardLayerStore.refresh()
  }, [active, id, priority])

  const topLayerId = useSyncExternalStore(
    keyboardLayerStore.subscribe,
    keyboardLayerStore.getSnapshot,
    keyboardLayerStore.getSnapshot,
  )

  return {
    isTopLayer: active && topLayerId === id,
  }
}

const useIsomorphicLayoutEffect = typeof window === 'undefined'
  ? useEffect
  : useLayoutEffect
