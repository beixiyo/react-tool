'use client'

import type { Size } from '../../types'
import { useLatestCallback } from 'hooks'
import React, { forwardRef, memo, useMemo, useState } from 'react'
import { cn } from 'utils'
import { useFormField } from '../Form'

/** 预设尺寸映射（静态常量，提到模块顶层避免每次渲染重建） */
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
} as const

export const Radio = memo<RadioProps>(forwardRef<HTMLInputElement, RadioProps>((
  {
    style,
    className,
    containerClassName,
    size = 'md',
    label,
    labelPosition = 'right',
    disabled = false,
    checked,
    defaultChecked = false,
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
  /** 是否为受控模式（显式传入 checked，如经 RadioGroup 包裹时） */
  const isControlled = checked !== undefined

  /** 非受控模式下的内部选中态 */
  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  /** 使用 useFormField hook 处理表单集成 */
  const {
    isInForm,
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
  } = useFormField<boolean, React.ChangeEvent<HTMLInputElement>>({
    name,
    value: checked,
    defaultValue: defaultChecked,
    error,
    errorMessage,
    onChange,
  })

  /**
   * 最终选中态来源优先级：
   * 1. 受控（显式传 checked）→ 使用 checked（RadioGroup 走此路径，保证既有行为不变）
   * 2. 表单内（isInForm）→ 跟随表单字段值
   * 3. 非受控 → 使用内部状态
   */
  const isChecked = isControlled
    ? checked
    : isInForm
      ? !!actualValue
      : internalChecked

  const handleChange = useLatestCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
    /** 受控模式：仅向上抛出，由外部决定（既有行为） */
    if (isControlled) {
      onChange?.(next, e)
      return
    }
    /** 表单内：同步表单字段值（handleChangeVal 内部会触发 onChange，无需重复调用） */
    if (isInForm) {
      handleChangeVal(next, e)
      return
    }
    /** 非受控：维护内部状态并向上抛出 */
    setInternalChecked(next)
    onChange?.(next, e)
  })

  /** 获取尺寸相关的样式，仅在 size 变化时重新计算 */
  const sizeStyles = useMemo(() => {
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
  }, [size])

  const radioElement = (
    <div className="relative flex items-center justify-center">
      <input
        ref={ ref }
        type="radio"
        disabled={ disabled }
        checked={ isChecked }
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
            'border-gray-400 group-hover:border-blue-500 dark:border-gray-500 dark:group-hover:border-blue-400': !isChecked && !disabled && !actualError,
          },
          // Checked state
          {
            'border-blue-500 dark:border-blue-400': isChecked && !actualError,
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
            { 'scale-100': isChecked },
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
