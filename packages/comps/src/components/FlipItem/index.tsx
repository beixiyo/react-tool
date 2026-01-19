import { motion } from 'motion/react'
import * as React from 'react'
import { cn } from 'utils'

export function FlipItem({
  frontContent,
  backContent,
  gradient,
  isActive = false,
  className,
  children,
}: FlipItemProps) {
  /** 根据激活状态决定初始动画状态 */
  const initialState = isActive
    ? 'active'
    : 'initial'

  const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: -90, opacity: 0 },
    active: { rotateX: -90, opacity: 0 },
  }

  const backVariants = {
    initial: { rotateX: 90, opacity: 0 },
    hover: { rotateX: 0, opacity: 1 },
    active: { rotateX: 0, opacity: 1 },
  }

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: 1,
      scale: 2,
      transition: {
        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
      },
    },
    active: {
      opacity: 1,
      scale: 2,
      transition: {
        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
      },
    },
  }

  const sharedTransition = {
    type: 'spring',
    stiffness: 100,
    damping: 20,
    duration: 0.5,
  }

  return (
    <motion.div
      className={ cn(
        'group relative block overflow-visible rounded-xl',
        className,
      ) }
      style={ { perspective: '600px' } }
      whileHover="hover"
      animate={ initialState }
      initial={ initialState }
    >
      { gradient && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          variants={ glowVariants }
          style={ {
            background: gradient,
            opacity: 0,
            borderRadius: '16px',
          } }
        />
      ) }

      <motion.div
        className="relative z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 transition-colors"
        variants={ itemVariants }
        transition={ sharedTransition }
        style={ { transformStyle: 'preserve-3d', transformOrigin: 'center bottom' } }
      >
        { frontContent }
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 transition-colors"
        variants={ backVariants }
        transition={ sharedTransition }
        style={ { transformStyle: 'preserve-3d', transformOrigin: 'center top', rotateX: 90 } }
      >
        { backContent }
      </motion.div>

      { children }
    </motion.div>
  )
}

export interface FlipItemProps {
  frontContent: React.ReactNode
  backContent: React.ReactNode
  gradient?: string
  isActive?: boolean
  className?: string
  children?: React.ReactNode
}
