'use client'

import { useLatestCallback } from 'hooks'
import type { HTMLMotionProps } from 'motion/react'
import { motion } from 'motion/react'
import type { ChangeEvent } from 'react'
import { forwardRef, memo, useCallback, useId, useState } from 'react'
import { cn } from 'utils'
import type { Size } from '../../types'
import { getControlLabelStyles, getControlSizeStyles } from '../../utils/controlSizes'
import { getRoundedStyles } from '../../utils/roundedUtils'
import { useFormField } from '../Form'
import type { InputProps } from './types'

const DEFAULT_UNDERLINE_TRANSITION = { duration: 0.5 } satisfies HTMLMotionProps<'div'>['transition']

const InnerInput = forwardRef<HTMLInputElement, InputProps>((
  props,
  ref,
) => {
  const {
    style,
    className,
    wrapperClassName,
    containerClassName,
    size = 'md' as Size,
    label,
    labelClassName,
    labelPosition = 'top',
    variant = 'default',
    underlineTransition = DEFAULT_UNDERLINE_TRANSITION,
    bordered = true,
    shadowed = false,
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
    prefixClassName,
    suffix,
    suffixClassName,
    rounded = 'lg',
    onFocus,
    onBlur,
    onPressEnter,
    onKeyDown,
    onChange,
    value,
    defaultValue,
    type,
    name,
    id,
    ...rest
  } = props

  /** 使用 useFormField hook 处理表单集成 */
  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur: handleFieldBlur,
  } = useFormField<string, ChangeEvent<HTMLInputElement>>({
    name,
    value,
    defaultValue: defaultValue as string,
    error,
    errorMessage,
    onChange,
  })

  const [isFocused, setIsFocused] = useState(false)

  /** 用于 label/错误信息与 input 的无障碍关联，外部传入 id 优先 */
  const reactId = useId()
  const inputId = id ?? reactId
  const errorMessageId = `${inputId}-error`
  const hasError = !!actualError && !!actualErrorMessage

  /** 处理输入变化 */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      handleChangeVal?.(value, e)
    },
    [handleChangeVal],
  )

  const handleFocus = useLatestCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  })

  const handleBlur = useLatestCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    handleFieldBlur()
    onBlur?.(e)
  })

  const handleKeyDown = useLatestCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.key === 'Enter' && onPressEnter) {
      onPressEnter(e)
    }
  })

  const sizeStyles = getControlSizeStyles(size)
  const labelSizeStyles = getControlLabelStyles(size)

  const { className: roundedClass, style: roundedStyle } = getRoundedStyles(rounded)
  const isUnderlined = variant === 'underlined'

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
    'relative w-full flex items-center',
    !isUnderlined && bordered && 'border',
    !isUnderlined && roundedClass,
    sizeStyles.className,
    {
      'bg-background': !isUnderlined && !actualError && !disabled,
      'border-border': !isUnderlined && bordered && (!actualError || disabled),
      'focus-within:ring-1 focus-within:ring-danger/20': !isUnderlined && actualError && !disabled,
      'border-danger': !isUnderlined && bordered && actualError && !disabled,
      'bg-background2 text-textDisabled cursor-not-allowed': !isUnderlined && disabled,
      'border-border2': !isUnderlined && bordered && isFocused && !actualError && !disabled,
      'hover:border-border2': !isUnderlined && bordered && !isFocused && !actualError && !disabled,
      'cursor-not-allowed': isUnderlined && disabled,
    },
    shadowed && 'shadow-card',
    disabled && disabledContainerClass,
    actualError && errorContainerClass,
    isFocused && focusContainerClass,
    containerClassName,
  )

  const renderInput = () => (
    <div className={ containerClasses } style={ { ...sizeStyles.style, ...(!isUnderlined && roundedStyle) } }>
      { prefix && (
        <div className={ cn('flex items-center justify-center pl-3 text-text2', prefixClassName) }>
          { prefix }
        </div>
      ) }
      <input
        ref={ ref }
        id={ inputId }
        type={ type }
        value={ actualValue }
        className={ cn(
          inputClasses,
          prefix
            ? 'pl-2'
            : 'pl-3',
          suffix
            ? 'pr-2'
            : 'pr-3',
          className,
        ) }
        disabled={ disabled }
        readOnly={ readOnly }
        aria-invalid={ actualError || undefined }
        aria-required={ required || undefined }
        aria-errormessage={ hasError
          ? errorMessageId
          : undefined }
        aria-describedby={ hasError
          ? errorMessageId
          : undefined }
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onKeyDown={ handleKeyDown }
        onChange={ handleChange }
        name={ name }
        { ...rest }
      />
      { suffix && (
        <div className={ cn('flex items-center justify-center pr-3 text-text2', suffixClassName) }>
          { suffix }
        </div>
      ) }
      { isUnderlined && (
        <>
          <div
            className={ cn(
              'pointer-events-none absolute inset-x-0 bottom-0 h-px',
              actualError
                ? 'bg-danger'
                : 'bg-border',
            ) }
          />
          { !actualError && (
            <motion.div
              initial={ false }
              animate={ {
                scaleX: isFocused && !disabled
                  ? 1
                  : 0,
              } }
              transition={ underlineTransition }
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-brand"
            />
          ) }
        </>
      ) }
    </div>
  )

  return (
    <div
      style={ style }
      className={ cn(
        'InputContainer',
        {
          'flex flex-col gap-1': labelPosition === 'top',
          'flex flex-row items-center gap-2': labelPosition === 'left',
        },
        wrapperClassName,
      ) }
    >
      { label && (
        <label
          htmlFor={ inputId }
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
      { hasError && (
        <div id={ errorMessageId } className="mt-1 text-sm text-rose-500">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
})

InnerInput.displayName = 'Input'
export const Input = memo(InnerInput) as typeof InnerInput
