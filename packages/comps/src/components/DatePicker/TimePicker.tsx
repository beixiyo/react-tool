'use client'

import { getHours, setHours } from 'date-fns'
import { useLatestCallback } from 'hooks'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { Cascader } from '../Cascader'
import { QuickTimePopover } from './components/QuickTimePopover'
import { TimeSegmentInput } from './components/TimeSegmentInput'
import { DATA_DATE_PICKER_IGNORE } from './constants'
import type { TimePickerProps } from './types'

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
  enableTimeKeyboardInput = true,
  enableTimeUnitPopover = true,
  enableTimeUnitScrollAnimation = true,
  enableTimeInputWheel = true,
  layout = 'separate',
  error = false,
}) => {
  const t = useT()
  const hours = getHours(value)
  const showHour = precision === 'hour' || precision === 'minute' || precision === 'second'
  const showSecond = precision === 'second'

  const isPM = hours >= 12
  const isCombinedLayout = layout === 'combined'

  const toggleAMPM = useLatestCallback(() => {
    const newHour = isPM
      ? hours - 12
      : hours + 12
    onChange(setHours(value, newHour))
  })

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
    if (!use12Hours) return null
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
          <div
            className={ cn(
              'flex items-center cursor-pointer select-none text-xs font-medium text-text transition-colors',
              isCombinedLayout
                ? 'h-auto rounded-none bg-transparent px-0 hover:bg-transparent'
                : 'h-10 rounded-xl bg-background2 px-3 hover:bg-background3',
              error && 'text-systemRed',
            ) }
          >
            { isPM
              ? t('datePicker.pm') || '下午'
              : t('datePicker.am') || '上午' }
          </div>
         }
        dropdownClassName={ cn('min-w-[80px]!', timeDropdownClassName) }
        dropdownStyle={ timeDropdownStyle }
        dropdownProps={ { [DATA_DATE_PICKER_IGNORE]: 'true' } as any }
        enableScrollAnimation={ enableTimeUnitScrollAnimation }
      />
    )
  }, [use12Hours, ampmOptions, isPM, disabled, t, timeDropdownClassName, timeDropdownStyle, isCombinedLayout, error, enableTimeUnitScrollAnimation, toggleAMPM])

  if (!showHour) return null

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

  const timeValueControl = (
    <TimeSegmentInput
      value={ value }
      onChange={ onChange }
      precision={ precision }
      use12Hours={ use12Hours }
      disabled={ disabled }
      minuteStep={ minuteStep }
      enableKeyboardInput={ enableTimeKeyboardInput }
      enablePopover={ enableTimeUnitPopover }
      enableScrollAnimation={ enableTimeUnitScrollAnimation }
      enableWheel={ enableTimeInputWheel }
      contentClassName={ timeDropdownClassName }
      contentStyle={ timeDropdownStyle }
      error={ error }
    />
  )

  return (
    <div
      className={ cn(
        'flex items-center justify-between',
        isCombinedLayout && 'w-fit',
        className,
      ) }
    >
      <div
        className={ cn(
          'flex items-center gap-2',
          isCombinedLayout && 'h-10 w-full min-w-max rounded-xl bg-background2 px-2',
          isCombinedLayout && error && 'text-systemRed',
        ) }
        aria-invalid={ error || undefined }
      >
        { periodPosition === 'left' && ampmSelector }

        { isCombinedLayout && quickTimeSelector }

        { isCombinedLayout
          ? timeValueControl
          : (
            <div
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
            </div>
          ) }

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
