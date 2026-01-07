'use client'

import type { CalendarGridProps } from './types'
import { memo, useMemo } from 'react'
import { CalendarCell } from './CalendarCell'
import {
  getCalendarDays,
  getWeekdayLabels,
  isDateDisabled,
  isDateInCurrentMonth,
  isDateToday,
  isSameDate,
} from './utils'

export const CalendarGrid = memo<CalendarGridProps>(({
  currentMonth,
  selectedDate,
  onSelect,
  disabledDate,
  minDate,
  maxDate,
  weekStartsOn = 1,
}) => {
  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth, weekStartsOn),
    [currentMonth, weekStartsOn],
  )

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(weekStartsOn),
    [weekStartsOn],
  )

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date, disabledDate, minDate, maxDate))
      return
    onSelect?.(date)
  }

  return (
    <div className="w-full">
      {/* 星期标题行 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayLabels.map(label => (
          <div
            key={ label }
            className="flex h-8 items-center justify-center text-xs font-medium text-textSecondary"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const isCurrentMonth = isDateInCurrentMonth(date, currentMonth)
          const isSelected = isSameDate(date, selectedDate)
          const isToday = isDateToday(date)
          const isDisabled = isDateDisabled(date, disabledDate, minDate, maxDate)

          return (
            <CalendarCell
              key={ date.toISOString() }
              date={ date }
              isCurrentMonth={ isCurrentMonth }
              isToday={ isToday }
              isSelected={ isSelected }
              isDisabled={ isDisabled }
              onClick={ () => handleDateClick(date) }
            />
          )
        })}
      </div>
    </div>
  )
})

CalendarGrid.displayName = 'CalendarGrid'
