/**
 * 轮播图动画变体配置
 */

/**
 * 滑动动画变体
 * 图片从左右两侧滑入，当前图片滑出
 */
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
}

/**
 * 淡入淡出动画变体
 * 图片通过透明度变化实现切换效果
 */
export const fadeVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
}

/**
 * 缩放动画变体
 * 图片通过缩放和透明度变化实现切换效果
 */
export const zoomVariants = {
  enter: {
    opacity: 0,
    scale: 0.8,
  },
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 1.2,
  },
}

/**
 * 根据过渡类型选择对应的动画变体
 * @param transitionType - 过渡类型
 * @returns 对应的动画变体配置
 */
export function getVariants(transitionType: 'slide' | 'fade' | 'zoom') {
  switch (transitionType) {
    case 'fade':
      return fadeVariants
    case 'zoom':
      return zoomVariants
    case 'slide':
    default:
      return slideVariants
  }
}

/**
 * 获取过渡动画配置
 * @param transitionType - 过渡类型
 * @param animationDuration - 动画持续时间
 * @returns 过渡动画配置
 */
export function getTransition(
  transitionType: 'slide' | 'fade' | 'zoom',
  animationDuration: number,
) {
  const baseTransition = {
    opacity: { duration: animationDuration },
  }

  if (transitionType === 'slide') {
    return {
      ...baseTransition,
      x: { duration: animationDuration },
    }
  }

  if (transitionType === 'zoom') {
    return {
      ...baseTransition,
      scale: { duration: animationDuration },
    }
  }

  return baseTransition
}
