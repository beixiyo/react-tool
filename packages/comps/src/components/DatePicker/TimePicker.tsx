'use client'

import type { CSSProperties } from 'react'
import type { TimePickerProps } from './types'
import { getHours, getMinutes, getSeconds, setHours, setMinutes, setSeconds } from 'date-fns'
import { useLatestCallback } from 'hooks'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { Cascader } from '../Cascader'
import { QuickTimePopover } from './components/QuickTimePopover'
import { TimeSegmentInput } from './components/TimeSegmentInput'
import { TimeUnitPopover } from './components/TimeUnitPopover'
import { DATA_DATE_PICKER_IGNORE } from './constants'

export const TimePicker = memo<TimePickerProps>(({
  value,
  onChange,
  precision = 'day',
  disabled = false,
  className,
  use12Hours = false,
  onConfirm,
  confirmLoading = false,
  showConfirm = true,
  timeIcon,
  timeDropdownClassName,
  timeDropdownZIndex,
  minuteStep = 1,
  quickTimeStep,
  timeInputMode = 'popover',
  enableTimeInputWheel = true,
  layout = 'separate',
  error = false,
}) => {
  const t = useT()
  const hours = getHours(value)
  const minutes = getMinutes(value)
  const seconds = getSeconds(value)

  const showHour = precision === 'hour' || precision === 'minute' || precision === 'second'
  const showMinute = precision === 'minute' || precision === 'second'
  const showSecond = precision === 'second'

  const isPM = hours >= 12
  const isCombinedLayout = layout === 'combined'

  const displayHour = useMemo(() => {
    if (!use12Hours)
      return hours
    const h = hours % 12
    return h === 0
      ? 12
      : h
  }, [hours, use12Hours])

  const handleHourChange = useLatestCallback((newHour: number) => {
    let finalHour = newHour
    if (use12Hours) {
      if (isPM) {
        finalHour = newHour === 12
          ? 12
          : newHour + 12
      }
      else {
        finalHour = newHour === 12
          ? 0
          : newHour
      }
    }
    onChange(setHours(value, finalHour))
  })

  const handleMinuteChange = useLatestCallback((newMinute: number) => {
    onChange(setMinutes(value, newMinute))
  })

  const handleSecondChange = useLatestCallback((newSecond: number) => {
    onChange(setSeconds(value, newSecond))
  })

  const toggleAMPM = useLatestCallback(() => {
    const newHour = isPM
      ? hours - 12
      : hours + 12
    onChange(setHours(value, newHour))
  })

  const hourOptions = useMemo(() => {
    if (use12Hours) {
      return Array.from({ length: 12 }, (_, i) => i + 1)
    }
    return Array.from({ length: 24 }, (_, i) => i)
  }, [use12Hours])

  const minuteOptions = useMemo(() => {
    return Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep)
  }, [minuteStep])

  const secondOptions = Array.from({ length: 60 }, (_, i) => i)
  const ampmOptions = useMemo(() => [
    { label: t('datePicker.am') || '上午', value: 'AM' },
    { label: t('datePicker.pm') || '下午', value: 'PM' },
  ], [t])

  const periodPosition = t('datePicker.periodPosition') || 'left'
  const timeDropdownStyle = useMemo(() => {
    return timeDropdownZIndex == null
      ? undefined
      : { zIndex: timeDropdownZIndex }
  }, [timeDropdownZIndex])

  const ampmSelector = useMemo(() => {
    if (!use12Hours)
      return null
    return (
      <Cascader
        options={ ampmOptions }
        value={ isPM
          ? 'PM'
          : 'AM' }
        disabled={ disabled }
        onChange={ (val) => {
          const shouldBePM = val === 'PM'
          if (shouldBePM !== isPM) {
            toggleAMPM()
          }
        } }
        trigger={
          <div className={ cn(
            'flex items-center cursor-pointer select-none text-xs font-medium text-text transition-colors',
            isCombinedLayout
              ? 'h-auto rounded-none bg-transparent px-0 hover:bg-transparent'
              : 'h-10 rounded-xl bg-background2 px-3 hover:bg-background3',
            error && 'text-systemRed',
          ) }>
            { isPM
              ? t('datePicker.pm') || '下午'
              : t('datePicker.am') || '上午' }
          </div>
        }
        dropdownClassName={ cn('min-w-[80px]!', timeDropdownClassName) }
        dropdownStyle={ timeDropdownStyle }
        dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
      />
    )
  }, [use12Hours, ampmOptions, isPM, disabled, t, timeDropdownClassName, timeDropdownStyle, isCombinedLayout, error])

  if (!showHour)
    return null

  const quickTimeSelector = (
    <QuickTimePopover
      value={ value }
      step={ quickTimeStep }
      icon={ timeIcon }
      disabled={ disabled }
      onChange={ onChange }
      contentClassName={ timeDropdownClassName }
      contentStyle={ timeDropdownStyle }
    />
  )

  const timeValueControl = timeInputMode === 'segments'
    ? <TimeSegmentInput
        value={ value }
        onChange={ onChange }
        precision={ precision }
        use12Hours={ use12Hours }
        disabled={ disabled }
        enableTimeInputWheel={ enableTimeInputWheel }
        error={ error }
      />
    : <TimeUnitControls
        showMinute={ showMinute }
        showSecond={ showSecond }
        hourOptions={ hourOptions }
        minuteOptions={ minuteOptions }
        secondOptions={ secondOptions }
        displayHour={ displayHour }
        minutes={ minutes }
        seconds={ seconds }
        disabled={ disabled }
        onHourChange={ handleHourChange }
        onMinuteChange={ handleMinuteChange }
        onSecondChange={ handleSecondChange }
        contentClassName={ timeDropdownClassName }
        contentStyle={ timeDropdownStyle }
        error={ error }
      />

  return (
    <div className={ cn('flex items-center justify-between', className) }>
      <div
        className={ cn(
          'flex items-center gap-2',
          isCombinedLayout && 'h-10 w-full rounded-xl bg-background2 px-2',
          isCombinedLayout && error && 'text-systemRed',
        ) }
        aria-invalid={ error || undefined }>
        { periodPosition === 'left' && ampmSelector }

        { isCombinedLayout && quickTimeSelector }

        { isCombinedLayout
          ? timeValueControl
          : <div
              className="flex items-center justify-center bg-background2 rounded-xl gap-2"
              style={ {
                width: showSecond
                  ? 116
                  : 88,
                height: 40,
              } }
            >
              { quickTimeSelector }
              { timeValueControl }
            </div> }

        { periodPosition === 'right' && ampmSelector }
      </div>

      { showConfirm && (
        <Button
          onClick={ onConfirm }
          disabled={ disabled }
          loading={ confirmLoading }
          variant="primary"
          className="h-10"
        >
          { t('datePicker.confirm') || '确认' }
        </Button>
      ) }
    </div>
  )
})

