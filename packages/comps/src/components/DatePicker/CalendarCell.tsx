'use client'

import type { CalendarCellProps } from './types'
import { memo } from 'react'
import { cn } from 'utils'
import { formatDate } from './utils'

export const CalendarCell = memo<CalendarCellProps>(({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isDisabled,
  onClick,
  className,
}) => {
  const dayNumber = date.getDate()

  return (
    <button
      type="button"
      disabled={ isDisabled }
      onClick={ onClick }
      aria-label={ formatDate(date, 'yyyy-MM-dd') }
      aria-selected={ isSelected }
      aria-disabled={ isDisabled }
      className={ cn(
        'relative size-9 p-0 rounded-md flex items-center justify-center',
        'transition-colors cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'text-textSecondary': !isCurrentMonth,
          'text-textPrimary': isCurrentMonth,
          'bg-systemOrange text-white hover:bg-systemOrange/90': isSelected,
          'font-semibold': isToday && !isSelected,
          'hover:bg-backgroundSecondary': !isSelected && !isDisabled,
        },
        className,
      ) }
    >
      {isToday && !isSelected && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-1 w-1 rounded-full bg-systemOrange" />
        </span>
      )}
      <span className="relative z-10">{dayNumber}</span>
    </button>
  )
})

CalendarCell.displayName = 'CalendarCell'
