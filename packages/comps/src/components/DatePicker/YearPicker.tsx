'use client'

import type { YearPickerProps, YearPickerRef } from './types'
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
import { addYear, formatDate, getYear, isYearRangeAvailable, subtractYear } from './utils'
import { YearGrid } from './YearGrid'

const InnerYearPicker = forwardRef<YearPickerRef, YearPickerProps>(({
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
  format: dateFormat = 'yyyy',
  placeholder: propsPlaceholder,
  disabled = false,
  disabledYear,
  minDate,
  maxDate,
  yearRange = 20,
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
  const placeholder = propsPlaceholder ?? t('datePicker.yearPlaceholder')

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

  /** 处理年份选择 */
  const handleYearSelect = useCallback((date: Date) => {
    updateValue(date)
    setOpen(false)
  }, [setOpen, updateValue])

  /** 处理清除 */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    updateValue(null)
  }, [updateValue])

  /** 处理年份范围切换 */
  const handleYearRangeChange = useCallback((direction: 'prev' | 'next') => {
    const range = yearRange * 2 + 1 // 总年份数
    const newYear = direction === 'prev'
      ? subtractYear(currentYear, range)
      : addYear(currentYear, range)
    const firstYear = subtractYear(newYear, yearRange)
    const lastYear = addYear(newYear, yearRange)

    if (!isYearRangeAvailable(firstYear, lastYear, minDate, maxDate))
      return

    setCurrentYear(newYear)
  }, [currentYear, yearRange, minDate, maxDate, setCurrentYear])

  /** 显示的值 */
  const displayValue = formatDate(internalValue, dateFormat)

  const previousCenter = subtractYear(currentYear, yearRange * 2 + 1)
  const nextCenter = addYear(currentYear, yearRange * 2 + 1)
  const canGoPrev = isYearRangeAvailable(
    subtractYear(previousCenter, yearRange),
    addYear(previousCenter, yearRange),
    minDate,
    maxDate,
  )
  const canGoNext = isYearRangeAvailable(
    subtractYear(nextCenter, yearRange),
    addYear(nextCenter, yearRange),
    minDate,
    maxDate,
  )

  const dropdownContent = (
    <div className="min-w-72">
      {/* 年份范围切换头部 */ }
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          disabled={ !canGoPrev }
          onClick={ () => handleYearRangeChange('prev') }
          aria-label={ t('datePicker.prevYearRange') }
          leftIcon={ prevIcon || <ChevronLeft className="h-4 w-4 text-text" /> }
        />

        <div className="text-sm font-semibold text-text">
          { getYear(subtractYear(currentYear, yearRange)) }
          { ' ' }
          -
          { getYear(addYear(currentYear, yearRange)) }
        </div>

        <Button
          variant="ghost"
          iconOnly
          size="sm"
          disabled={ !canGoNext }
          onClick={ () => handleYearRangeChange('next') }
          aria-label={ t('datePicker.nextYearRange') }
          leftIcon={ nextIcon || <ChevronRight className="h-4 w-4 text-text" /> }
        />
      </div>

      {/* 年份网格 */ }
      <YearGrid
        currentYear={ currentYear }
        selectedYear={ internalValue }
        onSelect={ handleYearSelect }
        disabledYear={ disabledYear }
        minDate={ minDate }
        maxDate={ maxDate }
        yearRange={ yearRange }
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

InnerYearPicker.displayName = 'YearPicker'

export const YearPicker = memo(InnerYearPicker) as typeof InnerYearPicker
