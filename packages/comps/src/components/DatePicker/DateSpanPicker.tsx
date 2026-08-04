'use client'

import type { DateSpanPickerProps, DateSpanPickerRef, DateSpanPickerTriggerContext } from './types'
import { useLatestCallback } from 'hooks'
import { forwardRef, memo } from 'react'
import { formatDatePickerDate } from 'utils'
import { useT } from '../../i18n'
import { useFormField } from '../Form'
import { PickerBase } from './components/PickerBase'
import { SpanPickerInput } from './components/SpanPickerInput'
import { DateSpanCalendar } from './DateSpanCalendar'
import { useDateRangePickerSession } from './hooks/useDateRangePickerSession'
import { useDateSpanSelection } from './hooks/useDateSpanSelection'
import { usePickerState } from './hooks/usePickerState'
import { getFormatByPrecision } from './utils'

const EMPTY_DATE_SPAN = { start: null, end: null }

/**
 * 在同一日历中连续选择单日或日期区间的 Picker。
 *
 * 点选规则固定为：空 → 单日 → 区间 → 新单日；再次点击当前单日则清空。
 */
const InnerDateSpanPicker = forwardRef<DateSpanPickerRef, DateSpanPickerProps>(({
  value,
  defaultValue,
  onChange,
  onConfirm,
  onCancel,
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
  separator = ' ~ ',
  disabled = false,
  disabledDate,
  minDate,
  maxDate,
  className,
  inputClassName,
  triggerVariant = 'default',
  dropdownClassName,
  dropdownZIndex,
  calendarClassName,
  name,
  error,
  errorMessage,
  showClear = false,
  weekStartsOn = 1,
  yearRange,
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
  const placeholder = propsPlaceholder ?? t('datePicker.placeholder')
  const actualFormat = dateFormat || getFormatByPrecision('day', false, t('datePicker.dateFormat'))

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField({
    name,
    value,
    defaultValue: defaultValue ?? EMPTY_DATE_SPAN,
    error,
    errorMessage,
    onChange,
  })

  const {
    isOpen,
    setOpen,
  } = usePickerState({
    open: controlledOpen,
    onOpenChange,
    disabled,
    ref,
  })

  const {
    value: internalValue,
    tempDate,
    currentMonth,
    setTempDate,
    setCurrentMonth,
    selectDate,
    clear,
    restore,
    endSession,
  } = useDateSpanSelection({
    externalValue: actualValue,
    initialValue: actualValue ?? defaultValue ?? EMPTY_DATE_SPAN,
    onChange: nextValue => handleChangeVal(nextValue, undefined as any),
    onDraftChange: () => resetRejection(),
  })

  const {
    confirming,
    confirmRejected,
    resetRejection,
    cancel: handleCancel,
    confirm: handleConfirm,
  } = useDateRangePickerSession({
    isOpen,
    committedValue: actualValue,
    draftValue: internalValue,
    setOpen,
    restoreValue: restore,
    onConfirm,
    onCancel,
    onSessionEnd: endSession,
  })

  const handleToggle = useLatestCallback(() => {
    onTriggerClick?.()
    if (isOpen) {
      handleCancel('trigger')
      return
    }

    resetRejection()
    setOpen(true)
  })

  const handleClear = useLatestCallback((event: React.MouseEvent) => {
    event.stopPropagation()
    clear()
  })

  const displayValue = formatDateSpan(internalValue.start, internalValue.end, actualFormat, separator)
  const defaultTriggerContext: DateSpanPickerTriggerContext = {
    value: internalValue,
    displayValue,
    placeholder,
    separator,
    confirming,
    confirmRejected,
    isOpen,
    disabled,
    error: !!actualError,
    open: () => !isOpen && setOpen(true),
    close: () => handleCancel('programmatic'),
    toggle: handleToggle,
    clear: handleClear,
    showClear,
    canShowClear: showClear && !!internalValue.start && !disabled,
    use12Hours: false,
    periodPosition: 'right',
    inputClassName,
    icon,
    clearIcon,
    triggerVariant,
  }

  const triggerContent = renderTrigger
    ? renderTrigger(defaultTriggerContext)
    : trigger
      ? <div onClick={ handleToggle }>{ trigger }</div>
      : (
          <SpanPickerInput
            displayValue={ displayValue }
            placeholder={ placeholder }
            disabled={ disabled }
            showClear={ showClear }
            error={ !!actualError || confirmRejected }
            canShowClear={ defaultTriggerContext.canShowClear }
            onClear={ handleClear }
            onClick={ handleToggle }
            inputClassName={ inputClassName }
            icon={ icon }
            clearIcon={ clearIcon }
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
      onDismiss={ handleCancel }
      onConfirm={ () => { void handleConfirm() } }
      onBlur={ handleBlur }
      className={ className }
      dropdownClassName={ dropdownClassName }
      dropdownZIndex={ dropdownZIndex }
      error={ !!actualError }
      errorMessage={ actualErrorMessage }
      dropdown={
        <DateSpanCalendar
          currentMonth={ currentMonth }
          onCurrentMonthChange={ setCurrentMonth }
          value={ internalValue }
          tempDate={ tempDate }
          onSelect={ selectDate }
          onDateHover={ setTempDate }
          disabledDate={ disabledDate }
          minDate={ minDate }
          maxDate={ maxDate }
          className={ calendarClassName }
          weekStartsOn={ weekStartsOn }
          onMouseLeave={ () => setTempDate(null) }
          onConfirm={ () => { void handleConfirm() } }
          confirmLoading={ confirming }
          yearRange={ yearRange }
          prevIcon={ prevIcon }
          nextIcon={ nextIcon }
          superPrevIcon={ superPrevIcon }
          superNextIcon={ superNextIcon }
          timeIcon={ timeIcon }
          extraFooter={ extraFooter }
          renderCell={ renderCell }
          onAddTime={ onAddTime }
        />
      }
    />
  )
})

InnerDateSpanPicker.displayName = 'DateSpanPicker'

export const DateSpanPicker = memo(InnerDateSpanPicker) as typeof InnerDateSpanPicker

function formatDateSpan(
  start: Date | null,
  end: Date | null,
  format: string,
  separator: string,
): string {
  if (!start)
    return ''

  const formattedStart = formatDatePickerDate(start, { dateFormat: format })
  if (!end)
    return formattedStart

  return `${formattedStart}${separator}${formatDatePickerDate(end, { dateFormat: format })}`
}
