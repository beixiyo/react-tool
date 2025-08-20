import type { MotionProps, Variants } from 'framer-motion'
import { cn } from '@/utils'
import { motion } from 'framer-motion'
import React, { memo } from 'react'

/**
 * 动态打勾组件，提供流畅的动画效果和高度可定制性
 * @example
 * <Checkmark
 *   size={80}
 *   strokeWidth={4}
 *   color="rgb(16, 185, 129)"
 *   show={true}
 * />
 */
export const Checkmark = memo<CheckmarkProps>((
  {
    size = 24,
    strokeWidth = 6,
    borderColor = 'currentColor',
    backgroundColor = 'transparent',
    checkmarkColor = 'currentColor',
    className = '',
    show = true,
    showCircle = true,
    animationDuration = 3,
    animationDelay = 0,
    ...rest
  },
) => {
  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay: i * animationDelay,
          type: 'spring',
          duration: animationDuration,
          ease: 'easeInOut',
        },
        opacity: { delay: i * animationDelay, duration: 0.2 },
      },
    }),
  }

  return (
    <motion.svg
      width={ size }
      height={ size }
      viewBox="0 0 100 100"
      initial="hidden"
      animate={ show
        ? 'visible'
        : 'hidden' }
      className={ cn(
        'outline-none',
        rest.onClick
          ? 'cursor-pointer'
          : '',
        className,
      ) }
      { ...rest }
    >
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        key={ backgroundColor }
        stroke={ borderColor }
        variants={ !showCircle
          ? undefined
          : draw }
        custom={ 0 }
        style={ {
          strokeWidth,
          strokeLinecap: 'round',
          fill: backgroundColor,
        } }
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke={ checkmarkColor }
        variants={ draw }
        custom={ 1 }
        style={ {
          strokeWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'transparent',
          animationDuration: `${animationDuration}s`,
        } }
      />
    </motion.svg>
  )
})

Checkmark.displayName = 'Checkmark'

export type CheckmarkProps = {
  /**
   * 组件大小（宽高相等）
   * @default 24
   */
  size?: number
  /**
   * 线条宽度
   * @default 6
   */
  strokeWidth?: number

  /**
   * 边框颜色
   * @default 'currentColor'
   */
  borderColor?: string
  /**
   * 背景颜色
   * @default 'currentColor'
   */
  backgroundColor?: string
  /**
   * 打勾颜色
   * @default 'currentColor'
   */
  checkmarkColor?: string

  /**
   * 自定义类名
   */
  className?: string
  /**
   * 是否显示打勾动画
   * @default true
   */
  show?: boolean
  /**
   * 是否显示外部圆圈
   * @default true
   */
  showCircle?: boolean
  /**
   * 动画持续时间（秒）
   * @default 0.6
   */
  animationDuration?: number
  /**
   * 动画延迟（秒）
   * @default 0.1
   */
  animationDelay?: number
}
& React.SVGProps<SVGSVGElement>
& MotionProps
