import type { RefObject } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useResizeObserver } from './ob'

export type FloatingSide = 'top' | 'bottom' | 'left' | 'right'
export type FloatingAlign = 'start' | 'center' | 'end'
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${FloatingAlign}`

export type UseFloatingPositionOptions = {
  /**
   * 是否启用自动更新与位置计算
   * @default true
   */
  enabled?: boolean

  /**
   * 首选位置
   * @default 'bottom'
   */
  placement?: FloatingPlacement

  /**
   * 与触发器的主轴偏移距离（像素）
   * @default 8
   */
  offset?: number

  /**
   * 与视口边缘的最小间距（像素）
   * @default 8
   */
  boundaryPadding?: number

  /**
   * 当首选位置不可用时是否翻面（使用相反 side）
   * @default true
   */
  flip?: boolean

  /**
   * 是否将浮层贴到视口可见范围内（clamp）
   * @default true
   */
  shift?: boolean

  /**
   * 是否监听 window scroll/resize 自动更新
   * @default true
   */
  autoUpdate?: boolean

  /**
   * scroll 监听是否使用 capture，以覆盖更多滚动容器
   * @default true
   */
  scrollCapture?: boolean

  /**
   * 定位策略
   * @default 'fixed'
   */
  strategy?: 'fixed' | 'absolute'
}

export type UseFloatingPositionReturn = {
  x: number
  y: number
  placement: FloatingPlacement
  strategy: 'fixed' | 'absolute'
  update: () => void
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max))
}

function parsePlacement(placement: FloatingPlacement): { side: FloatingSide, align: FloatingAlign } {
  const [sideRaw, alignRaw] = placement.split('-') as [FloatingSide, FloatingAlign | undefined]
  return {
    side: sideRaw,
    align: alignRaw || 'center',
  }
}

function oppositeSide(side: FloatingSide): FloatingSide {
  switch (side) {
    case 'top': return 'bottom'
    case 'bottom': return 'top'
    case 'left': return 'right'
    case 'right': return 'left'
  }
}

function buildPlacement(side: FloatingSide, align: FloatingAlign): FloatingPlacement {
  return align === 'center'
    ? side
    : `${side}-${align}`
}

type Rect = {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

function calcCoords(
  reference: Rect,
  floating: Rect,
  placement: FloatingPlacement,
  offset: number,
) {
  const { side, align } = parsePlacement(placement)

  let x = 0
  let y = 0

  // main axis
  if (side === 'top') {
    y = reference.top - floating.height - offset
  }
  else if (side === 'bottom') {
    y = reference.bottom + offset
  }
  else if (side === 'left') {
    x = reference.left - floating.width - offset
  }
  else if (side === 'right') {
    x = reference.right + offset
  }

  // cross axis alignment
  if (side === 'top' || side === 'bottom') {
    if (align === 'start') {
      x = reference.left
    }
    else if (align === 'end') {
      x = reference.right - floating.width
    }
    else {
      x = reference.left + (reference.width - floating.width) / 2
    }
  }
  else {
    if (align === 'start') {
      y = reference.top
    }
    else if (align === 'end') {
      y = reference.bottom - floating.height
    }
    else {
      y = reference.top + (reference.height - floating.height) / 2
    }
  }

  return { x, y }
}

function calcOverflow(
  x: number,
  y: number,
  floating: Rect,
  viewportWidth: number,
  viewportHeight: number,
  padding: number,
) {
  const left = padding - x
  const right = (x + floating.width) - (viewportWidth - padding)
  const top = padding - y
  const bottom = (y + floating.height) - (viewportHeight - padding)

  return {
    left: Math.max(0, left),
    right: Math.max(0, right),
    top: Math.max(0, top),
    bottom: Math.max(0, bottom),
    total: Math.max(0, left) + Math.max(0, right) + Math.max(0, top) + Math.max(0, bottom),
  }
}

/**
 * 通用浮层定位 Hook：基于 reference/floating 的 DOMRect 计算 x/y，
 * 支持翻面（flip）、贴边（shift/clamp）以及 scroll/resize 自动更新。
 */
export function useFloatingPosition(
  referenceRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  options: UseFloatingPositionOptions = {},
): UseFloatingPositionReturn {
  const {
    enabled = true,
    placement = 'bottom',
    offset = 8,
    boundaryPadding = 8,
    flip = true,
    shift = true,
    autoUpdate = true,
    scrollCapture = true,
    strategy = 'fixed',
  } = options

  const [coords, setCoords] = useState({ x: -9999, y: -9999 })
  const [resolvedPlacement, setResolvedPlacement] = useState<FloatingPlacement>(placement)

  const update = useCallback(() => {
    if (!enabled) {
      setCoords({ x: -9999, y: -9999 })
      setResolvedPlacement(placement)
      return
    }

    const referenceEl = referenceRef.current
    const floatingEl = floatingRef.current
    if (!referenceEl || !floatingEl) {
      setCoords({ x: -9999, y: -9999 })
      setResolvedPlacement(placement)
      return
    }

    const referenceRect = referenceEl.getBoundingClientRect()
    const floatingRect = floatingEl.getBoundingClientRect()
    /**
     * 注意：getBoundingClientRect 会受 transform/scale 动画影响（例如 Tooltip/Popover 的 scale 动画），
     * 可能导致首次测量到的尺寸偏小，从而出现“右侧被削掉一半”等溢出问题。
     * 这里优先使用 offsetWidth/offsetHeight（布局尺寸，不受 transform 影响）来做定位计算。
     */
    const floatingWidth = floatingEl.offsetWidth || floatingRect.width
    const floatingHeight = floatingEl.offsetHeight || floatingRect.height
    const floatingBox = { ...floatingRect, width: floatingWidth, height: floatingHeight }
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const preferred = placement
    const preferredMeta = parsePlacement(preferred)
    const opposite = buildPlacement(oppositeSide(preferredMeta.side), preferredMeta.align)

    const preferredCoords = calcCoords(referenceRect, floatingBox, preferred, offset)
    const preferredOverflow = calcOverflow(
      preferredCoords.x,
      preferredCoords.y,
      floatingBox,
      viewportWidth,
      viewportHeight,
      boundaryPadding,
    )

    let bestPlacement = preferred
    let bestCoords = preferredCoords
    let bestOverflow = preferredOverflow

    if (flip) {
      const oppositeCoords = calcCoords(referenceRect, floatingBox, opposite, offset)
      const oppositeOverflow = calcOverflow(
        oppositeCoords.x,
        oppositeCoords.y,
        floatingBox,
        viewportWidth,
        viewportHeight,
        boundaryPadding,
      )

      if (oppositeOverflow.total < preferredOverflow.total) {
        bestPlacement = opposite
        bestCoords = oppositeCoords
        bestOverflow = oppositeOverflow
      }
    }

    let x = bestCoords.x
    let y = bestCoords.y

    if (shift && bestOverflow.total > 0) {
      const maxX = Math.max(boundaryPadding, viewportWidth - floatingBox.width - boundaryPadding)
      const maxY = Math.max(boundaryPadding, viewportHeight - floatingBox.height - boundaryPadding)
      x = clamp(x, boundaryPadding, maxX)
      y = clamp(y, boundaryPadding, maxY)
    }

    setResolvedPlacement(bestPlacement)
    setCoords({ x, y })
  }, [
    enabled,
    referenceRef,
    floatingRef,
    placement,
    offset,
    boundaryPadding,
    flip,
    shift,
  ])

  // 当 ref 目标发生尺寸变化时自动更新（显示期间更重要）
  useResizeObserver(
    useMemo(
      () => [referenceRef, floatingRef] as RefObject<HTMLElement>[],
      [referenceRef, floatingRef],
    ),
    () => {
      if (enabled) {
        update()
      }
    },
  )

  useEffect(() => {
    update()
  }, [update])

  useEffect(() => {
    if (!enabled || !autoUpdate)
      return

    const onResize = () => update()
    const onScroll = () => update()

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('scroll', onScroll, { capture: scrollCapture, passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, { capture: scrollCapture } as any)
    }
  }, [enabled, autoUpdate, scrollCapture, update])

  return {
    x: coords.x,
    y: coords.y,
    placement: resolvedPlacement,
    strategy,
    update,
  }
}
