import type { WheelEvent as ReactWheelEvent } from 'react'
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
  } = options

  const handleWheel = useCallback((e: ReactWheelEvent) => {
    if (preventDefault)
      e.preventDefault()

    if (stopPropagation)
      e.stopPropagation()

    const { deltaY } = e

    // 过滤掉极小的滚动值（例如某些触控板抖动）
    if (Math.abs(deltaY) <= threshold)
      return

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
}
