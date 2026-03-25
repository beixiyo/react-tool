import type { StaggerContainerProps } from './types'
import { motion } from 'motion/react'
import { forwardRef, memo } from 'react'
import { DEFAULT_VIEWPORT } from './constants'

/**
 * Stagger container — orchestrates sequential children animation delays.
 * Wrap `StaggerItem` children inside to animate them one by one.
 *
 * @example
 * ```tsx
 * <StaggerContainer stagger={0.12}>
 *   <StaggerItem>First</StaggerItem>
 *   <StaggerItem>Second</StaggerItem>
 *   <StaggerItem>Third</StaggerItem>
 * </StaggerContainer>
 * ```
 */
const InnerStaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>((
  {
    children,
    stagger = 0.1,
    delay = 0,
    className,
    as = 'div',
    viewport,
    ...rest
  },
  ref,
) => {
  const Component = motion[as] as React.ElementType

  return (
    <Component
      ref={ ref }
      initial="hidden"
      whileInView="visible"
      viewport={ { ...DEFAULT_VIEWPORT, ...viewport } }
      variants={ {
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      } }
      className={ className }
      { ...rest }
    >
      {children}
    </Component>
  )
})

export const StaggerContainer = memo(InnerStaggerContainer) as typeof InnerStaggerContainer
StaggerContainer.displayName = 'StaggerContainer'
