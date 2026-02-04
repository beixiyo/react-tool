'use client'

import type { DatePickerProps, DatePickerRef } from './types'
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../../i18n'
import { useFormField } from '../Form/useFormField'
import { Calendar as CalendarComponent } from './Calendar'
import { PickerBase } from './components/PickerBase'
import { PickerInput } from './components/PickerInput'
import { usePickerState } from './hooks/usePickerState'
import { formatDate, getFormatByPrecision, getInitialDate, isDateEqual, preserveTimeFromDate } from './utils'

const InnerDatePicker = forwardRef<DatePickerRef, DatePickerProps>(({
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
  format: dateFormat,
  placeholder: propsPlaceholder,
  disabled = false,
  disabledDate,
  minDate,
  maxDate,
  className,
  inputClassName,
  dropdownClassName,
  calendarClassName,
  name,
  error,
  errorMessage,
  showClear = true,
  weekStartsOn = 0,
  precision = 'day',
  icon,
}, ref) => {
  const t = useT()
  const placeholder = propsPlaceholder ?? t('datePicker.placeholder')
  const actualFormat = dateFormat || getFormatByPrecision(precision)

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<Date | null>({
    name,
    value,
    defaultValue: null,
    error,
    errorMessage,
    onChange,
  })

  const {
    isOpen,
    setOpen,
    handleTriggerClick,
  } = usePickerState({
    open: controlledOpen,
    onOpenChange,
    disabled,
    ref,
  })

  const [internalValue, setInternalValue] = useState<Date | null>(() =>
    actualValue ?? defaultValue ?? null,
  )

  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    getInitialDate(actualValue, defaultValue),
  )

  const initialValueRef = useRef<Date | null>(null)

  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
      if (actualValue)
        setCurrentMonth(actualValue)
    }
  }, [actualValue])

  useEffect(() => {
    if (isOpen) {
      initialValueRef.current = internalValue
    }
    else {
      if (onConfirm && !isDateEqual(initialValueRef.current, internalValue)) {
        onConfirm(internalValue)
      }
    }
  }, [isOpen])

  const handleDateSelect = useCallback((date: Date) => {
    const finalDate = preserveTimeFromDate(date, internalValue, precision)
    setInternalValue(finalDate)
    handleChangeVal(finalDate, undefined as any)
    if (precision === 'day')
      setOpen(false)
  }, [handleChangeVal, precision, internalValue, setOpen])

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalValue(null)
    handleChangeVal(null, undefined as any)
  }, [handleChangeVal])

  const displayValue = formatDate(internalValue, actualFormat)

  const triggerContent = trigger
    ? (
        <div onClick={ () => { onTriggerClick?.(); handleTriggerClick() } }>{trigger}</div>
      )
    : (
        <PickerInput
          displayValue={ displayValue }
          placeholder={ placeholder }
          disabled={ disabled }
          showClear={ showClear }
          error={ actualError }
          canShowClear={ showClear && !!displayValue && !disabled }
          onClear={ handleClear }
          onClick={ () => { onTriggerClick?.(); handleTriggerClick() } }
          inputClassName={ inputClassName }
          icon={ icon }
        />
      )

  return (
    <PickerBase
      isOpen={ isOpen }
      setOpen={ setOpen }
      trigger={ triggerContent }
      placement={ placement }
      offset={ offset }
      onClickOutside={ onClickOutside }
      onBlur={ handleBlur }
      className={ className }
      dropdownClassName={ dropdownClassName }
      error={ actualError }
      errorMessage={ actualErrorMessage }
      dropdown={
        <CalendarComponent
          currentMonth={ currentMonth }
          onCurrentMonthChange={ setCurrentMonth }
          selectedDate={ internalValue }
          onSelect={ handleDateSelect }
          disabledDate={ disabledDate }
          minDate={ minDate }
          maxDate={ maxDate }
          className={ calendarClassName }
          weekStartsOn={ weekStartsOn }
          precision={ precision }
          onTimeChange={ (date) => {
            setInternalValue(date)
            handleChangeVal(date, undefined as any)
          } }
        />
      }
    />
  )
})

InnerDatePicker.displayName = 'DatePicker'

export const DatePicker = memo(InnerDatePicker) as typeof InnerDatePicker
