'use client'

import type { CalendarProps } from './types'
import { Clock } from 'lucide-react'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'
import { DATA_DATE_PICKER_IGNORE } from './constants'
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
  onAddTime,
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
  const t = useT()
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

  const TimeIcon = timeIcon || <Clock className="size-3.5 text-iconColor" />

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
            timeIcon={ TimeIcon }
            minuteStep={ minuteStep }
          />
        ) }

        { !showTimePicker && (
          <div
            className="flex items-center justify-between"
            { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
          >
            { onAddTime && <Button
              variant="secondary"
              className="border-none text-text3"
              onClick={ () => onAddTime?.() }
              leftIcon={ TimeIcon }
            >
              { t('datePicker.addTime') || 'Add Time' }
            </Button>}

            <Button variant="primary" onClick={ onConfirm }>
              { t('datePicker.confirm') || '确认' }
            </Button>
          </div>
        ) }

        { extraFooter }
      </div>
    </div>
  )
})

Calendar.displayName = 'Calendar'
