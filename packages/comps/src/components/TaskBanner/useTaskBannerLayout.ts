/** 测量同一批真实卡片的自然尺寸；共享可反向的时间轴，不复制 DOM 或切换 layoutId */
import { useLatestCallback } from 'hooks'
import { animate, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'

/** 单卡运动时长与相邻卡片错峰间隔（秒）*/
export const COLLAPSE_DURATION = 0.42
export const COLLAPSE_STAGGER = 0.1

/** 测量不受 transform 影响的内容盒，容器始终保留展开坐标系 */
export function useTaskBannerLayout({ collapsed, count, layoutKey }: LayoutOptions) {
  const rootRef = useRef<HTMLDivElement>(null)
  const elements = useRef(new Map<number, HTMLDivElement>())
  const [geometry, setGeometry] = useState<Geometry>({ sizes: new Map(), gap: 12 })
  const progress = useMotionValue(
    collapsed
      ? 1
      : 0,
  )
  const reducedMotion = useReducedMotion()
  const duration = COLLAPSE_DURATION + Math.max(0, count - 2) * COLLAPSE_STAGGER

  const measure = useLatestCallback(() => {
    const sizes = new Map<number, CardSize>()
    elements.current.forEach((element, id) => {
      sizes.set(id, { width: element.offsetWidth, height: element.offsetHeight })
    })
    const parent = rootRef.current?.parentElement
    const gap = parent
      ? Number.parseFloat(getComputedStyle(parent).rowGap) || 0
      : 12
    setGeometry((previous) => {
      if (
        previous.gap === gap && previous.sizes.size === sizes.size
        && [...sizes].every(([id, size]) => previous.sizes.get(id)?.width === size.width && previous.sizes.get(id)?.height === size.height)
      ) {
        return previous
      }
      return { sizes, gap }
    })
  })

  useLayoutEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    elements.current.forEach((element) => observer.observe(element))
    if (rootRef.current?.parentElement) observer.observe(rootRef.current.parentElement)
    return () => observer.disconnect()
  }, [layoutKey, measure])

  useLayoutEffect(() => {
    const target = collapsed
      ? 1
      : 0
    /** stop 保留当前值；反向只走剩余路程，所有卡片沿原路径返回，不重放 initial */
    const controls = animate(progress, target, {
      duration: reducedMotion
        ? 0
        : duration * Math.abs(target - progress.get()),
      ease: 'linear',
    })
    return () => controls.stop()
  }, [collapsed, duration, progress, reducedMotion])

  return { rootRef, elements, geometry, progress, duration, measure }
}

/** 全局时间轴转换成单卡进度：收起远端先行，反向时近端先展开。 */
export function useTaskBannerCardProgress({ progress, index, count, duration }: CardProgressOptions) {
  return useTransform(() => {
    if (index === 0) return 0
    const delay = Math.max(0, count - 1 - index) * COLLAPSE_STAGGER
    const value = Math.max(0, Math.min(1, (progress.get() * duration - delay) / COLLAPSE_DURATION))
    return value * value * (3 - 2 * value)
  })
}

/** 不含缩放、位移的真实卡片尺寸。 */
export type CardSize = { width: number; height: number }

type Geometry = { sizes: Map<number, CardSize>; gap: number }
type LayoutOptions = { collapsed: boolean; count: number; layoutKey: string }
type CardProgressOptions = {
  progress: import('motion/react').MotionValue<number>
  index: number
  count: number
  duration: number
}
