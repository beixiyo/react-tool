import { motion, stagger as staggerChildren, useReducedMotion } from 'motion/react'
import { memo } from 'react'
import { LIST_ENTER_INTERVAL } from '../../Animate/utils/listEnter'
import { DEFAULT_VIEWPORT } from '../constants'
import type { StaggerContainerProps } from '../types'

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
const InnerStaggerContainer = ({
  ref,
  children,
  stagger = LIST_ENTER_INTERVAL,
  delay = 0,
  className,
  as = 'div',
  viewport,
  respectReducedMotion = false,
  ...rest
}: StaggerContainerProps) => {
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
          transition: {
            delayChildren: shouldReduce
              ? 0
              : staggerChildren(stagger, { startDelay: delay }),
          },
        },
      } }
      className={ className }
      { ...rest }
    >
      { children }
    </Component>
  )
}

export const StaggerContainer = memo(InnerStaggerContainer)
StaggerContainer.displayName = 'StaggerContainer'
