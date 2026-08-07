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
  visualRangePosition,
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
  const hasRangeBackground = !!isInRange

  const fallbackRangePosition = isRangeStart || isTempStart
    ? isRangeEnd || isTempEnd
      ? 'single'
      : 'start'
    : isRangeEnd || isTempEnd
      ? 'end'
      : hasRangeBackground
        ? 'middle'
        : undefined

  const rangePosition = visualRangePosition ?? fallbackRangePosition
  const isVisualRangeStart = rangePosition === 'start' || rangePosition === 'single'
  const isVisualRangeEnd = rangePosition === 'end' || rangePosition === 'single'

  const showRangeConnector = hasRangeBackground
    && !(isVisualRangeStart && isVisualRangeEnd)
    && !(isVisualRangeStart && isWeekEnd)
    && !(isVisualRangeEnd && isWeekStart)

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
          'text-text': isCurrentMonth && !isToday && !isBeforeToday(date),
          'text-brand font-semibold': isToday && !isConfirmed,
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

      { showRangeConnector && (
        <span
          aria-hidden="true"
          className={ cn(
            'absolute bottom-0 h-8 bg-brand/10',
            isVisualRangeStart && 'left-1/2 right-0',
            isVisualRangeEnd && 'left-0 right-1/2',
            !isVisualRangeStart && !isVisualRangeEnd && 'inset-x-0',
            !isVisualRangeStart && isWeekStart && 'rounded-l-full',
            !isVisualRangeEnd && isWeekEnd && 'rounded-r-full',
          ) }
        />
      ) }

      <span
        className={ cn(
          'group/day relative z-10 flex size-8 items-center justify-center rounded-full text-sm transition-colors duration-200',
          {
            'bg-button text-button3 hover:bg-button/70': isConfirmed,
          },
        ) }
      >
        { !isConfirmed && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-background opacity-0 group-hover/day:opacity-100"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-brand/20 opacity-0 transition-opacity duration-0 group-hover/day:opacity-100 group-hover/day:duration-200"
            />
          </>
        ) }
        <span className="relative z-10">
          { renderCell
            ? renderCell(date)
            : dayNumber }
        </span>
      </span>
    </button>
  )
})

CalendarCell.displayName = 'CalendarCell'
