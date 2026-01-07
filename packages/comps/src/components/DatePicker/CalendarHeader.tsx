'use client'

import type { CalendarHeaderProps } from './types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, useCallback } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { addMonth, getMonthLabel, isAfter, isBefore, subtractMonth } from './utils'

export const CalendarHeader = memo<CalendarHeaderProps>(({
  currentMonth,
  onMonthChange,
  minDate,
  maxDate,
  className,
}) => {
  const monthLabel = getMonthLabel(currentMonth)

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
    <div className={ cn('flex items-center justify-between mb-4', className) }>
      <Button
        variant="ghost"
        iconOnly
        size="sm"
        disabled={ !canGoPrev }
        onClick={ handlePrevMonth }
        aria-label="上一月"
        leftIcon={ <ChevronLeft className="h-4 w-4 text-textPrimary" /> }
      />

      <div className="text-sm font-semibold text-textPrimary">
        {monthLabel}
      </div>

      <Button
        variant="ghost"
        iconOnly
        size="sm"
        disabled={ !canGoNext }
        onClick={ handleNextMonth }
        aria-label="下一月"
        leftIcon={ <ChevronRight className="h-4 w-4 text-textPrimary" /> }
      />
    </div>
  )
})

CalendarHeader.displayName = 'CalendarHeader'
