'use client'

import type { CascaderOption } from '../Cascader'
import type { CalendarHeaderProps } from './types'
import { getMonth, getYear, setMonth, setYear, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useCallback, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { Cascader } from '../Cascader'
import { DATA_DATE_PICKER_IGNORE } from './constants'
import { addMonth, isAfter, isBefore, subtractMonth } from './utils'

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

  const handleYearChange = useCallback((value: string) => {
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

  return (
    <div className={ cn('flex items-center gap-2 h-10', className) }>
      { superPrevIcon && (
        <Button
          variant="ghost"
          iconOnly
          size="sm"
          onClick={ () => onMonthChange(subtractMonth(currentMonth, 12)) }
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
                <Cascader
                  options={ monthOptions }
                  value={ String(currentMonthIndex) }
                  onChange={ handleMonthChange }
                  dropdownMinWidth={ 120 }
                  dropdownHeight={ 250 }
                  dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
                  trigger={
                    <div
                      className="text-sm text-text hover:bg-background2 px-2 rounded-xl transition-all duration-200 cursor-pointer font-medium"
                      { ...{ [DATA_DATE_PICKER_IGNORE]: 'true' } }
                    >
                      { monthOptions.find(opt => opt.value === String(currentMonthIndex))?.label }
                    </div>
                  }
                />
                <Cascader
                  options={ yearOptions }
                  value={ String(currentYear) }
                  onChange={ handleYearChange }
                  dropdownMinWidth={ 100 }
                  dropdownHeight={ 250 }
                  dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
                  trigger={
                    <div
                      className="text-sm text-text hover:bg-background2 px-2 rounded-xl transition-all duration-200 cursor-pointer ml-1"
                      { ...{ [DATA_DATE_PICKER_IGNORE]: 'true' } }
                    >
                      { currentYear }
                    </div>
                  }
                />
              </>
            )
          : (
              <>
                <Cascader
                  options={ yearOptions }
                  value={ String(currentYear) }
                  onChange={ handleYearChange }
                  dropdownMinWidth={ 100 }
                  dropdownHeight={ 250 }
                  dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
                  trigger={
                    <div
                      className="text-sm text-text hover:bg-background2 px-2 rounded-xl transition-all duration-200 cursor-pointer"
                      { ...{ [DATA_DATE_PICKER_IGNORE]: 'true' } }
                    >
                      { currentYear }
                    </div>
                  }
                />
                <span className="text-sm font-medium px-2">{ t('datePicker.yearSuffix') || '年' }</span>

                <Cascader
                  options={ monthOptions }
                  value={ String(currentMonthIndex) }
                  onChange={ handleMonthChange }
                  dropdownMinWidth={ 80 }
                  dropdownHeight={ 250 }
                  dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
                  trigger={
                    <div
                      className="text-sm text-text hover:bg-background2 px-2 rounded-xl transition-all duration-200 cursor-pointer"
                      { ...{ [DATA_DATE_PICKER_IGNORE]: 'true' } }
                    >
                      { currentMonthIndex + 1 }
                    </div>
                  }
                />
                <span className="text-sm font-medium px-2">{ t('datePicker.monthSuffix') || '月' }</span>
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
          onClick={ () => onMonthChange(addMonth(currentMonth, 12)) }
          leftIcon={ superNextIcon }
        />
      ) }
    </div>
  )
})

CalendarHeader.displayName = 'CalendarHeader'
