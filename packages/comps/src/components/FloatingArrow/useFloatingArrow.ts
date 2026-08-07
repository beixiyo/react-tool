import type { CSSProperties, RefObject } from 'react'
import type { FloatingArrowPlacement, FloatingArrowSide } from '.'
import { useLayoutEffect, useState } from 'react'

const DEFAULT_SIZE = 12

/** 根据 reference 与最终浮层布局计算箭头在交叉轴上的中心偏移 */
export function useFloatingArrow(options: UseFloatingArrowOptions): number {
  const {
    enabled,
    placement,
    floatingStyle,
    referenceRef,
    floatingRef,
    virtualReferenceRect,
    size = DEFAULT_SIZE,
    centerOffset: controlledCenterOffset,
  } = options
  const [autoCenterOffset, setAutoCenterOffset] = useState(size / 2)

  useLayoutEffect(() => {
    if (!enabled || controlledCenterOffset !== undefined)
      return

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
    const nextOffset = Math.min(
      Math.max(offset, size / 2),
      floatingCrossSize - size / 2,
    )

    setAutoCenterOffset(current => current === nextOffset
      ? current
      : nextOffset)
  }, [
    controlledCenterOffset,
    enabled,
    floatingRef,
    floatingStyle.left,
    floatingStyle.top,
    placement,
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
}
