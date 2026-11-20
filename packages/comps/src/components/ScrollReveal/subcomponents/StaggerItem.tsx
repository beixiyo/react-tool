import { motion, useReducedMotion } from 'motion/react'
import { memo } from 'react'
import { MOTION_TRANSITIONS } from '../../Animate'
import { LIST_ENTER_DISTANCE } from '../../Animate/utils/listEnter'
import { resolveRevealVariants } from '../constants'
import type { StaggerItemProps } from '../types'

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
const InnerStaggerItem = ({
  ref,
  children,
  variant = 'fadeUp',
  distance = LIST_ENTER_DISTANCE,
  duration = MOTION_TRANSITIONS.quick.duration,
  className,
  as = 'div',
  respectReducedMotion = false,
  ...rest
}: StaggerItemProps) => {
  const variants = resolveRevealVariants(variant, distance)
  const Component = motion[as] as React.ElementType

  /** 命中系统「减少动态效果」时瞬时切到最终态 */
  const shouldReduce = useReducedMotion() && respectReducedMotion

  return (
    <Component
      ref={ ref }
      variants={ variants }
      transition={ shouldReduce
        ? { duration: 0 }
        : { ...MOTION_TRANSITIONS.quick, duration } }
      className={ className }
      { ...rest }
    >
      { children }
    </Component>
  )
}

export const StaggerItem = memo(InnerStaggerItem)
StaggerItem.displayName = 'StaggerItem'
