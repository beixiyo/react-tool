'use client'

import type { CalendarProps } from './types'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
import { Button, ButtonGroup } from '../Button'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'
import { TimePicker } from './TimePicker'

export const Calendar = memo<CalendarProps>(({
  currentMonth: externalCurrentMonth,
  onCurrentMonthChange,
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
  selectingType,
  onSelectingTypeChange,
  onTimeChange,
}) => {
  // Calendar 组件完全受控，使用外部传入的 currentMonth
  /** 如果没有传入，则根据 selectedDate 或 selectedRange 计算默认值 */
  const currentMonth = externalCurrentMonth
    || selectedDate
    || selectedRange?.start
    || new Date()

  // CalendarHeader 会调用 onMonthChange，通过 onCurrentMonthChange 回调给父组件
  const handleMonthChange = useCallback((date: Date) => {
    onCurrentMonthChange?.(date)
  }, [onCurrentMonthChange])

  /** 处理时间变更 */
  const handleTimeChange = useCallback((date: Date) => {
    if (onTimeChange) {
      onTimeChange(date)
    }
    else if (onSelect) {
      onSelect(date)
    }
  }, [onTimeChange, onSelect])

  /** 判断是否需要显示时间选择器（精度包含时间时显示） */
  const showTimePicker = precision === 'hour' || precision === 'minute' || precision === 'second'

  /** 确定时间选择器的值 */
  let timeValue = new Date()
  if (rangeMode) {
    /** 范围模式：优先使用正在编辑的一侧的时间 */
    if (selectingType === 'start' && selectedRange?.start) {
      timeValue = selectedRange.start
    }
    else if (selectingType === 'end' && selectedRange?.end) {
      timeValue = selectedRange.end
    }
    /** 降级逻辑 */
    else if (selectedRange?.end) {
      timeValue = selectedRange.end
    }
    else if (selectedRange?.start) {
      timeValue = selectedRange.start
    }
  }
  else {
    /** 单日期模式 */
    timeValue = selectedDate || new Date()
  }

  return (
    <div className={ cn('w-full flex flex-col', className) }>
      { rangeMode && (
        <div className="flex border-b border-border p-2 bg-background">
          <ButtonGroup
            active={ selectingType }
            onChange={ val => onSelectingTypeChange?.(val as 'start' | 'end') }
            className="w-full"
            rounded="lg"
          >
            <Button name="start" className="flex-1 text-xs">
              开始日期
            </Button>
            <Button name="end" className="flex-1 text-xs">
              结束日期
            </Button>
          </ButtonGroup>
        </div>
      ) }
      <div className="flex">
        <div
          className="flex-1 p-4"
          onMouseLeave={ () => onDateHover?.(null) }
        >
          <CalendarHeader
            currentMonth={ currentMonth }
            onMonthChange={ handleMonthChange }
            minDate={ minDate }
            maxDate={ maxDate }
          />
          <CalendarGrid
            currentMonth={ currentMonth }
            selectedDate={ selectedDate }
            onSelect={ onSelect }
            disabledDate={ disabledDate }
            minDate={ minDate }
            maxDate={ maxDate }
            weekStartsOn={ weekStartsOn }
            rangeMode={ rangeMode }
            selectedRange={ selectedRange }
            selectingType={ selectingType }
            onSelectingTypeChange={ onSelectingTypeChange }
            tempDate={ tempDate }
            onDateHover={ onDateHover }
          />
        </div>
        { showTimePicker && (
          <TimePicker
            value={ timeValue }
            onChange={ handleTimeChange }
            precision={ precision }
          />
        ) }
      </div>
    </div>
  )
})

Calendar.displayName = 'Calendar'
