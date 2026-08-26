import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { DatePicker } from '../DatePicker'
import { DATE_2026_07_04 } from './fixtures'
import { ControlledDatePicker, expectDate, renderWithI18n } from './test-utils'

const floatingArrowSelector = `[${DATA_ATTR.floatingArrow}]`

describe('datePicker', () => {
  it('默认触发器可用键盘打开，关闭后不再消费 Escape', async () => {
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ vi.fn() }
      />,
    )

    const trigger = screen.getByRole('button', { name: '2026 年 07 月 04 日' })
    expect(trigger.getAttribute('tabindex')).toBe('0')
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(await screen.findByRole('button', { name: '确认' })).toBeTruthy()

    const closeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    fireEvent(document, closeEvent)
    expect(closeEvent.defaultPrevented).toBe(true)

    const closedEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    fireEvent(document, closedEvent)
    expect(closedEvent.defaultPrevented).toBe(false)
  })

  it('默认触发器按 Space 打开', async () => {
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ vi.fn() }
      />,
    )

    fireEvent.keyDown(
      screen.getByRole('button', { name: '2026 年 07 月 04 日' }),
      { key: ' ' },
    )

    expect(await screen.findByRole('button', { name: '确认' })).toBeTruthy()
  })

  it('disabled 时即使受控打开也不消费 Escape', async () => {
    renderWithI18n(
      <DatePicker
        disabled
        open
        value={ DATE_2026_07_04 }
      />,
    )

    expect(await screen.findByRole('button', { name: '确认' })).toBeTruthy()

    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    })
    fireEvent(document, escapeEvent)

    expect(escapeEvent.defaultPrevented).toBe(false)
  })

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
        disabledDate={ (date) => date.getDate() === 12 }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日'))
    const disabledDate = await screen.findByRole('button', { name: '2026-07-12' })

    expect(disabledDate).toHaveProperty('disabled', true)
    expect(disabledDate.getAttribute('aria-disabled')).toBe('true')
    expect(disabledDate.getAttribute(DATA_ATTR.disabled)).toBe('true')
    fireEvent.click(disabledDate)

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText('2026 年 07 月 04 日')).toBeTruthy()
  })

  it('默认显示箭头并支持显式关闭', async () => {
    const { unmount } = renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ vi.fn() }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日'))
    await screen.findByRole('button', { name: '确认' })
    expect(document.querySelector(floatingArrowSelector)).toBeTruthy()

    unmount()
    renderWithI18n(
      <ControlledDatePicker
        initialValue={ DATE_2026_07_04 }
        onChange={ vi.fn() }
        arrow={ false }
      />,
    )

    fireEvent.click(screen.getByText('2026 年 07 月 04 日'))
    await screen.findByRole('button', { name: '确认' })
    expect(document.querySelector(floatingArrowSelector)).toBeNull()
  })
})
