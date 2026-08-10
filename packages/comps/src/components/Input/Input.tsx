'use client'

import type { HTMLMotionProps } from 'motion/react'
import type { ChangeEvent } from 'react'
import type { Rounded, Size } from '../../types'
import { useLatestCallback } from 'hooks'
import { motion } from 'motion/react'
import { forwardRef, memo, useCallback, useId, useState } from 'react'
import { cn } from 'utils'
import { getRoundedStyles } from '../../utils/roundedUtils'
import { useFormField } from '../Form'

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
            {
              'text-sm': typeof size === 'string' && size === 'sm',
              'text-base': typeof size === 'string' && size === 'md',
              'text-lg': typeof size === 'string' && size === 'lg',
              'min-w-24': labelPosition === 'left',
              'text-rose-500': actualError,
            },
            labelClassName,
          ) }
          style={ typeof size === 'number'
            ? { fontSize: `${size * 0.4}px` }
            : undefined }
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

export type InputProps
  = & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'prefix'>
    & {
    /**
     * 容器类名
     */
      containerClassName?: string
      /**
       * 最外层容器类名
       */
      wrapperClassName?: string
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
       * 输入框视觉样式
       * @default 'default'
       */
      variant?: 'default' | 'underlined'
      /**
       * 下划线变体的聚焦动画配置，仅在 variant 为 underlined 时生效
       */
      underlineTransition?: HTMLMotionProps<'div'>['transition']
      /**
       * 是否显示方框边框；下划线变体始终保留底线
       * @default true
       */
      bordered?: boolean
      /**
       * 是否显示阴影
       * @default false
       */
      shadowed?: boolean
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
       * 前缀容器类名
       */
      prefixClassName?: string
      /**
       * 后缀内容
       */
      suffix?: React.ReactNode
      /**
       * 后缀容器类名
       */
      suffixClassName?: string
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
