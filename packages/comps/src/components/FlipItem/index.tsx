'use client'

import type { HTMLMotionProps, Transition } from 'motion/react'
import { motion } from 'motion/react'
import * as React from 'react'
import { memo } from 'react'
import { cn } from 'utils'

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
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      scale: { duration: 0.5, type: 'spring' as const, stiffness: 300, damping: 25 },
    },
  },
  active: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
      scale: { duration: 0.5, type: 'spring' as const, stiffness: 300, damping: 25 },
    },
  },
}

const defaultTransition: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

export const FlipItem = memo(({
  frontContent,
  backContent,
  gradient,
  isActive = false,
  perspective = '600px',
  glowBorderRadius = '16px',
  transition = defaultTransition,
  className,
  style,
  children,
  ...rest
}: FlipItemProps) => {
  /** 根据激活状态决定初始动画状态 */
  const initialState = isActive
    ? 'active'
    : 'initial'

  return (
    <motion.div
      className={ cn(
        'group relative block overflow-visible rounded-xl',
        className,
      ) }
      style={ { perspective, ...style } }
      whileHover="hover"
      animate={ initialState }
      initial={ initialState }
      { ...rest }
    >
      { gradient && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          variants={ glowVariants }
          style={ {
            background: gradient,
            opacity: 0,
            borderRadius: glowBorderRadius,
          } }
        />
      ) }

      <motion.div
        className="relative z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 transition-colors"
        variants={ itemVariants }
        transition={ transition }
        style={ { transformStyle: 'preserve-3d', transformOrigin: 'center bottom' } }
      >
        { frontContent }
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10 flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 transition-colors"
        variants={ backVariants }
        transition={ transition }
        style={ { transformStyle: 'preserve-3d', transformOrigin: 'center top', rotateX: 90 } }
      >
        { backContent }
      </motion.div>

      { children }
    </motion.div>
  )
})

FlipItem.displayName = 'FlipItem'

export interface FlipItemProps extends Omit<
  HTMLMotionProps<'div'>,
  'whileHover' | 'animate' | 'initial' | 'transition' | 'children'
> {
  /** 正面内容 */
  frontContent: React.ReactNode
  /** 背面内容（hover/激活时翻转显示） */
  backContent: React.ReactNode
  /** 背景辉光的 CSS 渐变/颜色，不传则不渲染辉光层 */
  gradient?: string
  /**
   * 是否处于激活态（直接展示背面）
   * @default false
   */
  isActive?: boolean
  /**
   * 3D 透视距离
   * @default '600px'
   */
  perspective?: string
  /**
   * 辉光层圆角
   * @default '16px'
   */
  glowBorderRadius?: string
  /**
   * 翻转动画过渡配置
   * @default { type: 'spring', stiffness: 100, damping: 20, duration: 0.5 }
   */
  transition?: Transition
  children?: React.ReactNode
}
