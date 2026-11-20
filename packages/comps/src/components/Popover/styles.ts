import type { Variants } from 'motion/react'
import { MOTION_TRANSITIONS } from '../Animate'
import type { PopoverPosition, PopoverVariantsMap } from './types'

const visible = { opacity: 1, scale: 1, x: 0, y: 0 }
const enter = { ...visible, transition: MOTION_TRANSITIONS.floatingEnter }

function createVariants(x: number, y: number): Variants {
  return {
    initial: { ...visible, opacity: 0, scale: 0.96 },
    animate: enter,
    exit: { ...visible, opacity: 0, x, y },
  }
}

const popoverVariants: PopoverVariantsMap = {
  top: createVariants(0, 10),
  bottom: createVariants(0, -10),
  left: createVariants(10, 0),
  right: createVariants(-10, 0),
}

/** 以实际定位（含视口翻转）后靠近触发器的边或角为缩放原点 */
export function getMotionByPlacement(placement: string) {
  const [side, align] = placement.split('-') as [PopoverPosition, string?]
  const cross = align === 'start'
    ? '0%'
    : align === 'end'
    ? '100%'
    : '50%'

  const origins = {
    top: `${cross} 100%`,
    bottom: `${cross} 0%`,
    left: `100% ${cross}`,
    right: `0% ${cross}`,
  }

  return {
    variants: popoverVariants[side],
    transformOrigin: origins[side],
  }
}
