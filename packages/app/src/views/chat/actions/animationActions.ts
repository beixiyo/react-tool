import type { AnimationConfig } from '../store'
import { animationConfig } from '../store'
import type { Updater } from './updater'
import { resolveUpdater } from './updater'

/** 写入动画配置 */
function setAnimationConfig(updater: Updater<AnimationConfig>) {
  animationConfig.value = resolveUpdater(animationConfig.value, updater)
}

/**
 * 切换动画模式
 */
export function toggleAnimations(skipAnimations?: boolean) {
  setAnimationConfig((prev) => ({
    ...prev,
    skipAnimations: skipAnimations ?? !prev.skipAnimations,
  }))
}

/**
 * 更新动画配置
 */
export function updateAnimationConfig(config: Partial<AnimationConfig>) {
  setAnimationConfig((prev) => ({ ...prev, ...config }))
}

/** Chat 动画配置 signal */
export { animationConfig }
