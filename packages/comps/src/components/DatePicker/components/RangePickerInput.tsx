'use client'

import type { ReactNode } from 'react'
import type { PickerTriggerVariant } from '../types'
import { useTheme } from 'hooks'
import { Calendar } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { PickerClearButton } from './PickerClearButton'

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
  /** 图标点击回调 */
  onIconClick?: () => void
  /** 图标按钮的无障碍标签 */
  iconLabel?: string
  /** 输入框类名 */
  inputClassName?: string
  /** 自定义图标 */
  icon?: ReactNode
  /** 自定义清除图标 */
  clearIcon?: ReactNode
  /** 是否使用 12 小时制 */
  use12Hours?: boolean
  /** 开始日期的 AM/PM 文本 */
  startAmpm?: string
  /** 结束日期的 AM/PM 文本 */
  endAmpm?: string
  /** 开始具体时间值 */
  startTimeValue?: string
  /** 结束具体时间值 */
  endTimeValue?: string
  /** AM/PM 显示位置 */
  periodPosition?: 'left' | 'right'
  /** 默认输入框或无边框紧凑模式 */
  triggerVariant?: PickerTriggerVariant
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
  showClear = false,
  error = false,
  canShowClear: _canShowClear,
  onClear,
  onInputClick,
  onIconClick,
  iconLabel = '选择日期',
  inputClassName,
  icon,
  clearIcon,
  use12Hours,
  startAmpm,
  endAmpm,
  startTimeValue,
  endTimeValue,
  periodPosition = 'right',
  triggerVariant = 'default',
}) => {
  const [theme] = useTheme()
  const compact = triggerVariant === 'compact'
  const canShowClear = _canShowClear !== undefined
    ? _canShowClear
    : (showClear && (startValue || endValue) && !disabled)

  const renderAmpm = (ampm?: string, isActive?: boolean) => (
    use12Hours && ampm && (
      <span className={ cn('text-sm uppercase shrink-0', {
        'text-button3': isActive,
        'text-text': !isActive,
        'mr-1': periodPosition === 'left',
        'ml-1': periodPosition === 'right',
      }) }>
        { ampm }
      </span>
    )
  )

  const renderTimePart = (val?: string, ampm?: string, isActive?: boolean) => (
    use12Hours && val && (
      <div className="ml-1 flex items-center shrink-0">
        { periodPosition === 'left' && renderAmpm(ampm, isActive) }
        <span>{ val }</span>
        { periodPosition === 'right' && renderAmpm(ampm, isActive) }
      </div>
    )
  )

  return (
    <div
      className={ cn(
        'group/picker flex w-fit items-center text-sm transition-colors',
        compact
          ? 'h-auto border-0 bg-transparent p-0'
          : 'h-10 rounded-xl bg-background px-3 py-2 shadow-card',
        !compact && theme !== 'light' && 'border border-border',
        {
          'border-systemRed': error,
          'cursor-not-allowed': disabled,
          'opacity-60': disabled,
        },
        inputClassName,
      ) }
    >
      <button
        type="button"
        disabled={ disabled }
        aria-label={ iconLabel }
        className={ cn(
          'inline-flex shrink-0 items-center justify-center text-text2 transition-colors disabled:cursor-not-allowed',
          compact
            ? 'mr-1 hover:text-brand'
            : 'mr-2',
        ) }
        onClick={ (event) => {
          event.stopPropagation()
          onIconClick?.()
        } }
      >
        { icon !== undefined
          ? icon
          : <Calendar className="h-4 w-4 shrink-0 text-current" /> }
      </button>

      <div className="flex flex-1 items-center justify-center min-w-0 h-full">
        <div
          className={ cn(
            'flex h-full w-fit cursor-pointer items-center justify-center whitespace-nowrap text-center transition-colors',
            compact
              ? 'rounded-none p-0 hover:text-brand'
              : 'rounded-lg px-2 py-0.5',
            {
              'text-text2': !startValue,
              'text-text': startValue,
              'bg-button text-button3': activeType === 'start' && !compact,
              'text-brand': activeType === 'start' && compact,
              'hover:bg-background3': !disabled && activeType !== 'start' && !compact,
            },
          ) }
          onClick={ (e) => {
            e.stopPropagation()
            if (!disabled)
              onInputClick?.('start')
          } }
        >
          { startValue || startPlaceholder }
          { renderTimePart(startTimeValue, startAmpm, activeType === 'start') }
        </div>

        <span className={ cn('shrink-0 text-text2', compact
          ? 'px-1'
          : 'px-2') }>
          { separator }
        </span>

        <div
          className={ cn(
            'flex h-full w-fit cursor-pointer items-center justify-center whitespace-nowrap text-center transition-colors',
            compact
              ? 'rounded-none p-0 hover:text-brand'
              : 'rounded-lg px-2 py-0.5',
            {
              'text-text2': !endValue,
              'text-text': endValue,
              'bg-button text-button3 font-medium': activeType === 'end' && !compact,
              'text-brand': activeType === 'end' && compact,
              'hover:bg-background3': !disabled && activeType !== 'end' && !compact,
            },
          ) }
          onClick={ (e) => {
            e.stopPropagation()
            if (!disabled)
              onInputClick?.('end')
          } }
        >
          { endValue || endPlaceholder }
          { renderTimePart(endTimeValue, endAmpm, activeType === 'end') }
        </div>
      </div>

      { canShowClear && onClear && (
        <PickerClearButton
          className="ml-2 shrink-0"
          clearIcon={ clearIcon }
          onClear={ onClear }
        />
      ) }
    </div>
  )
})

RangePickerInput.displayName = 'RangePickerInput'
