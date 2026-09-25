/** 连续轨道的指针拖动与横向触控板手势；仅在当前轮播容器内生效 */

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react'

/** 让轨道跟随手指/鼠标移动，并在松开时按距离或速度决定翻页 */
export function useContinuousDrag({ enabled, animating, onNext, onPrev }: ContinuousDragOptions) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [settling, setSettling] = useState(false)
  const pointer = useRef<{ id: number; x: number; time: number; width: number } | null>(null)
  const lastWheelAt = useRef(0)

  useEffect(() => {
    if (!dragging) return
    const previous = document.documentElement.style.cursor
    document.documentElement.style.cursor = 'grabbing'
    return () => { document.documentElement.style.cursor = previous }
  }, [dragging])

  const resetPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = pointer.current
    if (!active || active.id !== event.pointerId) return null
    pointer.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    return active
  }

  return {
    offset,
    dragging,
    settling,
    onSettled: () => setSettling(false),
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || (settling && !animating) || pointer.current || (event.pointerType === 'mouse' && event.button !== 0)) return
      pointer.current = { id: event.pointerId, x: event.clientX, time: Date.now(), width: event.currentTarget.clientWidth }
      setDragging(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
    },
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => {
      const active = pointer.current
      if (!active || active.id !== event.pointerId) return
      // 正在翻页时只记录下一次手势意图，避免拖动偏移突然叠到过渡动画上
      if (!animating) setOffset(event.clientX - active.x)
    },
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => {
      const active = resetPointer(event)
      if (!active) return
      const distance = event.clientX - active.x
      const elapsed = Math.max(1, Date.now() - active.time)
      setOffset(0)
      setSettling(!animating && Math.abs(distance) > 1)
      if (Math.abs(distance) >= active.width * 0.15 || (Math.abs(distance) > 20 && Math.abs(distance / elapsed) > 0.5)) {
        if (distance < 0) onNext()
        else onPrev()
      }
    },
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => {
      const active = resetPointer(event)
      if (!active) return
      setOffset(0)
      setSettling(!animating && Math.abs(event.clientX - active.x) > 1)
    },
    onLostPointerCapture: (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointer.current || pointer.current.id !== event.pointerId) return
      pointer.current = null
      setDragging(false)
      setOffset(0)
      setSettling(false)
    },
    onWheel: (event: ReactWheelEvent<HTMLDivElement>) => {
      if (!enabled || (settling && !animating) || Math.abs(event.deltaX) < 12 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      const now = Date.now()
      if (now - lastWheelAt.current < 160) return
      lastWheelAt.current = now
      if (event.deltaX > 0) onNext()
      else onPrev()
    },
  }
}

/** 指针与触控板共用的翻页行为 */
type ContinuousDragOptions = {
  enabled: boolean
  animating: boolean
  onNext: () => void
  onPrev: () => void
}
