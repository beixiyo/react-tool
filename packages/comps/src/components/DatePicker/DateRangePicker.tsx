'use client'

import type { DateRangePickerProps, DateRangePickerRef } from './types'
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { useFormField } from '../Form/useFormField'
import { Calendar as CalendarComponent } from './Calendar'
import { PickerInput } from './components/PickerInput'
import { useClickOutside } from './hooks/useClickOutside'
import { usePickerFloating } from './hooks/usePickerFloating'
import { usePickerState } from './hooks/usePickerState'
import { formatDateRange, getFormatByPrecision, getInitialDate, getValidDateRange, isDateRangeEqual, preserveTimeFromDate } from './utils'

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
  placeholder = '请选择日期范围',
  startPlaceholder: _startPlaceholder = '开始日期',
  endPlaceholder: _endPlaceholder = '结束日期',
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
  // 如果没有指定 format，根据 precision 自动生成
  const actualFormat = dateFormat || getFormatByPrecision(precision)

  /** 使用 useFormField 处理表单集成 */
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

  /** 触发器元素引用 */
  const triggerRef = useRef<HTMLDivElement>(null)
  /** 下拉面板引用 */
  const dropdownRef = useRef<HTMLDivElement>(null)

  /** 使用公共 Hook 管理浮层位置和动画 */
  const {
    style,
    shouldAnimate,
  } = usePickerFloating({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    placement,
    offset,
  })

  /** 使用公共 Hook 处理点击外部关闭 */
  useClickOutside({
    enabled: isOpen,
    triggerRef,
    dropdownRef,
    onClickOutside,
    onClose: () => {
      setOpen(false)
      handleBlur()
    },
  })

  /** 内部值管理 */
  const [internalValue, setInternalValue] = useState<{ start: Date | null, end: Date | null }>(() => {
    if (actualValue !== undefined)
      return actualValue
    if (defaultValue !== undefined)
      return defaultValue
    return { start: null, end: null }
  })

  /** 临时选择的日期（用于鼠标悬停时显示预览） */
  const [tempDate, setTempDate] = useState<Date | null>(null)

  /** 当前显示的月份 */
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return getInitialDate(internalValue.start, internalValue.end)
  })

  /** 记录打开时的初始值，用于在关闭时判断是否有变化 */
  const initialValueRef = useRef<{ start: Date | null, end: Date | null }>({ start: null, end: null })

  /** 更新内部值当受控值变化时 */
  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
      if (actualValue.start) {
        setCurrentMonth(actualValue.start)
      }
      else if (actualValue.end) {
        setCurrentMonth(actualValue.end)
      }
    }
  }, [actualValue])

  /** 当打开时，记录初始值 */
  useEffect(() => {
    if (isOpen) {
      // 打开时记录当前值
      initialValueRef.current = { ...internalValue }
    }
  }, [isOpen])

  /** 当关闭时，触发确认事件 */
  useEffect(() => {
    if (!isOpen) {
      // 关闭时，清空临时日期
      setTempDate(null)
      // 如果值有变化且存在 onConfirm 回调，则触发
      if (onConfirm && !isDateRangeEqual(initialValueRef.current, internalValue)) {
        onConfirm(internalValue)
      }
    }
  }, [isOpen, internalValue, onConfirm])

  /** 处理触发器点击 */
  const handleTriggerClick = useCallback(() => {
    onTriggerClick?.()
    baseHandleTriggerClick()
  }, [onTriggerClick, baseHandleTriggerClick])

  /** 处理日期选择 */
  const handleDateSelect = useCallback((date: Date) => {
    const newValue = { ...internalValue }

    if (!newValue.start || (newValue.start && newValue.end)) {
      // 开始新的范围选择，保留之前开始日期的时间（如果有）
      newValue.start = preserveTimeFromDate(date, internalValue.start, precision)
      newValue.end = null
    }
    else if (newValue.start && !newValue.end) {
      // 选择结束日期
      // 如果之前有结束日期，保留之前结束日期的时间；否则保留开始日期的时间
      const timeSource = internalValue.end || internalValue.start
      // 确保开始日期也保留时间（如果之前有）
      const startDate = preserveTimeFromDate(newValue.start, internalValue.start, precision)
      const endDate = preserveTimeFromDate(date, timeSource, precision)
      const validRange = getValidDateRange(startDate, endDate)
      newValue.start = validRange.start
      newValue.end = validRange.end
    }

    setInternalValue(newValue)
    handleChangeVal(newValue, undefined as any)

    // 如果范围选择完成且精度只到日期（不包含时间），关闭面板
    const shouldClose = (newValue.start && newValue.end) && precision === 'day'
    if (shouldClose) {
      setOpen(false)
    }
  }, [internalValue, handleChangeVal, precision, setOpen])

  /** 处理时间变更 */
  const handleTimeChange = useCallback((date: Date) => {
    const newValue = { ...internalValue }

    // 判断是更新开始时间还是结束时间
    if (!newValue.end) {
      // 只有开始日期，更新开始时间
      newValue.start = date
    }
    else {
      // 两个日期都存在，默认更新结束时间（因为通常先选开始日期，再选结束日期）
      if (newValue.start && newValue.end) {
        newValue.end = date
      }
    }

    setInternalValue(newValue)
    handleChangeVal(newValue, undefined as any)
  }, [internalValue, handleChangeVal])

  /** 处理鼠标悬停（用于预览范围） */
  const handleDateHover = useCallback((date: Date | null) => {
    if (internalValue.start && !internalValue.end) {
      setTempDate(date)
    }
  }, [internalValue])

  /** 处理清除 */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const clearedValue = { start: null, end: null }
    setInternalValue(clearedValue)
    handleChangeVal(clearedValue, undefined as any)
    setTempDate(null)
  }, [handleChangeVal])

  /** 显示的值 */
  const displayValue = formatDateRange(internalValue, actualFormat, separator)

  /** 下拉面板内容 */
  const dropdownContent = isOpen && (
    <AnimateShow
      show={ shouldAnimate }
      variants="scale"
      visibilityMode
      animateOnMount={ false }
      display="block"
      style={ {
        ...style,
        zIndex: 50,
      } }
    >
      <div
        ref={ dropdownRef }
        className={ cn(
          'bg-background border border-border rounded-lg shadow-lg',
          dropdownClassName,
        ) }
        onMouseLeave={ () => setTempDate(null) }
      >
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
          tempDate={ tempDate }
          onDateHover={ handleDateHover }
          precision={ precision }
          onTimeChange={ handleTimeChange }
        />
      </div>
    </AnimateShow>
  )

  return (
    <>
      {trigger
        ? (
            <div
              ref={ triggerRef }
              className={ cn('inline-block', className) }
              onClick={ handleTriggerClick }
            >
              {trigger}
            </div>
          )
        : (
            <div ref={ triggerRef } className={ cn('inline-block', className) }>
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
              />
            </div>
          )}
      {createPortal(dropdownContent, document.body)}
      {actualError && actualErrorMessage && (
        <div className="mt-1 text-xs text-danger">
          {actualErrorMessage}
        </div>
      )}
    </>
  )
})

InnerDateRangePicker.displayName = 'DateRangePicker'

export const DateRangePicker = memo(InnerDateRangePicker) as typeof InnerDateRangePicker
