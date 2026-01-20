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
  isTempStart,
  isTempEnd,
  isInRange,
  onClick,
  onMouseEnter,
  className,
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
        'relative size-9 p-0 flex items-center justify-center rounded-xl',
        'transition-colors cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-50',
        {
          'text-textSecondary': !isCurrentMonth,
          'text-textPrimary': isCurrentMonth,
          // 1. 已确定的选中点 (单个选中 或 范围的起始点) - 使用中性色 (黑白)
          'bg-buttonPrimary text-buttonTertiary z-20 hover:opacity-90': isConfirmed,
          // 2. 预览中的临时点 (正在选择的起点或终点) - 使用品牌色
          'bg-brand text-white z-10 hover:bg-brand/90': isTemp,
          // 3. 范围内的中间区域 - 使用浅品牌色
          'bg-brand/10 text-textPrimary': isInRange && !isConfirmed && !isTemp,
          // 4. 今天（非选中状态）
          'font-semibold': isToday && !isConfirmed && !isTemp,
          // 5. 普通悬停
          'hover:bg-backgroundSecondary': !isConfirmed && !isTemp && !isInRange && !isDisabled,
        },
        className,
      ) }
    >
      {isToday && !isConfirmed && !isTemp && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="size-1.5 rounded-full bg-brand" />
        </span>
      )}
      <span className="relative z-10">{dayNumber}</span>
    </button>
  )
})

CalendarCell.displayName = 'CalendarCell'
