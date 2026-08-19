import { act, render } from '@testing-library/react'
import { I18nProvider } from 'i18n/react'
import type { ReactElement } from 'react'
import { useState } from 'react'
import { beforeAll, expect, vi } from 'vitest'
import { allResources } from '../../../i18n'
import { DatePicker } from '../DatePicker'
import { DateRangePicker } from '../DateRangePicker'
import { DateSpanPicker } from '../DateSpanPicker'
import { DateTimeSpanPicker } from '../DateTimeSpanPicker'
import { MonthPicker } from '../MonthPicker'
import { TimePicker } from '../TimePicker'
import type { DateRangePickerProps, DateRangePickerValue, DateSpanPickerValue, DateTimeSpanPickerValue } from '../types'
import { DATE_2026_08_01, DATE_2026_08_02, DATE_TIME_2026_07_04_10_15 } from './fixtures'

beforeAll(() => {
  if (!Element.prototype.animate) {
    Element.prototype.animate = vi.fn(() => ({
      cancel: vi.fn(),
    } as unknown as Animation))
  }
})

export function renderWithI18n(ui: ReactElement) {
  return render(
    <I18nProvider
      resources={ allResources }
      defaultLanguage="zh-CN"
      language="zh-CN"
    >
      { ui }
    </I18nProvider>,
  )
}

export function expectDate(date: Date | null, year: number, month: number, day: number) {
  expect(date).toBeInstanceOf(Date)
  expect(date?.getFullYear()).toBe(year)
  expect(date?.getMonth()).toBe(month)
  expect(date?.getDate()).toBe(day)
}

export function ControlledDatePicker({
  disabledDate,
  initialValue,
  onChange,
  showClear,
}: ControlledDatePickerProps) {
  const [value, setValue] = useState<Date | null>(initialValue)

  return (
    <DatePicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      disabledDate={ disabledDate }
      showClear={ showClear }
    />
  )
}

export function ControlledDateRangePicker({
  initialValue,
  onChange,
  onConfirm,
  onCancel,
  closeOnSelect,
  renderTrigger,
  precision,
  quickTimeStep,
}: ControlledDateRangePickerProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <DateRangePicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      onConfirm={ onConfirm }
      onCancel={ onCancel }
      closeOnSelect={ closeOnSelect }
      renderTrigger={ renderTrigger }
      precision={ precision }
      quickTimeStep={ quickTimeStep }
    />
  )
}

export function ControlledDateSpanPicker({
  onChange,
  onConfirm,
  onCancel,
}: {
  onChange: (value: DateSpanPickerValue) => void
  onConfirm?: (value: DateSpanPickerValue) => void
  onCancel?: (value: DateSpanPickerValue) => void
}) {
  const [value, setValue] = useState<DateSpanPickerValue>({ start: null, end: null })

  return (
    <DateSpanPicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      onConfirm={ onConfirm }
      onCancel={ onCancel }
    />
  )
}

export function ControlledDateTimeSpanPicker({
  onChange,
}: {
  onChange: (value: DateTimeSpanPickerValue) => void
}) {
  const [value, setValue] = useState<DateTimeSpanPickerValue>({ start: null, end: null, hasTime: false })

  return (
    <DateTimeSpanPicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
      precision="minute"
      defaultEndTimeOffsetMinutes={ 15 }
    />
  )
}

export function ControlledSegmentTimePicker({
  onChange,
}: {
  onChange?: (value: Date) => void
} = {}) {
  const [value, setValue] = useState(DATE_TIME_2026_07_04_10_15)

  return (
    <TimePicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange?.(nextValue)
      } }
      precision="minute"
    />
  )
}

export function LinkedDateTimeSpanPicker({
  initialValue = {
    start: parseDate('2026-07-04T10:00:00'),
    end: parseDate('2026-07-04T11:30:00'),
    hasTime: true,
  },
}: {
  initialValue?: DateTimeSpanPickerValue
}) {
  const [value, setValue] = useState<DateTimeSpanPickerValue>(initialValue)
  const [open, setOpen] = useState(false)

  return (
    <DateTimeSpanPicker
      value={ value }
      onChange={ setValue }
      open={ open }
      onOpenChange={ setOpen }
      precision="minute"
      syncEndTimeWithStart
      defaultEndTimeOffsetMinutes={ 15 }
    />
  )
}

export function ReplaceAndOpenDateRangePicker({ onCancel }: ReplaceAndOpenDateRangePickerProps) {
  const [value, setValue] = useState<DateRangePickerValue>({
    start: DATE_2026_08_01,
    end: null,
  })
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={ () => {
          setValue({ start: DATE_2026_08_02, end: null })
          setOpen(true)
        } }
      >
        替换并打开
      </button>
      <DateRangePicker
        value={ value }
        open={ open }
        onOpenChange={ setOpen }
        onChange={ setValue }
        onCancel={ onCancel }
        closeOnSelect={ false }
      />
    </>
  )
}

export function ControlledMonthPickerSession({ onConfirm }: { onConfirm: (value: Date | null) => void }) {
  const [value, setValue] = useState<Date | null>(DATE_2026_08_01)
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={ () => {
          setValue(parseDate('2026-08-01'))
          setOpen(true)
        } }
      >
        open with August
      </button>
      <MonthPicker
        value={ value }
        open={ open }
        onChange={ setValue }
        onOpenChange={ setOpen }
        onConfirm={ onConfirm }
      />
    </>
  )
}

function parseDate(rawValue: string) {
  return new Date(rawValue)
}

export async function actPromise(handler: () => Promise<void> | void) {
  await act(handler)
}

export type ControlledDatePickerProps = {
  initialValue: Date | null
  onChange: (value: Date | null) => void
  disabledDate?: (date: Date) => boolean
  showClear?: boolean
}

export type ControlledDateRangePickerProps = {
  initialValue: {
    start: Date | null
    end: Date | null
  }
  onChange: (value: { start: Date | null; end: Date | null }) => void
  onConfirm?: DateRangePickerProps['onConfirm']
  onCancel?: DateRangePickerProps['onCancel']
  closeOnSelect?: boolean
  renderTrigger?: DateRangePickerProps['renderTrigger']
  precision?: DateRangePickerProps['precision']
  quickTimeStep?: DateRangePickerProps['quickTimeStep']
}

export type ReplaceAndOpenDateRangePickerProps = {
  onCancel: NonNullable<DateRangePickerProps['onCancel']>
}
