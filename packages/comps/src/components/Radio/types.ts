/**
 * Radio 类型声明
 */
import type { Size } from '../../types'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /**
   * 容器类名
   */
  containerClassName?: string
  /**
   * 尺寸
   * @default 'md'
   */
  size?: Size
  /**
   * 标签文本
   */
  label?: string
  /**
   * 标签位置
   * @default 'right'
   */
  labelPosition?: 'left' | 'right'
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 是否选中（受控）。不传则进入非受控模式，由内部状态管理；在 Form 内会跟随表单字段值
   */
  checked?: boolean
  /**
   * 非受控模式下的初始选中态
   * @default false
   */
  defaultChecked?: boolean
  /**
   * 错误状态
   * @default false
   */
  error?: boolean
  /**
   * 错误信息
   */
  errorMessage?: string
  /**
   * 是否必填
   * @default false
   */
  required?: boolean
  /**
   * 值变化时的回调
   */
  onChange?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * The content of the component.
   */
  children?: React.ReactNode
  /**
   * Layout direction of the radio buttons.
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal'
  /**
   * 当前选中的值
   */
  value?: string
  /**
   * 单选按钮组名称
   */
  name: string
  /**
   * 值变化时的回调
   */
  onChange?: (value: string, e: React.ChangeEvent<HTMLInputElement>) => void
}
