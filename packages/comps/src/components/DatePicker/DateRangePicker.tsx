'use client'

import type { DateRangePickerProps, DateRangePickerRef } from './types'
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../../i18n'
import { useFormField } from '../Form/useFormField'
import { Calendar as CalendarComponent } from './Calendar'
import { RangePickerInput } from './components'
import { PickerBase } from './components/PickerBase'
import { usePickerState } from './hooks/usePickerState'
import {
  formatDate,
  getFormatByPrecision,
  getInitialDate,
  isAfter,
  isBefore,
  isDateRangeEqual,
  preserveTimeFromDate,
} from './utils'

const InnerDateRangePicker = forwardRef<DateRangePickerRef, DateRangePickerProps>(({
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
  startPlaceholder: propsStartPlaceholder,
  endPlaceholder: propsEndPlaceholder,
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
  weekStartsOn = 1,
  separator = ' ~ ',
  precision = 'day',
  icon,
}, ref) => {
  const t = useT()
  const startPlaceholder = propsStartPlaceholder || t('common.datePicker.startPlaceholder')
  const endPlaceholder = propsEndPlaceholder || t('common.datePicker.endPlaceholder')
  const actualFormat = dateFormat || getFormatByPrecision(precision)

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField<{ start: Date | null, end: Date | null }>({
    name,
    value,
    defaultValue: { start: null, end: null },
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

  const [internalValue, setInternalValue] = useState<{ start: Date | null, end: Date | null }>(() =>
    actualValue ?? defaultValue ?? { start: null, end: null },
  )
  const [selectingType, setSelectingType] = useState<'start' | 'end'>('start')
  const [tempDate, setTempDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(() =>
    getInitialDate(internalValue.start, internalValue.end),
  )

  const initialValueRef = useRef<{ start: Date | null, end: Date | null }>({ start: null, end: null })

  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
      if (actualValue.start)
        setCurrentMonth(actualValue.start)
      else if (actualValue.end)
        setCurrentMonth(actualValue.end)
    }
  }, [actualValue])

  useEffect(() => {
    if (isOpen) {
      initialValueRef.current = { ...internalValue }
    }
    else {
      setTempDate(null)
      if (onConfirm && !isDateRangeEqual(initialValueRef.current, internalValue)) {
        onConfirm(internalValue)
      }
    }
  }, [isOpen])

  const handleDateSelect = useCallback((date: Date) => {
    const newValue = { ...internalValue }
    if (selectingType === 'start') {
      newValue.start = preserveTimeFromDate(date, internalValue.start, precision)
      if (newValue.end && isAfter(newValue.start, newValue.end))
        newValue.end = null
      if (precision === 'day')
        setSelectingType('end')
    }
    else {
      newValue.end = preserveTimeFromDate(date, internalValue.end || internalValue.start, precision)
      if (newValue.start && isBefore(newValue.end, newValue.start)) {
        const temp = newValue.start
        newValue.start = newValue.end
        newValue.end = temp
      }
      if (precision === 'day')
        setOpen(false)
    }
    setInternalValue(newValue)
    handleChangeVal(newValue, undefined as any)
  }, [internalValue, precision, selectingType, setOpen, handleChangeVal])

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const clearedValue = { start: null, end: null }
    setInternalValue(clearedValue)
    handleChangeVal(clearedValue, undefined as any)
    setTempDate(null)
    setSelectingType('start')
  }, [handleChangeVal])

  const triggerContent = trigger
    ? (
        <div onClick={ () => { onTriggerClick?.(); handleTriggerClick() } }>{trigger}</div>
      )
    : (
        <RangePickerInput
          startValue={ formatDate(internalValue.start, actualFormat) }
          endValue={ formatDate(internalValue.end, actualFormat) }
          startPlaceholder={ startPlaceholder }
          endPlaceholder={ endPlaceholder }
          separator={ separator }
          activeType={ isOpen
            ? selectingType
            : null }
          disabled={ disabled }
          showClear={ showClear }
          error={ actualError }
          onClear={ handleClear }
          onInputClick={ (type) => {
            setSelectingType(type)
            if (!isOpen)
              setOpen(true)
            onTriggerClick?.()
          } }
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
        <div onMouseLeave={ () => setTempDate(null) }>
          <CalendarComponent
            currentMonth={ currentMonth }
            onCurrentMonthChange={ setCurrentMonth }
            onSelect={ handleDateSelect }
            disabledDate={ disabledDate }
            minDate={ minDate }
            maxDate={ maxDate }
            className={ calendarClassName }
            weekStartsOn={ weekStartsOn }
            rangeMode={ true }
            selectedRange={ internalValue }
            selectingType={ selectingType }
            onSelectingTypeChange={ setSelectingType }
            tempDate={ tempDate }
            onDateHover={ setTempDate }
            precision={ precision }
            onTimeChange={ (date) => {
              const newValue = { ...internalValue }
              if (selectingType === 'start')
                newValue.start = date
              else newValue.end = date
              setInternalValue(newValue)
              handleChangeVal(newValue, undefined as any)
            } }
          />
        </div>
      }
    />
  )
})

InnerDateRangePicker.displayName = 'DateRangePicker'

export const DateRangePicker = memo(InnerDateRangePicker) as typeof InnerDateRangePicker
