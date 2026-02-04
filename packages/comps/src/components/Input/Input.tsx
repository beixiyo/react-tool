'use client'

import type { ChangeEvent } from 'react'
import type { Rounded, Size } from '../../types'
import { forwardRef, memo, useCallback, useState } from 'react'
import { cn } from 'utils'
import { getRoundedStyles } from '../../utils/roundedUtils'
import { useFormField } from '../Form'

const InnerInput = forwardRef<HTMLInputElement, InputProps>((
  props,
  ref,
) => {
  const {
    style,
    className,
    containerClassName,
    size = 'md' as Size,
    label,
    labelClassName,
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
    rounded = 'md',
    onFocus,
    onBlur,
    onPressEnter,
    onKeyDown,
    onChange,
    value,
    defaultValue,
    type,
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
  } = useFormField<string, ChangeEvent<HTMLInputElement>>({
    name,
    value,
    defaultValue: defaultValue as string,
    error,
    errorMessage,
    onChange,
  })

  const [isFocused, setIsFocused] = useState(false)

  /** 处理输入变化 */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      handleChangeVal?.(value, e)
    },
    [handleChangeVal],
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }, [onFocus])

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    handleFieldBlur()
    onBlur?.(e)
  }, [onBlur, handleFieldBlur])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e)
    if (e.key === 'Enter' && onPressEnter) {
      onPressEnter(e)
    }
  }, [onKeyDown, onPressEnter])

  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  }

  /** 获取尺寸相关的样式 */
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return {
        className: undefined,
        style: {
          height: `${size}px`,
          fontSize: `${size * 0.4}px`, // 根据高度计算字体大小
        },
      }
    }
    return {
      className: sizeClasses[size],
      style: undefined,
    }
  }

  const sizeStyles = getSizeStyles()

  const { className: roundedClass, style: roundedStyle } = getRoundedStyles(rounded)

  const inputClasses = cn(
    'w-full outline-hidden bg-transparent text-textPrimary',
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
      'border-border bg-white dark:bg-neutral-900': !actualError && !disabled,
      'border-rose-500 hover:border-rose-600 focus-within:border-rose-500': actualError && !disabled,
      'border-border bg-backgroundSecondary text-textDisabled cursor-not-allowed': disabled,
      'border-primary': isFocused && !actualError && !disabled,
      'hover:border-borderStrong': !isFocused && !actualError && !disabled,
    },
    disabled && disabledContainerClass,
    actualError && errorContainerClass,
    isFocused && focusContainerClass,
    containerClassName,
  )

  const renderInput = () => (
    <div className={ containerClasses } style={ { ...sizeStyles.style, ...roundedStyle } }>
      { prefix && (
        <div className="flex items-center justify-center pl-3 text-textSecondary">
          { prefix }
        </div>
      ) }
      <input
        ref={ ref }
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
        onFocus={ handleFocus }
        onBlur={ handleBlur }
        onKeyDown={ handleKeyDown }
        onChange={ handleChange }
        name={ name }
        { ...rest }
      />
      { suffix && (
        <div className="flex items-center justify-center pr-3 text-textSecondary">
          { suffix }
        </div>
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
      ) }
    >
      { label && (
        <label
          className={ cn(
            'block text-textPrimary',
            {
              'text-sm': typeof size === 'string' && size === 'sm',
              'text-base': typeof size === 'string' && size === 'md',
              'text-lg': typeof size === 'string' && size === 'lg',
              'min-w-24': labelPosition === 'left',
              'text-rose-500': actualError,
            },
            labelClassName,
          ) }
          style={
            typeof size === 'number'
              ? { fontSize: `${size * 0.4}px` }
              : undefined
          }
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

InnerInput.displayName = 'Input'
export const Input = memo(InnerInput) as typeof InnerInput

export type InputProps
  = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'prefix'>
    & {
    /**
     * 容器类名
     */
      containerClassName?: string
      /**
       * label 类名（用于自定义 label 样式）
       */
      labelClassName?: string
      /**
       * 禁用时的类名
       */
      disabledClass?: string
      /**
       * 禁用时的容器类名
       */
      disabledContainerClass?: string
      /**
       * 聚焦时的类名
       */
      focusClass?: string
      /**
       * 聚焦时的容器类名
       */
      focusContainerClass?: string
      /**
       * 错误时的类名
       */
      errorClass?: string
      /**
       * 错误时的容器类名
       */
      errorContainerClass?: string
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
       * @default 'top'
       */
      labelPosition?: 'top' | 'left'
      /**
       * 是否禁用
       * @default false
       */
      disabled?: boolean
      /**
       * 是否为只读
       * @default false
       */
      readOnly?: boolean
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
       * 前缀内容
       */
      prefix?: React.ReactNode
      /**
       * 后缀内容
       */
      suffix?: React.ReactNode
      /**
       * 圆角大小
       * @default 'md'
       */
      rounded?: Rounded | number
      /**
       * 输入值（受控模式）
       */
      value?: string
      /**
       * 输入内容变化时的回调
       */
      onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void
      /**
       * 聚焦时的回调
       */
      onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
      /**
       * 失焦时的回调
       */
      onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
      /**
       * 按下键盘时的回调
       */
      onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
      /**
       * 按下回车键时的回调
       */
      onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    }
