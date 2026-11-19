'use client'

import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import { animateVariants, DURATION, variantsMap } from './constants'
import type { AnimateProps } from './types'

const InnerAnimate = ({
  ref,
  style,
  className,
  children,

  duration = DURATION,
  variants = 'top-bottom',
  ...rest
}: AnimateProps) => {
  return (
    <motion.div
      ref={ ref }
      className={ cn(
        className,
      ) }
      style={ style }
      variants={ typeof variants === 'string'
        ? variantsMap[variants] || animateVariants
        : variants || animateVariants }
      initial="initial"
      animate="animate"
      exit="exit"
      transition={ {
        type: 'tween',
        ease: 'easeInOut',
        duration,
      } }
      { ...rest }
    >
      { children }
    </motion.div>
  )
}

export const Animate = memo<AnimateProps>(InnerAnimate)
Animate.displayName = 'Animate'
