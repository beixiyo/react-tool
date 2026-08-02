import { useLatestCallback } from 'hooks'
import { useEffect, useState } from 'react'
import { getInitialDate, isDateEqual } from '../utils'
import { usePickerConfirmOnClose } from './usePickerConfirmOnClose'

/** DatePicker、MonthPicker 和 YearPicker 共用的单值状态 */
export function useSinglePickerValue({
  externalValue,
  defaultValue,
  isOpen,
  onChange,
  onConfirm,
}: UseSinglePickerValueOptions): UseSinglePickerValueReturn {
  const [value, setValue] = useState<Date | null>(() => externalValue ?? defaultValue ?? null)
  const [viewDate, setViewDate] = useState(() => getInitialDate(externalValue, defaultValue))
  const actualValue = externalValue === undefined
    ? value
    : externalValue

  useEffect(() => {
    if (externalValue === undefined)
      return
    setValue(externalValue)
    if (externalValue)
      setViewDate(externalValue)
  }, [externalValue])

  usePickerConfirmOnClose({ isOpen, value: actualValue, onConfirm, isEqual: isDateEqual })

  const updateValue = useLatestCallback((nextValue: Date | null) => {
    setValue(nextValue)
    onChange(nextValue)
  })

  return {
    value: actualValue,
    viewDate,
    setViewDate,
    updateValue,
  }
}

type UseSinglePickerValueOptions = {
  externalValue: Date | null | undefined
  defaultValue: Date | null | undefined
  isOpen: boolean
  onChange: (value: Date | null) => void
  onConfirm?: (value: Date | null) => void
}

type UseSinglePickerValueReturn = {
  value: Date | null
  viewDate: Date
  setViewDate: (value: Date) => void
  updateValue: (value: Date | null) => void
}
