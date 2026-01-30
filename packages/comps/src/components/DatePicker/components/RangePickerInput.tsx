'use client'

import type { ReactNode } from 'react'
import { Calendar, X } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { Button } from '../../Button'

export interface RangePickerInputProps {
  /** 开始日期显示值 */
  startValue?: string
  /** 结束日期显示值 */
  endValue?: string
  /** 开始日期占位符 */
  startPlaceholder?: string
  /** 结束日期占位符 */
  endPlaceholder?: string
  /** 分隔符 */
  separator?: string
  /** 当前正在编辑的类型 */
  activeType?: 'start' | 'end' | null
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示清除按钮 */
  showClear?: boolean
  /** 是否有错误 */
  error?: boolean
  /** 是否显示清除按钮的条件 */
  canShowClear?: boolean
  /** 清除回调 */
  onClear?: (e: React.MouseEvent) => void
  /** 输入区域点击回调 */
  onInputClick?: (type: 'start' | 'end') => void
  /** 输入框类名 */
  inputClassName?: string
  /** 自定义图标 */
  icon?: ReactNode
}

/**
 * 专门用于范围选择的输入框组件
 */
export const RangePickerInput = memo<RangePickerInputProps>(({
  startValue,
  endValue,
  startPlaceholder = '开始日期',
  endPlaceholder = '结束日期',
  separator = ' ~ ',
  activeType,
  disabled = false,
  showClear = true,
  error = false,
  canShowClear: _canShowClear,
  onClear,
  onInputClick,
  inputClassName,
  icon,
}) => {
  const canShowClear = _canShowClear !== undefined
    ? _canShowClear
    : (showClear && (startValue || endValue) && !disabled)

  return (
    <div
      className={ cn(
        'flex h-10 w-fit items-center rounded-md border border-border bg-background px-3 py-2 text-sm transition-all',
        'focus-within:ring-2 focus-within:ring-systemOrange focus-within:ring-offset-2 focus-within:ring-offset-background',
        {
          'border-danger': error,
          'cursor-not-allowed': disabled,
          'opacity-60': disabled,
        },
        inputClassName,
      ) }
    >
      {icon !== undefined
        ? icon
        : <Calendar className="mr-2 h-4 w-4 text-textSecondary shrink-0" />}

      <div className="flex flex-1 items-center justify-center min-w-0 h-full">
        <div
          className={ cn(
            'w-fit whitespace-nowrap text-center cursor-pointer transition-colors px-2 py-0.5 rounded-lg h-full flex items-center justify-center',
            {
              'text-textSecondary': !startValue,
              'text-textPrimary': startValue,
              'bg-buttonPrimary text-buttonTertiary font-medium': activeType === 'start',
              'hover:bg-backgroundTertiary': !disabled && activeType !== 'start',
            },
          ) }
          onClick={ (e) => {
            e.stopPropagation()
            if (!disabled)
              onInputClick?.('start')
          } }
        >
          {startValue || startPlaceholder}
        </div>

        <span className="px-2 text-textSecondary shrink-0">{separator}</span>

        <div
          className={ cn(
            'w-fit whitespace-nowrap text-center cursor-pointer transition-colors px-2 py-0.5 rounded-lg h-full flex items-center justify-center',
            {
              'text-textSecondary': !endValue,
              'text-textPrimary': endValue,
              'bg-buttonPrimary text-buttonTertiary font-medium': activeType === 'end',
              'hover:bg-backgroundTertiary': !disabled && activeType !== 'end',
            },
          ) }
          onClick={ (e) => {
            e.stopPropagation()
            if (!disabled)
              onInputClick?.('end')
          } }
        >
          {endValue || endPlaceholder}
        </div>
      </div>

      {canShowClear && onClear && (
        <Button
          variant="ghost"
          iconOnly
          size={ 16 }
          onClick={ onClear }
          aria-label="清除"
          className="ml-2 shrink-0"
          leftIcon={ <X className="h-3 w-3 text-textSecondary" /> }
        />
      )}
    </div>
  )
})

RangePickerInput.displayName = 'RangePickerInput'
