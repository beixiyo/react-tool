'use client'

import type { CSSProperties } from 'react'
import { memo, useId } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { DEFAULT_FLOATING_ARROW_SEAM_OVERLAP } from './config'
import { resolveFloatingArrowGeometry } from './geometry'

const DEFAULT_BORDER_WIDTH = 1

/**
 * 浮层角标
 *
 * 使用双层 SVG path 连接浮层背景与边框，并通过轻微重叠消除浏览器
 * 亚像素渲染产生的接缝。轮廓走 {@link resolveFloatingArrowGeometry}：
 * 根部与浮层边缘相切、尖端磨圆，看上去是从浮层长出来而不是贴上去的三角形
 * 组件只负责绘制，reference 测量由调用方完成
 */
export const FloatingArrow = memo<FloatingArrowProps>((props) => {
  const {
    placement,
    centerOffset,
    size: sizeOption,
    height,
    bordered = false,
    borderWidth = DEFAULT_BORDER_WIDTH,
    seamOverlap = DEFAULT_FLOATING_ARROW_SEAM_OVERLAP,
    fill,
    className,
    style,
  } = props

  const clipPathId = useId().replaceAll(':', '')
  /** 绘制区取箭头宽度的方形，rotate(±90deg) 后占位不变，四个方向共用同一套定位 */
  const { width: size, path } = resolveFloatingArrowGeometry({ size: sizeOption, height })
  const [side] = placement.split('-') as [FloatingArrowSide]
  const isVerticalSide = side === 'top' || side === 'bottom'
  const resolvedBorderWidth = bordered
    ? borderWidth
    : 0

  /** SVG stroke 居中绘制，因此使用两倍宽度后再裁掉面板内侧部分 */
  const strokeWidth = resolvedBorderWidth * 2
  const halfStrokeWidth = strokeWidth / 2
  const crossAxisOffset = centerOffset
    - (size + strokeWidth) / 2
    - (isVerticalSide
      ? resolvedBorderWidth
      : 0)
  const crossAxisProperty = isVerticalSide
    ? 'left'
    : 'top'

  const rotation = {
    top: '',
    right: 'rotate(90deg)',
    bottom: 'rotate(180deg)',
    left: 'rotate(-90deg)',
  }[side]

  return (
    <svg
      aria-hidden
      { ...{ [DATA_ATTR.floatingArrow]: true } }
      width={ size + strokeWidth }
      height={ size }
      viewBox={ `0 0 ${size} ${size}` }
      className={ cn(
        'pointer-events-none absolute z-1 fill-background',
        className,
      ) }
      style={ {
        [crossAxisProperty]: crossAxisOffset,
        [side]: isVerticalSide
          ? `calc(100% - ${seamOverlap}px)`
          : `calc(100% - ${halfStrokeWidth + seamOverlap}px)`,
        transform: rotation,
        ...style,
      } }
    >
      { bordered && (
        <path
          clipPath={ `url(#${clipPathId})` }
          fill="none"
          className="stroke-border"
          strokeWidth={ strokeWidth + 1 }
          d={ path }
        />
      ) }

      <path
        className={ cn(
          'fill-background',
          bordered && 'stroke-background',
        ) }
        style={ fill
          ? { fill }
          : undefined }
        d={ path }
      />

      <clipPath id={ clipPathId }>
        <rect
          x={ -halfStrokeWidth }
          y={ halfStrokeWidth }
          width={ size + strokeWidth }
          height={ size }
        />
      </clipPath>
    </svg>
  )
})

FloatingArrow.displayName = 'FloatingArrow'

export type FloatingArrowSide = 'top' | 'right' | 'bottom' | 'left'
export type FloatingArrowAlign = 'start' | 'center' | 'end'
export type FloatingArrowPlacement = FloatingArrowSide | `${FloatingArrowSide}-${FloatingArrowAlign}`

export type FloatingArrowProps = {
  /** 浮层相对 reference 的最终方向，支持带 start/end 的 placement */
  placement: FloatingArrowPlacement
  /** 箭头中心到浮层交叉轴起始边的距离，单位 px */
  centerOffset: number
  /**
   * 箭头宽度，单位 px；不传时按 height 与默认宽高比推算
   * @default 24
   */
  size?: number
  /**
   * 箭头尖端凸出浮层边缘的高度，单位 px；不传时按 size 与默认宽高比推算
   * @default 7
   */
  height?: number
  /**
   * 是否绘制与浮层连续的边框
   * @default false
   */
  bordered?: boolean
  /**
   * 浮层边框宽度，单位 px
   * @default 1
   */
  borderWidth?: number
  /**
   * 箭头压入浮层的距离，用于消除亚像素接缝
   * @default 1
   */
  seamOverlap?: number
  /** 自定义箭头填充色 */
  fill?: CSSProperties['fill']
  className?: string
  style?: CSSProperties
}

export { DEFAULT_FLOATING_ARROW_SEAM_OVERLAP, getFloatingArrowProtrusion, resolveFloatingArrowOptions, resolveFloatingOffset } from './config'
export type { FloatingArrowConfig, FloatingArrowOptions, ResolveFloatingOffsetOptions } from './config'
export { DEFAULT_FLOATING_ARROW_HEIGHT, DEFAULT_FLOATING_ARROW_SIZE, resolveFloatingArrowBox, resolveFloatingArrowGeometry } from './geometry'
export type { FloatingArrowGeometry, FloatingArrowGeometryOptions } from './geometry'
export { useFloatingArrow } from './useFloatingArrow'
export type { UseFloatingArrowOptions } from './useFloatingArrow'
export { useFloatingArrowState } from './useFloatingArrowState'
export type { UseFloatingArrowStateOptions, UseFloatingArrowStateResult } from './useFloatingArrowState'
export { useFloatingLayer } from './useFloatingLayer'
export type { UseFloatingLayerOptions, UseFloatingLayerReturn } from './useFloatingLayer'
