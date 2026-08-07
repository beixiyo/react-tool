import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DatePicker } from '../DatePicker'
import { MonthPicker } from '../MonthPicker'
import { YearPicker } from '../YearPicker'
import {
  DATE_2000_06_15,
  DATE_2025_06_15,
  DATE_2026_01_01,
  DATE_2026_05_15,
  DATE_2026_06_01,
  DATE_2026_07_01,
} from './fixtures'
import { ControlledMonthPickerSession, expectDate, renderWithI18n } from './test-utils'

describe('period pickers', () => {
  it('allows DatePicker to navigate into a boundary month with selectable days', async () => {
    renderWithI18n(
      <DatePicker
        defaultValue={ DATE_2026_06_01 }
        minDate={ DATE_2026_05_15 }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 06 月 01 日'))
    const previousMonth = await screen.findByRole('button', { name: '上一月' })
    expect((previousMonth as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(previousMonth)
    expect((await screen.findByRole('button', { name: '2026-05-15' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('allows MonthPicker to navigate into a boundary year with selectable months', async () => {
    renderWithI18n(
      <MonthPicker
        defaultValue={ DATE_2026_01_01 }
        minDate={ DATE_2025_06_15 }
      />,
    )

    fireEvent.click(screen.getByText('2026-01'))
    const previousYear = await screen.findByRole('button', { name: '上一年' })
    expect((previousYear as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(previousYear)
    expect((await screen.findByRole('button', { name: '7' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('allows YearPicker to navigate into a boundary page containing valid years', async () => {
    renderWithI18n(
      <YearPicker
        defaultValue={ DATE_2026_01_01 }
        minDate={ DATE_2000_06_15 }
      />,
    )

    fireEvent.click(screen.getAllByText('2026')[0])
    const previousRange = await screen.findByRole('button', { name: '上一组年份' })
    expect((previousRange as HTMLButtonElement).disabled).toBe(false)

    fireEvent.click(previousRange)
    expect((await screen.findByRole('button', { name: '2000' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('confirms MonthPicker only after a real open session changes', async () => {
    const onConfirm = vi.fn()
    renderWithI18n(
      <MonthPicker
        defaultValue={ DATE_2026_07_01 }
        onConfirm={ onConfirm }
      />,
    )

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('2026-07'))
    fireEvent.click(await screen.findByRole('button', { name: '8' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0], 2026, 7, 1)
  })

  it('confirms YearPicker only after a real open session changes', async () => {
    const onConfirm = vi.fn()
    renderWithI18n(
      <YearPicker
        defaultValue={ DATE_2026_01_01 }
        onConfirm={ onConfirm }
      />,
    )

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getAllByText('2026')[0])
    fireEvent.click(await screen.findByRole('button', { name: '2027' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0], 2027, 0, 1)
  })

  it('does not confirm a controlled value supplied in the same render that opens MonthPicker', async () => {
    const onConfirm = vi.fn()
    renderWithI18n(<ControlledMonthPickerSession onConfirm={ onConfirm } />)

    fireEvent.click(screen.getByRole('button', { name: 'open with August' }))
    expect(await screen.findByRole('button', { name: '8' })).toBeTruthy()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
