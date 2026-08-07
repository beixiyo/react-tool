import type { CSSProperties, RefObject } from 'react'
import type { FloatingArrowOptions, FloatingArrowPlacement } from '../FloatingArrow'
import type { PopoverProps } from './types'
import { resolveFloatingArrowOptions, useFloatingArrow } from '../FloatingArrow'

const DEFAULT_ARROW_SIZE = 12
const DEFAULT_ARROW_OFFSET = 24

/** 计算 Popover 箭头配置及其相对最终浮层位置的中心偏移 */
export function usePopoverArrow(options: UsePopoverArrowOptions): UsePopoverArrowResult {
  const {
    arrow,
    isOpen,
    placement,
    floatingStyle,
    triggerRef,
    contentRef,
    virtualReferenceRect,
  } = options
  const arrowOptions = resolveFloatingArrowOptions(arrow)
  const centerOffset = useFloatingArrow({
    enabled: isOpen && Boolean(arrowOptions),
    placement: placement as FloatingArrowPlacement,
    floatingStyle,
    referenceRef: triggerRef,
    floatingRef: contentRef,
    virtualReferenceRect,
    size: arrowOptions?.size ?? DEFAULT_ARROW_SIZE,
    centerOffset: arrowOptions?.offset,
  })

  const {
    background,
    backgroundColor,
    ...style
  } = arrowOptions?.style ?? {}
  const fill = typeof backgroundColor === 'string'
    ? backgroundColor
    : typeof background === 'string'
      ? background
      : undefined

  return {
    options: arrowOptions,
    centerOffset: arrowOptions
      ? centerOffset
      : DEFAULT_ARROW_OFFSET,
    fill,
    style,
  }
}

type UsePopoverArrowOptions = {
  arrow: PopoverProps['arrow']
  isOpen: boolean
  placement: string
  floatingStyle: CSSProperties
  triggerRef: RefObject<HTMLDivElement | null>
  contentRef: RefObject<HTMLDivElement | null>
  virtualReferenceRect?: DOMRect | null
}

type UsePopoverArrowResult = {
  options: FloatingArrowOptions | null
  centerOffset: number
  fill?: CSSProperties['fill']
  style: CSSProperties
}
