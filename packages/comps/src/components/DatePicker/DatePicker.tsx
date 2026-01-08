'use client'

import type { DatePickerProps, DatePickerRef } from './types'
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
  placeholder = '请选择日期',
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
  } = useFormField<Date | null>({
    name,
    value,
    defaultValue: null,
    error,
    errorMessage,
    onChange,
  })

  /** 使用公共 Hook 管理状态 */
  const {
    isControlled,
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
    x: left,
    y: top,
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
  const [internalValue, setInternalValue] = useState<Date | null>(() => {
    if (actualValue !== undefined)
      return actualValue
    if (defaultValue !== undefined)
      return defaultValue
    return null
  })

  /** 当前显示的月份 */
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return getInitialDate(actualValue, defaultValue)
  })

  /** 记录打开时的初始值，用于在关闭时判断是否有变化 */
  const initialValueRef = useRef<Date | null>(null)

  /** 更新内部值当受控值变化时 */
  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
      if (actualValue) {
        setCurrentMonth(actualValue)
      }
    }
  }, [actualValue])

  /** 当打开状态变化时，记录初始值或触发确认事件 */
  useEffect(() => {
    if (isOpen) {
      // 打开时记录当前值
      initialValueRef.current = internalValue
    }
    else {
      // 关闭时，如果值有变化且存在 onConfirm 回调，则触发
      if (onConfirm && !isDateEqual(initialValueRef.current, internalValue)) {
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
    // 如果精度只到日期（不包含时间），选择后立即关闭
    const shouldClose = precision === 'day'

    // 如果精度包含时间，且已有内部值，保留之前选择的时间部分
    const finalDate = preserveTimeFromDate(date, internalValue, precision)

    setInternalValue(finalDate)
    handleChangeVal(finalDate, undefined as any)

    if (shouldClose) {
      setOpen(false)
    }
  }, [handleChangeVal, precision, internalValue, setOpen])

  /** 处理时间变更 */
  const handleTimeChange = useCallback((date: Date) => {
    setInternalValue(date)
    handleChangeVal(date, undefined as any)
  }, [handleChangeVal])

  /** 处理清除 */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalValue(null)
    handleChangeVal(null, undefined as any)
  }, [handleChangeVal])

  /** 显示的值 */
  const displayValue = formatDate(internalValue, actualFormat)

  /** 下拉面板内容 */
  const dropdownContent = isOpen && (
    <AnimateShow
      show={ shouldAnimate }
      ref={ dropdownRef }
      variants="scale"
      visibilityMode
      animateOnMount={ false }
      display="block"
      style={ {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 50,
      } }
    >
      <div
        className={ cn(
          'bg-background border border-border rounded-lg shadow-lg',
          dropdownClassName,
        ) }
      >
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

InnerDatePicker.displayName = 'DatePicker'

export const DatePicker = memo(InnerDatePicker) as typeof InnerDatePicker
