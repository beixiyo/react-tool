'use client'

import type { CalendarProps } from './types'
import { memo, useEffect, useState } from 'react'
import { cn } from 'utils'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'

export const Calendar = memo<CalendarProps>(({
  currentMonth: externalCurrentMonth,
  selectedDate,
  onSelect,
  disabledDate,
  minDate,
  maxDate,
  className,
  weekStartsOn = 1,
}) => {
  const [internalMonth, setInternalMonth] = useState(() => {
    return externalCurrentMonth || selectedDate || new Date()
  })

  useEffect(() => {
    if (externalCurrentMonth) {
      setInternalMonth(externalCurrentMonth)
    }
    else if (selectedDate) {
      setInternalMonth(selectedDate)
    }
  }, [externalCurrentMonth, selectedDate])

  const handleMonthChange = (date: Date) => {
    setInternalMonth(date)
  }

  return (
    <div className={ cn('w-full p-4', className) }>
      <CalendarHeader
        currentMonth={ internalMonth }
        onMonthChange={ handleMonthChange }
        minDate={ minDate }
        maxDate={ maxDate }
      />
      <CalendarGrid
        currentMonth={ internalMonth }
        selectedDate={ selectedDate }
        onSelect={ onSelect }
        disabledDate={ disabledDate }
        minDate={ minDate }
        maxDate={ maxDate }
        weekStartsOn={ weekStartsOn }
      />
    </div>
  )
})

Calendar.displayName = 'Calendar'
