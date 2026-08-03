import type { DateSpanPickerValue } from '../types'
import { useLatestCallback } from 'hooks'
import { useEffect, useState } from 'react'
import { getInitialDate, isAfter, isSameDate } from '../utils'

/** 管理单日与连续日期段共用的日历草稿和点选规则 */
export function useDateSpanSelection({
  externalValue,
  initialValue,
  onChange,
  onDraftChange,
}: UseDateSpanSelectionOptions): UseDateSpanSelectionReturn {
  const [value, setValue] = useState<DateSpanPickerValue>(initialValue)
  const [tempDate, setTempDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => getInitialDate(value.start, value.end))

  useEffect(() => {
    if (externalValue === undefined)
      return

    setValue(externalValue)
    if (externalValue.start)
      setCurrentMonth(externalValue.start)
  }, [externalValue])

  const updateValue = useLatestCallback((nextValue: DateSpanPickerValue) => {
    setValue(nextValue)
    onChange(nextValue)
    onDraftChange()
  })

  /**
   * 一个日历同时表达单日与区间：空 → 单日 → 区间 → 新单日；点单日自身则清空
   */
  const selectDate = useLatestCallback((date: Date) => {
    const { start, end } = value

    if (!start) {
      updateValue({ start: date, end: null })
      return
    }

    if (!end) {
      if (isSameDate(start, date)) {
        updateValue(EMPTY_DATE_SPAN)
        return
      }

      updateValue(isAfter(start, date)
        ? { start: date, end: start }
        : { start, end: date })
      return
    }

    updateValue({ start: date, end: null })
  })

  const clear = useLatestCallback(() => {
    updateValue(EMPTY_DATE_SPAN)
    setTempDate(null)
  })

  const restore = useLatestCallback((nextValue: DateSpanPickerValue) => {
    setValue(nextValue)
    onChange(nextValue)
  })

  const endSession = useLatestCallback(() => setTempDate(null))

  return {
    value,
    tempDate,
    currentMonth,
    setTempDate,
    setCurrentMonth,
    selectDate,
    clear,
    restore,
    endSession,
  }
}

const EMPTY_DATE_SPAN: DateSpanPickerValue = {
  start: null,
  end: null,
}

type UseDateSpanSelectionOptions = {
  externalValue: DateSpanPickerValue | undefined
  initialValue: DateSpanPickerValue
  onChange: (value: DateSpanPickerValue) => void
  onDraftChange: () => void
}

type UseDateSpanSelectionReturn = {
  value: DateSpanPickerValue
  tempDate: Date | null
  currentMonth: Date
  setTempDate: (date: Date | null) => void
  setCurrentMonth: (date: Date) => void
  selectDate: (date: Date) => void
  clear: () => void
  restore: (value: DateSpanPickerValue) => void
  endSession: () => void
}
