// oxlint-disable no-unused-vars
import { useLayoutEffect, useState } from 'react'
// oxlint-disable-next-line no-unused-vars
import type { FloatingArrowSide, UseFloatingArrowOptions } from '../types'
import { DEFAULT_FLOATING_ARROW_SIZE } from '../utils/geometry'

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
    if (!enabled || controlledCenterOffset !== undefined) return

    const measure = () => {
      const referenceElement = referenceRef.current?.firstElementChild
        ?? referenceRef.current
      const referenceRect = virtualReferenceRect
        ?? referenceElement?.getBoundingClientRect()
      const floatingElement = floatingRef.current
      if (!referenceRect || !floatingElement) return

      const [side] = placement.split('-') as [FloatingArrowSide]
      const isHorizontalSide = side === 'left' || side === 'right'
      const axis = isHorizontalSide
        ? 'top'
        : 'left'
      const referenceCenter = referenceRect[axis] + (isHorizontalSide
            ? referenceRect.height
            : referenceRect.width) / 2
      const position = floatingStyle[axis]
      /** 固定定位使用最终坐标，避免面板开始展开前仍停在屏外，导致箭头被夹到边缘 */
      const fixedOrigin = floatingStyle.position === 'fixed'
        ? typeof position === 'number'
          ? position
          : position?.endsWith('px')
          ? Number.parseFloat(position)
          : NaN
        : NaN
      const origin = Number.isFinite(fixedOrigin)
        ? fixedOrigin
        : getLayoutOrigin(floatingElement, axis)
      const offset = referenceCenter - origin
      const floatingCrossSize = isHorizontalSide
        ? floatingElement.offsetHeight
        : floatingElement.offsetWidth
      /** 面板尚未布局（display:none 等）时尺寸为 0，此时的测量不可信，等待 ResizeObserver 触发重测 */
      if (floatingCrossSize === 0) return

      const safePadding = Math.max(0, padding)
      const edgeInset = Math.min(size / 2 + safePadding, floatingCrossSize / 2)
      const nextOffset = Math.min(
        Math.max(offset, edgeInset),
        floatingCrossSize - edgeInset,
      )

      setAutoCenterOffset((current) =>
        current === nextOffset
          ? current
          : nextOffset
      )
    }

    measure()

    /**
     * 浮层可能在打开的同一帧仍处于 display:none（如等待定位完成再显示的动画容器），
     * 或在打开后内容尺寸发生变化；监听浮层尺寸在布局后重测，避免箭头停留在错误位置
     */
    const floatingElement = floatingRef.current
    if (!floatingElement || typeof ResizeObserver === 'undefined') return

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
    floatingStyle.position,
    placement,
    padding,
    referenceRef,
    size,
    virtualReferenceRect,
  ])

  return controlledCenterOffset ?? autoCenterOffset
}

/** offset 系列不受浮层自身的 motion transform 影响 */
function getLayoutOrigin(element: HTMLElement, axis: 'left' | 'top') {
  const parent = element.offsetParent
  const parentRect = parent?.getBoundingClientRect()
  const parentOrigin = parentRect?.[axis] ?? 0
  if (axis === 'top') {
    return parentOrigin + element.offsetTop - (parent instanceof HTMLElement
      ? parent.scrollTop - parent.clientTop
      : 0)
  }
  return parentOrigin + element.offsetLeft - (parent instanceof HTMLElement
    ? parent.scrollLeft - parent.clientLeft
    : 0)
}
