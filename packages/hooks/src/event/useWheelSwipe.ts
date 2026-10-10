import type { RefObject } from 'react'
import { useEffect } from 'react'
import { useLatestCallback } from '../memo'

type WheelSwipeTarget = HTMLElement | RefObject<HTMLElement | null> | (() => HTMLElement | null)

/**
 * 把触控板 / 滚轮的连续滚动归一化成「一次手势 = 一次离散滑动」
 *
 * 触控板双指横滑产生的是 `wheel` 事件（带 `deltaX`），不是 pointer 拖拽，`drag` 类库收不到；
 * 且一次手势会连续触发几十个事件（含惯性），直接响应会连翻多页
 *
 * 本 hook 累计主轴 `delta`，超过 `threshold` 触发一次回调并锁定，
 * 锁定在两种情况下解除：滚轮事件静默 `idleMs`；或检测到新手势（位移相对惯性尾巴明显回升 / 方向反向）
 * 后者保证 macOS 松手后一两秒的惯性滚动不会拖住下一次滑动；但两次触发之间至少间隔 `cooldownMs`，
 * 因为同一次手势内位移会上下抖动（如 36 → 16 → 44），不能当成新手势。只处理主轴占优的事件，副轴滚动原样放行
 *
 * 方向沿用 wheel 的符号：`deltaX > 0` 为 `right`，`deltaY > 0` 为 `down`（与 {@link useWheelDirection} 一致）
 * @example
 * ```tsx
 * // 轮播：双指向左划（deltaX > 0）看下一张
 * useWheelSwipe({ onSwipeRight: next, onSwipeLeft: prev }, { target: containerEl })
 * ```
 */
export function useWheelSwipe(
  handlers: WheelSwipeHandlers,
  options: UseWheelSwipeOptions = {},
) {
  const {
    axis = 'x',
    threshold = 60,
    idleMs = 150,
    cooldownMs = 150,
    enable = true,
    preventDefault = true,
    target,
  } = options

  const handleSwipe = useLatestCallback((direction: WheelSwipeDirection, event: WheelEvent) => {
    if (direction === 'left') handlers.onSwipeLeft?.(event)
    else if (direction === 'right') handlers.onSwipeRight?.(event)
    else if (direction === 'up') handlers.onSwipeUp?.(event)
    else handlers.onSwipeDown?.(event)
  })

  useEffect(() => {
    const element = resolveTarget(target)
    if (!enable || !element) return

    let accumulated = 0
    let locked = false
    /** 锁定后观察到的最小位移：惯性只会衰减，位移从它回升说明用户开始了新手势 */
    let floor = 0
    let lockedSign = 0
    let lastFiredAt = 0
    let idleTimer: ReturnType<typeof setTimeout> | undefined

    const handleWheel = (event: WheelEvent) => {
      const main = axis === 'x'
        ? event.deltaX
        : event.deltaY
      const cross = axis === 'x'
        ? event.deltaY
        : event.deltaX
      if (Math.abs(main) <= Math.abs(cross)) return

      /** 主轴手势由本 hook 接管，避免触发浏览器横向回退或容器滚动 */
      if (preventDefault) event.preventDefault()

      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        accumulated = 0
        locked = false
      }, idleMs)

      if (locked) {
        const abs = Math.abs(main)

        /** 冷却期内位移抖动不算新手势，也不计入 floor：冷却结束时以当前位移为基准重新观察 */
        if (Date.now() - lastFiredAt < cooldownMs) {
          floor = abs
          return
        }

        floor = Math.min(floor, abs)

        const rising = abs > floor * NEW_GESTURE_RISE_RATIO + NEW_GESTURE_RISE_PX
        const reversed = Math.sign(main) !== lockedSign && abs >= NEW_GESTURE_RISE_PX
        if (!rising && !reversed) return

        accumulated = 0
        locked = false
      }

      accumulated += main
      if (Math.abs(accumulated) < threshold) return

      const positive = accumulated > 0
      accumulated = 0
      locked = true
      lockedSign = positive
        ? 1
        : -1
      lastFiredAt = Date.now()
      floor = Math.abs(main)
      handleSwipe(
        axis === 'x'
          ? (positive
            ? 'right'
            : 'left')
          : (positive
            ? 'down'
            : 'up'),
        event,
      )
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      element.removeEventListener('wheel', handleWheel)
      clearTimeout(idleTimer)
    }
  }, [axis, threshold, idleMs, cooldownMs, enable, preventDefault, target, handleSwipe])
}

/** 锁定期间，位移超过「已见最小位移 × 该倍率 + 该像素」视为新手势 */
const NEW_GESTURE_RISE_RATIO = 2
const NEW_GESTURE_RISE_PX = 4

function resolveTarget(target: WheelSwipeTarget | null | undefined) {
  if (!target) return null
  if (typeof target === 'function') return target()
  if ('current' in target) return target.current
  return target
}

export type WheelSwipeDirection = 'left' | 'right' | 'up' | 'down'

export interface WheelSwipeHandlers {
  /** 向左滑动一次（`deltaX < 0`，仅 `axis: 'x'`） */
  onSwipeLeft?: (event: WheelEvent) => void
  /** 向右滑动一次（`deltaX > 0`，仅 `axis: 'x'`） */
  onSwipeRight?: (event: WheelEvent) => void
  /** 向上滑动一次（`deltaY < 0`，仅 `axis: 'y'`） */
  onSwipeUp?: (event: WheelEvent) => void
  /** 向下滑动一次（`deltaY > 0`，仅 `axis: 'y'`） */
  onSwipeDown?: (event: WheelEvent) => void
}

export interface UseWheelSwipeOptions {
  /**
   * 手势主轴
   * @default 'x'
   */
  axis?: 'x' | 'y'
  /**
   * 累计主轴位移超过该值（px）才触发
   * @default 60
   */
  threshold?: number
  /**
   * 滚轮事件静默多久视为一次手势结束（ms）；期间的惯性滚动不会再次触发
   * @default 150
   */
  idleMs?: number
  /**
   * 两次触发之间的最小间隔（ms）；间隔内即使位移回升或反向也不会再次触发
   * @default 150
   */
  cooldownMs?: number
  /**
   * 是否启用
   * @default true
   */
  enable?: boolean
  /**
   * 是否阻止主轴事件的默认行为
   * @default true
   */
  preventDefault?: boolean
  /** 监听目标，支持元素、Ref 或 getter；为空时不监听 */
  target?: WheelSwipeTarget | null
}
