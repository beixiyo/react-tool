'use client'

import type { MonthPickerProps, MonthPickerRef } from './types'
import { useLatestCallback } from 'hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { forwardRef, memo, useCallback } from 'react'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { useFormField } from '../Form'
import { PickerBase } from './components/PickerBase'
import { PickerInput } from './components/PickerInput'
import { usePickerState } from './hooks/usePickerState'
import { useSinglePickerValue } from './hooks/useSinglePickerValue'
import { MonthGrid } from './MonthGrid'
import { addYear, formatDate, getYearLabel, isYearAvailable, subtractYear } from './utils'

const InnerMonthPicker = forwardRef<MonthPickerRef, MonthPickerProps>(({
  value,
  defaultValue,
  onChange,
  onConfirm,
  onClickOutside,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onTriggerClick,
  placement = 'bottom-start',
  offset = 4,
  format: dateFormat = 'yyyy-MM',
  placeholder: propsPlaceholder,
  disabled = false,
  disabledMonth,
  minDate,
  maxDate,
  className,
  inputClassName,
  dropdownClassName,
  dropdownZIndex,
  name,
  error,
  errorMessage,
  showClear = false,
  icon,
  clearIcon,
  prevIcon,
  nextIcon,
  extraFooter,
}, ref) => {
  /** 使用 useFormField 处理表单集成 */
  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<Date | null>({
    name,
    value,
    defaultValue: defaultValue ?? null,
    error,
    errorMessage,
    onChange,
  })

  /** 使用公共 Hook 管理状态 */
  const {
    isOpen,
    setOpen,
    handleTriggerClick: baseHandleTriggerClick,
  } = usePickerState({
    open: controlledOpen,
    onOpenChange,
    disabled,
    ref,
  })

  const t = useT()
  const placeholder = propsPlaceholder ?? t('datePicker.monthPlaceholder')

  const {
    value: internalValue,
    viewDate: currentYear,
    setViewDate: setCurrentYear,
    updateValue,
  } = useSinglePickerValue({
    externalValue: actualValue,
    defaultValue,
    isOpen,
    onChange: nextValue => handleChangeVal(nextValue, undefined as any),
    onConfirm,
  })

  /** 处理触发器点击 */
  const handleTriggerClick = useLatestCallback(() => {
    onTriggerClick?.()
    baseHandleTriggerClick()
  })

  /** 处理月份选择 */
  const handleMonthSelect = useCallback((date: Date) => {
    updateValue(date)
    setOpen(false)
  }, [setOpen, updateValue])

  /** 处理清除 */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    updateValue(null)
  }, [updateValue])

  /** 处理年份切换 */
  const handleYearChange = useCallback((direction: 'prev' | 'next') => {
    const newYear = direction === 'prev'
      ? subtractYear(currentYear, 1)
      : addYear(currentYear, 1)

    if (!isYearAvailable(newYear, minDate, maxDate))
      return

    setCurrentYear(newYear)
  }, [currentYear, minDate, maxDate, setCurrentYear])

  /** 显示的值 */
  const displayValue = formatDate(internalValue, dateFormat)

  const canGoPrev = isYearAvailable(subtractYear(currentYear, 1), minDate, maxDate)
  const canGoNext = isYearAvailable(addYear(currentYear, 1), minDate, maxDate)

  const dropdownContent = (
    <div>
      {/* 年份切换头部 */ }
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          disabled={ !canGoPrev }
          onClick={ () => handleYearChange('prev') }
          aria-label={ t('datePicker.prevYear') }
          leftIcon={ prevIcon || <ChevronLeft className="h-4 w-4 text-text" /> }
        />

        <div className="text-sm font-semibold text-text">
          { getYearLabel(currentYear) }
        </div>

        <Button
          variant="ghost"
          iconOnly
          size="sm"
          disabled={ !canGoNext }
          onClick={ () => handleYearChange('next') }
          aria-label={ t('datePicker.nextYear') }
          leftIcon={ nextIcon || <ChevronRight className="h-4 w-4 text-text" /> }
        />
      </div>

      {/* 月份网格 */ }
      <MonthGrid
        currentYear={ currentYear }
        selectedMonth={ internalValue }
        onSelect={ handleMonthSelect }
        disabledMonth={ disabledMonth }
        minDate={ minDate }
        maxDate={ maxDate }
      />

      { extraFooter && (
        <div className="mt-4 border-t border-border pt-4">
          { extraFooter }
        </div>
      ) }
    </div>
  )

  const triggerContent = trigger
    ? <div onClick={ handleTriggerClick }>{ trigger }</div>
    : (
        <PickerInput
          displayValue={ displayValue }
          placeholder={ placeholder }
          disabled={ disabled }
          showClear={ showClear }
          error={ actualError }
          canShowClear={ showClear && !!displayValue && !disabled }
          onClear={ handleClear }
          onClick={ handleTriggerClick }
          inputClassName={ inputClassName }
          icon={ icon }
          clearIcon={ clearIcon }
        />
      )

  return (
    <PickerBase
      isOpen={ isOpen }
      setOpen={ setOpen }
      trigger={ triggerContent }
      dropdown={ dropdownContent }
      placement={ placement }
      offset={ offset }
      onClickOutside={ onClickOutside }
      onBlur={ handleBlur }
      className={ className }
      dropdownClassName={ dropdownClassName }
      dropdownZIndex={ dropdownZIndex }
      error={ actualError }
      errorMessage={ actualErrorMessage }
      fullWidth={ false }
    />
  )
})

InnerMonthPicker.displayName = 'MonthPicker'

export const MonthPicker = memo(InnerMonthPicker) as typeof InnerMonthPicker
