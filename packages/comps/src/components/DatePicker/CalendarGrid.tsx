'use client'

import type { CalendarGridProps } from './types'
import { memo, useMemo } from 'react'
import { CalendarCell } from './CalendarCell'
import {
  getCalendarDays,
  getWeekdayLabels,
  isDateDisabled,
  isDateInCurrentMonth,
  isDateInRangeSelection,
  isDateToday,
  isRangeEnd,
  isRangeStart,
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
  rangeMode = false,
  selectedRange,
  tempDate,
  onDateHover,
}) => {
  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth, weekStartsOn),
    [currentMonth, weekStartsOn],
  )

  const weekdayLabels = useMemo(
    () => getWeekdayLabels(weekStartsOn),
    [weekStartsOn],
  )

  // 计算范围（如果正在选择范围，使用临时日期）
  const effectiveRange = useMemo(() => {
    if (!rangeMode || !selectedRange)
      return null
    if (tempDate && selectedRange.start && !selectedRange.end) {
      // 正在选择结束日期
      return {
        start: selectedRange.start,
        end: tempDate,
      }
    }
    return selectedRange
  }, [rangeMode, selectedRange, tempDate])

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
          const isToday = isDateToday(date)
          const isDisabled = isDateDisabled(date, disabledDate, minDate, maxDate)

          // 单个日期选择模式
          const isSelected = !rangeMode && isSameDate(date, selectedDate)

          // 范围选择模式
          const isRangeStartDate = rangeMode && effectiveRange ? isRangeStart(date, effectiveRange) : false
          const isRangeEndDate = rangeMode && effectiveRange ? isRangeEnd(date, effectiveRange) : false
          const isInRange = rangeMode && effectiveRange ? isDateInRangeSelection(date, effectiveRange) : false

          return (
            <CalendarCell
              key={ date.toISOString() }
              date={ date }
              isCurrentMonth={ isCurrentMonth }
              isToday={ isToday }
              isSelected={ isSelected }
              isDisabled={ isDisabled }
              isRangeStart={ isRangeStartDate }
              isRangeEnd={ isRangeEndDate }
              isInRange={ isInRange }
              onClick={ () => handleDateClick(date) }
              onMouseEnter={ rangeMode && onDateHover ? () => onDateHover(date) : undefined }
            />
          )
        })}
      </div>
    </div>
  )
})

CalendarGrid.displayName = 'CalendarGrid'
