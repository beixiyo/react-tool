import type { ScrollRevealProps } from './types'
import { motion, useReducedMotion } from 'motion/react'
import { forwardRef, memo } from 'react'
import { DEFAULT_EASE, DEFAULT_VIEWPORT, REVEAL_VARIANTS } from './constants'

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
const InnerScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>((
  {
    children,
    variant = 'fadeUp',
    delay = 0,
    duration = 0.7,
    className,
    as = 'div',
    viewport,
    respectReducedMotion = false,
    ...rest
  },
  ref,
) => {
  const variants = REVEAL_VARIANTS[variant]
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
      {children}
    </Component>
  )
})

export const ScrollReveal = memo(InnerScrollReveal) as typeof InnerScrollReveal
ScrollReveal.displayName = 'ScrollReveal'
