import type React from 'react'
import type { SessionConfig } from '../../types'

/**
 * 需求输入组件的属性
 */
export type RequirementInputProps = {
  /**
   * 当前需求描述
   */
  value?: string
  /**
   * 配置项
   */
  config: SessionConfig
  /**
   * 是否生成中
   */
  loading?: boolean
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
  /**
   * 需求变化回调
   */
  onChange?: (value: string) => void
  /**
   * 配置变化回调
   */
  onConfigChange?: (config: SessionConfig) => void
  /**
   * 提交回调
   */
  onSubmit?: (value: string) => void
}
