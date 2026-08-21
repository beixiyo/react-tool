'use client'

import { isSameDay } from 'date-fns'
import { useLatestCallback } from 'hooks'
import { forwardRef, memo } from 'react'
import { cn, formatDatePickerDate, formatDatePickerDateRange, formatDatePickerDateTime, formatDatePickerDateTimeRange, formatDatePickerTimeParts } from 'utils'
import type { DatePickerRangeFormatter } from 'utils'
import { useT } from '../../i18n'
import { useFormField } from '../Form'
import { SpanPickerInput } from './components'
import { PickerBase } from './components/PickerBase'
import { DateTimeSpanCalendar } from './DateTimeSpanCalendar'
import { useDateRangePickerSession } from './hooks/useDateRangePickerSession'
import { useDateTimeSpanSelection } from './hooks/useDateTimeSpanSelection'
import { usePickerState } from './hooks/usePickerState'
import type { DateTimeSpanPickerProps, DateTimeSpanPickerRef, DateTimeSpanPickerTriggerContext, DateTimeSpanPickerValue } from './types'
import { getFormatByPrecision, isDateRangeEqual } from './utils'

const EMPTY_DATE_TIME_SPAN: DateTimeSpanPickerValue = {
  start: null,
  end: null,
  hasTime: false,
}

/**
 * Todo 风格的日期 / 时刻一体选择器
 *
 * 日历始终先按全天日期编辑；底部 Add time 开关控制是否进入时刻编辑布局
 */
