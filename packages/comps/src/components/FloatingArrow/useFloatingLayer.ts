/**
 * 浮层定位 + 箭头的组合 hook
 *
 * 把「offset 换算、useFloatingPosition 定位、箭头交叉轴测量」三步合成一次调用，
 * 让 Tooltip / Popover / DatePicker 等消费方只需把 arrowProps 交给 FloatingArrow 渲染，
 * 而不必各自重复接线
 */
import type { UseFloatingPositionOptions, UseFloatingPositionReturn } from 'hooks'
import type { RefObject } from 'react'
import type { FloatingArrowProps } from '.'
import type { FloatingArrowConfig } from './config'
import { useFloatingPosition } from 'hooks'
import { resolveFloatingOffset } from './config'
import { useFloatingArrowState } from './useFloatingArrowState'

export function useFloatingLayer(
  referenceRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: UseFloatingLayerOptions = {},
): UseFloatingLayerReturn {
  const {
    arrow,
    bordered = false,
    offset = 8,
    enabled = true,
    virtualReferenceRect,
    ...positionOptions
  } = options

  const position = useFloatingPosition(referenceRef, floatingRef, {
    ...positionOptions,
    enabled,
    offset: resolveFloatingOffset({
      offset,
      arrow,
    }),
    virtualReferenceRect,
  })

  const arrowState = useFloatingArrowState({
    arrow,
    enabled,
    placement: position.placement,
    floatingStyle: position.style,
    referenceRef,
    floatingRef,
    virtualReferenceRect,
  })

  const arrowProps: FloatingArrowProps | null = arrowState.options
    ? {
        placement: position.placement,
        centerOffset: arrowState.centerOffset,
        size: arrowState.options.size,
        bordered,
        fill: arrowState.fill,
        className: arrowState.options.className,
        style: arrowState.style,
      }
    : null

  return {
    ...position,
    arrowProps,
  }
}

export interface UseFloatingLayerOptions extends UseFloatingPositionOptions {
  /**
   * 箭头配置；关闭时 arrowProps 为 null
   * @default undefined
   */
  arrow?: FloatingArrowConfig
  /**
   * 箭头是否绘制与浮层连续的边框，需与浮层自身的边框保持一致
   * @default false
   */
  bordered?: boolean
  /**
   * 目标元素到浮层可见边缘的间距，单位 px
   *
   * 开启箭头时以箭头尖端为准，关闭箭头时以面板边缘为准
   * @default 8
   */
  offset?: number
}

export interface UseFloatingLayerReturn extends UseFloatingPositionReturn {
  /** 可直接展开给 FloatingArrow 的属性；未开启箭头时为 null */
  arrowProps: FloatingArrowProps | null
}
