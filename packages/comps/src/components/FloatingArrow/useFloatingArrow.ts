import type { CSSProperties, RefObject } from 'react'
import type { FloatingArrowPlacement, FloatingArrowSide } from '.'
import { useLayoutEffect, useState } from 'react'
import { DEFAULT_FLOATING_ARROW_SIZE } from './config'

const DEFAULT_PADDING = 16

/** 根据 reference 与最终浮层布局计算箭头在交叉轴上的中心偏移 */
export function useFloatingArrow(options: UseFloatingArrowOptions): number {
  const {
    enabled,
    placement,
    floatingStyle,
    referenceRef,
    floatingRef,
    virtualReferenceRect,
    size = DEFAULT_FLOATING_ARROW_SIZE,
    centerOffset: controlledCenterOffset,
    padding = DEFAULT_PADDING,
  } = options
  const [autoCenterOffset, setAutoCenterOffset] = useState(size / 2)

  useLayoutEffect(() => {
    if (!enabled || controlledCenterOffset !== undefined)
      return

    const measure = () => {
      const referenceElement = referenceRef.current?.firstElementChild
        ?? referenceRef.current
      const referenceRect = virtualReferenceRect
        ?? referenceElement?.getBoundingClientRect()
      const floatingElement = floatingRef.current
      if (!referenceRect || !floatingElement)
        return

      const [side] = placement.split('-') as [FloatingArrowSide]
      const offsetParent = floatingElement.offsetParent
      const parentRect = offsetParent?.getBoundingClientRect()
      const parentScrollLeft = offsetParent instanceof HTMLElement
        ? offsetParent.scrollLeft
        : 0
      const parentScrollTop = offsetParent instanceof HTMLElement
        ? offsetParent.scrollTop
        : 0
      const parentClientLeft = offsetParent instanceof HTMLElement
        ? offsetParent.clientLeft
        : 0
      const parentClientTop = offsetParent instanceof HTMLElement
        ? offsetParent.clientTop
        : 0
      const referenceCenterX = referenceRect.left
        + referenceRect.width / 2
        - (parentRect?.left ?? 0)
        + parentScrollLeft
        - parentClientLeft
      const referenceCenterY = referenceRect.top
        + referenceRect.height / 2
        - (parentRect?.top ?? 0)
        + parentScrollTop
        - parentClientTop

      /** offset 系列不受 motion transform 影响，可稳定表示动画结束后的布局 */
      const isHorizontalSide = side === 'left' || side === 'right'
      const offset = isHorizontalSide
        ? referenceCenterY - floatingElement.offsetTop
        : referenceCenterX - floatingElement.offsetLeft
      const floatingCrossSize = isHorizontalSide
        ? floatingElement.offsetHeight
        : floatingElement.offsetWidth
      /** 面板尚未布局（display:none 等）时尺寸为 0，此时的测量不可信，等待 ResizeObserver 触发重测 */
      if (floatingCrossSize === 0)
        return

      const safePadding = Math.max(0, padding)
      const edgeInset = Math.min(size / 2 + safePadding, floatingCrossSize / 2)
      const nextOffset = Math.min(
        Math.max(offset, edgeInset),
        floatingCrossSize - edgeInset,
      )

      setAutoCenterOffset(current => current === nextOffset
        ? current
        : nextOffset)
    }

    measure()

    /**
     * 浮层可能在打开的同一帧仍处于 display:none（如等待定位完成再显示的动画容器），
     * 或在打开后内容尺寸发生变化；监听浮层尺寸在布局后重测，避免箭头停留在错误位置
     */
    const floatingElement = floatingRef.current
    if (!floatingElement || typeof ResizeObserver === 'undefined')
      return

    const observer = new ResizeObserver(measure)
    observer.observe(floatingElement)
    return () => {
      observer.disconnect()
    }
  }, [
    controlledCenterOffset,
    enabled,
    floatingRef,
    floatingStyle.left,
    floatingStyle.top,
    placement,
    padding,
    referenceRef,
    size,
    virtualReferenceRect,
  ])

  return controlledCenterOffset ?? autoCenterOffset
}

export type UseFloatingArrowOptions = {
  /** 是否启用自动测量 */
  enabled: boolean
  /** 浮层相对 reference 的最终方向 */
  placement: FloatingArrowPlacement
  /** 浮层定位样式，用于在位置变化后重新测量 */
  floatingStyle: CSSProperties
  /** reference 容器；默认优先测量其首个子元素 */
  referenceRef: RefObject<HTMLElement | null>
  /** floating 元素 */
  floatingRef: RefObject<HTMLElement | null>
  /** 虚拟 reference 的视口矩形 */
  virtualReferenceRect?: DOMRect | null
  /** 箭头宽度，单位 px */
  size?: number
  /** 受控中心偏移；传入后跳过自动测量 */
  centerOffset?: number
  /** 箭头外缘与浮层交叉轴边界的最小距离，单位 px */
  padding?: number
}
