'use client'

import type { DatePickerProps, DatePickerRef } from './types'
import { useFloatingPosition } from 'hooks'
import { Calendar, X } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { Button } from '../Button'
import { useFormField } from '../Form/useFormField'
import { Calendar as CalendarComponent } from './Calendar'
import { formatDate, getFormatByPrecision } from './utils'

const InnerDatePicker = forwardRef<DatePickerRef, DatePickerProps>(({
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
  /** 是否应该显示动画，位置计算完成后才为 true */
  const [shouldAnimate, setShouldAnimate] = useState(false)

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
    return actualValue || defaultValue || new Date()
  })

  /** 更新内部值当受控值变化时 */
  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
      if (actualValue) {
        setCurrentMonth(actualValue)
      }
    }
  }, [actualValue])

  const {
    x: left,
    y: top,
    update: updatePosition,
  } = useFloatingPosition(triggerRef, dropdownRef, {
    enabled: isOpen,
    placement,
    offset,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
    strategy: 'fixed',
  })

  /** 当打开状态变化时，计算位置 */
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      setShouldAnimate(false)
      requestAnimationFrame(() => {
        updatePosition()
        setShouldAnimate(true)
      })
    }
    else {
      setShouldAnimate(false)
    }
  }, [isOpen, updatePosition])

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
    // 如果精度只到日期（不包含时间），选择后立即关闭
    const shouldClose = precision === 'day'

    setInternalValue(date)
    handleChangeVal(date, {} as any)

    if (shouldClose) {
      if (isControlled) {
        onOpenChange?.(false)
      }
      else {
        setInternalOpen(false)
      }
    }
  }, [handleChangeVal, isControlled, onOpenChange, precision])

  /** 处理时间变更 */
  const handleTimeChange = useCallback((date: Date) => {
    setInternalValue(date)
    handleChangeVal(date, {} as any)
  }, [handleChangeVal])

  /** 处理清除 */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalValue(null)
    handleChangeVal(null, {} as any)
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

InnerDatePicker.displayName = 'DatePicker'

export const DatePicker = memo(InnerDatePicker) as typeof InnerDatePicker
