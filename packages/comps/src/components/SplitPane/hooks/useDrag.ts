import { useCallback, useEffect, useRef } from 'react'

export type UseDragOptions = {
  /**
   * 拖拽开始回调
   */
  onDragStart?: (event: React.MouseEvent) => void
  /**
   * 拖拽中回调，delta 为相对于起始位置的偏移量
   */
  onDrag: (delta: number) => void
  /**
   * 拖拽结束回调
   */
  onDragEnd?: () => void
}

export type UseDragReturn = {
  /**
   * 是否正在拖拽
   */
  isDragging: boolean
  /**
   * 开始拖拽的处理函数
   */
  handleMouseDown: (e: React.MouseEvent) => void
}

/**
 * 拖拽逻辑 Hook
 */
export function useDrag(options: UseDragOptions): UseDragReturn {
  const { onDragStart, onDrag, onDragEnd } = options
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      isDraggingRef.current = true
      startXRef.current = e.clientX
      onDragStart?.(e)
    },
    [onDragStart],
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current)
        return
      const delta = e.clientX - startXRef.current
      onDrag(delta)
    }

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        onDragEnd?.()
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [onDrag, onDragEnd])

  return {
    isDragging: isDraggingRef.current,
    handleMouseDown,
  }
}
