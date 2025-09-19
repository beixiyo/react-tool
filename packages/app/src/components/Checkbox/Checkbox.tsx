import type { CheckmarkProps } from './Checkmark'
import { memo } from 'react'
import { cn } from 'utils'
import { useFormField } from '@/components/Form'
import { primaryColor } from '@/styles/variable'
import { Checkmark } from './Checkmark'

/**
 * 交互式复选框组件，基于 Checkmark 组件构建
 * @example
 * <Checkbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 *   label="同意条款"
 * />
 */
export const Checkbox = memo<CheckboxProps>((props) => {
  const {
    checked = false,
    onChange,
    disabled = false,
    className,
    size = 24,
    strokeWidth = 6,
    borderColor = primaryColor,
    checkedBackgroundColor = primaryColor,
    uncheckedBackgroundColor = 'transparent',
    checkmarkColor = '#fff',
    label,
    labelPosition = 'right',
    labelClassName,
    indeterminate = false,
    required = false,
    name,
    ...rest
  } = props

  /** 使用 useFormField 集成表单功能 */
  const {
    actualValue,
    handleChangeVal,
    handleBlur,
  } = useFormField<boolean, React.MouseEvent | React.KeyboardEvent>({
    name,
    value: checked,
    defaultValue: false,
    onChange,
  })

  /** 使用表单值或组件自身的值 */
  const isChecked = actualValue ?? checked

  const backgroundColor = checked
    ? checkedBackgroundColor
    : uncheckedBackgroundColor

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      /** 使用 handleChangeVal 处理值变更 */
      handleChangeVal(!isChecked, e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      handleChangeVal(!isChecked, e as unknown as React.MouseEvent)
    }
  }

  const checkboxElement = (
    <Checkmark
      size={ size }
      strokeWidth={ strokeWidth }
      borderColor={ borderColor }
      backgroundColor={ backgroundColor }
      checkmarkColor={ checkmarkColor }
      show={ isChecked || indeterminate }
      showCircle={ false }
      animationDuration={ 0.6 }
      className={ cn(
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : '',
        className,
      ) }
      role="checkbox"
      aria-checked={ indeterminate
        ? 'mixed'
        : isChecked }
      aria-disabled={ disabled }
      aria-required={ required }
      tabIndex={ disabled
        ? -1
        : 0 }
      { ...rest }
      onClick={ handleClick }
      onKeyDown={ handleKeyDown }
      onBlur={ handleBlur }
    />
  )

  /** 如果有标签，则渲染带标签的组件 */
  if (label) {
    return (
      <label
        className={ cn(
          'flex items-center gap-2',
          labelPosition === 'left'
            ? 'flex-row-reverse'
            : '',
          'cursor-pointer',
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : '',
          labelClassName,
        ) }
        onClick={ e => !disabled && handleChangeVal(!isChecked, e) }
      >
        { checkboxElement }
        <span className={ cn(
          required
            ? 'before:content-["*"] before:mr-1 before:text-red-500'
            : '',
        ) }>
          { label }
        </span>
      </label>
    )
  }

  return checkboxElement
})

Checkbox.displayName = 'Checkbox'

export type CheckboxProps = {
  /**
   * 复选框是否被选中
   * @default false
   */
  checked?: boolean
  checkedBackgroundColor?: string
  uncheckedBackgroundColor?: string

  /**
   * 复选框状态改变时的回调函数
   */
  onChange?: (checked: boolean, e: React.MouseEvent | React.KeyboardEvent) => void
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
}
& Omit<CheckmarkProps, 'show' | 'onChange' | 'disabled' | 'showCircle' | 'backgroundColor'>
