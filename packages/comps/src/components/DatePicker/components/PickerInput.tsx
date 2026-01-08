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
}

/**
 * 统一的 Picker 输入框组件
 */
export const PickerInput = memo<PickerInputProps>(({
  displayValue,
  placeholder = '请选择',
  disabled = false,
  showClear = true,
  error = false,
  canShowClear: _canShowClear,
  onClear,
  onClick,
  inputClassName,
  icon,
}) => {
  const canShowClear = _canShowClear !== undefined
    ? _canShowClear
    : (showClear && displayValue && !disabled)

  return (
    <div
      className={ cn(
        'flex h-10 w-full items-center rounded-md border border-border bg-background px-3 py-2 text-sm',
        'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-textSecondary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-systemOrange focus-visible:ring-offset-2',
        {
          'border-danger': error,
          'cursor-not-allowed': disabled,
          'cursor-pointer': !disabled,
          'opacity-60': disabled,
        },
        inputClassName,
      ) }
      onClick={ onClick }
    >
      {icon !== undefined ? icon : <Calendar className="mr-2 h-4 w-4 text-textSecondary" />}
      <span className={ cn('flex-1 text-left', {
        'text-textSecondary': !displayValue,
        'text-textPrimary': displayValue,
      }) }>
        {displayValue || placeholder}
      </span>
      {canShowClear && onClear && (
        <Button
          variant="ghost"
          iconOnly
          size={ 16 }
          onClick={ onClear }
          aria-label="清除"
          className="ml-2"
          leftIcon={ <X className="h-3 w-3 text-textSecondary" /> }
        />
      )}
    </div>
  )
})

PickerInput.displayName = 'PickerInput'
