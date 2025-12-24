import type { AnimationConfig } from '../../store'
import { useChatAtoms } from '../../store'

/**
 * 动画配置相关的 Hook
 */
export function useAnimationConfig() {
  const { animationConfig, setAnimationConfig } = useChatAtoms(['animationConfig'] as const)

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
    animationConfig,
    toggleAnimations,
    updateAnimationConfig,
  }
}
