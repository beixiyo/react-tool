'use client'

import type { CalendarCellProps } from './types'
import { memo } from 'react'
import { cn } from 'utils'
import { formatDate, isBeforeToday } from './utils'

export const CalendarCell = memo<CalendarCellProps>(({
  date,
  isCurrentMonth,
  isPreviousMonth,
  isNextMonth,
  isToday,
  isSelected,
  isDisabled,
  isRangeStart,
  isRangeEnd,
  isTempStart,
  isTempEnd,
  isInRange,
  isWeekStart,
  isWeekEnd,
  rangeStartLabel = 'Start',
  rangeEndLabel = 'End',
  onClick,
  onMouseEnter,
  className,
  renderCell,
}) => {
  const dayNumber = date.getDate()

  /** 是否为确定的选中点 */
  const isConfirmed = isSelected || isRangeStart || isRangeEnd
  /** 是否为临时预览点 */
  const isTemp = (isTempStart || isTempEnd) && !isConfirmed
  const hasRangeBackground = !!(isInRange || isRangeStart || isRangeEnd || isTempStart || isTempEnd)
  const isVisualRangeStart = !!(isRangeStart || isTempStart)
  const isVisualRangeEnd = !!(isRangeEnd || isTempEnd)
  const rangePosition = isVisualRangeStart && isVisualRangeEnd
    ? 'single'
    : isVisualRangeStart
      ? 'start'
      : isVisualRangeEnd
        ? 'end'
        : hasRangeBackground
          ? 'middle'
          : undefined
  const boundaryLabel = isRangeStart && isRangeEnd
    ? `${rangeStartLabel} · ${rangeEndLabel}`
    : isRangeStart
      ? rangeStartLabel
      : isRangeEnd
        ? rangeEndLabel
        : undefined

  return (
    <button
      type="button"
      disabled={ isDisabled }
      onClick={ onClick }
      onMouseEnter={ onMouseEnter }
      aria-label={ formatDate(date, 'yyyy-MM-dd') }
      aria-selected={ isConfirmed || isTemp }
      aria-disabled={ isDisabled }
      data-range-position={ rangePosition }
      className={ cn(
        'relative flex h-10 w-full items-end justify-center p-0',
        'cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'text-textDisabled': !isCurrentMonth && isPreviousMonth,
          'text-text4': (!isCurrentMonth && isNextMonth) || (isCurrentMonth && !isToday && isBeforeToday(date)),
          'text-text': isCurrentMonth && (isToday || !isBeforeToday(date)),
          'text-button3': isConfirmed,
        },
        className,
      ) }
    >
      { boundaryLabel && (
        <span className="absolute -top-1 truncate text-center text-[10px] leading-2.5 text-brand">
          { boundaryLabel }
        </span>
      ) }

      { hasRangeBackground && (
        <span
          aria-hidden="true"
          className={ cn(
            'absolute inset-x-0 bottom-0 h-8 bg-brand/10',
            (isVisualRangeStart || isWeekStart) && 'rounded-l-full',
            (isVisualRangeEnd || isWeekEnd) && 'rounded-r-full',
          ) }
        />
      ) }

      <span
        className={ cn(
          'relative z-10 flex size-8 items-center justify-center rounded-full text-sm transition-colors duration-200',
          {
            'bg-button text-button3 hover:bg-button/70': isConfirmed,
            'hover:bg-background3': !isConfirmed,
            'bg-brand/10': isToday && !isConfirmed && !isTemp && !hasRangeBackground,
          },
        ) }
      >
        { renderCell
          ? renderCell(date)
          : dayNumber }
      </span>
    </button>
  )
})

CalendarCell.displayName = 'CalendarCell'
