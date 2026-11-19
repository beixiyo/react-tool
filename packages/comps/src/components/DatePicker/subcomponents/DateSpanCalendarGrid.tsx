'use client'

import { useI18n } from 'i18n/react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../../i18n'
import { chunkRows, useCalendarGridNavigation } from '../hooks'
import type { DateSpanPickerValue } from '../types'
import {
  getCalendarDays,
  getMonthEnd,
  getValidDateRange,
  getWeekdayLabels,
  isAfter,
  isBefore,
  isDateDisabled,
  isDateInCurrentMonth,
  isDateInRangeSelection,
  isDateToday,
  isSameDate,
} from '../utils'
import { formatDate } from '../utils/value'
import { CalendarCell } from './CalendarCell'

/** DateSpanPicker 专用网格：单日是独立选择态，完整区间才显示 Start / End */
export const DateSpanCalendarGrid = memo<DateSpanCalendarGridProps>(({
  currentMonth,
  value,
  tempDate,
  onSelect,
  onDateHover,
  disabledDate,
  minDate,
  maxDate,
  weekStartsOn = 1,
  enableRangeHoverPreview = true,
  renderCell,
  onMonthChange,
  className,
  onKeyDown: externalOnKeyDown,
  ...restProps
}) => {
  const { i18n } = useI18n()
  const t = useT()
  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth, weekStartsOn),
    [currentMonth, weekStartsOn],
  )
  const weekdayLabels = useMemo(() => {
    const resources = i18n.getResources() as any
    const labels = resources?.comps?.datePicker?.weekdays
    return getWeekdayLabels(
      weekStartsOn,
      Array.isArray(labels)
        ? labels
        : undefined,
    )
  }, [i18n, weekStartsOn])

  const effectiveRange = useMemo(() => {
    if (!value.start) return null

    if (value.end) return value

    if (tempDate && !isSameDate(value.start, tempDate)) return getValidDateRange(value.start, tempDate)

    return null
  }, [tempDate, value])

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date, disabledDate, minDate, maxDate)) onSelect(date)
  }

  const { onKeyDown, getCellNavProps } = useCalendarGridNavigation({
    currentMonth,
    calendarDays,
    selectedDate: value.start,
    isDisabled: (date) => isDateDisabled(date, disabledDate, minDate, maxDate),
    weekStartsOn,
    onMonthChange,
    onActiveDateChange: enableRangeHoverPreview
      ? onDateHover
      : undefined,
  })

  const weeks = useMemo(() => chunkRows(calendarDays, 7), [calendarDays])

  const hasConfirmedRange = !!(value.start && value.end)
  const isSingleDate = !!(value.start && !value.end)

  return (
    <div
      role="grid"
      aria-label={ formatDate(currentMonth, 'yyyy-MM') }
      { ...restProps }
      className={ cn('w-full flex flex-col gap-4', className) }
      onKeyDown={ (event) => {
        externalOnKeyDown?.(event)
        if (!event.defaultPrevented) onKeyDown(event)
      } }
    >
      <div role="row" className="grid grid-cols-7 gap-1">
        { weekdayLabels.map((label) => (
          <div
            key={ label }
            role="columnheader"
            className="flex h-5 items-center justify-center text-[10px] text-text3"
          >
            { label }
          </div>
        )) }
      </div>

      <div role="rowgroup" className="flex flex-col gap-y-1.5">
        { weeks.map((week) => (
          <div key={ week[0].toISOString() } role="row" className="grid grid-cols-7 gap-x-0">
            { week.map((date, index) => {
              const isCurrentMonth = isDateInCurrentMonth(date, currentMonth)
              const isPreviousMonth = !isCurrentMonth && isBefore(date, currentMonth)
              const isNextMonth = !isCurrentMonth && isAfter(date, getMonthEnd(currentMonth))
              const isInRange = effectiveRange
                ? isDateInRangeSelection(date, effectiveRange)
                : false
              const visualRangePosition = isInRange && effectiveRange
                ? isSameDate(date, effectiveRange.start)
                  ? 'start'
                  : isSameDate(date, effectiveRange.end)
                  ? 'end'
                  : 'middle'
                : undefined

              return (
                <CalendarCell
                  key={ date.toISOString() }
                  date={ date }
                  isCurrentMonth={ isCurrentMonth }
                  isPreviousMonth={ isPreviousMonth }
                  isNextMonth={ isNextMonth }
                  isToday={ isDateToday(date) }
                  isSelected={ isSingleDate && isSameDate(date, value.start) }
                  isDisabled={ isDateDisabled(date, disabledDate, minDate, maxDate) }
                  isRangeStart={ hasConfirmedRange && isSameDate(date, value.start) }
                  isRangeEnd={ hasConfirmedRange && isSameDate(date, value.end) }
                  isTempStart={ !!(tempDate && effectiveRange && isSameDate(tempDate, effectiveRange.start)) }
                  isTempEnd={ !!(tempDate && effectiveRange && isSameDate(tempDate, effectiveRange.end)) }
                  isInRange={ isInRange }
                  visualRangePosition={ visualRangePosition }
                  isWeekStart={ index === 0 }
                  isWeekEnd={ index === 6 }
                  rangeStartLabel={ t('datePicker.rangeStart') }
                  rangeEndLabel={ t('datePicker.rangeEnd') }
                  onClick={ () => handleDateClick(date) }
                  onMouseEnter={ enableRangeHoverPreview
                    ? () => onDateHover(date)
                    : undefined }
                  renderCell={ renderCell }
                  { ...getCellNavProps(date) }
                />
              )
            }) }
          </div>
        )) }
      </div>
    </div>
  )
})

DateSpanCalendarGrid.displayName = 'DateSpanCalendarGrid'

type DateSpanCalendarGridProps = {
  currentMonth: Date
  value: DateSpanPickerValue
  tempDate: Date | null
  onSelect: (date: Date) => void
  onDateHover: (date: Date | null) => void
  disabledDate?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  enableRangeHoverPreview?: boolean
  renderCell?: (date: Date) => React.ReactNode
  /** 键盘导航跨月时请求切换显示月份 */
  onMonthChange?: (month: Date) => void
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'onSelect'>
