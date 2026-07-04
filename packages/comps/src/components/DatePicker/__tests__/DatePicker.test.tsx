import { fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from 'i18n/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { allResources } from '../../../i18n'
import { DatePicker } from '../DatePicker'
import { DateRangePicker } from '../DateRangePicker'

describe('datePicker', () => {
  it('selects a date from the calendar and updates the trigger text', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ dateOf(2026, 6, 4) }
        onChange={ onChange }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-12' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expectDate(onChange.mock.calls[0][0], 2026, 6, 12)
    expect(screen.getByText('2026 年 07 月 12 日')).toBeTruthy()
    expect(screen.getByRole('button', { name: '确认' })).toBeTruthy()
  })

  it('clears selected value through the clear button', () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ dateOf(2026, 6, 4) }
        onChange={ onChange }
        showClear
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '清除' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByText('选择日期')).toBeTruthy()
  })

  it('does not call onChange for disabled dates', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ dateOf(2026, 6, 4) }
        onChange={ onChange }
        disabledDate={ date => date.getDate() === 12 }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日'))
    const disabledDate = await screen.findByRole('button', { name: '2026-07-12' })

    expect(disabledDate).toHaveProperty('disabled', true)
    fireEvent.click(disabledDate)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('2026 年 07 月 04 日')).toBeTruthy()
  })
})

describe('dateRangePicker', () => {
  it('selects an end date from the active range input', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDateRangePicker
        initialValue={ {
          start: dateOf(2026, 6, 4),
          end: null,
        } }
        onChange={ onChange }
      />,
    )

    fireEvent.click(screen.getByText('结束日期'))
    fireEvent.click(await screen.findByRole('button', { name: '2026-07-10' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    const [nextValue] = onChange.mock.calls[0]
    expectDate(nextValue.start, 2026, 6, 4)
    expectDate(nextValue.end, 2026, 6, 10)
    expect(screen.getByText('2026 年 07 月 04 日')).toBeTruthy()
    expect(screen.getByText('2026 年 07 月 10 日')).toBeTruthy()
  })
})

function renderWithI18n(ui: React.ReactElement) {
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

function ControlledDatePicker({
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

function ControlledDateRangePicker({
  initialValue,
  onChange,
}: ControlledDateRangePickerProps) {
  const [value, setValue] = useState(initialValue)

  return (
    <DateRangePicker
      value={ value }
      onChange={ (nextValue) => {
        setValue(nextValue)
        onChange(nextValue)
      } }
    />
  )
}

function dateOf(year: number, month: number, day: number) {
  return new Date(year, month, day)
}

function expectDate(date: Date | null, year: number, month: number, day: number) {
  expect(date).toBeInstanceOf(Date)
  expect(date?.getFullYear()).toBe(year)
  expect(date?.getMonth()).toBe(month)
  expect(date?.getDate()).toBe(day)
}

type ControlledDatePickerProps = {
  initialValue: Date | null
  onChange: (value: Date | null) => void
  disabledDate?: (date: Date) => boolean
  showClear?: boolean
}

type ControlledDateRangePickerProps = {
  initialValue: {
    start: Date | null
    end: Date | null
  }
  onChange: (value: { start: Date | null, end: Date | null }) => void
}
