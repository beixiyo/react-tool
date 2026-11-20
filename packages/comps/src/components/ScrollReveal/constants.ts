import type { Variants } from 'motion/react'
import { createListItemEnter } from '../Animate/utils/listEnter'
import type { RevealVariant } from './types'

export const DEFAULT_DURATION = 0.7
export const DEFAULT_EASE = [0.25, 0.1, 0.25, 1] as const
export const DEFAULT_VIEWPORT = { once: true, amount: 0.15 } as const

export const REVEAL_VARIANTS = {
  fadeUp: createListItemEnter({ y: 40 }),
  fadeDown: createListItemEnter({ y: -40 }),
  fadeIn: createListItemEnter({}),
  slideLeft: createListItemEnter({ x: -60 }),
  slideRight: createListItemEnter({ x: 60 }),
  scaleUp: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  blurIn: {
    hidden: { opacity: 0, filter: 'blur(10px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
} satisfies Record<string, Variants>

/** 可选的距离只覆盖位移幅度，不改变方向或非位移变体 */
export function resolveRevealVariants(variant: RevealVariant, distance?: number): Variants {
  const variants = REVEAL_VARIANTS[variant]
  if (distance === undefined) return variants

  const { hidden } = variants
  const offset = Math.abs(distance)
  if ('x' in hidden && hidden.x !== undefined) return createListItemEnter({ x: Math.sign(hidden.x) * offset })
  if ('y' in hidden && hidden.y !== undefined) return createListItemEnter({ y: Math.sign(hidden.y) * offset })
  return variants
}
