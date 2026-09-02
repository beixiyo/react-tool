import type { Variants } from 'motion/react'

const PANEL_MOTION_DURATION = 0.3

/** ChatInput 面板共用的轻量进出场动画，不改变面板尺寸。 */
export const PANEL_MOTION_VARIANTS = {
  initial: {
    opacity: 0,
    y: -6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: PANEL_MOTION_DURATION,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: PANEL_MOTION_DURATION,
      ease: [0.4, 0, 1, 1],
    },
  },
} satisfies Variants
