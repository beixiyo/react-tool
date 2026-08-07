'use client'

import type { DatePickerProps, DatePickerRef, DatePickerTriggerContext } from './types'
import { forwardRef, memo, useCallback } from 'react'
import { formatDatePickerDate, formatDatePickerTimeParts } from 'utils'
import { useT } from '../../i18n'
import { useFormField } from '../Form'
import { Calendar as CalendarComponent } from './Calendar'
import { PickerBase } from './components/PickerBase'
import { PickerInput } from './components/PickerInput'
import { usePickerState } from './hooks/usePickerState'
import { useSinglePickerValue } from './hooks/useSinglePickerValue'
import {
  getFormatByPrecision,
  preserveTimeFromDate,
} from './utils'

const InnerDatePicker = forwardRef<DatePickerRef, DatePickerProps>(({
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
  placeholder: propsPlaceholder,
  disabled = false,
  disabledDate,
  minDate,
  maxDate,
  className,
  inputClassName,
  triggerVariant = 'default',
  dropdownClassName,
  dropdownZIndex,
  timeDropdownClassName,
  timeDropdownZIndex,
  calendarClassName,
  name,
  error,
  errorMessage,
  showClear = false,
  weekStartsOn = 1,
  precision = 'day',
  use12Hours = false,
  closeOnSelect = false,
  minuteStep = 1,
  enableTimeKeyboardInput = true,
  enableTimeUnitPopover = true,
  enableTimeInputWheel = true,
  icon,
  yearRange,
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
  const placeholder = propsPlaceholder ?? t('datePicker.placeholder')
  const baseDateFormat = t('datePicker.dateFormat')
  const actualFormat = dateFormat || getFormatByPrecision(precision, use12Hours, baseDateFormat)

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

  const {
    value: internalValue,
    viewDate: currentMonth,
    setViewDate: setCurrentMonth,
    updateValue,
  } = useSinglePickerValue({
    externalValue: actualValue,
    defaultValue,
    isOpen,
    onChange: nextValue => handleChangeVal(nextValue, undefined as any),
    onConfirm,
  })

  const handleDateSelect = useCallback((date: Date) => {
    const finalDate = preserveTimeFromDate(date, internalValue, precision)
    updateValue(finalDate)
    if (precision === 'day' && closeOnSelect)
      setOpen(false)
  }, [precision, internalValue, setOpen, closeOnSelect, updateValue])

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    updateValue(null)
  }, [updateValue])

  const periodPosition = t('datePicker.periodPosition') as 'left' | 'right'
  const displayValue = internalValue
    ? formatDatePickerDate(internalValue, { dateFormat: actualFormat })
    : ''
  const timeParts = internalValue && precision !== 'day'
    ? formatDatePickerTimeParts(internalValue, {
        precision,
        use12Hours,
        amLabel: t('datePicker.am'),
        pmLabel: t('datePicker.pm'),
        periodPosition,
      })
    : { timeValue: '', period: '' }
  const timeValue = timeParts.timeValue
  const ampm = timeParts.period

  const defaultTriggerContext: DatePickerTriggerContext = {
    value: internalValue,
    displayValue,
    placeholder,
    isOpen,
    disabled,
    error: !!actualError,
    open: handleTriggerClick,
    close: () => setOpen(false),
    clear: handleClear,
    showClear,
    canShowClear: showClear && !!displayValue && !disabled,
    use12Hours: use12Hours && precision !== 'day',
    ampm,
    timeValue,
    periodPosition,
    inputClassName,
    icon,
    clearIcon,
    triggerVariant,
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
            clearIcon={ clearIcon }
            use12Hours={ use12Hours && precision !== 'day' }
            ampm={ ampm }
            timeValue={ timeValue }
            periodPosition={ periodPosition }
            triggerVariant={ triggerVariant }
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
      onConfirm={ () => setOpen(false) }
      onBlur={ handleBlur }
      className={ className }
      dropdownClassName={ dropdownClassName }
      dropdownZIndex={ dropdownZIndex }
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
          use12Hours={ use12Hours }
          onTimeChange={ (date) => {
            updateValue(date)
          } }
          onConfirm={ () => setOpen(false) }
          yearRange={ yearRange }
          prevIcon={ prevIcon }
          nextIcon={ nextIcon }
          superPrevIcon={ superPrevIcon }
          superNextIcon={ superNextIcon }
          timeIcon={ timeIcon }
          timeDropdownClassName={ timeDropdownClassName }
          timeDropdownZIndex={ timeDropdownZIndex }
          extraFooter={ extraFooter }
          renderCell={ renderCell }
          minuteStep={ minuteStep }
          enableTimeKeyboardInput={ enableTimeKeyboardInput }
          enableTimeUnitPopover={ enableTimeUnitPopover }
          enableTimeInputWheel={ enableTimeInputWheel }
          onAddTime={ onAddTime }
        />
      }
    />
  )
})

InnerDatePicker.displayName = 'DatePicker'

export const DatePicker = memo(InnerDatePicker) as typeof InnerDatePicker
