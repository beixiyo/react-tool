import type { CheckmarkProps } from './Checkmark'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { useFormField } from '../Form'
import { Checkmark } from './Checkmark'

/**
 * 交互式复选框组件，基于 Checkmark 组件构建
 *
 * 支持受控和非受控两种模式：
 * - 受控模式：通过 `checked` 和 `onChange` 属性完全控制组件状态
 * - 非受控模式：通过 `defaultChecked` 属性设置初始状态，组件内部管理状态变化
 *
 * @example
 * // 受控模式
 * <Checkbox
 *   checked={isChecked}
 *   onChange={setIsChecked}
 *   label="同意条款"
 * />
 *
 * @example
 * // 非受控模式
 * <Checkbox
 *   defaultChecked={true}
 *   onChange={(checked) => console.log('状态变化:', checked)}
 *   label="记住我"
 * />
 */
export const Checkbox = memo<CheckboxProps>((props) => {
  const {
    checked: controlledChecked,
    defaultChecked = false,
    onChange,
    disabled = false,
    className,
    size = 24,
    strokeWidth = 10,
    /**
     * 选中时背景色，默认使用 token 中的按钮主色（light -> 黑，dark -> 白）
     * 借助设计 Token `--buttonPrimary` 实现深浅色自动切换
     */
    checkedBackgroundColor = `rgb(var(--buttonPrimary) / 1)`,
    uncheckedBackgroundColor = 'transparent',
    /**
     * 打勾颜色，默认使用 token 中的按钮次色（与背景形成对比）
     * 使用 `--buttonTertiary` 可以在 light/dark 下得到相反的颜色
     */
    checkmarkColor = `rgb(var(--buttonTertiary) / 1)`,
    label,
    labelPosition = 'right',
    labelClassName,
    indeterminate = false,
    required = false,
    name,
    ...rest
  } = props

  /** 受控/非受控模式管理 */
  const isControlled = controlledChecked !== undefined
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  /** 使用受控值或内部状态 */
  const checked = isControlled
    ? controlledChecked
    : internalChecked

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

  const backgroundColor = (checked || indeterminate)
    ? checkedBackgroundColor
    : uncheckedBackgroundColor

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (!disabled) {
      const newChecked = !checked
      /** 非受控模式下更新内部状态 */
      if (!isControlled) {
        setInternalChecked(newChecked)
      }
      /** 使用 handleChangeVal 处理值变更 */
      handleChangeVal(newChecked, e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      const newChecked = !checked
      /** 非受控模式下更新内部状态 */
      if (!isControlled) {
        setInternalChecked(newChecked)
      }
      handleChangeVal(newChecked, e as unknown as React.MouseEvent)
    }
  }

  const innerSize = Math.round(size * 0.9)

  const checkboxElement = (
    <span
      role="checkbox"
      aria-checked={ indeterminate
        ? 'mixed'
        : isChecked }
      aria-disabled={ disabled }
      aria-required={ required }
      tabIndex={ disabled
        ? -1
        : 0 }
      onClick={ handleClick }
      onKeyDown={ handleKeyDown }
      onBlur={ handleBlur }
      className={ cn(
        'inline-flex items-center justify-center box-border border rounded-md',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',
        className,
      ) }
      style={ {
        width: size,
        height: size,
        background: backgroundColor,
        /** 使用设计 Token --textPrimary 作为边框颜色，在 light/dark 下自动反转 */
        borderColor: 'rgb(var(--textPrimary) / 1)',
      } }
    >
      <Checkmark
        size={ innerSize }
        strokeWidth={ strokeWidth }
        borderColor="transparent"
        backgroundColor="transparent"
        checkmarkColor={ checkmarkColor }
        show={ isChecked || indeterminate }
        indeterminate={ indeterminate }
        showCircle={ false }
        animationDuration={ 0.6 }
        { ...rest }
      />
    </span>
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
        onClick={ (e) => {
          if (!disabled) {
            const newChecked = !checked
            /** 非受控模式下更新内部状态 */
            if (!isControlled) {
              setInternalChecked(newChecked)
            }
            handleChangeVal(newChecked, e)
          }
        } }
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
