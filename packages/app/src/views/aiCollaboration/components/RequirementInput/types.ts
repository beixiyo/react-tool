import type React from 'react'

/**
 * 需求输入组件的属性
 */
export type RequirementInputProps = {
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
  /**
   * 提交回调
   */
  onSubmit?: (value: string) => void
}
