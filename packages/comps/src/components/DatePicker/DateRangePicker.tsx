'use client'

import { useLatestCallback } from 'hooks'
import { forwardRef, memo } from 'react'
import { formatDatePickerDate, formatDatePickerTimeParts } from 'utils'
import { useT } from '../../i18n'
import { useFormField } from '../Form'
import { Calendar as CalendarComponent } from './Calendar'
import { RangePickerInput } from './components'
import { PickerBase } from './components/PickerBase'
import { useDateRangePickerSession } from './hooks/useDateRangePickerSession'
import { useDateRangeSelection } from './hooks/useDateRangeSelection'
import { usePickerState } from './hooks/usePickerState'
import type { DateRangePickerProps, DateRangePickerRef, DateRangePickerTriggerContext } from './types'
import { getFormatByPrecision } from './utils'

const InnerDateRangePicker = forwardRef<DateRangePickerRef, DateRangePickerProps>(({
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
  startPlaceholder: propsStartPlaceholder,
  endPlaceholder: propsEndPlaceholder,
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
  closeOnSelect = true,
  weekStartsOn = 1,
  enableRangeHoverPreview = true,
  separator = ' ~ ',
  precision = 'day',
  use12Hours = false,
  minuteStep = 1,
  quickTimeStep,
  enableTimeKeyboardInput = true,
  enableTimeUnitPopover = true,
  enableTimeUnitScrollAnimation = true,
  enableTimeInputWheel = true,
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
  } = useFormField<{ start: Date | null; end: Date | null }>({
    name,
    value,
    defaultValue: defaultValue ?? { start: null, end: null },
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
    selectingType,
    tempDate,
    currentMonth,
    setSelectingType,
    setTempDate,
    setCurrentMonth,
    selectDate,
    clear,
    changeTime,
    restore,
    endSession,
  } = useDateRangeSelection({
    externalValue: actualValue,
    initialValue: actualValue ?? defaultValue ?? { start: null, end: null },
    precision,
    onChange: (nextValue) => handleChangeVal(nextValue, undefined as any),
    onDraftChange: () => resetRejection(),
  })
  const {
    confirming,
    confirmRejected,
    validationMessage,
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

  const handleDateSelect = useLatestCallback((date: Date) => {
    const result = selectDate(date)
    if (result.completedDayRange && closeOnSelect) void handleConfirm(result.value)
  })

  const handleClear = useLatestCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    clear()
  })

  const periodPosition = t('datePicker.periodPosition') as 'left' | 'right'
  const startValue = internalValue.start
    ? formatDatePickerDate(internalValue.start, { dateFormat: actualFormat })
    : ''
  const endValue = internalValue.end
    ? formatDatePickerDate(internalValue.end, { dateFormat: actualFormat })
    : ''
  const startTimeParts = internalValue.start && precision !== 'day'
    ? formatDatePickerTimeParts(internalValue.start, {
      precision,
      use12Hours,
      amLabel: t('datePicker.am'),
      pmLabel: t('datePicker.pm'),
      periodPosition,
    })
    : { timeValue: '', period: '' }
  const endTimeParts = internalValue.end && precision !== 'day'
    ? formatDatePickerTimeParts(internalValue.end, {
      precision,
      use12Hours,
      amLabel: t('datePicker.am'),
      pmLabel: t('datePicker.pm'),
      periodPosition,
    })
    : { timeValue: '', period: '' }
  const startTimeValue = startTimeParts.timeValue
  const endTimeValue = endTimeParts.timeValue
  const startAmpm = startTimeParts.period
  const endAmpm = endTimeParts.period

  const canShowClear = showClear && (internalValue.start || internalValue.end) && !disabled
  const handleInputClick = useLatestCallback((type: 'start' | 'end') => {
    onTriggerClick?.()
    if (!isOpen) {
      resetRejection()
      setSelectingType(type)
      setOpen(true)
      return
    }
    if (selectingType === type) {
      handleCancel('trigger')
      return
    }
    setSelectingType(type)
  })

  const defaultTriggerContext: DateRangePickerTriggerContext = {
    value: internalValue,
    startValue,
    endValue,
    startPlaceholder,
    endPlaceholder,
    separator,
    activeType: isOpen
      ? selectingType
      : null,
    confirming,
    confirmRejected,
    isOpen,
    disabled,
    error: !!actualError,
    open: () => {
      if (!isOpen) handleTriggerClick()
    },
    close: () => handleCancel('programmatic'),
    clear: handleClear,
    showClear,
    canShowClear: !!canShowClear,
    onInputClick: handleInputClick,
    use12Hours: use12Hours && precision !== 'day',
    startAmpm,
    endAmpm,
    startTimeValue,
    endTimeValue,
    periodPosition,
    inputClassName,
    icon,
    clearIcon,
    triggerVariant,
  }

  const iconTarget = !internalValue.start
    ? 'start'
    : !internalValue.end
    ? 'end'
    : 'start'

  const triggerContent = renderTrigger
    ? renderTrigger(defaultTriggerContext)
    : trigger
    ? (
      <div
        onClick={ () => {
          onTriggerClick?.()
          if (isOpen) handleCancel('trigger')
          else handleTriggerClick()
        } }
      >
        { trigger }
      </div>
    )
    : (
      <RangePickerInput
        startValue={ startValue }
        endValue={ endValue }
        startPlaceholder={ startPlaceholder }
        endPlaceholder={ endPlaceholder }
        separator={ separator }
        activeType={ isOpen
          ? selectingType
          : null }
        disabled={ disabled }
        showClear={ showClear }
        error={ actualError || confirmRejected }
        onClear={ handleClear }
        onInputClick={ handleInputClick }
        onIconClick={ () => handleInputClick(iconTarget) }
        iconLabel={ iconTarget === 'start'
          ? startPlaceholder
          : endPlaceholder }
        inputClassName={ inputClassName }
        icon={ icon }
        clearIcon={ clearIcon }
        use12Hours={ use12Hours && precision !== 'day' }
        startAmpm={ startAmpm }
        endAmpm={ endAmpm }
        startTimeValue={ startTimeValue }
        endTimeValue={ endTimeValue }
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
      onDismiss={ handleCancel }
      onConfirm={ () => {
        void handleConfirm()
      } }
      onBlur={ handleBlur }
      className={ className }
      dropdownClassName={ dropdownClassName }
      dropdownZIndex={ dropdownZIndex }
      error={ actualError || confirmRejected }
      errorMessage={ actualError
        ? actualErrorMessage
        : validationMessage }
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
          enableRangeHoverPreview={ enableRangeHoverPreview }
          selectedRange={ internalValue }
          selectingType={ selectingType }
          onSelectingTypeChange={ setSelectingType }
          tempDate={ tempDate }
          onDateHover={ setTempDate }
          precision={ precision }
          use12Hours={ use12Hours }
          onMouseLeave={ () => setTempDate(null) }
          onTimeChange={ (date) => {
            changeTime(date)
          } }
          onConfirm={ () => {
            void handleConfirm()
          } }
          confirmLoading={ confirming }
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
          quickTimeStep={ quickTimeStep }
          enableTimeKeyboardInput={ enableTimeKeyboardInput }
          enableTimeUnitPopover={ enableTimeUnitPopover }
          enableTimeUnitScrollAnimation={ enableTimeUnitScrollAnimation }
          enableTimeInputWheel={ enableTimeInputWheel }
          onAddTime={ onAddTime }
        />
       }
    />
  )
})

InnerDateRangePicker.displayName = 'DateRangePicker'

export const DateRangePicker = memo(InnerDateRangePicker) as typeof InnerDateRangePicker
