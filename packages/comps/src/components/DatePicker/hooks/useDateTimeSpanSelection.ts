import type { DatePrecision, DateTimeSpanPickerValue } from '../types'
import { addMilliseconds, addMinutes } from 'date-fns'
import { useLatestCallback } from 'hooks'
import { useEffect, useState } from 'react'
import { getInitialDate, isAfter, isSameDate, preserveTimeFromDate } from '../utils'

/** 管理全天 / 时刻模式及单日、日期段的统一草稿 */
export function useDateTimeSpanSelection({
  externalValue,
  initialValue,
  precision,
  syncEndTimeWithStart = false,
  onChange,
  onDraftChange,
}: UseDateTimeSpanSelectionOptions): UseDateTimeSpanSelectionReturn {
  const [value, setValue] = useState<DateTimeSpanPickerValue>(normalizeValue(initialValue))
  const [tempDate, setTempDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => getInitialDate(value.start, value.end))

  useEffect(() => {
    if (externalValue === undefined)
      return

    const nextValue = normalizeValue(externalValue)
    setValue(nextValue)
    if (nextValue.start)
      setCurrentMonth(nextValue.start)
  }, [externalValue])

  const updateValue = useLatestCallback((nextValue: DateTimeSpanPickerValue) => {
    const normalized = normalizeValue(nextValue)
    setValue(normalized)
    onChange(normalized)
    onDraftChange()
  })

  /** 空 → 单日 → 区间 → 新单日；再次点当前单日清空 */
  const selectDate = useLatestCallback((date: Date) => {
    const { start, end, hasTime } = value
    const hasDateRange = !!(start && end && !isSameDate(start, end))

    if (!start) {
      updateValue({
        start: hasTime
          ? preserveTimeFromDate(date, getCurrentMinute(), precision)
          : startOfDay(date),
        end: null,
        hasTime,
      })
      return
    }

    if (!hasDateRange) {
      if (isSameDate(start, date)) {
        updateValue(EMPTY_DATE_TIME_SPAN)
        return
      }

      const nextStart = preserveDate(date, start, hasTime, precision)
      const nextEnd = preserveDate(date, end ?? start, hasTime, precision)
      updateValue(isAfter(start, nextStart)
        ? { start: nextStart, end: start, hasTime }
        : { start, end: nextEnd, hasTime })
      return
    }

    updateValue({
      start: preserveDate(date, start, hasTime, precision),
      end: null,
      hasTime,
    })
  })

  /** 从底部 Add time 进入时刻布局；没有日期时自动选今天 */
  const addTime = useLatestCallback(() => {
    if (value.hasTime)
      return

    const now = getCurrentMinute()
    updateValue({
      start: value.start
        ? preserveTimeFromDate(value.start, now, precision)
        : now,
      end: value.end
        ? preserveTimeFromDate(value.end, now, precision)
        : null,
      hasTime: true,
    })
  })

  /** 清除时刻，但保留当前单日或日期段 */
  const clearTime = useLatestCallback(() => {
    if (!value.hasTime)
      return

    updateValue({
      start: value.start && startOfDay(value.start),
      end: value.end && startOfDay(value.end),
      hasTime: false,
    })
  })

  const changeStartTime = useLatestCallback((start: Date) => {
    const end = syncEndTimeWithStart && value.start && value.end && value.end.getTime() >= value.start.getTime()
      ? shiftEndTime(value.start, value.end, start)
      : value.end
    updateValue({ ...value, start, end, hasTime: true })
  })

  const changeEndTime = useLatestCallback((end: Date) => {
    updateValue({ ...value, end, hasTime: true })
  })

  const addEndTime = useLatestCallback(() => {
    if (!value.start || !value.hasTime || value.end)
      return

    const proposedEnd = addMinutes(value.start, 15)
    updateValue({
      ...value,
      end: isSameDate(value.start, proposedEnd)
        ? proposedEnd
        : getLastMinuteOfDay(value.start),
    })
  })

  const clear = useLatestCallback(() => {
    updateValue(EMPTY_DATE_TIME_SPAN)
    setTempDate(null)
  })

  const restore = useLatestCallback((nextValue: DateTimeSpanPickerValue) => {
    const normalized = normalizeValue(nextValue)
    setValue(normalized)
    onChange(normalized)
  })

  const endSession = useLatestCallback(() => setTempDate(null))

  return {
    value,
    tempDate,
    currentMonth,
    setTempDate,
    setCurrentMonth,
    selectDate,
    addTime,
    clearTime,
    changeStartTime,
    changeEndTime,
    addEndTime,
    clear,
    restore,
    endSession,
  }
}

const EMPTY_DATE_TIME_SPAN: DateTimeSpanPickerValue = {
  start: null,
  end: null,
  hasTime: false,
}

function normalizeValue(value: DateTimeSpanPickerValue): DateTimeSpanPickerValue {
  if (!value.start || value.hasTime || !value.end || !isSameDate(value.start, value.end))
    return value

  return { ...value, end: null }
}

function preserveDate(date: Date, source: Date, hasTime: boolean, precision: DatePrecision): Date {
  return hasTime
    ? preserveTimeFromDate(date, source, precision)
    : startOfDay(date)
}

function getCurrentMinute(): Date {
  const now = new Date()
  now.setSeconds(0, 0)
  return now
}

function startOfDay(date: Date): Date {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

function getLastMinuteOfDay(date: Date): Date {
  const lastMinute = new Date(date)
  lastMinute.setHours(23, 59, 0, 0)
  return lastMinute
}

type UseDateTimeSpanSelectionOptions = {
  externalValue: DateTimeSpanPickerValue | undefined
  initialValue: DateTimeSpanPickerValue
  precision: DatePrecision
  syncEndTimeWithStart?: boolean
  onChange: (value: DateTimeSpanPickerValue) => void
  onDraftChange: () => void
}

type UseDateTimeSpanSelectionReturn = {
  value: DateTimeSpanPickerValue
  tempDate: Date | null
  currentMonth: Date
  setTempDate: (date: Date | null) => void
  setCurrentMonth: (date: Date) => void
  selectDate: (date: Date) => void
  addTime: () => void
  clearTime: () => void
  changeStartTime: (date: Date) => void
  changeEndTime: (date: Date) => void
  addEndTime: () => void
  clear: () => void
  restore: (value: DateTimeSpanPickerValue) => void
  endSession: () => void
}

/** 保持 Start / End 原有的完整持续时长，可自然跨日。 */
function shiftEndTime(previousStart: Date, previousEnd: Date, nextStart: Date): Date {
  const duration = previousEnd.getTime() - previousStart.getTime()
  return addMilliseconds(nextStart, duration)
}
