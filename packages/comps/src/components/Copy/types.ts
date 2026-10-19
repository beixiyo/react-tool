import type { ReactNode } from 'react'
import type { ButtonProps } from '../Button/types'
import type { CheckmarkProps } from '../Checkbox/types'

export type CopyProps = {
  /**
   * 要复制到剪贴板的内容，支持传入函数实现懒求值（点击时才调用）
   */
  text: string | (() => Promise<string>)

  /**
   * 原复制流程完成后的兼容回调，始终只传本次文本
   */
  onCopy?: (text: string) => void

  /** 每次点击开始时安全通知；operationId 是跨实例、跨重挂载唯一的 Symbol。@default undefined */
  onCopyStart?: (event: CopyOperationEvent) => void | Promise<void>

  /** 剪贴板工具明确报告写入成功后安全通知；不等待返回值。@default undefined */
  onCopySuccess?: (event: CopyOperationEvent & { text: string }) => void | Promise<void>

  /** 原复制流程正常返回时提供 text（不代表底层确认写入成功），异常时提供 error；finally 通知且不等待。@default undefined */
  onCopyEnd?: (event: CopyOperationEvent & { text?: string; error?: Error }) => void | Promise<void>

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
   * @default 1
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

/** Copy 单次操作事件基类；operationId 使用 Symbol 保证跨实例与重挂载仍唯一 */
export type CopyOperationEvent = {
  operationId: symbol
}
