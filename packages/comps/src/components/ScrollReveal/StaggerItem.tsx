import type { StaggerItemProps } from './types'
import { motion, useReducedMotion } from 'motion/react'
import { forwardRef, memo } from 'react'
import { DEFAULT_EASE, REVEAL_VARIANTS } from './constants'

/**
 * Stagger child item — used inside `StaggerContainer`.
 * Inherits animation timing from parent container.
 *
 * @example
 * ```tsx
 * <StaggerContainer>
 *   <StaggerItem variant="fadeUp">A</StaggerItem>
 *   <StaggerItem variant="scaleUp">B</StaggerItem>
 * </StaggerContainer>
 * ```
 */
const InnerStaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>((
  {
    children,
    variant = 'fadeUp',
    duration = 0.6,
    className,
    as = 'div',
    respectReducedMotion = false,
    ...rest
  },
  ref,
) => {
  const variants = REVEAL_VARIANTS[variant]
  const Component = motion[as] as React.ElementType

  /** 命中系统「减少动态效果」时瞬时切到最终态 */
  const shouldReduce = useReducedMotion() && respectReducedMotion

  return (
    <Component
      ref={ ref }
      variants={ variants }
      transition={ shouldReduce
        ? { duration: 0 }
        : {
            duration,
            ease: DEFAULT_EASE,
          } }
      className={ className }
      { ...rest }
    >
      {children}
    </Component>
  )
})

export const StaggerItem = memo(InnerStaggerItem) as typeof InnerStaggerItem
StaggerItem.displayName = 'StaggerItem'
