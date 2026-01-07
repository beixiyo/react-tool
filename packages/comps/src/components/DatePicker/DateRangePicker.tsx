'use client'

import type { DateRangePickerProps, DateRangePickerRef } from './types'
import { Calendar, X } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { Button } from '../Button'
import { useFormField } from '../Form/useFormField'
import { Calendar as CalendarComponent } from './Calendar'
import { formatDateRange, getFormatByPrecision, getValidDateRange } from './utils'

const InnerDateRangePicker = forwardRef<DateRangePickerRef, DateRangePickerProps>(({
  value,
  defaultValue,
  onChange,
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
}, ref) => {
  // 如果没有指定 format，根据 precision 自动生成
  const actualFormat = dateFormat || getFormatByPrecision(precision)
  /** 判断是否为受控模式 */
  const isControlled = controlledOpen !== undefined

  /** 内部打开状态（非受控模式使用） */
  const [internalOpen, setInternalOpen] = useState(false)

  /** 实际使用的打开状态 */
  const isOpen = isControlled
    ? controlledOpen
    : internalOpen

  /** 触发器元素引用 */
  const triggerRef = useRef<HTMLDivElement>(null)
  /** 下拉面板引用 */
  const dropdownRef = useRef<HTMLDivElement>(null)
  /** 下拉面板位置 */
  const [position, setPosition] = useState({ top: 0, left: 0 })
  /** 是否应该显示动画，位置计算完成后才为 true */
  const [shouldAnimate, setShouldAnimate] = useState(false)

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
    return internalValue.start || internalValue.end || new Date()
  })

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

  /** 计算下拉面板位置 */
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current)
      return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const dropdownRect = dropdownRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    let top = 0
    let left = 0

    switch (placement) {
      case 'bottom-start':
        top = triggerRect.bottom + offset
        left = triggerRect.left
        if (top + dropdownRect.height > viewportHeight) {
          top = triggerRect.top - dropdownRect.height - offset
        }
        if (left + dropdownRect.width > viewportWidth) {
          left = viewportWidth - dropdownRect.width - 8
        }
        break
      case 'bottom-end':
        top = triggerRect.bottom + offset
        left = triggerRect.right - dropdownRect.width
        if (top + dropdownRect.height > viewportHeight) {
          top = triggerRect.top - dropdownRect.height - offset
        }
        if (left < 0) {
          left = 8
        }
        break
      case 'top-start':
        top = triggerRect.top - dropdownRect.height - offset
        left = triggerRect.left
        if (top < 0) {
          top = triggerRect.bottom + offset
        }
        if (left + dropdownRect.width > viewportWidth) {
          left = viewportWidth - dropdownRect.width - 8
        }
        break
      case 'top-end':
        top = triggerRect.top - dropdownRect.height - offset
        left = triggerRect.right - dropdownRect.width
        if (top < 0) {
          top = triggerRect.bottom + offset
        }
        if (left < 0) {
          left = 8
        }
        break
      default:
        top = triggerRect.bottom + offset
        left = triggerRect.left
    }

    setPosition({ top, left })
    requestAnimationFrame(() => {
      setShouldAnimate(true)
    })
  }, [placement, offset])

  /** 当打开状态变化时，计算位置 */
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setShouldAnimate(false)
      requestAnimationFrame(() => {
        calculatePosition()
      })
    }
    else {
      setShouldAnimate(false)
      setTempDate(null)
    }
  }, [isOpen, calculatePosition])

  /** 处理点击外部关闭 */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      triggerRef.current && !triggerRef.current.contains(event.target as Node)
      && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
    ) {
      if (isControlled) {
        onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
      onClickOutside?.()
      handleBlur()
    }
  }, [isControlled, onOpenChange, onClickOutside, handleBlur])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  /** 处理日期选择 */
  const handleDateSelect = useCallback((date: Date) => {
    const newValue = { ...internalValue }

    if (!newValue.start || (newValue.start && newValue.end)) {
      // 开始新的范围选择
      newValue.start = date
      newValue.end = null
    }
    else if (newValue.start && !newValue.end) {
      // 选择结束日期
      const validRange = getValidDateRange(newValue.start, date)
      newValue.start = validRange.start
      newValue.end = validRange.end
    }

    setInternalValue(newValue)
    handleChangeVal(newValue, {} as any)

    // 如果范围选择完成且精度只到日期（不包含时间），关闭面板
    const shouldClose = (newValue.start && newValue.end) && precision === 'day'
    if (shouldClose) {
      if (isControlled) {
        onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
    }
  }, [internalValue, handleChangeVal, isControlled, onOpenChange, precision])

  /** 处理时间变更 */
  const handleTimeChange = useCallback((date: Date) => {
    const newValue = { ...internalValue }

    // 判断是更新开始时间还是结束时间
    if (!newValue.end) {
      // 只有开始日期，更新开始时间
      newValue.start = date
    }
    else {
      // 两个日期都存在，判断更接近哪个
      // 如果当前选中的是开始日期相关的时间，更新开始时间
      // 这里简化处理：如果开始日期和结束日期是同一天，则更新开始时间
      // 否则，根据日期选择逻辑判断
      if (newValue.start && newValue.end) {
        // 默认更新结束时间（因为通常先选开始日期，再选结束日期）
        newValue.end = date
      }
    }

    setInternalValue(newValue)
    handleChangeVal(newValue, {} as any)
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
    handleChangeVal(clearedValue, {} as any)
    setTempDate(null)
  }, [handleChangeVal])

  /** 处理触发器点击 */
  const handleTriggerClick = useCallback(() => {
    if (disabled)
      return

    onTriggerClick?.()

    if (isControlled) {
      onOpenChange?.(!isOpen)
    }
    else {
      setInternalOpen(!isOpen)
    }
  }, [disabled, onTriggerClick, isControlled, onOpenChange, isOpen])

  /** 暴露 ref 方法 */
  useImperativeHandle(ref, () => ({
    open: () => {
      if (disabled || isOpen)
        return
      if (isControlled) {
        onOpenChange?.(true)
      }
      else {
        setInternalOpen(true)
      }
    },
    close: () => {
      if (isControlled) {
        onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
    },
  }), [disabled, isOpen, isControlled, onOpenChange])

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
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
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
              <div
                className={ cn(
                  'flex h-10 w-full items-center rounded-md border border-border bg-background px-3 py-2 text-sm',
                  'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
                  'placeholder:text-textSecondary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-systemOrange focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  {
                    'border-danger': actualError,
                    'cursor-pointer': !disabled,
                  },
                  inputClassName,
                ) }
                onClick={ handleTriggerClick }
              >
                <Calendar className="mr-2 h-4 w-4 text-textSecondary" />
                <span className={ cn('flex-1 text-left', {
                  'text-textSecondary': !displayValue,
                  'text-textPrimary': displayValue,
                }) }>
                  {displayValue || placeholder}
                </span>
                {showClear && displayValue && !disabled && (
                  <Button
                    variant="ghost"
                    iconOnly
                    size={ 16 }
                    onClick={ handleClear }
                    aria-label="清除"
                    className="ml-2"
                    leftIcon={ <X className="h-3 w-3 text-textSecondary" /> }
                  />
                )}
              </div>
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
