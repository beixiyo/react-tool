'use client'

import type { Size } from '../../types'
import React, { forwardRef, memo, useCallback } from 'react'
import { cn } from 'utils'
import { useFormField } from '../Form'

export const Radio = memo<RadioProps>(forwardRef<HTMLInputElement, RadioProps>((
  {
    style,
    className,
    containerClassName,
    size = 'md',
    label,
    labelPosition = 'right',
    disabled = false,
    checked = false,
    error = false,
    errorMessage,
    required = false,
    name,
    value,
    onChange,
    ...rest
  },
  ref,
) => {
  /** 使用 useFormField hook 处理表单集成 */
  const {
    actualError,
    actualErrorMessage,
  } = useFormField<boolean, React.ChangeEvent<HTMLInputElement>>({
    name,
    value: checked,
    error,
    errorMessage,
    onChange,
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    /** 调用外部onChange */
    onChange?.(e.target.checked, e)
  }, [onChange])

  const sizeClasses = {
    sm: {
      container: 'h-4 w-4',
      label: 'text-sm',
      gap: 'gap-x-2',
    },
    md: {
      container: 'h-5 w-5',
      label: 'text-base',
      gap: 'gap-x-2',
    },
    lg: {
      container: 'h-6 w-6',
      label: 'text-lg',
      gap: 'gap-x-2',
    },
  }

  /** 获取尺寸相关的样式 */
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return {
        containerStyle: {
          width: `${size}px`,
          height: `${size}px`,
        },
        labelStyle: {
          fontSize: `${size * 0.4}px`, // 根据容器大小计算字体大小
        },
        gapStyle: {
          gap: `${size * 0.5}px`, // 根据容器大小计算间距
        },
        containerClassName: undefined,
        labelClassName: undefined,
        gapClassName: undefined,
      }
    }
    return {
      containerStyle: undefined,
      labelStyle: undefined,
      gapStyle: undefined,
      containerClassName: sizeClasses[size].container,
      labelClassName: sizeClasses[size].label,
      gapClassName: sizeClasses[size].gap,
    }
  }

  const sizeStyles = getSizeStyles()

  const radioElement = (
    <div className="relative flex items-center justify-center">
      <input
        ref={ ref }
        type="radio"
        disabled={ disabled }
        checked={ checked }
        name={ name }
        value={ value }
        required={ required }
        onChange={ handleChange }
        className="peer sr-only"
        aria-invalid={ actualError }
        { ...rest }
      />
      <span
        aria-hidden="true"
        className={ cn(
          'box-border flex shrink-0 items-center justify-center rounded-full border-2 p-0.5 transition-colors',
          sizeStyles.containerClassName,
          // Peer states
          'peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/50 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-gray-900',
          // Disabled state
          'peer-disabled:cursor-not-allowed peer-disabled:border-gray-200 peer-disabled:bg-gray-100 dark:peer-disabled:border-gray-700 dark:peer-disabled:bg-gray-800',
          // Unchecked state
          {
            'border-gray-400 group-hover:border-blue-500 dark:border-gray-500 dark:group-hover:border-blue-400': !checked && !disabled && !actualError,
          },
          // Checked state
          {
            'border-blue-500 dark:border-blue-400': checked && !actualError,
          },
          // Error state
          {
            'border-red-500': actualError,
          },
        ) }
        style={ sizeStyles.containerStyle }
      >
        <span
          className={ cn(
            'h-3/5 w-3/5 scale-0 rounded-full bg-blue-500 transition-transform dark:bg-blue-400',
            { 'scale-100': checked },
            { 'bg-red-500 dark:bg-red-400': actualError },
          ) }
        />
      </span>
    </div>
  )

  const labelElement = label
    ? (
        <span
          className={ cn(
            'select-none',
            sizeStyles.labelClassName,
            disabled
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-gray-800 dark:text-gray-200',
            { 'text-red-500 dark:text-red-400': actualError },
          ) }
          style={ sizeStyles.labelStyle }
        >
          { label }
          { required && <span className="ml-1 text-red-500 dark:text-red-400">*</span> }
        </span>
      )
    : null

  return (
    <div className={ cn('inline-flex flex-col', containerClassName) }>
      <label
        style={ { ...style, ...sizeStyles.gapStyle } }
        className={ cn(
          'group inline-flex items-center',
          sizeStyles.gapClassName,
          disabled
            ? 'cursor-not-allowed'
            : 'cursor-pointer',
          className,
        ) }
      >
        { labelPosition === 'left' && labelElement }
        { radioElement }
        { labelPosition === 'right' && labelElement }
      </label>
      { actualError && actualErrorMessage && (
        <p className="mt-1.5 text-sm text-red-500 dark:text-red-400">
          { actualErrorMessage }
        </p>
      ) }
    </div>
  )
}))

Radio.displayName = 'Radio'

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
   * 是否选中
   * @default false
   */
  checked?: boolean
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
