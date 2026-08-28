/** 虚拟行布局动画的出入场状态与视口约束 */

import type { TargetAndTransition } from 'motion/react'

const DEFAULT_LAYOUT_INITIAL = { opacity: 0 } as const
const DEFAULT_LAYOUT_EXIT = { opacity: 0 } as const
const PROJECTION_TRANSLATE_Y_RE = /(translate3d\(\s*[^,]+,\s*)(-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)px(\s*,\s*[^)]+\))/i

export function resolveLayoutInitial(
  initial: false | TargetAndTransition | undefined,
  isGroupedContent: boolean,
) {
  if (initial !== undefined) return initial

  return isGroupedContent
    ? false
    : DEFAULT_LAYOUT_INITIAL
}

export function resolveLayoutExit(options: ResolveLayoutExitOptions) {
  const {
    exit,
    layoutId,
    presence,
  } = options
  if (exit !== undefined) return exit
  if (layoutId && presence.presentLayoutIds.has(layoutId)) return DEFAULT_LAYOUT_EXIT
  return DEFAULT_LAYOUT_EXIT
}

/**
 * 把常驻行跨越视口的 FLIP 投影压缩到可见边界内，同时保留原动画进度
 */
export function clampPersistentProjectionToViewport(options: ClampProjectionOptions) {
  const {
    generatedTransform,
    rowKey,
    targetStart,
    rowSize,
    scrollElement,
    projections,
  } = options
  const match = generatedTransform.match(PROJECTION_TRANSLATE_Y_RE)
  if (!match || !scrollElement) {
    projections.delete(rowKey)
    return generatedTransform
  }

  const deltaY = Number.parseFloat(match[2])
  if (!Number.isFinite(deltaY) || Math.abs(deltaY) < 0.01) return generatedTransform

  const contentOffset = (scrollElement.firstElementChild as HTMLElement | null)?.offsetTop ?? 0
  const viewportStart = scrollElement.scrollTop - contentOffset
  const viewportEnd = viewportStart + scrollElement.clientHeight - rowSize
  let projection = projections.get(rowKey)
  if (
    !projection
    || Math.abs(deltaY) > Math.abs(projection.initialDeltaY) + 0.5
  ) {
    const originStart = targetStart + deltaY
    const originVisible = originStart >= viewportStart && originStart <= viewportEnd
    const targetVisible = targetStart >= viewportStart && targetStart <= viewportEnd
    const crossesViewport = (originStart < viewportStart && targetStart > viewportEnd)
      || (originStart > viewportEnd && targetStart < viewportStart)

    if (!originVisible && !targetVisible && !crossesViewport) return generatedTransform

    projection = {
      targetStart,
      initialDeltaY: deltaY,
      visibleOrigin: Math.min(Math.max(originStart, viewportStart), viewportEnd),
      visibleTarget: Math.min(Math.max(targetStart, viewportStart), viewportEnd),
    }
    projections.set(rowKey, projection)
  }
  else {
    /** 动画首帧后真实高度可能继续校正；沿用同一进度，避免每次测量都重新起步 */
    projection.targetStart = targetStart
    projection.visibleTarget = Math.min(Math.max(targetStart, viewportStart), viewportEnd)
  }

  const progress = Math.min(
    Math.max(1 - deltaY / projection.initialDeltaY, 0),
    1,
  )
  const visibleStart = projection.visibleOrigin
    + (projection.visibleTarget - projection.visibleOrigin) * progress
  const visibleDeltaY = visibleStart - targetStart

  return generatedTransform.replace(
    PROJECTION_TRANSLATE_Y_RE,
    `$1${visibleDeltaY}px$3`,
  )
}

export type LayoutPresenceState = {
  presentKeys: ReadonlySet<string | number>
  presentLayoutIds: ReadonlySet<string>
}

export type PersistentProjection = {
  targetStart: number
  initialDeltaY: number
  visibleOrigin: number
  visibleTarget: number
}

type ResolveLayoutExitOptions = {
  exit: TargetAndTransition | undefined
  layoutId: string | undefined
  presence: LayoutPresenceState
}

type ClampProjectionOptions = {
  generatedTransform: string
  rowKey: string | number
  targetStart: number
  rowSize: number
  scrollElement: HTMLDivElement | null
  projections: Map<string | number, PersistentProjection>
}