const InnerDateTimeSpanPicker = forwardRef<DateTimeSpanPickerRef, DateTimeSpanPickerProps>(({
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
  sameDaySeparator,
  rangeFormatter,
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
  enableRangeHoverPreview = true,
  precision = 'minute',
  syncEndTimeWithStart = false,
  defaultEndTimeOffsetMinutes: configuredDefaultEndTimeOffsetMinutes,
  use12Hours = false,
  minuteStep = 1,
  quickTimeStep,
  enableTimeKeyboardInput = true,
  enableTimeUnitPopover = true,
  enableTimeUnitScrollAnimation = true,
  enableHeaderScrollAnimation = true,
  enableTimeInputWheel = true,
  icon,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
  timeIcon,
  addEndTimeIcon,
  extraFooter,
  renderCell,
  clearIcon,
  yearRange,
  getTimeFieldErrors,
}, ref) => {
  const t = useT()
  const defaultEndTimeOffsetMinutes = configuredDefaultEndTimeOffsetMinutes ?? minuteStep
  const placeholder = propsPlaceholder ?? t('datePicker.placeholder')
  const startPlaceholder = t('datePicker.startPlaceholder')
  const endPlaceholder = t('datePicker.endPlaceholder')
  const periodPosition = t('datePicker.periodPosition') as 'left' | 'right'

  const {
    actualValue,
    actualError,
    actualErrorMessage,
    handleChangeVal,
    handleBlur,
  } = useFormField({
    name,
    value,
    defaultValue: defaultValue ?? EMPTY_DATE_TIME_SPAN,
    error,
    errorMessage,
    onChange,
  })

  const { isOpen, setOpen } = usePickerState({
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
    addTime,
    clearTime,
    changeStartTime,
    changeEndTime,
    addEndTime,
    clear,
    restore,
    endSession,
  } = useDateTimeSpanSelection({
    externalValue: actualValue,
    initialValue: actualValue ?? defaultValue ?? EMPTY_DATE_TIME_SPAN,
    precision,
    syncEndTimeWithStart,
    defaultEndTimeOffsetMinutes,
    onChange: (nextValue) => handleChangeVal(nextValue, undefined as any),
    onDraftChange: () => resetRejection(),
  })

  const {
    confirming,
    confirmRejected,
    validationMessage,
    resetRejection,
    cancel: handleCancel,
    confirm: confirmSession,
  } = useDateRangePickerSession({
    isOpen,
    committedValue: actualValue,
    draftValue: internalValue,
    setOpen,
    restoreValue: restore,
    onConfirm,
    onCancel,
    onSessionEnd: endSession,
    isValueEqual: isDateTimeSpanEqual,
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

  const displayPrecision = internalValue.hasTime
    ? precision
    : 'day'
  const baseDateFormat = t('datePicker.dateFormat')
  const actualFormat = dateFormat || getFormatByPrecision(displayPrecision, use12Hours, baseDateFormat)
  const startValue = internalValue.start
    ? formatDatePickerDate(internalValue.start, { dateFormat: actualFormat })
    : ''
  const endValue = internalValue.end
    ? formatDatePickerDate(internalValue.end, { dateFormat: actualFormat })
    : ''
  const startTimeParts = internalValue.hasTime && internalValue.start
    ? formatDatePickerTimeParts(internalValue.start, { precision, use12Hours, amLabel: t('datePicker.am'), pmLabel: t('datePicker.pm'), periodPosition })
    : { timeValue: '', period: '' }
  const endTimeParts = internalValue.hasTime && internalValue.end
    ? formatDatePickerTimeParts(internalValue.end, { precision, use12Hours, amLabel: t('datePicker.am'), pmLabel: t('datePicker.pm'), periodPosition })
    : { timeValue: '', period: '' }
  const hasInvalidEndTime = !!(internalValue.hasTime && internalValue.start && internalValue.end
    && internalValue.end.getTime() < internalValue.start.getTime())
  const timeFieldErrors = getTimeFieldErrors?.(internalValue)
  const canShowClear = showClear && (internalValue.start || internalValue.end) && !disabled
  const displayValue = formatDateTimeSpanValue(internalValue, {
    dateFormat: dateFormat || baseDateFormat,
    precision,
    use12Hours,
    amLabel: t('datePicker.am'),
    pmLabel: t('datePicker.pm'),
    periodPosition,
    separator,
    sameDaySeparator,
    rangeFormatter,
  })

  const triggerContext: DateTimeSpanPickerTriggerContext = {
    value: internalValue,
    displayValue,
    hasTime: internalValue.hasTime,
    startValue,
    endValue,
    startPlaceholder,
    endPlaceholder,
    separator,
    confirming,
    confirmRejected,
    isOpen,
    disabled,
    error: !!actualError,
    open: () => !isOpen && setOpen(true),
    close: () => handleCancel('programmatic'),
    clear: handleClear,
    showClear,
    canShowClear: !!canShowClear,
    toggle: handleToggle,
    use12Hours: internalValue.hasTime && use12Hours,
    startAmpm: startTimeParts.period,
    endAmpm: endTimeParts.period,
    startTimeValue: startTimeParts.timeValue,
    endTimeValue: endTimeParts.timeValue,
    periodPosition,
    inputClassName,
    icon,
    clearIcon,
    triggerVariant,
  }

  const handleConfirm = useLatestCallback(() => {
    if (hasInvalidEndTime) return
    return void confirmSession()
  })

  const triggerContent = renderTrigger
    ? renderTrigger(triggerContext)
    : trigger
    ? <div onClick={ handleToggle }>{ trigger }</div>
    : (
      <SpanPickerInput
        displayValue={ displayValue }
        placeholder={ placeholder }
        disabled={ disabled }
        showClear={ showClear }
        error={ !!actualError || confirmRejected }
        canShowClear={ !!canShowClear }
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
      onConfirm={ handleConfirm }
      onBlur={ handleBlur }
      className={ className }
      dropdownClassName={ cn('w-[300px] p-5', dropdownClassName) }
      dropdownZIndex={ dropdownZIndex }
      error={ !!actualError }
      errorMessage={ actualErrorMessage }
      dropdown={ 
        <DateTimeSpanCalendar
          currentMonth={ currentMonth }
          onCurrentMonthChange={ setCurrentMonth }
          value={ internalValue }
          tempDate={ tempDate }
          onSelect={ selectDate }
          onDateHover={ setTempDate }
          onStartTimeChange={ changeStartTime }
          onEndTimeChange={ changeEndTime }
          onAddTime={ addTime }
          onClearTime={ clearTime }
          onAddEndTime={ addEndTime }
          startTimeError={ Boolean(timeFieldErrors?.start) }
          endTimeError={ hasInvalidEndTime || Boolean(timeFieldErrors?.end) }
          disabledDate={ disabledDate }
          minDate={ minDate }
          maxDate={ maxDate }
          className={ calendarClassName }
          weekStartsOn={ weekStartsOn }
          precision={ precision }
          enableRangeHoverPreview={ enableRangeHoverPreview }
          use12Hours={ use12Hours }
          minuteStep={ minuteStep }
          quickTimeStep={ quickTimeStep }
          enableTimeKeyboardInput={ enableTimeKeyboardInput }
          enableTimeUnitPopover={ enableTimeUnitPopover }
          enableTimeUnitScrollAnimation={ enableTimeUnitScrollAnimation }
          enableHeaderScrollAnimation={ enableHeaderScrollAnimation }
          enableTimeInputWheel={ enableTimeInputWheel }
          timeIcon={ timeIcon }
          addEndTimeIcon={ addEndTimeIcon }
          timeDropdownClassName={ timeDropdownClassName }
          timeDropdownZIndex={ timeDropdownZIndex }
          dropdownZIndex={ dropdownZIndex }
          onMouseLeave={ () => setTempDate(null) }
          onConfirm={ handleConfirm }
          confirmLoading={ confirming }
          validationMessage={ confirmRejected
            ? validationMessage
            : undefined }
          yearRange={ yearRange }
          prevIcon={ prevIcon }
          nextIcon={ nextIcon }
          superPrevIcon={ superPrevIcon }
          superNextIcon={ superNextIcon }
          extraFooter={ extraFooter }
          renderCell={ renderCell }
        />
       }
    />
  )
})

InnerDateTimeSpanPicker.displayName = 'DateTimeSpanPicker'

export const DateTimeSpanPicker = memo(InnerDateTimeSpanPicker) as typeof InnerDateTimeSpanPicker

function isDateTimeSpanEqual(left: DateTimeSpanPickerValue, right: DateTimeSpanPickerValue): boolean {
  return left.hasTime === right.hasTime && isDateRangeEqual(left, right)
}

function formatDateTimeSpanValue(
  value: DateTimeSpanPickerValue,
  options: {
    dateFormat: string
    precision: NonNullable<DateTimeSpanPickerProps['precision']>
    use12Hours: boolean
    amLabel: string
    pmLabel: string
    periodPosition: 'left' | 'right'
    separator: string
    sameDaySeparator?: string
    rangeFormatter?: DatePickerRangeFormatter
  },
): string {
  if (!value.start) return ''

  if (!value.hasTime) {
    return value.end
      ? formatDatePickerDateRange(value.start, value.end, {
        dateFormat: options.dateFormat,
        rangeSeparator: options.separator,
        rangeFormatter: options.rangeFormatter,
      })
      : formatDatePickerDate(value.start, { dateFormat: options.dateFormat })
  }

  const formatOptions = {
    dateFormat: options.dateFormat,
    precision: options.precision,
    use12Hours: options.use12Hours,
    amLabel: options.amLabel,
    pmLabel: options.pmLabel,
    periodPosition: options.periodPosition,
    rangeSeparator: value.end && isSameDay(value.start, value.end)
      ? options.sameDaySeparator ?? options.separator
      : options.separator,
    rangeFormatter: options.rangeFormatter,
  }
  return value.end
    ? formatDatePickerDateTimeRange(value.start, value.end, formatOptions)
    : formatDatePickerDateTime(value.start, formatOptions)
}
