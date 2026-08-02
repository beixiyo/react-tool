import type { DatePrecision, DateRangePickerValue } from '../types'
import { useLatestCallback } from 'hooks'
import { useEffect, useState } from 'react'
import { getInitialDate, isAfter, isBefore, preserveTimeFromDate } from '../utils'

/** 管理日期范围草稿、当前端点、悬停预览和日历月份 */
export function useDateRangeSelection({
  externalValue,
  initialValue,
  precision,
  onChange,
  onDraftChange,
}: UseDateRangeSelectionOptions): UseDateRangeSelectionReturn {
  const [value, setValue] = useState<DateRangePickerValue>(initialValue)
  const [selectingType, setSelectingType] = useState<DateRangeSelectingType>('start')
  const [tempDate, setTempDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => getInitialDate(value.start, value.end))

  useEffect(() => {
    if (externalValue === undefined)
      return

    setValue(externalValue)
    if (externalValue.start)
      setCurrentMonth(externalValue.start)
    else if (externalValue.end)
      setCurrentMonth(externalValue.end)
  }, [externalValue])

  const updateValue = useLatestCallback((nextValue: DateRangePickerValue) => {
    setValue(nextValue)
    onChange(nextValue)
    onDraftChange()
  })

  const selectDate = useLatestCallback((date: Date): DateRangeSelectionResult => {
    const nextValue = { ...value }
    if (selectingType === 'start') {
      nextValue.start = preserveTimeFromDate(date, value.start, precision)
      if (nextValue.end && isAfter(nextValue.start, nextValue.end))
        nextValue.end = null
      if (precision === 'day')
        setSelectingType('end')
    }
    else {
      nextValue.end = preserveTimeFromDate(date, value.end || value.start, precision)
      if (nextValue.start && isBefore(nextValue.end, nextValue.start))
        [nextValue.start, nextValue.end] = [nextValue.end, nextValue.start]
    }

    updateValue(nextValue)
    return {
      value: nextValue,
      completedDayRange: selectingType === 'end' && precision === 'day',
    }
  })

  const clear = useLatestCallback(() => {
    updateValue({ start: null, end: null })
    setTempDate(null)
    setSelectingType('start')
  })

  const changeTime = useLatestCallback((date: Date) => {
    updateValue({
      ...value,
      [selectingType]: date,
    })
  })

  const restore = useLatestCallback((nextValue: DateRangePickerValue) => {
    setValue(nextValue)
    onChange(nextValue)
  })

  const endSession = useLatestCallback(() => setTempDate(null))

  return {
    value,
    selectingType,
    tempDate,
    currentMonth,
    setSelectingType,
    setTempDate,
    setCurrentMonth,
    selectDate,
    clear,
    changeTime,
    restore,
    endSession,
  }
}

type UseDateRangeSelectionOptions = {
  externalValue: DateRangePickerValue | undefined
  initialValue: DateRangePickerValue
  precision: DatePrecision
  onChange: (value: DateRangePickerValue) => void
  onDraftChange: () => void
}

type UseDateRangeSelectionReturn = {
  value: DateRangePickerValue
  selectingType: DateRangeSelectingType
  tempDate: Date | null
  currentMonth: Date
  setSelectingType: (type: DateRangeSelectingType) => void
  setTempDate: (date: Date | null) => void
  setCurrentMonth: (date: Date) => void
  selectDate: (date: Date) => DateRangeSelectionResult
  clear: () => void
  changeTime: (date: Date) => void
  restore: (value: DateRangePickerValue) => void
  endSession: () => void
}

type DateRangeSelectionResult = {
  value: DateRangePickerValue
  completedDayRange: boolean
}

type DateRangeSelectingType = 'start' | 'end'
