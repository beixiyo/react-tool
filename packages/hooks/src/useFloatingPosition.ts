import type { RefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useResizeObserver } from './ob'
import { clamp } from '@jl-org/tool'

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

/**
 * 检测元素的滚动父级容器
 */
function getScrollParents(element: HTMLElement): HTMLElement[] {
  const scrollParents: HTMLElement[] = []
  let parent = element.parentElement

  while (parent && parent !== document.body) {
    const { overflow, overflowX, overflowY } = getComputedStyle(parent)
    if (/(auto|scroll|overlay)/.test(overflow + overflowX + overflowY)) {
      scrollParents.push(parent)
    }
    parent = parent.parentElement
  }

  return scrollParents
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
 * 支持虚拟 reference（如鼠标坐标、光标坐标）。
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
    scrollContainers,
    virtualReferenceRect,
  } = options

  const [coords, setCoords] = useState<{ x: number, y: number } | null>(null)
  const [resolvedPlacement, setResolvedPlacement] = useState<FloatingPlacement>(placement)

  const update = useCallback(() => {
    if (!enabled) {
      setCoords(null)
      setResolvedPlacement(placement)
      return
    }

    const floatingEl = floatingRef.current
    if (!floatingEl) {
      setCoords(null)
      setResolvedPlacement(placement)
      return
    }

    // 获取参考元素的矩形区域，优先使用虚拟 reference
    let referenceRect: DOMRect
    if (virtualReferenceRect) {
      referenceRect = virtualReferenceRect
    }
    else {
      const referenceEl = referenceRef.current
      if (!referenceEl) {
        setCoords(null)
        setResolvedPlacement(placement)
        return
      }
      referenceRect = referenceEl.getBoundingClientRect()
    }

    const floatingRect = floatingEl.getBoundingClientRect()
    /**
     * 注意：getBoundingClientRect 会受 transform/scale 动画影响（例如 Tooltip/Popover 的 scale 动画），
     * 可能导致首次测量到的尺寸偏小，从而出现"右侧被削掉一半"等溢出问题。
     * 这里优先使用 offsetWidth/offsetHeight（布局尺寸，不受 transform 影响）来做定位计算。
     *
     * 同时，DOMRect 的属性在某些浏览器中是不可枚举的，直接 spread (...) 可能会得到空对象，
     * 这里手动构建 floatingBox 对象。
     */
    const floatingWidth = floatingEl.offsetWidth || floatingRect.width
    const floatingHeight = floatingEl.offsetHeight || floatingRect.height
    const floatingBox = {
      top: floatingRect.top,
      left: floatingRect.left,
      bottom: floatingRect.bottom,
      right: floatingRect.right,
      width: floatingWidth,
      height: floatingHeight,
    }
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
      // 计算最大可用空间
      const maxAvailableWidth = viewportWidth - 2 * boundaryPadding
      const maxAvailableHeight = viewportHeight - 2 * boundaryPadding

      // 如果浮层尺寸大于视口可用空间，确保至少有最小可见区域
      if (floatingBox.width > maxAvailableWidth) {
        // 确保左侧至少有边界填充的区域可见
        x = Math.max(boundaryPadding, x)
      }
      else {
        const maxX = Math.max(boundaryPadding, viewportWidth - floatingBox.width - boundaryPadding)
        x = clamp(x, boundaryPadding, maxX)
      }

      if (floatingBox.height > maxAvailableHeight) {
        // 确保顶部至少有边界填充的区域可见
        y = Math.max(boundaryPadding, y)
      }
      else {
        const maxY = Math.max(boundaryPadding, viewportHeight - floatingBox.height - boundaryPadding)
        y = clamp(y, boundaryPadding, maxY)
      }
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
    virtualReferenceRect,
  ])

  // 当 ref 目标发生尺寸变化时自动更新（显示期间更重要）
  useResizeObserver(
    [referenceRef, floatingRef] as RefObject<HTMLElement>[],
    () => {
      if (enabled) {
        update()
      }
    },
  )

  useEffect(() => {
    if (enabled) {
      update()

      /**
       * 额外在开启后的前几帧持续更新位置。
       * 解决参考元素正在进行 CSS 动画（如 entrance animation）或内容动态加载导致的初始定位偏差。
       */
      let count = 0
      const handle = setInterval(() => {
        update()
        if (++count >= 10)
          clearInterval(handle)
      }, 16)

      return () => clearInterval(handle)
    }
  }, [enabled, update])

  useEffect(() => {
    if (!enabled || !autoUpdate)
      return

    const onResize = () => update()
    const onScroll = () => update()

    // 监听窗口事件
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('scroll', onScroll, { capture: scrollCapture, passive: true })

    // 获取并监听滚动容器
    let containers: HTMLElement[] = []
    if (scrollContainers) {
      containers = scrollContainers
    }
    else {
      // 自动检测滚动容器
      const referenceEl = referenceRef.current
      if (referenceEl) {
        containers = getScrollParents(referenceEl)
      }
    }

    // 为每个滚动容器添加监听器
    containers.forEach((container) => {
      container.addEventListener('scroll', onScroll, { passive: true })
    })

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, { capture: scrollCapture } as EventListenerOptions)

      // 清理滚动容器监听器
      containers.forEach((container) => {
        container.removeEventListener('scroll', onScroll)
      })
    }
  }, [enabled, autoUpdate, scrollCapture, update, scrollContainers, referenceRef])

  return {
    style: coords
      ? {
          position: strategy,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
        }
      : {
          position: strategy,
          left: '-9999px',
          top: '-9999px',
        },
    placement: resolvedPlacement,
    strategy,
    update,
  }
}

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

  /**
   * 自定义滚动容器，不提供则自动检测
   */
  scrollContainers?: HTMLElement[]

  /**
   * 虚拟 reference 的矩形区域，用于不依赖 DOM ref 的定位（如鼠标坐标、光标坐标）
   */
  virtualReferenceRect?: DOMRect | null
}

export type UseFloatingPositionReturn = {
  style: React.CSSProperties
  placement: FloatingPlacement
  strategy: 'fixed' | 'absolute'
  update: () => void
}
