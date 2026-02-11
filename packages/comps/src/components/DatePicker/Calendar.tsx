'use client'

import type { CalendarProps } from './types'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
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
  use12Hours = false,
  selectingType,
  onSelectingTypeChange,
  onTimeChange,
  onConfirm,
  onMouseLeave,
  yearRange,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
  timeIcon,
  extraFooter,
  renderCell,
  minuteStep = 1,
}) => {
  /**
   * Calendar 组件完全受控，使用外部传入的 currentMonth
   * 如果没有传入，则根据 selectedDate 或 selectedRange 计算默认值
   */
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
    <div
      className={ cn('w-full flex flex-col', className) }
      onMouseLeave={ onMouseLeave }
    >
      <div
        className="flex-1 gap-4 flex flex-col"
        onMouseLeave={ () => onDateHover?.(null) }
      >
        <CalendarHeader
          currentMonth={ currentMonth }
          onMonthChange={ handleMonthChange }
          minDate={ minDate }
          maxDate={ maxDate }
          yearRange={ yearRange }
          prevIcon={ prevIcon }
          nextIcon={ nextIcon }
          superPrevIcon={ superPrevIcon }
          superNextIcon={ superNextIcon }
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
          renderCell={ renderCell }
        />

        { showTimePicker && (
          <TimePicker
            value={ timeValue }
            onChange={ handleTimeChange }
            precision={ precision }
            use12Hours={ use12Hours }
            onConfirm={ onConfirm }
            timeIcon={ timeIcon }
            minuteStep={ minuteStep }
          />
        ) }

        { extraFooter && (
          <div className="mt-4 border-t border-border pt-4">
            { extraFooter }
          </div>
        ) }
      </div>
    </div>
  )
})

Calendar.displayName = 'Calendar'
