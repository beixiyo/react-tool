import type { Transition } from 'motion/react'

/** 可直接传给 Motion 的过渡参数；不绑定属性、布局或触发方式 */
export const MOTION_TRANSITIONS = {
  smooth: {
    type: 'spring',
    stiffness: 460,
    damping: 2 * Math.sqrt(460),
    mass: 1,
  },
  /** 可覆盖 duration（秒）的无回弹弹簧，不混用物理参数 */
  smoothTimed: { type: 'spring', duration: 0.3, bounce: 0 },
  quick: { type: 'tween', duration: 0.3, ease: 'easeOut' },
  exit: { type: 'tween', duration: 0.2, ease: 'easeOut' },
} as const satisfies Record<string, Transition>
