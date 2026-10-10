'use client'

import { numFixed } from '@jl-org/tool'
import { useLatestCallback } from 'hooks'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { forwardRef, memo, useCallback, useState } from 'react'
import { cn } from 'utils'
import type { Size } from '../../../types'
import { getControlLabelStyles, getControlSizeStyles } from '../../../utils/controlSizes'
import { getRoundedStyles } from '../../../utils/roundedUtils'
import { useFormField } from '../../Form'
import type { NumberInputProps } from '../types'

export const InnerNumberInput = forwardRef<HTMLInputElement, NumberInputProps>((
  props,
  ref,
) => {
  const {
    style,
    className,
    containerClassName,
    labelClassName,
    size = 'md' as Size,
    label,
    labelPosition = 'top',
    disabled = false,
    readOnly = false,
    disabledClass,
    disabledContainerClass,
    focusClass,
    focusContainerClass,
    errorClass,
    errorContainerClass,
    error = false,
    errorMessage,
    required = false,
    prefix,
    suffix,
    rounded = 'lg',
    onFocus,
    onBlur,
    onPressEnter,
    onKeyDown,
    onChange,
    onStepperClick,
    value,
    defaultValue,
    min: _min,
    max: _max,
    step = 1,
    precision,
    allowEmpty = false,
    name,
    ...rest
  } = props

  /** 使用 useFormField hook 处理表单集成 */
  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur: handleFieldBlur,
  } = useFormField<string | number, ChangeEvent<HTMLInputElement>, number | undefined>({
    name,
    value,
    defaultValue: defaultValue as string | number,
    error,
    errorMessage,
    onChange: onChange as any,
  })

  const min = typeof _min === 'string'
    ? Number.parseFloat(_min)
    : _min
  const max = typeof _max === 'string'
    ? Number.parseFloat(_max)
    : _max

  const [isFocused, setIsFocused] = useState(false)

  /** 处理输入变化 */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === '') {
        /**
         * 默认行为：清空即归零，保持向后兼容；
         * allowEmpty 时保留空字符串中间态，不强制写回 0，由 blur 决定最终值
         */
        handleChangeVal(
          allowEmpty
            ? ('' as any)
            : 0,
          e,
        )
        return
      }

      const allowNegative = min === undefined || min < 0
      const allowDecimal = precision !== undefined && precision > 0

      let pattern = '\\d*'
      if (allowDecimal) {
        /** 允许一个小数点 */
        pattern = '\\d*\\.?\\d*'
      }

      if (allowNegative) {
        pattern = `-?${pattern}`
      }

      const regex = new RegExp(`^${pattern}$`)

      if (!regex.test(val)) {
        return
      }

      /** 允许输入中间状态，如 '-' 或以 '.' 结尾 */
      if ((allowNegative && val === '-') || (allowDecimal && val.endsWith('.'))) {
        handleChangeVal(val as any, e)
      }
      else {
        const num = Number.parseFloat(val)
        if (!Number.isNaN(num)) {
          handleChangeVal(num, e)
        }
      }
    },
    [handleChangeVal, precision, min, allowEmpty],
  )

  /** 处理步进 */
  const handleIncrementOrDecrement = useCallback((type: 'increment' | 'decrement') => {
    if (disabled || readOnly) return

    const valStr = (actualValue ?? '').toString()
    let currentValue = Number.parseFloat(valStr)
    if (Number.isNaN(currentValue)) currentValue = 0

    if (type === 'increment' && max !== undefined && currentValue >= max) return
    if (type === 'decrement' && min !== undefined && currentValue <= min) return

    const newValue = type === 'increment'
      ? currentValue + step
      : currentValue - step

    let clampedValue = newValue
    if (max !== undefined && clampedValue > max) clampedValue = max
    if (min !== undefined && clampedValue < min) clampedValue = min

    const formattedValue = precision !== undefined
      ? numFixed(clampedValue, precision)
      : clampedValue

    const mockEvent = {
      target: { value: String(formattedValue) },
    } as ChangeEvent<HTMLInputElement>

    handleChangeVal(formattedValue, mockEvent)
  }, [actualValue, step, disabled, readOnly, max, min, precision, handleChangeVal])

  /** 处理聚焦 */
  const handleFocus = useLatestCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  })

  /** 处理失焦 */
  const handleBlur = useLatestCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    handleFieldBlur()

    let valueToSet: number | undefined
    const valueStr = (actualValue ?? '').toString()

    if (valueStr !== '') {
      /** 如果值是无效的中间状态，则清空 */
      if (valueStr === '-' || valueStr.endsWith('.')) {
        valueToSet = undefined
      }
      else {
        let numValue = Number.parseFloat(valueStr)
        if (!Number.isNaN(numValue)) {
          /** 应用范围限制 */
          if (min !== undefined && numValue < min) numValue = min
          if (max !== undefined && numValue > max) numValue = max

          /** 格式化精度 */
          valueToSet = precision !== undefined
            ? numFixed(numValue, precision)
            : numValue
        }
        else {
          valueToSet = undefined
        }
      }
    }
    else {
      valueToSet = undefined
    }

    const mockEvent = {
      target: {
        value: valueToSet === undefined
          ? ''
          : String(valueToSet),
      },
    } as ChangeEvent<HTMLInputElement>
    /**
     * 默认空值归一化为 0（向后兼容）；
     * allowEmpty 时保留空字符串，让调用方能表达「未填写」
     */
    const finalValue = valueToSet === undefined
      ? (allowEmpty
        ? ('' as any)
        : 0)
      : valueToSet
    handleChangeVal(finalValue, mockEvent)

    onBlur?.(e)
  })

  /** 处理键盘事件 */
  const handleKeyDown = useLatestCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrementOrDecrement('increment')
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleIncrementOrDecrement('decrement')
    }
    else if (e.key === 'Enter' && onPressEnter) {
      onPressEnter(e)
    }
  })

  const sizeStyles = getControlSizeStyles(size)
  const labelSizeStyles = getControlLabelStyles(size)

  const { className: roundedClass, style: roundedStyle } = getRoundedStyles(rounded)

  const inputClasses = cn(
    'w-full outline-hidden bg-transparent text-text',
    'transition-all duration-200 ease-in-out',
    disabled && 'cursor-not-allowed text-textDisabled',
    disabled && disabledClass,
    actualError && errorClass,
    isFocused && focusClass,
    readOnly && 'cursor-default',
  )

  const containerClasses = cn(
    'relative w-full flex items-center border',
    roundedClass,
    sizeStyles.className,
    {
      'border-border bg-background': !actualError && !disabled,
      'border-danger focus-within:border-danger focus-within:ring-1 focus-within:ring-danger/20': actualError && !disabled,
      'border-border bg-background2 text-textDisabled cursor-not-allowed': disabled,
      'border-border2': isFocused && !actualError && !disabled,
      'hover:border-border2': !isFocused && !actualError && !disabled,
    },
    disabled && disabledContainerClass,
    actualError && errorContainerClass,
    isFocused && focusContainerClass,
    containerClassName,
  )

  const stepperButtonClasses = cn(
    'flex items-center justify-center p-0.5 text-text2',
    'hover:text-text',
    'transition-colors duration-200',
    disabled && 'opacity-50 cursor-not-allowed hover:text-text2',
    readOnly && 'opacity-50 cursor-not-allowed hover:text-text2',
  )

  const renderInput = () => (
    <div className={ containerClasses } style={ { ...sizeStyles.style, ...roundedStyle } }>
      { prefix && (
        <div className="flex items-center justify-center pl-3 text-text2">
          { prefix }
        </div>
      ) }
      <input
        ref={ ref }
        value={ actualValue }
        className={ cn(
          inputClasses,
          prefix
            ? 'pl-2'
            : 'pl-3',
          'pr-2', // 为步进按钮留出空间
        ) }
        disabled={ disabled }
        readOnly={ readOnly }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onKeyDown={ handleKeyDown }
        onChange={ handleChange }
        inputMode="decimal"
        name={ name }
        { ...rest }
      />
      <div className="mr-1 flex flex-col">
        <button
          type="button"
          className={ stepperButtonClasses }
          onClick={ (e) => {
            onStepperClick?.(e)
            handleIncrementOrDecrement('increment')
          } }
          disabled={ disabled || readOnly || (max !== undefined && Number.parseFloat(actualValue?.toString() || '0') >= max) }
          tabIndex={ -1 }
        >
          <ChevronUp size={ sizeStyles.iconPx } />
        </button>
        <button
          type="button"
          className={ stepperButtonClasses }
          onClick={ (e) => {
            onStepperClick?.(e)
            handleIncrementOrDecrement('decrement')
          } }
          disabled={ disabled || readOnly || (min !== undefined && Number.parseFloat(actualValue?.toString() || '0') <= min) }
          tabIndex={ -1 }
        >
          <ChevronDown size={ sizeStyles.iconPx } />
        </button>
      </div>
      { suffix && (
        <div className="flex items-center justify-center pr-3 text-text2">
          { suffix }
        </div>
      ) }
    </div>
  )

  return (
    <div
      style={ style }
      className={ cn(
        'NumberInputContainer',
        {
          'flex flex-col gap-1': labelPosition === 'top',
          'flex flex-row items-center gap-2': labelPosition === 'left',
        },
      ) }
    >
      { label && (
        <label
          className={ cn(
            'block text-text',
            labelSizeStyles.className,
            {
              'min-w-24': labelPosition === 'left',
              'text-rose-500': actualError,
            },
            labelClassName,
          ) }
          style={ labelSizeStyles.style }
        >
          { label }
          { required && <span className="ml-1 text-rose-500">*</span> }
        </label>
      ) }
      { renderInput() }
      { actualError && actualErrorMessage && (
        <div className="mt-1 text-sm text-rose-500">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
})

InnerNumberInput.displayName = 'NumberInput'
export const NumberInput = memo(InnerNumberInput) as typeof InnerNumberInput