TimePicker.displayName = 'TimePicker'

function TimeUnitControls({
  showMinute,
  showSecond,
  hourOptions,
  minuteOptions,
  secondOptions,
  displayHour,
  minutes,
  seconds,
  disabled,
  onHourChange,
  onMinuteChange,
  onSecondChange,
  contentClassName,
  contentStyle,
  error,
}: TimeUnitControlsProps) {
  return (
    <div className={ cn('flex items-center gap-1 text-sm', error
      ? 'text-systemRed'
      : 'text-text') }>
      <TimeUnitPopover
        disabled={ disabled }
        options={ hourOptions }
        selected={ displayHour }
        onSelect={ onHourChange }
        contentClassName={ contentClassName }
        contentStyle={ contentStyle }
      >
        <div className="cursor-pointer hover:text-brand transition-colors">
          { String(displayHour).padStart(2, '0') }
        </div>
      </TimeUnitPopover>

      { showMinute && (
        <>
          <span className={ error
            ? 'text-systemRed'
            : 'text-text' }>
            :
          </span>
          <TimeUnitPopover
            disabled={ disabled }
            options={ minuteOptions }
            selected={ minutes }
            onSelect={ onMinuteChange }
            contentClassName={ contentClassName }
            contentStyle={ contentStyle }
          >
            <div className="cursor-pointer transition-colors hover:text-brand">
              { String(minutes).padStart(2, '0') }
            </div>
          </TimeUnitPopover>
        </>
      ) }

      { showSecond && (
        <>
          <span className={ error
            ? 'text-systemRed'
            : 'text-text4' }>
            :
          </span>
          <TimeUnitPopover
            disabled={ disabled }
            options={ secondOptions }
            selected={ seconds }
            onSelect={ onSecondChange }
            contentClassName={ contentClassName }
            contentStyle={ contentStyle }
          >
            <span className="cursor-pointer hover:text-brand transition-colors">
              { String(seconds).padStart(2, '0') }
            </span>
          </TimeUnitPopover>
        </>
      ) }
    </div>
  )
}

type TimeUnitControlsProps = {
  showMinute: boolean
  showSecond: boolean
  hourOptions: number[]
  minuteOptions: number[]
  secondOptions: number[]
  displayHour: number
  minutes: number
  seconds: number
  disabled: boolean
  onHourChange: (value: number) => void
  onMinuteChange: (value: number) => void
  onSecondChange: (value: number) => void
  contentClassName?: string
  contentStyle?: CSSProperties
  error: boolean
}
