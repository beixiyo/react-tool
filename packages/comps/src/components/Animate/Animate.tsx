'use client'

import { motion } from 'motion/react'
import { memo } from 'react'
import { cn } from 'utils'
import { animateVariants, variantsMap } from './constants'
import type { AnimateProps } from './types'
import { MOTION_TRANSITIONS } from './utils/transitions'

const InnerAnimate = ({
  ref,
  style,
  className,
  children,

  duration = MOTION_TRANSITIONS.smoothTimed.duration,
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
      transition={ { ...MOTION_TRANSITIONS.smoothTimed, duration } }
      { ...rest }
    >
      { children }
    </motion.div>
  )
}

export const Animate = memo<AnimateProps>(InnerAnimate)
Animate.displayName = 'Animate'
