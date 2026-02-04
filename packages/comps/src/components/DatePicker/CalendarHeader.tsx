'use client'

import type { Option } from '../Select/types'
import type { CalendarHeaderProps } from './types'
import { getMonth, getYear, setMonth, setYear, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { Select } from '../Select'
import { addMonth, isAfter, isBefore, subtractMonth } from './utils'

export const CalendarHeader = memo<CalendarHeaderProps>(({
  currentMonth,
  onMonthChange,
  minDate,
  maxDate,
  className,
}) => {
  const currentYear = getYear(currentMonth)
  const currentMonthIndex = getMonth(currentMonth) // 0-11

  /** 生成年份选项列表 */
  const yearOptions = useMemo(() => {
    const startYear = minDate
      ? getYear(minDate)
      : currentYear - 10
    const endYear = maxDate
      ? getYear(maxDate)
      : currentYear + 10
    const years: Option[] = []
    for (let year = startYear; year <= endYear; year++) {
      years.push({
        value: String(year),
        label: `${year}`,
      })
    }
    return years
  }, [minDate, maxDate, currentYear])

  /** 生成月份选项列表 */
  const monthOptions = useMemo(() => {
    const months: Option[] = []
    const monthNames = Array.from({ length: 12 }, (_, i) => `${i + 1}`)

    for (let i = 0; i < 12; i++) {
      const testDate = startOfMonth(setMonth(setYear(new Date(), currentYear), i))
      /** 检查该月份的第一天是否在允许范围内 */
      const isDisabled = (minDate && isBefore(testDate, startOfMonth(minDate))) || (maxDate && isAfter(testDate, startOfMonth(maxDate)))

      months.push({
        value: String(i),
        label: monthNames[i],
        disabled: isDisabled,
      })
    }
    return months
  }, [currentYear, minDate, maxDate])

  const handleYearChange = useCallback((value: string) => {
    const newYear = Number.parseInt(value)
    const newDate = startOfMonth(setYear(setMonth(currentMonth, currentMonthIndex), newYear))

    /** 检查新日期是否在允许范围内 */
    if (minDate && isBefore(newDate, startOfMonth(minDate))) {
      /** 如果新日期早于最小日期，设置为最小日期所在月份 */
      onMonthChange(startOfMonth(minDate))
      return
    }
    if (maxDate && isAfter(newDate, startOfMonth(maxDate))) {
      /** 如果新日期晚于最大日期，设置为最大日期所在月份 */
      onMonthChange(startOfMonth(maxDate))
      return
    }

    onMonthChange(newDate)
  }, [currentMonth, currentMonthIndex, minDate, maxDate, onMonthChange])

  const handleMonthChange = useCallback((value: string) => {
    const newMonthIndex = Number.parseInt(value)
    const newDate = startOfMonth(setMonth(currentMonth, newMonthIndex))

    /** 检查新日期是否在允许范围内 */
    if (minDate && isBefore(newDate, startOfMonth(minDate))) {
      onMonthChange(startOfMonth(minDate))
      return
    }
    if (maxDate && isAfter(newDate, startOfMonth(maxDate))) {
      onMonthChange(startOfMonth(maxDate))
      return
    }

    onMonthChange(newDate)
  }, [currentMonth, minDate, maxDate, onMonthChange])

  const handlePrevMonth = useCallback(() => {
    const prevMonth = subtractMonth(currentMonth, 1)
    if (minDate && isBefore(prevMonth, minDate))
      return
    onMonthChange(prevMonth)
  }, [currentMonth, minDate, onMonthChange])

  const handleNextMonth = useCallback(() => {
    const nextMonth = addMonth(currentMonth, 1)
    if (maxDate && isAfter(nextMonth, maxDate))
      return
    onMonthChange(nextMonth)
  }, [currentMonth, maxDate, onMonthChange])

  const canGoPrev = !minDate || !isBefore(subtractMonth(currentMonth, 1), minDate)
  const canGoNext = !maxDate || !isAfter(addMonth(currentMonth, 1), maxDate)

  const t = useT()

  return (
    <div className={ cn('flex items-center gap-2 mb-4', className) }>
      <Button
        variant="ghost"
        iconOnly
        size="sm"
        disabled={ !canGoPrev }
        onClick={ handlePrevMonth }
        aria-label={ t('datePicker.prevMonth') }
        leftIcon={ <ChevronLeft className="h-4 w-4 text-textPrimary" /> }
      />

      <div className="flex items-center gap-2 flex-1 justify-center">
        <Select
          options={ yearOptions }
          value={ String(currentYear) }
          onChange={ handleYearChange }
          placeholder={ t('datePicker.selectYear') }
          className="w-24"
          dropdownHeight={ 200 }
          showDownArrow={ true }
        />
        <Select
          options={ monthOptions }
          value={ String(currentMonthIndex) }
          onChange={ handleMonthChange }
          placeholder={ t('datePicker.selectMonth') }
          className="w-20"
          dropdownHeight={ 200 }
          showDownArrow={ true }
        />
      </div>

      <Button
        variant="ghost"
        iconOnly
        size="sm"
        disabled={ !canGoNext }
        onClick={ handleNextMonth }
        aria-label={ t('datePicker.nextMonth') }
        leftIcon={ <ChevronRight className="h-4 w-4 text-textPrimary" /> }
      />
    </div>
  )
})

CalendarHeader.displayName = 'CalendarHeader'
