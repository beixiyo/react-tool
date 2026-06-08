import { useLatestCallback } from 'hooks'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { modalStore } from './modalStore'

/**
 * 让单个 Modal 实例接入全局栈管理
 *
 * - 打开时入栈并领取递增 z-index，关闭/卸载时出栈
 * - 返回 `isTop` 标记是否为最上层（用于遮罩去重）
 * - 仅栈顶 Modal 响应 ESC 关闭，避免一次 ESC 关掉所有层
 *
 * @returns `zIndex` 自动分配的层级（未打开时为 undefined）；`isTop` 是否栈顶
 */
export function useModalStack(params: UseModalStackParams) {
  const { open, escToClose, onClose } = params

  const idRef = useRef(0)
  if (idRef.current === 0) {
    idRef.current = modalStore.nextId()
  }
  const id = idRef.current

  const [zIndex, setZIndex] = useState<number>()

  useEffect(() => {
    if (!open) {
      return
    }
    setZIndex(modalStore.open(id))
    return () => modalStore.close(id)
  }, [open, id])

  const stack = useSyncExternalStore(
    modalStore.subscribe,
    modalStore.getSnapshot,
    modalStore.getSnapshot,
  )
  const isTop = stack.length > 0 && stack[stack.length - 1] === id

  const handleKeydown = useLatestCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && open && isTop && escToClose) {
      onClose?.()
    }
  })

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [handleKeydown])

  return { zIndex, isTop }
}

interface UseModalStackParams {
  /** 当前是否打开 */
  open: boolean
  /** 是否允许 ESC 关闭 */
  escToClose: boolean
  /** 关闭回调 */
  onClose?: () => void
}
