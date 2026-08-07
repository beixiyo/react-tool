import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DATE_2026_07_04 } from './fixtures'
import { ControlledDatePicker, expectDate, renderWithI18n } from './test-utils'

describe('datePicker', () => {
  it('从日历选择日期并更新触发器文本', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
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

  it('通过清除按钮清空已选值', () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ onChange }
        showClear
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '清除' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(null)
    expect(screen.getByText('选择日期')).toBeTruthy()
  })

  it('对禁用日期不调用 onChange', async () => {
    const onChange = vi.fn()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
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
