import type { FloatingPlacement } from 'hooks'
import type { RefObject } from 'react'
import { useFloatingPosition } from 'hooks'
import { useEffect, useState } from 'react'

export interface UsePickerFloatingOptions {
  /** 是否启用 */
  enabled: boolean
  /** 触发器元素引用 */
  triggerRef: RefObject<HTMLElement | null>
  /** 下拉面板引用 */
  dropdownRef: RefObject<HTMLElement | null>
  /** 定位方式 */
  placement?: FloatingPlacement
  /** 偏移量 */
  offset?: number
}

export interface UsePickerFloatingReturn {
  /** 样式对象 */
  style: React.CSSProperties
  /** 是否应该显示动画 */
  shouldAnimate: boolean
}

/**
 * 统一的 Picker 浮层位置管理 Hook
 * 处理浮层位置计算和动画状态
 */
export function usePickerFloating({
  enabled,
  triggerRef,
  dropdownRef,
  placement = 'bottom-start',
  offset = 4,
}: UsePickerFloatingOptions): UsePickerFloatingReturn {
  /** 是否应该显示动画，位置计算完成后才为 true */
  const [shouldAnimate, setShouldAnimate] = useState(false)

  const {
    style,
    update,
  } = useFloatingPosition(triggerRef, dropdownRef, {
    enabled,
    placement,
    offset,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /** 当打开状态变化时，计算位置 */
  useEffect(() => {
    if (enabled && triggerRef.current) {
      setShouldAnimate(false)
      requestAnimationFrame(() => {
        update()
        setShouldAnimate(true)
      })
    }
    else {
      setShouldAnimate(false)
    }
  }, [enabled, update, triggerRef])

  return {
    style,
    shouldAnimate,
  }
}
