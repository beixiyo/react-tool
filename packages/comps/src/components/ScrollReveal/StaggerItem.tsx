import type { StaggerItemProps } from './types'
import { motion } from 'motion/react'
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
    ...rest
  },
  ref,
) => {
  const variants = REVEAL_VARIANTS[variant]
  const Component = motion[as] as React.ElementType

  return (
    <Component
      ref={ ref }
      variants={ variants }
      transition={ {
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
