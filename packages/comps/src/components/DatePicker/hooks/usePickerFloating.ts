import type { FloatingPlacement } from 'hooks'
import type { RefObject } from 'react'
import type { FloatingArrowConfig, FloatingArrowProps } from '../../FloatingArrow'
import { useEffect, useRef, useState } from 'react'
import { useFloatingLayer } from '../../FloatingArrow'

export interface UsePickerFloatingOptions {
  /** 是否启用 */
  enabled: boolean
  /** 触发器元素引用 */
  triggerRef: RefObject<HTMLElement | null>
  /** 下拉面板引用 */
  dropdownRef: RefObject<HTMLElement | null>
  /** 定位方式 */
  placement?: FloatingPlacement
  /** 触发器到面板可见边缘的间距；开启箭头时以箭头尖端为准 */
  offset?: number
  /** 箭头配置 */
  arrow?: FloatingArrowConfig
  /** 箭头是否绘制边框，需与面板边框保持一致 */
  bordered?: boolean
}

export interface UsePickerFloatingReturn {
  /** 样式对象 */
  style: React.CSSProperties
  /** 经过视口碰撞检测后的最终位置 */
  placement: FloatingPlacement
  /** 是否应该显示动画 */
  shouldAnimate: boolean
  /** 可直接展开给 FloatingArrow 的属性；未开启箭头时为 null */
  arrowProps: FloatingArrowProps | null
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
  offset = 8,
  arrow,
  bordered = false,
}: UsePickerFloatingOptions): UsePickerFloatingReturn {
  /** 是否应该显示动画，位置计算完成后才为 true */
  const [shouldAnimate, setShouldAnimate] = useState(false)

  const {
    style,
    placement: actualPlacement,
    update,
    arrowProps,
  } = useFloatingLayer(triggerRef, dropdownRef, {
    enabled,
    placement,
    offset,
    arrow,
    bordered,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /**
   * 停用定位时 useFloatingPosition 会将坐标重置到视口外
   * DatePicker 的浮层仍需留在原位完成退出动画，因此保留最后一次有效坐标
   */
  const lastPositionedStyleRef = useRef<React.CSSProperties>(style)
  useEffect(() => {
    if (enabled && style.left !== '-9999px')
      lastPositionedStyleRef.current = style
  }, [enabled, style])

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
    style: enabled
      ? style
      : lastPositionedStyleRef.current,
    placement: actualPlacement,
    shouldAnimate,
    arrowProps,
  }
}
