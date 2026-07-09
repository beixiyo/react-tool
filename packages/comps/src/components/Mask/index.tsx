import type { MotionProps } from 'motion/react'
import type { CSSProperties, HTMLAttributes } from 'react'
import { motion } from 'motion/react'
import { forwardRef, memo } from 'react'
import { cn } from 'utils'

const MASK_BACKGROUND = '#0000004D'
const MASK_BACKDROP_FILTER = 'blur(6px)'
const MASK_TRANSITION = { duration: 0.3, ease: 'easeInOut' } as const

export const Mask = memo(forwardRef<HTMLDivElement, MaskBgProps>((
  {
    style,
    className,
    children,
    ...rest
  },
  ref,
) => {
  const backgroundColor = style?.backgroundColor ?? MASK_BACKGROUND
  const backdropFilter = style?.backdropFilter ?? MASK_BACKDROP_FILTER

  return (
    <motion.div
      initial={ {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(0px)',
      } }
      animate={ {
        backgroundColor,
        backdropFilter,
      } }
      exit={ {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(0px)',
      } }
      transition={ MASK_TRANSITION }
      ref={ ref }
      className={ cn(
        'absolute inset-0',
        'flex items-center justify-center z-docked',
        className,
      ) }
      style={ {
        ...style,
      } }
      aria-hidden="true"
      { ...rest }
    >
      { children }
    </motion.div>
  )
}))

Mask.displayName = 'Mask'

export type MaskBgProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}
& MotionProps
& HTMLAttributes<HTMLDivElement>
