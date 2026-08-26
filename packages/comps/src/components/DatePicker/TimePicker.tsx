'use client'

import { getHours, setHours } from 'date-fns'
import { useLatestCallback } from 'hooks'
import type { ReactElement } from 'react'
import { memo, useMemo, useRef } from 'react'
import { cn } from 'utils'
import { DATA_ATTR } from '../../constants/dataAttributes'
import { useT } from '../../i18n'
import { Button } from '../Button'
import { Cascader } from '../Cascader'
import type { PopoverRef } from '../Popover'
import type { QuickTimeTriggerProps } from './components/QuickTimePopover'
import { QuickTimePopover } from './components/QuickTimePopover'
import type { TimeSegmentInputRef } from './components/TimeSegmentInput'
import { TimeSegmentInput } from './components/TimeSegmentInput'
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
  timeDropdownClassName,
  timeDropdownZIndex,
  minuteStep = 1,
  quickTimeStep = 30,
  enableQuickTimePopover = true,
  enableTimeKeyboardInput = true,
  enableTimeUnitPopover = false,
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
  const quickTimePopoverRef = useRef<PopoverRef>(null)
  const timeSegmentInputRef = useRef<TimeSegmentInputRef>(null)

  const handleQuickTimeOpen = useLatestCallback(() => {
    timeSegmentInputRef.current?.closePopovers()
  })

  const handleTimeUnitOpen = useLatestCallback(() => {
    quickTimePopoverRef.current?.close()
  })

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
    const trigger = (
      <div
        { ...{ [DATA_ATTR.datePicker.quickTimeIgnore]: 'true' } }
        className={ cn(
          'flex items-center cursor-pointer select-none text-text transition-colors',
          isCombinedLayout
            ? 'h-6 rounded-none bg-transparent px-0 text-sm font-normal leading-5.5 hover:bg-transparent'
            : 'h-10 rounded-xl bg-background2 px-3 text-xs font-medium hover:bg-background3',
          error && 'text-systemRed',
        ) }
      >
        { isPM
          ? t('datePicker.pm') || '下午'
          : t('datePicker.am') || '上午' }
      </div>
    )

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
        trigger={ trigger }
        dropdownClassName={ cn('min-w-[80px]!', timeDropdownClassName) }
        dropdownStyle={ timeDropdownStyle }
        dropdownProps={ { [DATA_ATTR.datePicker.ignore]: 'true' } as any }
        enableScrollAnimation={ enableTimeUnitScrollAnimation }
      />
    )
  }, [use12Hours, ampmOptions, isPM, disabled, t, timeDropdownClassName, timeDropdownStyle, isCombinedLayout, error, enableTimeUnitScrollAnimation, toggleAMPM])

  if (!showHour) return null

  const withQuickTimePopover = (trigger: ReactElement<QuickTimeTriggerProps>) => (
    <QuickTimePopover
      value={ value }
      use12Hours={ use12Hours }
      step={ enableQuickTimePopover
        ? quickTimeStep
        : undefined }
      disabled={ disabled }
      onChange={ onChange }
      contentClassName={ timeDropdownClassName }
      contentStyle={ timeDropdownStyle }
      popoverRef={ quickTimePopoverRef }
      onOpen={ handleQuickTimeOpen }
    >
      { trigger }
    </QuickTimePopover>
  )

  const timeValueControl = (
    <TimeSegmentInput
      ref={ timeSegmentInputRef }
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
      onPopoverOpen={ handleTimeUnitOpen }
    />
  )

  const combinedTimeControl = withQuickTimePopover(
    <div
      className={ cn(
        'flex h-10 w-full min-w-max items-center justify-center gap-2 rounded-xl bg-background2 px-2',
        error && 'text-systemRed',
      ) }
      aria-invalid={ error || undefined }
    >
      { periodPosition === 'left' && ampmSelector }
      { timeValueControl }
      { periodPosition === 'right' && ampmSelector }
    </div>,
  )

  const separateTimeControl = withQuickTimePopover(
    <div
      className="flex items-center justify-center bg-background2 rounded-xl"
      style={ {
        width: showSecond
          ? 84
          : 56,
        height: 40,
      } }
      aria-invalid={ error || undefined }
    >
      { timeValueControl }
    </div>,
  )

  return (
    <div
      className={ cn(
        'flex items-center justify-between',
        isCombinedLayout && 'w-full',
        className,
      ) }
    >
      { isCombinedLayout
        ? combinedTimeControl
        : (
          <div className="flex items-center gap-2">
            { periodPosition === 'left' && ampmSelector }
            { separateTimeControl }
            { periodPosition === 'right' && ampmSelector }
          </div>
        ) }

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
