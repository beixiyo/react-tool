import type { AtBottomHysteresis } from './types'

/**
 * 滞回底部状态判定
 *
 * 使用 enter/leave 双阈值，防止 isAtBottom 在边界反复抖动：
 * - 进入底部：distanceFromBottom <= enter（严格，默认 80px）
 * - 离开底部：distanceFromBottom > leave（宽松，默认 160px）
 */
export function resolveAtBottomState(opts: {
  previous: boolean
  distanceFromBottom: number
  threshold?: number
  hysteresis?: AtBottomHysteresis
}): boolean {
  const { previous, distanceFromBottom, threshold = 10, hysteresis } = opts

  if (!hysteresis) {
    return distanceFromBottom <= threshold
  }

  const enter = Math.max(0, hysteresis.enter)
  const leave = Math.max(enter, hysteresis.leave)

  if (previous) {
    return distanceFromBottom <= leave
  }
  return distanceFromBottom <= enter
}
