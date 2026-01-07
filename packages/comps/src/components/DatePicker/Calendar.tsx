'use client'

import type { CalendarProps } from './types'
import { memo, useCallback, useEffect, useState } from 'react'
import { cn } from 'utils'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'
import { TimePicker } from './TimePicker'

export const Calendar = memo<CalendarProps>(({
  currentMonth: externalCurrentMonth,
  selectedDate,
  onSelect,
  disabledDate,
  minDate,
  maxDate,
  className,
  weekStartsOn = 1,
  rangeMode = false,
  selectedRange,
  tempDate,
  onDateHover,
  precision = 'day',
  onTimeChange,
}) => {
  const [internalMonth, setInternalMonth] = useState(() => {
    return externalCurrentMonth || selectedDate || new Date()
  })

  useEffect(() => {
    if (externalCurrentMonth) {
      setInternalMonth(externalCurrentMonth)
    }
    else if (selectedDate) {
      setInternalMonth(selectedDate)
    }
    else if (selectedRange?.start) {
      setInternalMonth(selectedRange.start)
    }
  }, [externalCurrentMonth, selectedDate, selectedRange])

  const handleMonthChange = (date: Date) => {
    setInternalMonth(date)
  }

  // 处理时间变更
  const handleTimeChange = useCallback((date: Date) => {
    if (onTimeChange) {
      onTimeChange(date)
    }
    else if (onSelect) {
      onSelect(date)
    }
  }, [onTimeChange, onSelect])

  // 判断是否需要显示时间选择器（精度包含时间时显示）
  const showTimePicker = precision === 'hour' || precision === 'minute' || precision === 'second'

  // 确定时间选择器的值
  let timeValue = new Date()
  if (rangeMode) {
    // 范围模式：优先使用结束时间，如果没有则使用开始时间
    if (selectedRange?.end) {
      timeValue = selectedRange.end
    }
    else if (selectedRange?.start) {
      timeValue = selectedRange.start
    }
  }
  else {
    // 单日期模式
    timeValue = selectedDate || new Date()
  }

  return (
    <div className={ cn('w-full flex', className) }>
      <div className="flex-1 p-4">
        <CalendarHeader
          currentMonth={ internalMonth }
          onMonthChange={ handleMonthChange }
          minDate={ minDate }
          maxDate={ maxDate }
        />
        <CalendarGrid
          currentMonth={ internalMonth }
          selectedDate={ selectedDate }
          onSelect={ onSelect }
          disabledDate={ disabledDate }
          minDate={ minDate }
          maxDate={ maxDate }
          weekStartsOn={ weekStartsOn }
          rangeMode={ rangeMode }
          selectedRange={ selectedRange }
          tempDate={ tempDate }
          onDateHover={ onDateHover }
        />
      </div>
      {showTimePicker && (
        <TimePicker
          value={ timeValue }
          onChange={ handleTimeChange }
          precision={ precision }
        />
      )}
    </div>
  )
})

Calendar.displayName = 'Calendar'
