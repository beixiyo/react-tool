import type { WheelEvent as ReactWheelEvent, RefObject } from 'react'
import { useCallback } from 'react'

/**
 * 通用的鼠标滚轮方向判断 hook
 *
 * 将原始 wheel 事件归一化为「向上 / 向下」两个方向，
 * 并提供统一的默认行为控制（阻止默认滚动、阻止冒泡等）
 */
export function useWheelDirection(
  handlers: WheelDirectionHandlers,
  options: UseWheelDirectionOptions = {},
) {
  const {
    onScrollUp,
    onScrollDown,
  } = handlers

  const {
    preventDefault = true,
    stopPropagation = true,
    threshold = 10,
    enable = true,
    scrollContainer,
    useClosestScrollableParent = false,
    boundaryContainerRef,
  } = options

  const handleWheel = useCallback((e: ReactWheelEvent) => {
    if (!enable)
      return

    const { deltaY } = e

    // 过滤掉极小的滚动值（例如某些触控板抖动）
    if (Math.abs(deltaY) <= threshold)
      return

    const resolveScrollContainer = () => {
      if (scrollContainer) {
        if (typeof scrollContainer === 'function')
          return scrollContainer()
        if ('current' in scrollContainer)
          return scrollContainer.current
        return scrollContainer
      }

      if (!useClosestScrollableParent || typeof window === 'undefined')
        return null

      const boundary = boundaryContainerRef?.current
      let node = e.target as HTMLElement | null
      while (node && node !== boundary && node !== document.body) {
        const style = window.getComputedStyle(node)
        const hasScroll = /(auto|scroll|overlay)/.test(`${style.overflow}${style.overflowY}`)
        if (hasScroll && node.scrollHeight > node.clientHeight + 1)
          return node
        node = node.parentElement
      }

      return null
    }

    const scrollParent = resolveScrollContainer()
    if (scrollParent) {
      const canScrollUp = scrollParent.scrollTop > 0
      const canScrollDown = scrollParent.scrollTop + scrollParent.clientHeight < scrollParent.scrollHeight - 1
      const isScrollingUp = deltaY < 0
      const canScroll = isScrollingUp
        ? canScrollUp
        : canScrollDown

      if (canScroll)
        return
    }

    if (preventDefault)
      e.preventDefault()

    if (stopPropagation)
      e.stopPropagation()

    if (deltaY < 0) {
      onScrollUp?.(e)
    }
    else if (deltaY > 0) {
      onScrollDown?.(e)
    }
  }, [onScrollDown, onScrollUp, preventDefault, stopPropagation, threshold])

  return handleWheel
}

export interface WheelDirectionHandlers {
  /**
   * 向上滚动时触发（deltaY < 0）
   */
  onScrollUp?: (e: ReactWheelEvent) => void

  /**
   * 向下滚动时触发（deltaY > 0）
   */
  onScrollDown?: (e: ReactWheelEvent) => void
}

export interface UseWheelDirectionOptions {
  /**
   * 是否阻止默认行为（如页面/容器滚动）
   * @default true
   */
  preventDefault?: boolean

  /**
   * 是否阻止事件冒泡
   * @default true
   */
  stopPropagation?: boolean

  /**
   * 触发方向判断的最小绝对值阈值
   * @default 10
   */
  threshold?: number

  /**
   * 是否启用滚轮方向判断
   * @default true
   */
  enable?: boolean

  /**
   * 指定滚动容器，存在可滚动空间时不会触发方向回调
   * 支持传入元素、Ref 或函数返回元素
   */
  scrollContainer?: HTMLElement | RefObject<HTMLElement | null> | (() => HTMLElement | null)

  /**
   * 是否从事件目标向上查找可滚动父容器
   * @default false
   */
  useClosestScrollableParent?: boolean

  /**
   * 向上查找时的边界容器（到该容器即停止查找）
   */
  boundaryContainerRef?: RefObject<HTMLElement | null>
}
