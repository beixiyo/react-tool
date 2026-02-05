'use client'

import type { CalendarGridProps } from './types'
import { useI18n } from 'i18n/react'
import { memo, useMemo } from 'react'
import { CalendarCell } from './CalendarCell'
import {
  getCalendarDays,
  getValidDateRange,
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
  selectingType,
  tempDate,
  onDateHover,
}) => {
  const { i18n } = useI18n()

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth, weekStartsOn),
    [currentMonth, weekStartsOn],
  )

  const weekdayLabels = useMemo(() => {
    const resources = i18n.getResources() as any
    const labels = resources?.datePicker?.weekdays
    return getWeekdayLabels(weekStartsOn, Array.isArray(labels) ? labels : undefined)
  }, [weekStartsOn, i18n])

  /** 计算范围（如果正在选择范围，使用临时日期） */
  const effectiveRange = useMemo(() => {
    if (!rangeMode || !selectedRange)
      return null

    /** 如果有正在编辑的类型且有临时日期 */
    if (tempDate && selectingType) {
      if (selectingType === 'start') {
        /** 正在编辑开始日期，范围是从临时日期到原来的结束日期 */
        return getValidDateRange(tempDate, selectedRange.end)
      }
      else {
        /** 正在编辑结束日期，范围是从原来的开始日期到临时日期 */
        return getValidDateRange(selectedRange.start, tempDate)
      }
    }

    if (tempDate && selectedRange.start && !selectedRange.end) {
      /** 正在选择结束日期 */
      return {
        start: selectedRange.start,
        end: tempDate,
      }
    }
    return selectedRange
  }, [rangeMode, selectedRange, tempDate, selectingType])

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

          /** 单个日期选择模式 */
          const isSelected = !rangeMode && isSameDate(date, selectedDate)

          /** 范围选择模式（已确认的起点和终点） */
          const isRangeStartDate = rangeMode && selectedRange
            ? isRangeStart(date, selectedRange)
            : false
          const isRangeEndDate = rangeMode && selectedRange
            ? isRangeEnd(date, selectedRange)
            : false
          /** 预览中的范围 */
          const isInRange = rangeMode && effectiveRange
            ? isDateInRangeSelection(date, effectiveRange)
            : false

          /** 临时点（当前悬停或正在移动的点） */
          const isTempStartDate = rangeMode && tempDate && selectingType === 'start' && isSameDate(date, tempDate)
          const isTempEndDate = rangeMode && tempDate && (selectingType === 'end' || (!selectedRange?.end && !selectingType)) && isSameDate(date, tempDate)

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
              isTempStart={ isTempStartDate || undefined }
              isTempEnd={ isTempEndDate || undefined }
              isInRange={ isInRange }
              onClick={ () => handleDateClick(date) }
              onMouseEnter={ rangeMode && onDateHover
                ? () => onDateHover(date)
                : undefined }
            />
          )
        })}
      </div>
    </div>
  )
})

CalendarGrid.displayName = 'CalendarGrid'
