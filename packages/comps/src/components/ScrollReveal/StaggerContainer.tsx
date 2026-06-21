import type { StaggerContainerProps } from './types'
import { motion, useReducedMotion } from 'motion/react'
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
    respectReducedMotion = false,
    ...rest
  },
  ref,
) => {
  const Component = motion[as] as React.ElementType

  /** 命中系统「减少动态效果」时取消编排延迟，直接渲染最终态 */
  const shouldReduce = useReducedMotion() && respectReducedMotion

  return (
    <Component
      ref={ ref }
      initial={ shouldReduce
        ? 'visible'
        : 'hidden' }
      whileInView="visible"
      viewport={ { ...DEFAULT_VIEWPORT, ...viewport } }
      variants={ {
        visible: {
          transition: shouldReduce
            ? { staggerChildren: 0, delayChildren: 0 }
            : {
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
