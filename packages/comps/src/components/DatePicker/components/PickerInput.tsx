'use client'

import type { ReactNode } from 'react'
import { Calendar, X } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Button } from '../../Button'

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
}) => {
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
        'flex h-10 w-full items-center rounded-xl border border-border bg-background px-3 py-2 text-sm transition-all',
        'focus-within:ring-2 focus-within:ring-systemOrange focus-within:ring-offset-2 focus-within:ring-offset-background',
        {
          'border-danger': error,
          'cursor-not-allowed': disabled,
          'cursor-pointer': !disabled,
          'opacity-60': disabled,
          'hover:bg-background2': !disabled,
        },
        inputClassName,
      ) }
      onClick={ onClick }
    >
      { icon !== undefined ? icon : <Calendar className="mr-2 h-4 w-4 text-text2 shrink-0" /> }
      <div className="flex flex-1 items-center overflow-hidden">
        <span className={ cn('truncate text-left shrink-0', {
          'text-text2': !displayValue,
          'text-text': displayValue,
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
        <Button
          variant="ghost"
          iconOnly
          size={ 12 }
          onClick={ onClear }
          aria-label="清除"
          leftIcon={ clearIcon || <X className="h-3 w-3 text-text2" /> }
        />
      ) }
    </div>
  )
})

PickerInput.displayName = 'PickerInput'
