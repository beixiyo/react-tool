import { clamp } from '@jl-org/tool'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DragPosition, UseDragPositionOptions, UseDragPositionReturn } from './types'

/**
 * 通用指针拖拽定位 Hook：把「按下把手 → 移动 → 元素跟随」封装为
 * 视口内的 { x, y } 状态，适合 position: fixed 的悬浮元素
 *
 * - 未拖动前 position 为 null，调用方可以用自己的 CSS 定位（如 right-0 top-0），
 *   首次拖动会以元素当前渲染位置为基准无缝接管
 * - 按下后位移超过 startThreshold 才进入拖动，把手内交互元素的 click 不受影响
 * - 位置始终 clamp 在视口内；视口缩小后，下一次拖动的第一帧会把元素拉回可见区
 * - 建议把手元素加上 `touch-none select-none`，避免触摸滚动干扰与拖动选中文本
 *
 * @example
 * const targetRef = useRef<HTMLDivElement>(null)
 * const { position, isDragging, handleProps } = useDragPosition({ targetRef })
 * // position 为 null 时沿用默认 CSS 定位；拖动后应用 left/top
 */
export function useDragPosition(options: UseDragPositionOptions): UseDragPositionReturn {
  const {
    targetRef,
    initialPosition = null,
    boundaryPadding = 0,
    startThreshold = 4,
    disabled = false,
  } = options

  const [position, setPosition] = useState<DragPosition | null>(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  /** 指针会话存活期间为 true，驱动 effect 绑定 window 监听 */
  const [sessionActive, setSessionActive] = useState(false)
  const sessionRef = useRef<DragSession | null>(null)

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (disabled || event.button !== 0) return

    const target = targetRef.current
    if (!target) return

    const rect = target.getBoundingClientRect()
    sessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: rect.left,
      baseY: rect.top,
      width: rect.width,
      height: rect.height,
      started: false,
    }
    setSessionActive(true)
  }, [disabled, targetRef])

  /**
   * 会话存续期间在 window 上监听 move / up / cancel，
   * 指针移出把手也能持续跟随；卸载或会话结束即解绑
   */
  useEffect(() => {
    if (!sessionActive) return

    const handleMove = (event: PointerEvent) => {
      const session = sessionRef.current
      if (!session || event.pointerId !== session.pointerId) return

      const dx = event.clientX - session.startX
      const dy = event.clientY - session.startY

      if (!session.started) {
        const thresholdSq = startThreshold * startThreshold
        if (dx * dx + dy * dy < thresholdSq) return

        session.started = true
        setIsDragging(true)
      }

      event.preventDefault()
      setPosition({
        x: clampToViewport(session.baseX + dx, session.width, window.innerWidth, boundaryPadding),
        y: clampToViewport(session.baseY + dy, session.height, window.innerHeight, boundaryPadding),
      })
    }

    const endSession = (event: PointerEvent) => {
      const session = sessionRef.current
      if (!session || event.pointerId !== session.pointerId) return

      sessionRef.current = null
      setSessionActive(false)
      if (session.started) setIsDragging(false)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', endSession)
    window.addEventListener('pointercancel', endSession)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', endSession)
      window.removeEventListener('pointercancel', endSession)
    }
  }, [sessionActive, startThreshold, boundaryPadding])

  const reset = useCallback(() => {
    setPosition(initialPosition)
  }, [initialPosition])

  const handleProps = useMemo(() => ({
    onPointerDown: handlePointerDown,
  }), [handlePointerDown])

  return {
    position,
    isDragging,
    handleProps,
    reset,
  }
}

type DragSession = {
  pointerId: number | undefined
  startX: number
  startY: number
  /** 会话开始时元素的渲染位置，拖动位移以此为基准 */
  baseX: number
  baseY: number
  width: number
  height: number
  /** 是否已越过启动阈值（真正进入拖动） */
  started: boolean
}

/**
 * 把某一轴的坐标 clamp 进视口：
 * 元素比视口还大时退化为至少露出 boundaryPadding 的起始边
 */
function clampToViewport(value: number, size: number, viewportSize: number, padding: number): number {
  const min = padding
  const max = Math.max(min, viewportSize - size - padding)
  return clamp(value, min, max)
}
