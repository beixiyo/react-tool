'use client'

import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { chunkRows, useRovingGrid } from '../hooks'
import type { YearGridProps } from '../types'
import { getYear, getYearLabel, getYearList, isSameYearDate, isYearAvailable } from '../utils'

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

  const isYearDisabled = (yearDate: Date) => !isYearAvailable(yearDate, minDate, maxDate) || !!disabledYear?.(yearDate)

  const { onKeyDown, getItemNavProps } = useRovingGrid({
    count: yearList.length,
    columns: 4,
    selectedIndex: selectedYear
      ? yearList.findIndex((yearDate) => isSameYearDate(yearDate, selectedYear))
      : undefined,
    isDisabled: (index) => isYearDisabled(yearList[index]),
  })

  const rows = useMemo(() => chunkRows(yearList, 4), [yearList])

  const handleYearClick = (yearDate: Date) => {
    if (!isYearAvailable(yearDate, minDate, maxDate) || disabledYear?.(yearDate)) return
    onSelect?.(yearDate)
  }

  return (
    <div
      role="grid"
      className="w-full flex flex-col gap-1 max-h-72 overflow-y-auto"
      onKeyDown={ onKeyDown }
    >
      { rows.map((row, rowIndex) => (
        <div key={ row[0].toISOString() } role="row" className="grid grid-cols-4 gap-1">
          { row.map((yearDate, colIndex) => {
            const itemIndex = rowIndex * 4 + colIndex
            const isSelected = selectedYear
              ? isSameYearDate(yearDate, selectedYear)
              : false
            const isDisabled = isYearDisabled(yearDate)
            const isCurrentYear = yearDate.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={ yearDate.toISOString() }
                role="gridcell"
                aria-selected={ isSelected }
                aria-disabled={ isDisabled || undefined }
              >
                <button
                  { ...getItemNavProps(itemIndex) }
                  type="button"
                  disabled={ isDisabled }
                  onClick={ () => handleYearClick(yearDate) }
                  aria-label={ getYearLabel(yearDate) }
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
                      'bg-brand/10': isCurrentYear && !isSelected,
                      'text-text': !isSelected,
                      'hover:bg-background2': !isSelected && !isDisabled,
                    },
                  ) }
                >
                  <span className="relative z-10">{ getYearLabel(yearDate) }</span>
                </button>
              </div>
            )
          }) }
        </div>
      )) }
    </div>
  )
})

YearGrid.displayName = 'YearGrid'
