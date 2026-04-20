import { useLatestCallback, useLatestRef, useResizeObserver } from 'hooks'
import { useEffect, useRef, useState } from 'react'

/**
 * 无缝滚动核心逻辑
 * - 测量容器尺寸 V 与单份内容尺寸 W，计算所需副本数 N = max(2, ceil(V / (W + gap)) + 1)
 * - RAF 驱动 transform 位移，达到一份单位（W + gap）时瞬时重置回 0，视觉无缝
 * - 单份 < 容器 时自动按需扩份，不再露出空白
 */
export function useSeamlessScroll(options: UseSeamlessScrollOptions) {
  const { speed, direction, gap, pauseOnHover } = options

  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const unitRef = useRef<HTMLDivElement>(null)

  const [copies, setCopies] = useState(2)
  const [isPaused, setIsPaused] = useState(false)
  const isPausedRef = useRef(false)
  /** 缓存单份 + gap 的像素长度，避免每帧触发 layout reflow */
  const unitSizeRef = useRef(0)

  const isVertical = direction === 'up' || direction === 'down'
  const isReverse = direction === 'right' || direction === 'down'

  const latestRef = useLatestRef({ speed, gap, isVertical, isReverse })

  /** 测量 + 计算副本数。容器或单份尺寸变化都会触发 */
  useResizeObserver([containerRef, unitRef], () => {
    const c = containerRef.current
    const u = unitRef.current
    if (!c || !u)
      return

    const V = isVertical
      ? c.offsetHeight
      : c.offsetWidth
    const W = isVertical
      ? u.offsetHeight
      : u.offsetWidth
    const unit = W + gap
    if (!V || unit <= 0)
      return

    unitSizeRef.current = unit
    const need = Math.max(2, Math.ceil(V / unit) + 1)
    setCopies(prev => prev === need
      ? prev
      : need)
  })

  /** RAF 动画循环。copies 变化会让 effect 重跑，重新初始化 position */
  useEffect(
    () => {
      if (!trackRef.current || !unitRef.current)
        return

      /** 初次挂载时 resize 回调可能还没跑，手动兜底一次 */
      if (unitSizeRef.current <= 0) {
        const u = unitRef.current
        const W = isVertical
          ? u.offsetHeight
          : u.offsetWidth
        unitSizeRef.current = W + gap
      }

      let rafId = 0
      let lastTime = performance.now()
      let position = isReverse
        ? -unitSizeRef.current
        : 0

      const step = (now: number) => {
        const track = trackRef.current
        if (!track)
          return

        const dt = now - lastTime
        lastTime = now

        const maxOffset = unitSizeRef.current
        if (!isPausedRef.current && maxOffset > 0) {
          const { speed: sp, isVertical: v, isReverse: r } = latestRef.current
          const move = (sp * dt) / 1000
          position += r
            ? move
            : -move

          /** 用累加/累减重置而非直接归零，避免丢失一帧内的溢出量 */
          if (!r && position <= -maxOffset)
            position += maxOffset
          if (r && position >= 0)
            position -= maxOffset

          track.style.transform = v
            ? `translateY(${position}px)`
            : `translateX(${position}px)`
        }

        rafId = requestAnimationFrame(step)
      }

      rafId = requestAnimationFrame(step)
      return () => cancelAnimationFrame(rafId)
    },
    /** direction / gap 变化需要重置起始 position，所以一并进依赖 */
    [direction, gap, copies, isVertical, isReverse, latestRef],
  )

  const onMouseEnter = useLatestCallback(() => {
    if (!pauseOnHover)
      return
    isPausedRef.current = true
    setIsPaused(true)
  })

  const onMouseLeave = useLatestCallback(() => {
    if (!pauseOnHover)
      return
    isPausedRef.current = false
    setIsPaused(false)
  })

  return {
    containerRef,
    trackRef,
    unitRef,
    copies,
    isPaused,
    isVertical,
    onMouseEnter,
    onMouseLeave,
  }
}

export type UseSeamlessScrollOptions = {
  speed: number
  direction: 'left' | 'right' | 'up' | 'down'
  gap: number
  pauseOnHover: boolean
}
