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

  return (
    <button
      type="button"
      disabled={ isDisabled }
      onClick={ onClick }
      onMouseEnter={ onMouseEnter }
      aria-label={ formatDate(date, 'yyyy-MM-dd') }
      aria-selected={ isConfirmed || isTemp }
      aria-disabled={ isDisabled }
      className={ cn(
        'relative size-8 flex items-center justify-center rounded-full',
        'transition-all duration-300 cursor-pointer hover:bg-background3',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'text-textDisabled': !isCurrentMonth && isPreviousMonth,
          'text-text4': (!isCurrentMonth && isNextMonth) || (isCurrentMonth && !isToday && isBeforeToday(date)),
          'text-text': isCurrentMonth && (isToday || !isBeforeToday(date)),
          // 1. 已确定的选中点 (单个选中 或 范围的起始点) - 使用中性色 (黑白)
          'bg-button text-button3 z-20 hover:bg-button/70': isConfirmed,
          // 3. 范围内的中间区域 - 使用浅品牌色
          'bg-brand/10 text-text': isInRange && !isConfirmed && !isTemp,
          // 4. 今天（非选中状态）
          'text-brand/10 text-text': isToday && !isConfirmed && !isTemp,
          // 5. 普通悬停
          '': !isConfirmed && !isTemp && !isInRange && !isDisabled,
          'bg-brand/10': isToday && !isConfirmed && !isTemp,
        },
        className,
      ) }
    >
      { renderCell ? renderCell(date) : <span className="relative z-10 text-sm">{ dayNumber }</span> }
    </button>
  )
})

CalendarCell.displayName = 'CalendarCell'
