import type { AnimationConfig } from '../../store'
import { animationConfig } from '../../store'

/**
 * 动画配置相关的 Hook
 */
export function useAnimationConfig() {
  const setAnimationConfig = (
    updater: AnimationConfig | ((prev: AnimationConfig) => AnimationConfig),
  ) => {
    animationConfig.value = typeof updater === 'function'
      ? updater(animationConfig.value)
      : updater
  }

  /**
   * 切换动画模式
   */
  const toggleAnimations = (skipAnimations?: boolean) => {
    setAnimationConfig(prev => ({
      ...prev,
      skipAnimations: skipAnimations ?? !prev.skipAnimations,
    }))
  }

  /**
   * 更新动画配置
   */
  const updateAnimationConfig = (config: Partial<AnimationConfig>) => {
    setAnimationConfig(prev => ({ ...prev, ...config }))
  }

  return {
    animationConfig: animationConfig.value,
    toggleAnimations,
    updateAnimationConfig,
  }
}
