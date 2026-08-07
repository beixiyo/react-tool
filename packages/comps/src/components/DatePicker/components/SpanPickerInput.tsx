'use client'

import type { ReactNode } from 'react'
import type { PickerTriggerVariant } from '../types'
import { useTheme } from 'hooks'
import { Calendar } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { PickerClearButton } from './PickerClearButton'

/** 单日与连续日期段共用的默认触发器 */
export const SpanPickerInput = memo<SpanPickerInputProps>(({
  displayValue,
  placeholder = '选择日期',
  disabled = false,
  showClear = false,
  error = false,
  canShowClear,
  onClear,
  onClick,
  inputClassName,
  icon,
  clearIcon,
  triggerVariant = 'default',
}) => {
  const [theme] = useTheme()
  const compact = triggerVariant === 'compact'
  const actualCanShowClear = canShowClear ?? (showClear && !!displayValue && !disabled)

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
          'cursor-not-allowed opacity-60': disabled,
          'cursor-pointer hover:bg-background2': !disabled && !compact,
        },
        inputClassName,
      ) }
      onClick={ () => !disabled && onClick?.() }
    >
      <span className={ cn(
        'mr-2 inline-flex shrink-0 items-center justify-center text-text2 transition-colors',
        compact && !disabled && 'hover:text-brand',
      ) }>
        { icon !== undefined
          ? icon
          : <Calendar className="size-4 text-current" /> }
      </span>

      <span className={ cn('flex-1 truncate text-left transition-colors', {
        'text-text2': !displayValue,
        'text-text': !!displayValue,
        'hover:text-brand': !disabled && compact,
      }) }>
        { displayValue || placeholder }
      </span>

      { actualCanShowClear && onClear && (
        <PickerClearButton
          className="ml-2 shrink-0"
          clearIcon={ clearIcon }
          onClear={ onClear }
        />
      ) }
    </div>
  )
})

SpanPickerInput.displayName = 'SpanPickerInput'

export type SpanPickerInputProps = {
  displayValue?: string
  placeholder?: string
  disabled?: boolean
  showClear?: boolean
  error?: boolean
  canShowClear?: boolean
  onClear?: (event: React.MouseEvent) => void
  onClick?: () => void
  inputClassName?: string
  icon?: ReactNode
  clearIcon?: ReactNode
  triggerVariant?: PickerTriggerVariant
}
