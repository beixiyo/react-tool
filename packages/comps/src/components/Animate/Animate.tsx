import type { MotionProps } from 'motion/react'
import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { forwardRef, memo } from 'react'
import { cn } from 'utils'
import { animateVariants, DURTAION, variantsMap } from './constants'

const InnerAnimate = forwardRef<HTMLDivElement, AnimateProps>((
  {
    style,
    className,
    children,

    duration = DURTAION,
    variants = 'top-bottom',
    ...rest
  },
  ref,
) => {
  return (
    <motion.div
      ref={ ref }
      className={ cn(
        className,
      ) }
      style={ style }

      variants={
        typeof variants === 'string'
          ? variantsMap[variants] || animateVariants
          : variants || animateVariants
      }
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
})

export const Animate = memo<AnimateProps>(InnerAnimate) as typeof InnerAnimate
Animate.displayName = 'Animate'

export type AnimateProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode

  duration?: number

  /**
   * 动画变体配置
   * 支持字符串枚举或自定义 Variants 对象
   * @default 'top-bottom'
   */
  variants?: keyof typeof variantsMap | MotionProps['variants']
}
& Omit<MotionProps, 'variants'>
