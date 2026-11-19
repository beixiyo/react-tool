'use client'

import { useControllableState, useLatestCallback } from 'hooks'
import React, { memo, useMemo } from 'react'
import { cn } from 'utils'
import { useFormField } from '../Form'
import type { RadioProps } from './types'

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

export const Radio = memo<RadioProps>(({
  ref,
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
}: RadioProps) => {
  /**
   * 受控（显式传入 checked，如经 RadioGroup 包裹时）/ 非受控选中态
   * onChange 需要携带事件对象，因此不交给 hook 通知，由 handleChange 显式调用
   */
  const [checkedState, setCheckedState, isControlled] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
  })

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
    ? checkedState
    : isInForm
    ? !!actualValue
    : checkedState

  const handleChange = useLatestCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked
    if (isInForm && !isControlled) {
      handleChangeVal(next, e)
      return
    }
    setCheckedState(next)
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
          'peer-focus-visible:ring-2 peer-focus-visible:ring-systemBlue/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
          // Disabled state
          'peer-disabled:cursor-not-allowed peer-disabled:border-border peer-disabled:bg-background3',
          // Unchecked state
          {
            'border-border3 group-hover:border-systemBlue': !isChecked && !disabled && !actualError,
          },
          // Checked state
          {
            'border-systemBlue': isChecked && !actualError,
          },
          // Error state
          {
            'border-danger': actualError,
          },
        ) }
        style={ sizeStyles.containerStyle }
      >
        <span
          className={ cn(
            'h-3/5 w-3/5 scale-0 rounded-full bg-systemBlue transition-transform',
            { 'scale-100': isChecked },
            { 'bg-danger': actualError },
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
            ? 'text-text3'
            : 'text-text',
          { 'text-danger': actualError },
        ) }
        style={ sizeStyles.labelStyle }
      >
        { label }
        { required && <span className="ml-1 text-danger">*</span> }
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
        <p className="mt-1.5 text-sm text-danger">
          { actualErrorMessage }
        </p>
      ) }
    </div>
  )
})

Radio.displayName = 'Radio'
