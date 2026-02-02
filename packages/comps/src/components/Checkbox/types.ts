import type { MotionProps } from 'motion/react'
import type { ChangeEvent } from 'react'
import type { Size } from '../../types'

export type CheckmarkProps = {
  /**
   * 组件大小（宽高相等）
   * @default 24
   */
  size?: Size
  /**
   * 线条宽度
   * @default 10
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
  /**
   * 是否为不确定状态（半选），显示横线而不是打勾
   * @default false
   */
  indeterminate?: boolean
}
& React.SVGProps<SVGSVGElement>
& MotionProps

export type CheckboxProps = {
  /**
   * 复选框是否被选中（受控模式）
   * 当提供此属性时，组件变为受控组件，其选中状态完全由外部控制
   */
  checked?: boolean
  /**
   * 复选框默认选中状态（非受控模式）
   * 当不提供 `checked` 属性时，组件变为非受控组件，使用此属性作为初始状态
   * @default false
   */
  defaultChecked?: boolean
  /**
   * 选中时的背景颜色
   * @default 'rgb(var(--buttonPrimary) / 1)'
   */
  checkedBackgroundColor?: string
  /**
   * 未选中时的背景颜色
   * @default 'transparent'
   */
  uncheckedBackgroundColor?: string
  /**
   * 边框颜色
   * @default 'var(--borderStrong)'
   */
  borderColor?: string
  /**
   * 边框宽度 (px)
   * @default 1
   */
  borderWidth?: number
  /**
   * 内部打勾/横线的粗细
   * @default 2
   */
  checkmarkWidth?: number
  /**
   * 内部打勾的颜色
   * @default 'rgb(var(--buttonTertiary) / 1)'
   */
  checkmarkColor?: string

  /**
   * 复选框状态改变时的回调函数
   */
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void
  /**
   * 是否禁用复选框
   * @default false
   */
  disabled?: boolean
  /**
   * 复选框标签文本
   */
  label?: React.ReactNode
  /**
   * 标签位置
   * @default 'right'
   */
  labelPosition?: 'left' | 'right'
  /**
   * 标签自定义类名
   */
  labelClassName?: string
  /**
   * 是否为不确定状态（半选）
   * @default false
   */
  indeterminate?: boolean
  /**
   * 是否为必填项
   * @default false
   */
  required?: boolean
  /**
   * 表单字段名称
   */
  name?: string
  /**
   * 组件大小
   * @default 'md'
   */
  size?: Size
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 动画持续时间（秒）
   */
  animationDuration?: number
} & Omit<React.HTMLAttributes<HTMLElement>, 'onChange' | 'defaultChecked'>
// Remove CheckmarkProps inheritance to avoid confusion and invalid props
