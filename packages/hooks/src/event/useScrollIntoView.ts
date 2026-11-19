import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'
import { useLatestCallback } from '../memo'

/** 提供可取消、可选防抖及滚动边界的元素滚入视区能力，触发策略由调用方负责 */
export function useScrollIntoView(options: UseScrollIntoViewOptions = {}) {
  const {
    enabled = true,
    delay = 0,
    behavior = 'smooth',
    block = 'nearest',
    inline = 'nearest',
    boundary,
  } = options
  const timerRef = useRef<number | null>(null)

  const cancelScroll = useLatestCallback(() => {
    if (timerRef.current === null) return
    window.clearTimeout(timerRef.current)
    timerRef.current = null
  })

  const performScroll = useLatestCallback((targets: ScrollIntoViewTargets) => {
    if (!enabled) return
    const limit = boundary === undefined
      ? undefined
      : resolveTarget(boundary)
    /** 显式边界尚未挂载时不回退到原生滚动，避免意外带动页面 */
    if (boundary !== undefined && !limit) return

    const scrollOptions = { behavior, block, inline }
    const targetList = Array.isArray(targets)
      ? targets
      : [targets]

    for (const target of targetList) {
      const element = resolveTarget(target)
      if (!element) continue
      if (limit) {
        if (limit.contains(element)) scrollWithinBoundary(element, limit, scrollOptions)
      }
      else {
        element.scrollIntoView(scrollOptions)
      }
    }
  })

  const scrollIntoView = useLatestCallback((targets: ScrollIntoViewTargets) => {
    cancelScroll()
    if (!enabled) return
    if (delay <= 0) {
      performScroll(targets)
      return
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      performScroll(targets)
    }, delay)
  })

  useEffect(() => {
    if (!enabled) cancelScroll()
    return cancelScroll
  }, [enabled, cancelScroll])

  return { scrollIntoView, cancelScroll }
}

function resolveTarget(target: ScrollIntoViewTarget) {
  if (typeof target === 'function') return target()
  if ('current' in target) return target.current
  return target
}

function scrollWithinBoundary(target: Element, boundary: Element, options: NormalizedScrollOptions) {
  for (let container = target.parentElement; container && boundary.contains(container); container = container.parentElement) {
    const style = getComputedStyle(container)
    const scrollY = container.clientHeight > 0 && container.scrollHeight > container.clientHeight && /^(auto|scroll|hidden)$/.test(style.overflowY)
    const scrollX = container.clientWidth > 0 && container.scrollWidth > container.clientWidth && /^(auto|scroll|hidden)$/.test(style.overflowX)
    if (!scrollX && !scrollY) continue

    const viewport = container.getBoundingClientRect()
    const rect = target.getBoundingClientRect()

    /** CSS transform 使用视口像素，scrollTo 使用布局像素，需还原缩放比例 */
    const scaleX = (container.offsetWidth > 0
      ? viewport.width / container.offsetWidth
      : 1) || 1
    const scaleY = (container.offsetHeight > 0
      ? viewport.height / container.offsetHeight
      : 1) || 1

    const top = viewport.top + container.clientTop * scaleY
    const left = viewport.left + container.clientLeft * scaleX
    const verticalWriting = style.writingMode.startsWith('vertical')

    const block = physicalAlignment(options.block, verticalWriting && style.writingMode === 'vertical-rl')
    const inline = physicalAlignment(options.inline, style.direction === 'rtl')
    const deltaY = scrollY
      ? alignmentDelta(
        rect.top,
        rect.bottom,
        top,
        top + container.clientHeight * scaleY,
        verticalWriting
          ? inline
          : block,
      ) / scaleY
      : 0
    const deltaX = scrollX
      ? alignmentDelta(
        rect.left,
        rect.right,
        left,
        left + container.clientWidth * scaleX,
        verticalWriting
          ? block
          : inline,
      ) / scaleX
      : 0

    if (deltaX || deltaY) {
      container.scrollTo({ top: container.scrollTop + deltaY, left: container.scrollLeft + deltaX, behavior: options.behavior })
    }
    return
  }
}

function physicalAlignment(alignment: ScrollLogicalPosition, reversed: boolean): ScrollLogicalPosition {
  if (reversed && alignment === 'start') return 'end'
  if (reversed && alignment === 'end') return 'start'
  return alignment
}

function alignmentDelta(start: number, end: number, viewportStart: number, viewportEnd: number, alignment: ScrollLogicalPosition): number {
  if (alignment === 'start') return start - viewportStart
  if (alignment === 'end') return end - viewportEnd
  if (alignment === 'center') return (start + end - viewportStart - viewportEnd) / 2

  const fits = end - start <= viewportEnd - viewportStart
  if (start < viewportStart && (fits || end < viewportEnd)) {
    return fits
      ? start - viewportStart
      : end - viewportEnd
  }
  if (end > viewportEnd && (fits || start > viewportStart)) {
    return fits
      ? end - viewportEnd
      : start - viewportStart
  }
  return 0
}

/** 可直接传入元素、元素 ref 或返回元素的回调 */
export type ScrollIntoViewTarget = Element | RefObject<Element | null> | (() => Element | null)
/** 单个或多个滚动目标 */
export type ScrollIntoViewTargets = ScrollIntoViewTarget | readonly ScrollIntoViewTarget[]

/** 元素滚动配置；未提供边界时保留浏览器原生滚动行为 */
export interface UseScrollIntoViewOptions extends ScrollIntoViewOptions {
  /** 是否允许执行滚动 @default true */
  enabled?: boolean
  /** 防抖时间，单位毫秒；小于等于 0 时立即执行 @default 0 */
  delay?: number
  /**
   * 可选容器边界，仅滚动其内部最近的可滚动容器；边界未挂载或不包含目标时不滚动
   * @default undefined
   */
  boundary?: ScrollIntoViewTarget
}

type NormalizedScrollOptions = Required<Pick<ScrollIntoViewOptions, 'behavior' | 'block' | 'inline'>>
