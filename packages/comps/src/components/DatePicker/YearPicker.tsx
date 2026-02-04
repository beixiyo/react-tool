'use client'

import type { YearPickerProps, YearPickerRef } from './types'
import { useShortCutKey } from 'hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { forwardRef, memo, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { AnimateShow } from '../Animate'
import { Button } from '../Button'
import { useFormField } from '../Form/useFormField'
import { PickerInput } from './components/PickerInput'
import { useClickOutside } from './hooks/useClickOutside'
import { usePickerFloating } from './hooks/usePickerFloating'
import { usePickerState } from './hooks/usePickerState'
import { addYear, formatDate, getInitialDate, getYear, isAfter, isBefore, isDateEqual, subtractYear } from './utils'
import { YearGrid } from './YearGrid'

const InnerYearPicker = forwardRef<YearPickerRef, YearPickerProps>(({
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
  format: dateFormat = 'yyyy',
  placeholder: propsPlaceholder,
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
  icon,
}, ref) => {
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
    isOpen,
    setOpen,
    handleTriggerClick: baseHandleTriggerClick,
  } = usePickerState({
    open: controlledOpen,
    onOpenChange,
    disabled,
    ref,
  })

  const t = useT()
  const placeholder = propsPlaceholder ?? t('datePicker.yearPlaceholder')

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
  const [internalValue, setInternalValue] = useState<Date | null>(() => {
    if (actualValue !== undefined)
      return actualValue
    if (defaultValue !== undefined)
      return defaultValue
    return null
  })

  /** 当前显示的年份（用于滚动定位） */
  const [currentYear, setCurrentYear] = useState<Date>(() => {
    return getInitialDate(actualValue, defaultValue)
  })

  /** 记录打开时的初始值，用于在关闭时判断是否有变化 */
  const initialValueRef = useRef<Date | null>(null)

  /** 更新内部值当受控值变化时 */
  useEffect(() => {
    if (actualValue !== undefined) {
      setInternalValue(actualValue)
      if (actualValue) {
        setCurrentYear(actualValue)
      }
    }
  }, [actualValue])

  /** 当打开状态变化时，记录初始值或触发确认事件 */
  useEffect(() => {
    if (isOpen) {
      /** 打开时记录当前值 */
      initialValueRef.current = internalValue
    }
    else {
      /** 关闭时，如果值有变化且存在 onConfirm 回调，则触发 */
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

  /** 处理年份选择 */
  const handleYearSelect = useCallback((date: Date) => {
    setInternalValue(date)
    handleChangeVal(date, undefined as any)
    setOpen(false)
  }, [handleChangeVal, setOpen])

  /** 处理清除 */
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setInternalValue(null)
    handleChangeVal(null, undefined as any)
  }, [handleChangeVal])

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

  /** 显示的值 */
  const displayValue = formatDate(internalValue, dateFormat)

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
        ...style,
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
            aria-label={ t('datePicker.prevYearRange') }
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
            aria-label={ t('datePicker.nextYearRange') }
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
