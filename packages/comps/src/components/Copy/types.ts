import type { ReactNode } from 'react'
import type { ButtonProps } from '../Button/types'
import type { CheckmarkProps } from '../Checkbox/types'

export type CopyProps = {
  /**
   * 要复制到剪贴板的内容
   */
  text: string

  /**
   * 复制成功后的回调
   */
  onCopy?: (text: string) => void

  /**
   * 复制失败后的回调
   */
  onCopyError?: (error: Error) => void

  /**
   * Checkmark 动画完成后切换回 Button 的延迟时间（毫秒）
   * @default 1500
   */
  resetDelay?: number

  /**
   * Checkmark 动画持续时间（秒）
   * @default 0.6
   */
  animationDuration?: number

  /**
   * 是否显示按钮文本
   * @default false
   */
  showText?: boolean

  /**
   * 按钮文本内容
   * @default '复制'
   */
  buttonText?: string

  /**
   * 传递给 Button 的额外属性
   */
  buttonProps?: Omit<ButtonProps, 'onClick' | 'children' | 'leftIcon' | 'rightIcon'>

  /**
   * 传递给 Checkmark 的额外属性
   */
  checkmarkProps?: Omit<CheckmarkProps, 'show' | 'animationDuration'>

  /**
   * 自定义复制图标
   *
   * - 在未复制状态下显示
   * - 优先级高于默认的 Copy 图标
   */
  copyIcon?: ReactNode

  /**
   * 自定义复制成功图标
   *
   * - 在复制成功后的状态下显示
   * - 优先级高于默认的 Checkmark 组件
   */
  checkIcon?: ReactNode
}
