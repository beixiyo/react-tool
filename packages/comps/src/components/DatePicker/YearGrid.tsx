'use client'

import type { YearGridProps } from './types'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import {
  getYear,
  getYearLabel,
  getYearList,
  isDateDisabled,
  isSameYearDate,
} from './utils'

export const YearGrid = memo<YearGridProps>(({
  currentYear,
  selectedYear,
  onSelect,
  disabledYear,
  minDate,
  maxDate,
  yearRange = 20,
}) => {
  const currentYearNum = getYear(currentYear)
  const yearList = useMemo(
    () => getYearList(currentYearNum, yearRange),
    [currentYearNum, yearRange],
  )

  const handleYearClick = (yearDate: Date) => {
    if (isDateDisabled(yearDate, disabledYear, minDate, maxDate))
      return
    onSelect?.(yearDate)
  }

  return (
    <div className="w-full grid grid-cols-4 gap-1 max-h-72 overflow-y-auto">
      { yearList.map((yearDate) => {
        const isSelected = selectedYear
          ? isSameYearDate(yearDate, selectedYear)
          : false
        const isDisabled = isDateDisabled(yearDate, disabledYear, minDate, maxDate)
        const isCurrentYear = yearDate.getFullYear() === new Date().getFullYear()

        return (
          <button
            key={ yearDate.toISOString() }
            type="button"
            disabled={ isDisabled }
            onClick={ () => handleYearClick(yearDate) }
            aria-label={ getYearLabel(yearDate) }
            aria-selected={ isSelected }
            aria-disabled={ isDisabled }
            className={ cn(
              'relative h-10 w-full rounded-full flex items-center justify-center',
              'transition-colors cursor-pointer',
              'disabled:cursor-not-allowed disabled:opacity-50',
              {
                'bg-button text-button3 hover:opacity-90': isSelected,
                'bg-brand/10': isCurrentYear && !isSelected,
                'text-text': !isSelected,
                'hover:bg-background2': !isSelected && !isDisabled,
              },
            ) }
          >
            <span className="relative z-10">{ getYearLabel(yearDate) }</span>
          </button>
        )
      }) }
    </div>
  )
})

YearGrid.displayName = 'YearGrid'
