'use client'

import type { DateRangePickerProps, DateRangePickerRef } from './types'
import { useShortCutKey } from 'hooks'
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { AnimateShow } from '../Animate'
import { useFormField } from '../Form/useFormField'
import { Calendar as CalendarComponent } from './Calendar'
import { RangePickerInput } from './components'
import { useClickOutside } from './hooks/useClickOutside'
import { usePickerFloating } from './hooks/usePickerFloating'
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

  /** 如果没有指定 format，根据 precision 自动生成 */
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

  /** 按下 ESC 关闭 */
  useShortCutKey({
    key: 'Escape',
    fn: () => {
      if (isOpen) {
        setOpen(false)
        handleBlur()
      }
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

  /** 当前正在选择的类型：'start' | 'end' */
  const [selectingType, setSelectingType] = useState<'start' | 'end'>('start')

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
      /** 打开时记录当前值 */
      initialValueRef.current = { ...internalValue }
    }
  }, [isOpen])

  /** 当关闭时，触发确认事件 */
  useEffect(() => {
    if (!isOpen) {
      /** 关闭时，清空临时日期 */
      setTempDate(null)
      /** 如果值有变化且存在 onConfirm 回调，则触发 */
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

  /** 处理输入区域点击 */
  const handleInputClick = useCallback((type: 'start' | 'end') => {
    if (disabled)
      return

    setSelectingType(type)

    if (!isOpen) {
      setOpen(true)
    }
    onTriggerClick?.()
  }, [disabled, isOpen, setOpen, onTriggerClick])

  /** 处理日期选择 */
  const handleDateSelect = useCallback((date: Date) => {
    const newValue = { ...internalValue }

    if (selectingType === 'start') {
      newValue.start = preserveTimeFromDate(date, internalValue.start, precision)
      /** 如果开始日期大于结束日期，重置结束日期 */
      if (newValue.end && isAfter(newValue.start, newValue.end)) {
        newValue.end = null
      }
      /**
       * 只有在精度为天时才自动切换到结束日期
       * 如果有时间精度，允许用户留在当前侧调整时间
       */
      if (precision === 'day') {
        setSelectingType('end')
      }
    }
    else {
      newValue.end = preserveTimeFromDate(date, internalValue.end || internalValue.start, precision)
      /** 如果结束日期小于开始日期，交换它们 */
      if (newValue.start && isBefore(newValue.end, newValue.start)) {
        const temp = newValue.start
        newValue.start = newValue.end
        newValue.end = temp
      }
      /** 选完结束且没有时间精度，关闭面板 */
      if (precision === 'day') {
        setOpen(false)
      }
    }

    setInternalValue(newValue)
    handleChangeVal(newValue, undefined as any)
  }, [internalValue, precision, selectingType, setOpen, handleChangeVal])

  /** 处理时间变更 */
  const handleTimeChange = useCallback((date: Date) => {
    const newValue = { ...internalValue }

    if (selectingType === 'start') {
      newValue.start = date
    }
    else {
      newValue.end = date
    }

    setInternalValue(newValue)
    handleChangeVal(newValue, undefined as any)
  }, [internalValue, handleChangeVal, selectingType])

  /** 处理鼠标悬停（用于预览范围） */
  const handleDateHover = useCallback((date: Date | null) => {
    setTempDate(date)
  }, [])

  /** 处理清除 */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const clearedValue = { start: null, end: null }
    setInternalValue(clearedValue)
    handleChangeVal(clearedValue, undefined as any)
    setTempDate(null)
    setSelectingType('start')
  }, [handleChangeVal])

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
          selectingType={ selectingType }
          onSelectingTypeChange={ setSelectingType }
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
                onInputClick={ handleInputClick }
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
