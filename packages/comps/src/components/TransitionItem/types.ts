/**
 * TransitionItem 类型声明
 */

import type * as React from 'react'

export type TransitionItemProps = {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  /**
   * 渲染的标签 / 组件
   * @default 'div'
   */
  tag?: React.ElementType
  /** view transition 名称，会拼接为 `view-${transitionName}` */
  transitionName: string | number
} & Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'className' | 'children'>
