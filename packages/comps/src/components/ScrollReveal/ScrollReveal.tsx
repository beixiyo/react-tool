import type { ScrollRevealProps } from './types'
import { motion } from 'motion/react'
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
    ...rest
  },
  ref,
) => {
  const variants = REVEAL_VARIANTS[variant]
  const Component = motion[as] as React.ElementType

  return (
    <Component
      ref={ ref }
      initial="hidden"
      whileInView="visible"
      viewport={ { ...DEFAULT_VIEWPORT, ...viewport } }
      variants={ variants }
      transition={ {
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
