import type * as React from 'react'

/**
 * 图片过渡组件
 * - 在一组图片间循环切换，带淡入淡出与模糊过渡
 */
export interface ImgTransitionProps {
  /**
   * 图片地址列表
   */
  srcs: string[]
  /**
   * 自动切换间隔（毫秒）
   * @default 3000
   */
  interval?: number
  /**
   * 单次过渡动画时长（秒）
   * @default 0.3
   */
  transitionDuration?: number
  /**
   * 是否暂停自动切换
   * @default false
   */
  paused?: boolean
  /**
   * 容器类名
   */
  className?: string
  /**
   * 容器内联样式
   */
  style?: React.CSSProperties
  /**
   * 图片类名
   */
  imgClassName?: string
  /**
   * 图片 alt 文案（静态）；纯装饰图可传空串
   * @default `Transition image ${index + 1}`
   */
  alt?: string
  /**
   * 根据当前索引动态生成 alt 文案，优先级高于 alt
   */
  getAlt?: (index: number) => string
  /**
   * 当前图片索引变化时的回调
   */
  onIndexChange?: (index: number) => void
}
