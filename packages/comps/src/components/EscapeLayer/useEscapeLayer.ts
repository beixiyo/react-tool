import type { EscapeLayerController, UseEscapeLayerOptions } from './types'
import { useLatestCallback } from 'hooks'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { escapeLayerStore } from './escapeLayerStore'

/**
 * 将一个可关闭浮层注册到全局 Escape 响应栈
 *
 * 后打开的浮层优先响应 Escape，同一次按键不会继续关闭下层浮层
 */
export function useEscapeLayer(options: UseEscapeLayerOptions): EscapeLayerController {
  const {
    open,
    onEscape,
    dismissible = true,
    consume = true,
  } = options

  const idRef = useRef<symbol>(undefined)
  if (!idRef.current) {
    idRef.current = Symbol('escape-layer')
  }
  const id = idRef.current
  const handleEscape = useLatestCallback((event: KeyboardEvent) => {
    onEscape?.(event)
  })

  useEffect(() => {
    if (!open) {
      return
    }

    escapeLayerStore.register({
      id,
      onEscape: handleEscape,
      dismissible,
      consume,
    })

    return () => escapeLayerStore.unregister(id)
  }, [handleEscape, id, open])

  useEffect(() => {
    escapeLayerStore.update(id, {
      onEscape: handleEscape,
      dismissible,
      consume,
    })
  }, [consume, dismissible, handleEscape, id])

  const topLayerId = useSyncExternalStore(
    escapeLayerStore.subscribe,
    escapeLayerStore.getSnapshot,
    escapeLayerStore.getSnapshot,
  )

  return {
    isTopLayer: open && topLayerId === id,
  }
}
