'use client'

import { getMonth, getYear, setMonth, setYear, startOfMonth } from 'date-fns'
import { useLatestCallback } from 'hooks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import type { CascaderOption } from '../Cascader'
import { CalendarHeaderSelect } from './components/CalendarHeaderSelect'
import type { CalendarHeaderProps } from './types'
import { addMonth, isAfter, isBefore, isMonthAvailable, subtractMonth } from './utils'

export const CalendarHeader = memo<CalendarHeaderProps>(({
  currentMonth,
  onMonthChange,
  minDate,
  maxDate,
  className,
  yearRange = 20,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
  dropdownZIndex,
  enableScrollAnimation = true,
}) => {
  const t = useT()
  const headerOrder = t('datePicker.headerOrder') || 'ym'

  const currentYear = getYear(currentMonth)
  const currentMonthIndex = getMonth(currentMonth) // 0-11

  /** 生成年份选项列表 */
  const yearOptions = useMemo(() => {
    const startYear = minDate
      ? getYear(minDate)
      : currentYear - yearRange
    const endYear = maxDate
      ? getYear(maxDate)
      : currentYear + yearRange
    const years: CascaderOption[] = []
    for (let year = startYear; year <= endYear; year++) {
      years.push({
        value: String(year),
        label: `${year}`,
      })
    }
    return years
  }, [minDate, maxDate, currentYear, yearRange])

  /** 生成月份选项列表 */
  const monthOptions = useMemo(() => {
    const months: CascaderOption[] = []
    const monthsNames = t('datePicker.months', { returnObjects: true }) as unknown as string[]

    for (let i = 0; i < 12; i++) {
      const testDate = startOfMonth(setMonth(setYear(new Date(), currentYear), i))
      /** 检查该月份的第一天是否在允许范围内 */
      const isDisabled = (minDate && isBefore(testDate, startOfMonth(minDate))) || (maxDate && isAfter(testDate, startOfMonth(maxDate)))

      months.push({
        value: String(i),
        label: monthsNames?.[i] || `${i + 1}`,
        disabled: !!isDisabled,
      })
    }
    return months
  }, [currentYear, minDate, maxDate, t])

  const handleYearChange = useLatestCallback((value: string) => {
    const newYear = Number.parseInt(value)
    const newDate = startOfMonth(setYear(setMonth(currentMonth, currentMonthIndex), newYear))

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
  })

  const handleMonthChange = useLatestCallback((value: string) => {
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
  })

  const handlePrevMonth = useLatestCallback(() => {
    const prevMonth = subtractMonth(currentMonth, 1)
    if (!isMonthAvailable(prevMonth, minDate, maxDate)) return
    onMonthChange(prevMonth)
  })

  const handleNextMonth = useLatestCallback(() => {
    const nextMonth = addMonth(currentMonth, 1)
    if (!isMonthAvailable(nextMonth, minDate, maxDate)) return
    onMonthChange(nextMonth)
  })

  const handleSuperPrevMonth = useLatestCallback(() => {
    const previousYear = subtractMonth(currentMonth, 12)
    if (!isMonthAvailable(previousYear, minDate, maxDate)) return
    onMonthChange(previousYear)
  })

  const handleSuperNextMonth = useLatestCallback(() => {
    const nextYear = addMonth(currentMonth, 12)
    if (!isMonthAvailable(nextYear, minDate, maxDate)) return
    onMonthChange(nextYear)
  })

  const canGoPrev = isMonthAvailable(subtractMonth(currentMonth, 1), minDate, maxDate)
  const canGoNext = isMonthAvailable(addMonth(currentMonth, 1), minDate, maxDate)
  const canGoSuperPrev = isMonthAvailable(subtractMonth(currentMonth, 12), minDate, maxDate)
  const canGoSuperNext = isMonthAvailable(addMonth(currentMonth, 12), minDate, maxDate)
  const yearSelect = (
    <CalendarHeaderSelect
      options={ yearOptions }
      value={ String(currentYear) }
      onChange={ handleYearChange }
      minWidth={ 100 }
      suffix={ headerOrder === 'ym'
        ? t('datePicker.yearSuffix') || '年'
        : undefined }
      dropdownZIndex={ dropdownZIndex }
      enableScrollAnimation={ enableScrollAnimation }
    />
  )
  const monthSelect = (
    <CalendarHeaderSelect
      options={ monthOptions }
      value={ String(currentMonthIndex) }
      onChange={ handleMonthChange }
      minWidth={ headerOrder === 'ym'
        ? 80
        : 120 }
      suffix={ headerOrder === 'ym'
        ? t('datePicker.monthSuffix') || '月'
        : undefined }
      dropdownZIndex={ dropdownZIndex }
      enableScrollAnimation={ enableScrollAnimation }
    />
  )

  return (
    <div className={ cn('flex items-center gap-2', className) }>
      { superPrevIcon && (
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          disabled={ !canGoSuperPrev }
          onClick={ handleSuperPrevMonth }
          leftIcon={ superPrevIcon }
        />
      ) }
      <Button
        variant="ghost"
        iconOnly
        size="sm"
        disabled={ !canGoPrev }
        onClick={ handlePrevMonth }
        aria-label={ t('datePicker.prevMonth') }
        leftIcon={ prevIcon || <ChevronLeft className="h-5 w-5 text-text" /> }
      />

      <div className="flex items-center flex-1 justify-center">
        { headerOrder === 'my'
          ? (
            <>
              { monthSelect }
              { yearSelect }
            </>
          )
          : (
            <>
              { yearSelect }
              { monthSelect }
            </>
          ) }
      </div>

      <Button
        variant="ghost"
        iconOnly
        size="sm"
        disabled={ !canGoNext }
        onClick={ handleNextMonth }
        aria-label={ t('datePicker.nextMonth') }
        leftIcon={ nextIcon || <ChevronRight className="h-5 w-5 text-text" /> }
      />
      { superNextIcon && (
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          disabled={ !canGoSuperNext }
          onClick={ handleSuperNextMonth }
          leftIcon={ superNextIcon }
        />
      ) }
    </div>
  )
})

CalendarHeader.displayName = 'CalendarHeader'
