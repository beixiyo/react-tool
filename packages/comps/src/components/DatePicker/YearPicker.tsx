'use client'

import type { YearPickerProps, YearPickerRef } from './types'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { AnimateShow } from '../Animate'
import { Button } from '../Button'
import { useFormField } from '../Form/useFormField'
import { useFloatingPosition } from 'hooks'
import { addYear, formatDate, getYear, isAfter, isBefore, subtractYear } from './utils'
import { YearGrid } from './YearGrid'

const InnerYearPicker = forwardRef<YearPickerRef, YearPickerProps>(({
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
  format: dateFormat = 'yyyy',
  placeholder = '请选择年份',
  disabled = false,
  disabledYear,
  minDate,
  maxDate,
  yearRange = 10,
  className,
  inputClassName,
  dropdownClassName,
  name,
  error,
  errorMessage,
  showClear = true,
}, ref) => {
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

  /** 使用 useFloatingPosition 计算浮层位置 */
  const { x, y, placement: resolvedPlacement, update } = useFloatingPosition(triggerRef, dropdownRef, {
    enabled: isOpen,
    placement,
    offset,
    boundaryPadding: 8,
    flip: true,
    shift: true,
    autoUpdate: true,
    scrollCapture: true,
  })

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

  /** 当前显示的年份（用于滚动定位） */
  const [currentYear, setCurrentYear] = useState<Date>(() => {
    return actualValue || defaultValue || new Date()
  })

  /** 更新内部值当受控值变化时 */
  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
      if (actualValue) {
        setCurrentYear(actualValue)
      }
    }
  }, [actualValue])



  /** 当打开状态变化时，更新动画状态 */
  useEffect(() => {
    if (isOpen) {
      setShouldAnimate(false)
      requestAnimationFrame(() => {
        setShouldAnimate(true)
      })
    }
    else {
      setShouldAnimate(false)
    }
  }, [isOpen])

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

  /** 处理年份选择 */
  const handleYearSelect = useCallback((date: Date) => {
    setInternalValue(date)
    handleChangeVal(date, {} as any)
    if (isControlled) {
      onOpenChange?.(false)
    }
    else {
      setInternalOpen(false)
    }
  }, [handleChangeVal, isControlled, onOpenChange])

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

  /** 处理年份范围切换 */
  const handleYearRangeChange = useCallback((direction: 'prev' | 'next') => {
    const range = yearRange * 2 + 1 // 总年份数
    const newYear = direction === 'prev'
      ? subtractYear(currentYear, range)
      : addYear(currentYear, range)

    if (minDate && isBefore(newYear, minDate))
      return
    if (maxDate && isAfter(newYear, maxDate))
      return

    setCurrentYear(newYear)
  }, [currentYear, yearRange, minDate, maxDate])

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
  const displayValue = formatDate(internalValue, dateFormat)

  const currentYearNum = getYear(currentYear)
  const canGoPrev = !minDate || !isBefore(subtractYear(currentYear, yearRange * 2 + 1), minDate)
  const canGoNext = !maxDate || !isAfter(addYear(currentYear, yearRange * 2 + 1), maxDate)

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
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 50,
      } }
    >
      <div
        ref={ dropdownRef }
        className={ cn(
          'bg-background border border-border rounded-lg shadow-lg p-4 min-w-72',
          dropdownClassName,
        ) }
      >
        {/* 年份范围切换头部 */ }
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            disabled={ !canGoPrev }
            onClick={ () => handleYearRangeChange('prev') }
            aria-label="上一组年份"
            leftIcon={ <ChevronLeft className="h-4 w-4 text-textPrimary" /> }
          />

          <div className="text-sm font-semibold text-textPrimary">
            { getYear(subtractYear(currentYear, yearRange)) }
            { ' ' }
            -
            { getYear(addYear(currentYear, yearRange)) }
          </div>

          <Button
            variant="ghost"
            iconOnly
            size="sm"
            disabled={ !canGoNext }
            onClick={ () => handleYearRangeChange('next') }
            aria-label="下一组年份"
            leftIcon={ <ChevronRight className="h-4 w-4 text-textPrimary" /> }
          />
        </div>

        {/* 年份网格 */ }
        <YearGrid
          currentYear={ currentYear }
          selectedYear={ internalValue }
          onSelect={ handleYearSelect }
          disabledYear={ disabledYear }
          minDate={ minDate }
          maxDate={ maxDate }
          yearRange={ yearRange }
        />
      </div>
    </AnimateShow>
  )

  return (
    <>
      { trigger
        ? (
            <div
              ref={ triggerRef }
              className={ cn('inline-block', className) }
              onClick={ handleTriggerClick }
            >
              { trigger }
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
                  { displayValue || placeholder }
                </span>
                { showClear && displayValue && !disabled && (
                  <Button
                    variant="ghost"
                    iconOnly
                    size={ 16 }
                    onClick={ handleClear }
                    aria-label="清除"
                    className="ml-2"
                    leftIcon={ <X className="h-3 w-3 text-textSecondary" /> }
                  />
                ) }
              </div>
            </div>
          ) }
      { createPortal(dropdownContent, document.body) }
      { actualError && actualErrorMessage && (
        <div className="mt-1 text-xs text-danger">
          { actualErrorMessage }
        </div>
      ) }
    </>
  )
})

InnerYearPicker.displayName = 'YearPicker'

export const YearPicker = memo(InnerYearPicker) as typeof InnerYearPicker
