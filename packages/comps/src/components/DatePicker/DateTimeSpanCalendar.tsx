'use client'

import { useLatestCallback } from 'hooks'
import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { Switch } from '../Switch'
import { CalendarHeader } from './CalendarHeader'
import { DATA_DATE_PICKER_IGNORE } from './constants'
import { DateSpanCalendarGrid } from './DateSpanCalendarGrid'
import { TimePicker } from './TimePicker'
import type { DatePrecision, DateTimeSpanPickerValue, SharedUIProps } from './types'
import { isSameDate } from './utils'

/** DateTimeSpanPicker 的二合一日期网格与独立时刻编辑区 */
export const DateTimeSpanCalendar = memo<DateTimeSpanCalendarProps>(({
  currentMonth,
  onCurrentMonthChange,
  value,
  tempDate,
  onSelect,
  onDateHover,
  onStartTimeChange,
  onEndTimeChange,
  onAddTime,
  onClearTime,
  onAddEndTime,
  startTimeError = false,
  endTimeError = false,
  disabledDate,
  minDate,
  maxDate,
  className,
  weekStartsOn = 1,
  enableRangeHoverPreview = true,
  precision,
  use12Hours,
  minuteStep,
  quickTimeStep,
  enableTimeKeyboardInput,
  enableTimeUnitPopover,
  enableTimeUnitScrollAnimation,
  enableHeaderScrollAnimation,
  enableTimeInputWheel,
  timeIcon,
  addEndTimeIcon,
  timeDropdownClassName,
  timeDropdownZIndex,
  dropdownZIndex,
  confirmLoading = false,
  validationMessage,
  onConfirm,
  onMouseLeave,
  yearRange,
  prevIcon,
  nextIcon,
  superPrevIcon,
  superNextIcon,
  extraFooter,
  renderCell,
}) => {
  const t = useT()
  const handleMonthChange = useLatestCallback((date: Date) => onCurrentMonthChange(date))
  const calendarValue = useMemo(() => ({
    start: value.start,
    end: value.end && !isSameDate(value.start, value.end)
      ? value.end
      : null,
  }), [value])
  const hasInvalidEndTime = !!(value.hasTime && value.start && value.end && value.end.getTime() < value.start.getTime())
  const handleConfirm = useLatestCallback(() => {
    if (hasInvalidEndTime) return

    onConfirm()
  })

  return (
    <motion.div
      layout
      transition={ {
        layout: {
          duration: 0.2,
          ease: 'easeOut',
        },
      } }
      className={ cn('w-full flex flex-col', className) }
    >
      <div className="flex flex-1 flex-col gap-4">
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
          dropdownZIndex={ dropdownZIndex }
          enableScrollAnimation={ enableHeaderScrollAnimation }
        />
        <DateSpanCalendarGrid
          currentMonth={ currentMonth }
          value={ calendarValue }
          tempDate={ tempDate }
          onSelect={ onSelect }
          onDateHover={ onDateHover }
          disabledDate={ disabledDate }
          minDate={ minDate }
          maxDate={ maxDate }
          weekStartsOn={ weekStartsOn }
          renderCell={ renderCell }
          enableRangeHoverPreview={ enableRangeHoverPreview }
          onMouseLeave={ onMouseLeave }
        />

        <div
          className="flex items-center justify-between"
          { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
        >
          <span className="text-sm leading-5.5 text-text3">
            { t('datePicker.addTime') || 'Add Time' }
          </span>
          <Switch
            checked={ value.hasTime }
            onChange={ (checked) =>
              checked
                ? onAddTime()
                : onClearTime() }
            ariaLabel={ t('datePicker.addTime') || 'Add Time' }
            background="rgb(var(--brand) / 1)"
            trackWidth={ 36 }
            trackHeight={ 16 }
            thumbWidth={ 21 }
            thumbHeight={ 13 }
            thumbInset={ 1.5 }
            trackClassName="bg-background3"
          />
        </div>

        { value.hasTime && value.start && (
          <div
            className="flex min-w-0 items-end gap-2"
            { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
          >
            <TimeField
              label={ t('datePicker.rangeStart') || 'Start' }
              className={ value.end
                ? 'flex-1'
                : 'w-fit' }
            >
              <TimePicker
                value={ value.start }
                onChange={ onStartTimeChange }
                precision={ precision }
                use12Hours={ use12Hours }
                minuteStep={ minuteStep }
                quickTimeStep={ quickTimeStep }
                enableTimeKeyboardInput={ enableTimeKeyboardInput }
                enableTimeUnitPopover={ enableTimeUnitPopover }
                enableTimeUnitScrollAnimation={ enableTimeUnitScrollAnimation }
                enableTimeInputWheel={ enableTimeInputWheel }
                timeIcon={ timeIcon }
                timeDropdownClassName={ timeDropdownClassName }
                timeDropdownZIndex={ timeDropdownZIndex }
                showConfirm={ false }
                layout="combined"
                error={ startTimeError }
                className={ value.end
                  ? 'w-full'
                  : undefined }
              />
            </TimeField>
            { value.end
              ? (
                <TimeField label={ t('datePicker.rangeEnd') || 'End' } className="flex-1">
                  <TimePicker
                    value={ value.end }
                    onChange={ onEndTimeChange }
                    precision={ precision }
                    use12Hours={ use12Hours }
                    minuteStep={ minuteStep }
                    quickTimeStep={ quickTimeStep }
                    enableTimeKeyboardInput={ enableTimeKeyboardInput }
                    enableTimeUnitPopover={ enableTimeUnitPopover }
                    enableTimeUnitScrollAnimation={ enableTimeUnitScrollAnimation }
                    enableTimeInputWheel={ enableTimeInputWheel }
                    timeIcon={ timeIcon }
                    timeDropdownClassName={ timeDropdownClassName }
                    timeDropdownZIndex={ timeDropdownZIndex }
                    showConfirm={ false }
                    layout="combined"
                    error={ endTimeError }
                    className="w-full"
                  />
                </TimeField>
              )
              : (
                <Button
                  variant="secondary"
                  iconOnly
                  leftIcon={ addEndTimeIcon ?? <Plus className="size-4" /> }
                  onClick={ onAddEndTime }
                  className="shrink-0 rounded-full border-none bg-brand/10 text-brand hover:bg-brand/15"
                  aria-label={ t('datePicker.addEndTime') }
                />
              ) }
          </div>
        ) }

        { (hasInvalidEndTime || validationMessage) && (
          <p role="alert" className="text-center text-xs leading-4 text-systemRed">
            { hasInvalidEndTime
              ? t('datePicker.endBeforeStart')
              : validationMessage }
          </p>
        ) }

        <Button
          variant="primary"
          onClick={ handleConfirm }
          disabled={ hasInvalidEndTime }
          loading={ confirmLoading }
          className="h-10 w-full rounded-xl"
          { ...({ [DATA_DATE_PICKER_IGNORE]: 'true' } as any) }
        >
          { t('datePicker.confirm') || '确认' }
        </Button>
        { extraFooter }
      </div>
    </motion.div>
  )
})

DateTimeSpanCalendar.displayName = 'DateTimeSpanCalendar'

function TimeField({ label, className, children }: { label: string; className: string; children: ReactNode }) {
  return (
    <div className={ cn('min-w-0', className) }>
      <span className="mb-1 block text-xs leading-4 text-text3">{ label }</span>
      { children }
    </div>
  )
}

type DateTimeSpanCalendarProps = SharedUIProps & {
  currentMonth: Date
  onCurrentMonthChange: (date: Date) => void
  value: DateTimeSpanPickerValue
  tempDate: Date | null
  onSelect: (date: Date) => void
  onDateHover: (date: Date | null) => void
  onStartTimeChange: (date: Date) => void
  onEndTimeChange: (date: Date) => void
  onAddTime: () => void
  onClearTime: () => void
  onAddEndTime: () => void
  startTimeError?: boolean
  endTimeError?: boolean
  disabledDate?: (date: Date) => boolean
  minDate?: Date
  maxDate?: Date
  className?: string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  precision: DatePrecision
  use12Hours: boolean
  enableRangeHoverPreview?: boolean
  minuteStep: number
  quickTimeStep?: number
  enableTimeKeyboardInput?: boolean
  enableTimeUnitPopover?: boolean
  enableTimeUnitScrollAnimation?: boolean
  enableHeaderScrollAnimation?: boolean
  enableTimeInputWheel?: boolean
  timeIcon?: ReactNode
  addEndTimeIcon?: ReactNode
  timeDropdownClassName?: string
  timeDropdownZIndex?: number
  dropdownZIndex?: number
  confirmLoading?: boolean
  /** 业务确认被拒绝时在确认按钮上方展示的错误内容 */
  validationMessage?: ReactNode
  onConfirm: () => void
  onMouseLeave: () => void
  yearRange?: number
  prevIcon?: ReactNode
  nextIcon?: ReactNode
  superPrevIcon?: ReactNode
  superNextIcon?: ReactNode
  extraFooter?: ReactNode
  renderCell?: (date: Date) => ReactNode
}
