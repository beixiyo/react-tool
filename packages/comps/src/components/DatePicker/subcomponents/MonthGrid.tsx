'use client'

import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { chunkRows, useRovingGrid } from '../hooks'
import type { MonthGridProps } from '../types'
import { getMonthList, getShortMonthLabel, getYear, getYearLabel, isMonthAvailable, isSameMonthDate } from '../utils'

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

  const isMonthDisabled = (monthDate: Date) => !isMonthAvailable(monthDate, minDate, maxDate) || !!disabledMonth?.(monthDate)

  const { onKeyDown, getItemNavProps } = useRovingGrid({
    count: monthList.length,
    columns: 3,
    selectedIndex: selectedMonth
      ? monthList.findIndex((monthDate) => isSameMonthDate(monthDate, selectedMonth))
      : undefined,
    isDisabled: (index) => isMonthDisabled(monthList[index]),
  })

  const rows = useMemo(() => chunkRows(monthList, 3), [monthList])

  const handleMonthClick = (monthDate: Date) => {
    if (!isMonthAvailable(monthDate, minDate, maxDate) || disabledMonth?.(monthDate)) return
    onSelect?.(monthDate)
  }

  return (
    <div
      role="grid"
      aria-label={ getYearLabel(currentYear) }
      className="w-full flex flex-col gap-1 min-w-48"
      onKeyDown={ onKeyDown }
    >
      { rows.map((row, rowIndex) => (
        <div key={ row[0].toISOString() } role="row" className="grid grid-cols-3 gap-1">
          { row.map((monthDate, colIndex) => {
            const itemIndex = rowIndex * 3 + colIndex
            const isSelected = selectedMonth
              ? isSameMonthDate(monthDate, selectedMonth)
              : false
            const isDisabled = isMonthDisabled(monthDate)
            const isCurrentMonth = monthDate.getMonth() === new Date().getMonth()
              && monthDate.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={ monthDate.toISOString() }
                role="gridcell"
                aria-selected={ isSelected }
                aria-disabled={ isDisabled || undefined }
              >
                <button
                  { ...getItemNavProps(itemIndex) }
                  type="button"
                  disabled={ isDisabled }
                  onClick={ () => handleMonthClick(monthDate) }
                  aria-label={ getShortMonthLabel(monthDate) }
                  aria-disabled={ isDisabled }
                  { ...{
                    [DATA_ATTR.selected]: isSelected,
                    [DATA_ATTR.disabled]: isDisabled,
                  } }
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
              </div>
            )
          }) }
        </div>
      )) }
    </div>
  )
})

MonthGrid.displayName = 'MonthGrid'
