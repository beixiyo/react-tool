import type { ChangeEvent } from 'react'
import type { CheckboxProps } from './types'
import { memo, useState } from 'react'
import { cn } from 'utils'
import { useFormField } from '../Form'
import { Checkmark } from './Checkmark'
import { getSizeValue } from './utils'

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
    style,
    size = 'md',
    /**
     * 内部打勾线条粗细
     */
    checkmarkWidth = 2,
    /**
     * 边框宽度
     */
    borderWidth,
    /**
     * 边框颜色
     */
    borderColor,
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
    animationDuration = 0.6,
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
  } = useFormField<boolean, ChangeEvent<HTMLInputElement>>({
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
      handleChangeVal(newChecked, e as unknown as ChangeEvent<HTMLInputElement>)
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
      handleChangeVal(newChecked, e as unknown as ChangeEvent<HTMLInputElement>)
    }
  }

  const sizeValue = getSizeValue(size)
  const innerSize = Math.round(sizeValue * 0.9)

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
      { ...rest }
      className={ cn(
        'inline-flex items-center justify-center box-border border border-borderStrong rounded-lg',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',
        className,
      ) }
      style={ {
        ...style,
        width: sizeValue,
        height: sizeValue,
        background: backgroundColor,
        borderWidth: borderWidth !== undefined
          ? borderWidth
          : undefined,
        borderColor: borderColor || undefined,
      } }
    >
      <Checkmark
        size={ innerSize }
        strokeWidth={ checkmarkWidth }
        borderColor="transparent"
        backgroundColor="transparent"
        checkmarkColor={ checkmarkColor }
        show={ isChecked || indeterminate }
        indeterminate={ indeterminate }
        showCircle={ false }
        animationDuration={ animationDuration }
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
            handleChangeVal(newChecked, e as unknown as ChangeEvent<HTMLInputElement>)
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
