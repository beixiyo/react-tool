'use client'

import type { DateSpanPickerValue } from './types'
import { useI18n } from 'i18n/react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { CalendarCell } from './CalendarCell'
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
} from './utils'

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
  className,
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
    return getWeekdayLabels(weekStartsOn, Array.isArray(labels)
      ? labels
      : undefined)
  }, [i18n, weekStartsOn])

  const effectiveRange = useMemo(() => {
    if (!value.start)
      return null

    if (value.end)
      return value

    if (tempDate && !isSameDate(value.start, tempDate))
      return getValidDateRange(value.start, tempDate)

    return null
  }, [tempDate, value])

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date, disabledDate, minDate, maxDate))
      onSelect(date)
  }

  const hasConfirmedRange = !!(value.start && value.end)
  const isSingleDate = !!(value.start && !value.end)

  return (
    <div { ...restProps } className={ cn('w-full flex flex-col gap-4', className) }>
      <div className="grid grid-cols-7 gap-1">
        { weekdayLabels.map(label => (
          <div
            key={ label }
            className="flex h-5 items-center justify-center text-[10px] text-text3"
          >
            { label }
          </div>
        )) }
      </div>

      <div className="grid grid-cols-7 gap-x-0 gap-y-1.5">
        { calendarDays.map((date, index) => {
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
              isWeekStart={ index % 7 === 0 }
              isWeekEnd={ index % 7 === 6 }
              rangeStartLabel={ t('datePicker.rangeStart') }
              rangeEndLabel={ t('datePicker.rangeEnd') }
              onClick={ () => handleDateClick(date) }
              onMouseEnter={ enableRangeHoverPreview
                ? () => onDateHover(date)
                : undefined }
              renderCell={ renderCell }
            />
          )
        }) }
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
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'>
