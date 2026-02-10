'use client'

import type { MotionProps } from 'motion/react'
import type { CSSProperties } from 'react'
import { useCustomEffect } from 'hooks'
import { motion, useAnimationControls } from 'motion/react'
import { forwardRef, memo, useRef, useState } from 'react'
import { cn } from 'utils'
import { animateVariants, DURTAION, variantsMap } from './constants'

const InnerAnimateShow = forwardRef<HTMLDivElement, AnimateShowProps>((
  {
    style,
    className,
    children,

    show = true,
    display = 'block',
    visibilityMode = false,

    duration = DURTAION,
    variants = 'top-bottom',
    exitSetMode,
    animateOnMount = false,
    ...rest
  },
  ref,
) => {
  const controller = useAnimationControls()
  const [isAnimating, setIsAnimating] = useState(true)
  const isFirstMount = useRef(true)

  useCustomEffect(
    async () => {
      setIsAnimating(true)
      const isMount = isFirstMount.current

      if (isMount)
        isFirstMount.current = false

      if (show) {
        if (isMount && !animateOnMount) {
          controller.set('animate')
        }
        else {
          controller.set('initial')
          await controller.start('animate')
        }
        return
      }

      if (exitSetMode || (isMount && !animateOnMount)) {
        controller.set('exit')
        setIsAnimating(false)
        return
      }

      await controller.start('exit')
      setIsAnimating(false)
    },
    [show, controller, animateOnMount],
  )

  return (
    <motion.div
      ref={ ref as any }
      className={ cn(className) }

      variants={
        typeof variants === 'string'
          ? variantsMap[variants] || animateVariants
          : variants || animateVariants
      }
      animate={ controller }
      transition={ {
        duration,
        type: 'tween',
        ease: 'easeInOut',
      } }

      style={ {
        ...(
          visibilityMode
            ? {
                visibility: !show && !isAnimating
                  ? 'hidden'
                  : 'visible',
              }
            : {
                display: !show && !isAnimating
                  ? 'none'
                  : display,
              }
        ),
        ...style,
      } }
      { ...rest }
    >
      { children }
    </motion.div>
  )
})

export const AnimateShow = memo(InnerAnimateShow) as typeof InnerAnimateShow
AnimateShow.displayName = 'AnimateShow'

export type AnimateShowProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode

  show?: boolean
  display?: string
  visibilityMode?: boolean
  duration?: number

  /**
   * 动画变体配置
   * 支持字符串枚举或自定义 Variants 对象
   * @default 'top-bottom'
   */
  variants?: keyof typeof variantsMap | MotionProps['variants']

  /**
   * 退出动画是否采用 set 同步模式
   * 这将关闭退出动画
   * ### 适用于路由动画，可以解决布局异常问题
   */
  exitSetMode?: boolean

  /**
   * 是否在组件挂载时播放动画
   * @default false
   */
  animateOnMount?: boolean
}
& Omit<MotionProps, 'variants'>
& React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
