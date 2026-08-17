'use client'

import type { ReactNode } from 'react'
import type { DateSpanPickerValue, SharedUIProps } from './types'
import { useLatestCallback } from 'hooks'
import { Clock } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { CalendarHeader } from './CalendarHeader'
import { DATA_DATE_PICKER_IGNORE } from './constants'
import { DateSpanCalendarGrid } from './DateSpanCalendarGrid'

/** DateSpanPicker 的日期专用日历与 Confirm 页脚 */
export const DateSpanCalendar = memo<DateSpanCalendarProps>(({
  currentMonth,
  onCurrentMonthChange,
  value,
  tempDate,
  onSelect,
  onDateHover,
  disabledDate,
  minDate,
  maxDate,
  className,
  weekStartsOn = 1,
  enableRangeHoverPreview = true,
  confirmLoading = false,
  onConfirm,
  onMouseLeave,
  yearRange,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
  timeIcon,
  extraFooter,
  renderCell,
  onAddTime,
}) => {
  const t = useT()
  const handleMonthChange = useLatestCallback((date: Date) => onCurrentMonthChange(date))

  return (
    <div className={ cn('w-full flex flex-col', className) } onMouseLeave={ onMouseLeave }>
      <div className="flex flex-1 flex-col gap-4" onMouseLeave={ () => onDateHover(null) }>
        <CalendarHeader
          currentMonth={ currentMonth }
          onMonthChange={ handleMonthChange }
          minDate={ minDate }
          maxDate={ maxDate }
          yearRange={ yearRange }
          prevIcon={ prevIcon }
          nextIcon={ nextIcon }
          superPrevIcon={ superPrevIcon }
          superNextIcon={ superNextIcon }
        />
        <DateSpanCalendarGrid
          currentMonth={ currentMonth }
          value={ value }
          tempDate={ tempDate }
          onSelect={ onSelect }
          onDateHover={ onDateHover }
          disabledDate={ disabledDate }
          minDate={ minDate }
          maxDate={ maxDate }
          weekStartsOn={ weekStartsOn }
          enableRangeHoverPreview={ enableRangeHoverPreview }
          renderCell={ renderCell }
        />
        <div
          className="flex items-center justify-between"
          { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
        >
          { onAddTime && <Button
            variant="secondary"
            className="border-none text-text3"
            onClick={ onAddTime }
            leftIcon={ timeIcon || <Clock className="size-3.5 text-iconColor" /> }
          >
            { t('datePicker.addTime') || 'Add Time' }
          </Button> }
          <Button variant="primary" onClick={ onConfirm } loading={ confirmLoading }>
            { t('datePicker.confirm') || '确认' }
          </Button>
        </div>
        { extraFooter }
      </div>
    </div>
  )
})

DateSpanCalendar.displayName = 'DateSpanCalendar'

type DateSpanCalendarProps = SharedUIProps & {
  currentMonth: Date
  onCurrentMonthChange: (date: Date) => void
  value: DateSpanPickerValue
  tempDate: Date | null
  onSelect: (date: Date) => void
  onDateHover: (date: Date | null) => void
  disabledDate?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  enableRangeHoverPreview?: boolean
  confirmLoading?: boolean
  onConfirm: () => void
  onMouseLeave: () => void
  yearRange?: number
  timeIcon?: ReactNode
  onAddTime?: () => void
}
