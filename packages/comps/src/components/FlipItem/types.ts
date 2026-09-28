import type { HTMLMotionProps, Transition } from 'motion/react'

export interface FlipItemProps extends
  Omit<
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
