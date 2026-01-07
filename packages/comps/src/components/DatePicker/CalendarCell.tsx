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
  isRangeStart,
  isRangeEnd,
  isInRange,
  onClick,
  onMouseEnter,
  className,
}) => {
  const dayNumber = date.getDate()

  return (
    <button
      type="button"
      disabled={ isDisabled }
      onClick={ onClick }
      onMouseEnter={ onMouseEnter }
      aria-label={ formatDate(date, 'yyyy-MM-dd') }
      aria-selected={ isSelected || isRangeStart || isRangeEnd }
      aria-disabled={ isDisabled }
      className={ cn(
        'relative size-9 p-0 flex items-center justify-center',
        'transition-colors cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'text-textSecondary': !isCurrentMonth,
          'text-textPrimary': isCurrentMonth,
          // 单个日期选中或范围开始/结束
          'bg-systemOrange text-white hover:bg-systemOrange/90 rounded-md': (isSelected && !isRangeStart && !isRangeEnd) || (isRangeStart || isRangeEnd),
          // 范围内（但不是开始或结束）
          'bg-systemOrange/10 text-textPrimary rounded-md': isInRange && !isRangeStart && !isRangeEnd,
          'font-semibold': isToday && !isSelected && !isRangeStart && !isRangeEnd,
          'hover:bg-backgroundSecondary rounded-md': !isSelected && !isRangeStart && !isRangeEnd && !isInRange && !isDisabled,
        },
        className,
      ) }
    >
      {isToday && !isSelected && !isRangeStart && !isRangeEnd && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-1 w-1 rounded-full bg-systemOrange" />
        </span>
      )}
      <span className="relative z-10">{dayNumber}</span>
    </button>
  )
})

CalendarCell.displayName = 'CalendarCell'
