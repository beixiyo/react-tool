import type { CSSProperties, RefObject } from 'react'
import type { FloatingArrowPlacement } from '.'
import type { FloatingArrowConfig, FloatingArrowOptions } from './config'
import { resolveFloatingArrowOptions } from './config'
import { useFloatingArrow } from './useFloatingArrow'

const DEFAULT_ARROW_SIZE = 12
const DEFAULT_ARROW_OFFSET = 24

/** 解析箭头配置，并根据浮层的最终位置计算交叉轴偏移 */
export function useFloatingArrowState(options: UseFloatingArrowStateOptions): UseFloatingArrowStateResult {
  const {
    arrow,
    enabled,
    placement,
    floatingStyle,
    referenceRef,
    floatingRef,
    virtualReferenceRect,
  } = options
  const arrowOptions = resolveFloatingArrowOptions(arrow)
  const centerOffset = useFloatingArrow({
    enabled: enabled && Boolean(arrowOptions),
    placement,
    floatingStyle,
    referenceRef,
    floatingRef,
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

export type UseFloatingArrowStateOptions = {
  arrow?: FloatingArrowConfig
  enabled: boolean
  placement: FloatingArrowPlacement
  floatingStyle: CSSProperties
  referenceRef: RefObject<HTMLElement | null>
  floatingRef: RefObject<HTMLElement | null>
  virtualReferenceRect?: DOMRect | null
}

export type UseFloatingArrowStateResult = {
  options: FloatingArrowOptions | null
  centerOffset: number
  fill?: CSSProperties['fill']
  style: CSSProperties
}
