import { motion, useReducedMotion } from 'motion/react'
import { memo } from 'react'
import { DEFAULT_DURATION, DEFAULT_EASE, DEFAULT_VIEWPORT, resolveRevealVariants } from './constants'
import { StaggerContainer } from './subcomponents/StaggerContainer'
import { StaggerItem } from './subcomponents/StaggerItem'
import type { ScrollRevealProps } from './types'

/**
 * Scroll-triggered reveal animation wrapper.
 * Uses `whileInView` to animate elements as they enter the viewport.
 *
 * @example
 * ```tsx
 * <ScrollReveal>content fades up on scroll</ScrollReveal>
 * <ScrollReveal variant="slideLeft">slides from left</ScrollReveal>
 * <ScrollReveal variant="blurIn" delay={0.2}>blur entrance</ScrollReveal>
 * ```
 */
const InnerScrollReveal = ({
  ref,
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = DEFAULT_DURATION,
  distance,
  className,
  as = 'div',
  viewport,
  respectReducedMotion = false,
  ...rest
}: ScrollRevealProps) => {
  const variants = resolveRevealVariants(variant, distance)
  const Component = motion[as] as React.ElementType

  /** 命中系统「减少动态效果」时直接渲染最终态，跳过入场动画 */
  const shouldReduce = useReducedMotion() && respectReducedMotion

  return (
    <Component
      ref={ ref }
      initial={ shouldReduce
        ? 'visible'
        : 'hidden' }
      whileInView="visible"
      viewport={ { ...DEFAULT_VIEWPORT, ...viewport } }
      variants={ variants }
      transition={ shouldReduce
        ? { duration: 0 }
        : {
          duration,
          delay,
          ease: DEFAULT_EASE,
        } }
      className={ className }
      { ...rest }
    >
      { children }
    </Component>
  )
}

const MemoScrollReveal = memo(InnerScrollReveal)
MemoScrollReveal.displayName = 'ScrollReveal'

export const ScrollReveal = Object.assign(MemoScrollReveal, {
  Container: StaggerContainer,
  Item: StaggerItem,
})
