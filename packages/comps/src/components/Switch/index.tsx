'use client'

import type { VariantProps } from 'class-variance-authority'
import type { SizeStyle } from '../../types'
import { cva } from 'class-variance-authority'
import React, { memo, useCallback } from 'react'
import { cn } from 'utils'
import { useFormField } from '../Form'

const switchVariants = cva(
  'relative inline-flex items-center transition-colors duration-300 ease-in-out cursor-pointer',
  {
    variants: {
      variant: {
        default: '',
        disabled: 'cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const trackVariants = cva(
  'rounded-full transition-colors duration-300 ease-in-out',
  {
    variants: {
      size: {
        sm: 'w-9 h-5',
        md: 'w-11 h-6',
        lg: 'w-14 h-7',
      } as SizeStyle,
      checked: {
        true: 'bg-blue-600 dark:bg-blue-500',
        false: 'bg-gray-200 dark:bg-gray-700',
      },
      withGradient: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        withGradient: true,
        checked: true,
        class: 'bg-linear-to-r from-blue-400 to-purple-500 dark:from-blue-500 dark:to-purple-600',
      },
    ],
    defaultVariants: {
      size: 'md',
      checked: false,
      withGradient: false,
    },
  },
)

const thumbVariants = cva(
  'absolute top-0.5 left-0.5 bg-white dark:bg-gray-300 rounded-full shadow-xs transform transition-transform duration-300 ease-in-out flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
      },
      checked: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'sm',
        checked: true,
        class: 'translate-x-4',
      },
      {
        size: 'md',
        checked: true,
        class: 'translate-x-5',
      },
      {
        size: 'lg',
        checked: true,
        class: 'translate-x-7',
      },
    ],
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  },
)

export const Switch = memo<SwitchProps>((props) => {
  const {
    checked = false,
    onChange,
    disabled = false,
    size = 'md',
    background = '#2563EB',
    checkedIcon,
    uncheckedIcon,
    name,
    containerClassName,
    error = false,
    errorMessage,
    icon,
    withGradient = false,
    iconClassName,
    label,
    labelClassName,
    defaultChecked = false,
  } = props
  /** 添加内部状态用于非受控模式 */
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)

  /** 判断是否为受控组件 */
  const isControlled = checked !== undefined && onChange !== undefined

  /** 使用 useFormField hook 处理表单集成 */
  const {
    actualValue: formChecked,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<boolean, React.ChangeEvent<HTMLInputElement>>({
    name,
    value: checked,
    error,
    errorMessage,
    onChange,
  })

  /** 根据是否受控选择使用的值 */
  const realChecked = isControlled
    ? formChecked
    : internalChecked

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled)
      return

    const newChecked = event.target.checked

    /** 如果是受控组件，调用外部onChange */
    if (isControlled) {
      handleChangeVal(newChecked, event)
      handleBlur()
    }
    else {
      /** 非受控模式下，更新内部状态 */
      setInternalChecked(newChecked)
    }
  }, [disabled, handleChangeVal, handleBlur, isControlled])

  return (
    <div className={ cn('flex flex-col', containerClassName) }>
      <div className="flex items-center">
        <label className={ cn(switchVariants({
          variant: disabled
            ? 'disabled'
            : 'default',
        })) }>
          <input
            type="checkbox"
            className="sr-only"
            checked={ realChecked }
            onChange={ handleChange }
            disabled={ disabled }
            name={ name }
          />
          <div
            className={ cn(trackVariants({
              size,
              checked: realChecked,
              withGradient,
            })) }
            style={ realChecked && !withGradient
              ? { background }
              : undefined }
          >
            <div className={ cn(
              thumbVariants({ size, checked: realChecked }),
              iconClassName,
            ) }>
              { icon && icon }
              { !icon && realChecked && checkedIcon }
              { !icon && !realChecked && uncheckedIcon }
            </div>
          </div>
        </label>
        { label && (
          <span className={ cn('ml-2 text-sm text-gray-700 dark:text-gray-300', labelClassName) }>
            { label }
          </span>
        ) }
      </div>
      { actualError && actualErrorMessage && (
        <div className="mt-1 text-sm text-rose-500">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
})

interface SwitchProps extends VariantProps<typeof trackVariants> {
  /**
   * 是否选中（受控模式）
   * @default false
   */
  checked?: boolean
  /**
   * 状态改变时的回调函数（受控模式）
   */
  onChange?: (checked: boolean) => void
  /**
   * 默认是否选中（非受控模式）
   * @default false
   */
  defaultChecked?: boolean
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 自定义背景颜色
   */
  background?: string
  /**
   * 选中状态的图标
   */
  checkedIcon?: React.ReactElement
  /**
   * 未选中状态的图标
   */
  uncheckedIcon?: React.ReactElement
  /**
   * 中心图标（无论选中与否都显示）
   */
  icon?: React.ReactElement
  /**
   * 是否使用渐变背景
   * @default false
   */
  withGradient?: boolean
  /**
   * 表单字段名称
   */
  name?: string
  /**
   * 容器类名
   */
  containerClassName?: string
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
   * 开关按钮自定义类名
   */
  iconClassName?: string
  /**
   * 开关标签文本
   */
  label?: string
  /**
   * 标签类名
   */
  labelClassName?: string
}

Switch.displayName = 'Switch'
