'use client'

import type { MonthGridProps } from './types'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import {
  getMonthList,
  getShortMonthLabel,
  getYear,
  isDateDisabled,
  isSameMonthDate,
} from './utils'

export const MonthGrid = memo<MonthGridProps>(({
  currentYear,
  selectedMonth,
  onSelect,
  disabledMonth,
  minDate,
  maxDate,
}) => {
  const year = getYear(currentYear)
  const monthList = useMemo(() => getMonthList(year), [year])

  const handleMonthClick = (monthDate: Date) => {
    if (isDateDisabled(monthDate, disabledMonth, minDate, maxDate))
      return
    onSelect?.(monthDate)
  }

  return (
    <div className="w-full grid grid-cols-3 gap-1 min-w-48">
      { monthList.map((monthDate) => {
        const isSelected = selectedMonth
          ? isSameMonthDate(monthDate, selectedMonth)
          : false
        const isDisabled = isDateDisabled(monthDate, disabledMonth, minDate, maxDate)
        const isCurrentMonth = monthDate.getMonth() === new Date().getMonth()
          && monthDate.getFullYear() === new Date().getFullYear()

        return (
          <button
            key={ monthDate.toISOString() }
            type="button"
            disabled={ isDisabled }
            onClick={ () => handleMonthClick(monthDate) }
            aria-label={ getShortMonthLabel(monthDate) }
            aria-selected={ isSelected }
            aria-disabled={ isDisabled }
            className={ cn(
              'relative h-10 w-full rounded-full flex items-center justify-center',
              'transition-colors cursor-pointer',
              'disabled:cursor-not-allowed disabled:opacity-50',
              {
                'bg-button text-button3 hover:opacity-90': isSelected,
                'bg-brand/10': isCurrentMonth && !isSelected,
                'text-text': !isSelected,
                'hover:bg-background2': !isSelected && !isDisabled,
              },
            ) }
          >
            <span className="relative z-10">{ getShortMonthLabel(monthDate) }</span>
          </button>
        )
      }) }
    </div>
  )
})

MonthGrid.displayName = 'MonthGrid'
