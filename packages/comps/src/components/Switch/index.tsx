'use client'

import type { VariantProps } from 'class-variance-authority'
import type { SizeStyle } from '../../types'
import { cva } from 'class-variance-authority'
import { useLatestCallback } from 'hooks'
import React, { memo, useId } from 'react'
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
      },
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
  'absolute top-0.5 left-0.5 bg-white dark:bg-gray-300 rounded-full shadow-2xs transform transition-transform duration-300 ease-in-out flex items-center justify-center',
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
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  },
)

const switchSizeConfig = {
  sm: {
    trackWidth: 36,
    trackHeight: 20,
    thumbWidth: 16,
    thumbHeight: 16,
    thumbInset: 2,
  },
  md: {
    trackWidth: 44,
    trackHeight: 24,
    thumbWidth: 20,
    thumbHeight: 20,
    thumbInset: 2,
  },
  lg: {
    trackWidth: 56,
    trackHeight: 28,
    thumbWidth: 24,
    thumbHeight: 24,
    thumbInset: 2,
  },
} satisfies Record<keyof SizeStyle, SwitchSizeConfig>

export const Switch = memo<SwitchProps>((props) => {
  const {
    checked,
    onChange,
    disabled = false,
    size = 'md',
    background = 'rgb(var(--button) / 1)',
    checkedIcon,
    uncheckedIcon,
    name,
    containerClassName,
    error = false,
    errorMessage,
    icon,
    withGradient = false,
    label,
    labelClassName,
    defaultChecked = false,
    trackWidth,
    trackHeight,
    trackClassName,
    thumbWidth,
    thumbHeight,
    thumbInset,
    thumbClassName,
    ariaLabel,
  } = props
  /** 添加内部状态用于非受控模式 */
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)

  /** 稳定 id，用于 label 关联与 errorMessage 的 aria-describedby */
  const generatedId = useId()
  const inputId = name ?? generatedId
  const errorId = `${inputId}-error`

  /** 判断是否为受控组件 */
  const isControlled = checked !== undefined

  /** 使用 useFormField hook 处理表单集成 */
  const {
    isInForm,
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
  const sizePreset = switchSizeConfig[size ?? 'md']
  const actualTrackWidth = trackWidth ?? sizePreset.trackWidth
  const actualTrackHeight = trackHeight ?? sizePreset.trackHeight
  const actualThumbWidth = thumbWidth ?? sizePreset.thumbWidth
  const actualThumbHeight = thumbHeight ?? sizePreset.thumbHeight
  const actualThumbInset = thumbInset ?? sizePreset.thumbInset
  const checkedThumbOffset = Math.max(
    actualTrackWidth - actualThumbWidth - actualThumbInset * 2,
    0,
  )
  const hasCustomSize = trackWidth !== undefined
    || trackHeight !== undefined
    || thumbWidth !== undefined
    || thumbHeight !== undefined
    || thumbInset !== undefined

  const trackStyle = {
    ...(realChecked && !withGradient
      ? { background }
      : undefined),
    ...(hasCustomSize
      ? {
          width: actualTrackWidth,
          height: actualTrackHeight,
        }
      : undefined),
  } satisfies React.CSSProperties

  const thumbStyle = {
    transform: realChecked
      ? `translateX(${checkedThumbOffset}px)`
      : 'translateX(0)',
    ...(hasCustomSize
      ? {
          top: actualThumbInset,
          left: actualThumbInset,
          width: actualThumbWidth,
          height: actualThumbHeight,
        }
      : undefined),
  } satisfies React.CSSProperties

  const handleChange = useLatestCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled)
      return

    const newChecked = event.target.checked

    if (isControlled) {
      handleChangeVal(newChecked, event)
      handleBlur()
    }
    else {
      setInternalChecked(newChecked)
      handleChangeVal(newChecked, event)
      handleBlur()
      /** useFormField 非受控+非表单时不触发 onChange，需手动调用 */
      if (!isInForm) {
        onChange?.(newChecked)
      }
    }
  })

  return (
    <div className={ cn('flex flex-col', containerClassName) }>
      <div className="flex items-center">
        <label className={ cn(switchVariants({
          variant: disabled
            ? 'disabled'
            : 'default',
        })) }>
          <input
            id={ inputId }
            type="checkbox"
            className="sr-only"
            checked={ realChecked }
            onChange={ handleChange }
            disabled={ disabled }
            name={ name }
            aria-label={ ariaLabel ?? (typeof label === 'string'
              ? label
              : undefined) }
            aria-describedby={ actualError && actualErrorMessage
              ? errorId
              : undefined }
          />
          <div
            className={ cn(
              trackVariants({
                size,
                checked: realChecked,
                withGradient,
              }),
              trackClassName,
            ) }
            style={ Object.keys(trackStyle).length
              ? trackStyle
              : undefined }
          >
            <div
              className={ cn(
                thumbVariants({ size, checked: realChecked }),
                thumbClassName,
              ) }
              style={ thumbStyle }
            >
              { icon && icon }
              { !icon && realChecked && checkedIcon }
              { !icon && !realChecked && uncheckedIcon }
            </div>
          </div>
        </label>
        { label && (
          <label
            htmlFor={ inputId }
            className={ cn(
              'ml-2 text-sm text-gray-700 dark:text-gray-300',
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer',
              labelClassName,
            ) }
          >
            { label }
          </label>
        ) }
      </div>
      { actualError && actualErrorMessage && (
        <div id={ errorId } className="mt-1 text-sm text-rose-500">
          { actualErrorMessage }
        </div>
      ) }
    </div>
  )
})

/**
 * Switch 组件属性
 */
export interface SwitchProps extends VariantProps<typeof trackVariants> {
  /**
   * 尺寸
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg' | null
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
   * 自定义选中背景，支持颜色或 CSS background 表达式
   * @default 'rgb(var(--button) / 1)'
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
   * 中心图标（无论选中与否都显示）。
   * 优先级高于 checkedIcon / uncheckedIcon：传入 icon 后将忽略后两者
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
   * 轨道宽度，单位 px
   */
  trackWidth?: number
  /**
   * 轨道高度，单位 px
   */
  trackHeight?: number
  /**
   * 轨道自定义类名
   */
  trackClassName?: string
  /**
   * 滑块宽度，单位 px
   */
  thumbWidth?: number
  /**
   * 滑块高度，单位 px
   */
  thumbHeight?: number
  /**
   * 滑块距离轨道边缘的内缩距离，单位 px
   * @default 2
   */
  thumbInset?: number
  /**
   * 滑块自定义类名
   */
  thumbClassName?: string
  /**
   * 开关标签文本
   */
  label?: string
  /**
   * 标签类名
   */
  labelClassName?: string
  /**
   * 无障碍标签。未传时若 label 为字符串会自动用作 aria-label
   */
  ariaLabel?: string
}

Switch.displayName = 'Switch'

type SwitchSizeConfig = {
  trackWidth: number
  trackHeight: number
  thumbWidth: number
  thumbHeight: number
  thumbInset: number
}
