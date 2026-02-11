'use client'

import type { DateRangePickerProps, DateRangePickerRef, DateRangePickerTriggerContext } from './types'
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
  getTimeFormatByPrecision,
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
  renderTrigger,
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
  showClear = false,
  weekStartsOn = 1,
  separator = ' ~ ',
  precision = 'day',
  use12Hours = false,
  minuteStep = 1,
  icon,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
  timeIcon,
  extraFooter,
  renderCell,
  clearIcon,
  onAddTime,
}, ref) => {
  const t = useT()
  const startPlaceholder = propsStartPlaceholder || t('datePicker.startPlaceholder')
  const endPlaceholder = propsEndPlaceholder || t('datePicker.endPlaceholder')
  const baseDateFormat = t('datePicker.dateFormat')
  const actualFormat = dateFormat || getFormatByPrecision(precision, use12Hours, baseDateFormat)

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

  const timeFormat = getTimeFormatByPrecision(precision, use12Hours)
  const startTimeValue = internalValue.start && timeFormat
    ? formatDate(internalValue.start, timeFormat)
    : ''
  const endTimeValue = internalValue.end && timeFormat
    ? formatDate(internalValue.end, timeFormat)
    : ''

  const startAmpm = use12Hours && internalValue.start && precision !== 'day'
    ? (internalValue.start.getHours() >= 12
        ? t('datePicker.pm')
        : t('datePicker.am'))
    : ''
  const endAmpm = use12Hours && internalValue.end && precision !== 'day'
    ? (internalValue.end.getHours() >= 12
        ? t('datePicker.pm')
        : t('datePicker.am'))
    : ''
  const periodPosition = t('datePicker.periodPosition') as 'left' | 'right'

  const canShowClear = showClear && (internalValue.start || internalValue.end) && !disabled
  const defaultTriggerContext: DateRangePickerTriggerContext = {
    value: internalValue,
    startValue: formatDate(internalValue.start, actualFormat),
    endValue: formatDate(internalValue.end, actualFormat),
    startPlaceholder,
    endPlaceholder,
    separator,
    activeType: isOpen
      ? selectingType
      : null,
    isOpen,
    disabled,
    error: !!actualError,
    open: handleTriggerClick,
    close: () => setOpen(false),
    clear: handleClear,
    showClear,
    canShowClear: !!canShowClear,
    onInputClick: (type) => {
      setSelectingType(type)
      if (!isOpen)
        setOpen(true)
      onTriggerClick?.()
    },
    use12Hours: use12Hours && precision !== 'day',
    startAmpm,
    endAmpm,
    startTimeValue,
    endTimeValue,
    periodPosition,
    inputClassName,
    icon,
    clearIcon,
  }

  const triggerContent = renderTrigger
    ? (
        <div onClick={ () => { onTriggerClick?.(); handleTriggerClick() } }>
          { renderTrigger(defaultTriggerContext) }
        </div>
      )
    : trigger
      ? (
          <div onClick={ () => { onTriggerClick?.(); handleTriggerClick() } }>{ trigger }</div>
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
            clearIcon={ clearIcon }
            use12Hours={ use12Hours && precision !== 'day' }
            startAmpm={ startAmpm }
            endAmpm={ endAmpm }
            startTimeValue={ startTimeValue }
            endTimeValue={ endTimeValue }
            periodPosition={ periodPosition }
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
          use12Hours={ use12Hours }
          onMouseLeave={ () => setTempDate(null) }
          onTimeChange={ (date) => {
            const newValue = { ...internalValue }
            if (selectingType === 'start')
              newValue.start = date
            else newValue.end = date
            setInternalValue(newValue)
            handleChangeVal(newValue, undefined as any)
          } }
          onConfirm={ () => setOpen(false) }
          prevIcon={ prevIcon }
          nextIcon={ nextIcon }
          superPrevIcon={ superPrevIcon }
          superNextIcon={ superNextIcon }
          timeIcon={ timeIcon }
          extraFooter={ extraFooter }
          renderCell={ renderCell }
          minuteStep={ minuteStep }
          onAddTime={ onAddTime }
        />
      }
    />
  )
})

InnerDateRangePicker.displayName = 'DateRangePicker'

export const DateRangePicker = memo(InnerDateRangePicker) as typeof InnerDateRangePicker
