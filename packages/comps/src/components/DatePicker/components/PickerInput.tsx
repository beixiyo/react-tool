'use client'

import type { ReactNode } from 'react'
import type { PickerTriggerVariant } from '../types'
import { useTheme } from 'hooks'
import { Calendar } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { PickerClearButton } from './PickerClearButton'

export interface PickerInputProps {
  /** 显示的值 */
  displayValue?: string
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示清除按钮 */
  showClear?: boolean
  /** 是否有错误 */
  error?: boolean
  /** 是否显示清除按钮的条件（基于 displayValue 和 disabled） */
  canShowClear?: boolean
  /** 清除回调 */
  onClear?: (e: React.MouseEvent) => void
  /** 点击回调 */
  onClick?: () => void
  /** 输入框类名 */
  inputClassName?: string
  /** 自定义图标 */
  icon?: ReactNode
  /** 自定义清除图标 */
  clearIcon?: ReactNode
  /** 是否使用 12 小时制 */
  use12Hours?: boolean
  /** AM/PM 文本 */
  ampm?: string
  /** 具体的时间值 */
  timeValue?: string
  /** AM/PM 显示位置 */
  periodPosition?: 'left' | 'right'
  /** 默认输入框或无边框紧凑模式 */
  triggerVariant?: PickerTriggerVariant
}

/**
 * 统一的 Picker 输入框组件
 */
export const PickerInput = memo<PickerInputProps>(({
  displayValue,
  placeholder = '请选择',
  disabled = false,
  showClear = false,
  error = false,
  canShowClear: _canShowClear,
  onClear,
  onClick,
  inputClassName,
  icon,
  clearIcon,
  use12Hours,
  ampm,
  timeValue,
  periodPosition = 'right',
  triggerVariant = 'default',
}) => {
  const [theme] = useTheme()
  const compact = triggerVariant === 'compact'
  const canShowClear = _canShowClear !== undefined
    ? _canShowClear
    : (showClear && displayValue && !disabled)

  const ampmElement = use12Hours && ampm && (
    <span className={ cn('text-text text-sm uppercase shrink-0', {
      'mr-1': periodPosition === 'left',
      'ml-1': periodPosition === 'right',
    }) }>
      { ampm }
    </span>
  )

  return (
    <div
      className={ cn(
        'group/picker flex w-full items-center text-sm transition-colors',
        compact
          ? 'h-auto w-fit border-0 bg-transparent p-0'
          : 'h-10 rounded-xl bg-background px-3 py-2 shadow-card',
        !compact && theme !== 'light' && 'border border-border',
        {
          'border-danger': error,
          'cursor-not-allowed': disabled,
          'cursor-pointer': !disabled,
          'opacity-60': disabled,
          'hover:bg-background2': !disabled && !compact,
        },
        inputClassName,
      ) }
      onClick={ onClick }
    >
      <span className={ cn(
        'mr-2 inline-flex shrink-0 items-center justify-center text-text2 transition-colors',
        compact && !disabled && 'hover:text-brand',
      ) }>
        { icon !== undefined
          ? icon
          : <Calendar className="h-4 w-4 shrink-0 text-current" /> }
      </span>
      <div className="flex flex-1 items-center overflow-hidden">
        <span className={ cn('truncate text-left shrink-0 transition-colors', {
          'text-text2': !displayValue,
          'text-text': displayValue,
          'hover:text-brand': !disabled && compact,
        }) }>
          { displayValue || placeholder }
        </span>

        { use12Hours && timeValue && (
          <div className="ml-1 flex items-center shrink-0">
            { periodPosition === 'left' && ampmElement }
            <span className="text-text">{ timeValue }</span>
            { periodPosition === 'right' && ampmElement }
          </div>
        ) }
      </div>
      { canShowClear && onClear && (
        <PickerClearButton
          clearIcon={ clearIcon }
          onClear={ onClear }
        />
      ) }
    </div>
  )
})

PickerInput.displayName = 'PickerInput'
