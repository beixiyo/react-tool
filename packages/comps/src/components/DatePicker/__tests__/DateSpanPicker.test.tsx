import { fireEvent, screen } from '@testing-library/react'
import { addDays, format, startOfMonth } from 'date-fns'
import { describe, expect, it, vi } from 'vitest'
import { DateSpanPicker } from '../DateSpanPicker'
import { ControlledDateSpanPicker, expectDate, renderWithI18n } from './test-utils'

describe('dateSpanPicker', () => {
  it('按空、单日、区间、新单日和清空的顺序转换选择', async () => {
    const onChange = vi.fn()
    const currentMonth = startOfMonth(new Date())
    const firstDate = addDays(currentMonth, 9)
    const earlierDate = addDays(currentMonth, 3)
    const replacementDate = addDays(currentMonth, 6)
    renderWithI18n(<ControlledDateSpanPicker onChange={ onChange } />)

    fireEvent.click(screen.getByText('选择日期'))

    fireEvent.click(await screen.findByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }))
    expectDate(onChange.mock.calls[0][0].start, firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate())
    expect(onChange.mock.calls[0][0].end).toBeNull()
    expect(screen.getByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }).getAttribute('aria-selected')).toBe('true')
    expect(screen.queryByText('开始')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: format(earlierDate, 'yyyy-MM-dd') }))
    expectDate(onChange.mock.calls[1][0].start, earlierDate.getFullYear(), earlierDate.getMonth(), earlierDate.getDate())
    expectDate(onChange.mock.calls[1][0].end, firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate())
    expect(screen.getByRole('button', { name: format(earlierDate, 'yyyy-MM-dd') }).dataset.rangePosition).toBe('start')
    expect(screen.getByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }).dataset.rangePosition).toBe('end')

    fireEvent.click(screen.getByRole('button', { name: format(replacementDate, 'yyyy-MM-dd') }))
    expectDate(onChange.mock.calls[2][0].start, replacementDate.getFullYear(), replacementDate.getMonth(), replacementDate.getDate())
    expect(onChange.mock.calls[2][0].end).toBeNull()
    expect(screen.getByRole('button', { name: format(replacementDate, 'yyyy-MM-dd') }).getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: format(replacementDate, 'yyyy-MM-dd') }))
    expect(onChange.mock.calls[3][0]).toEqual({ start: null, end: null })
  })

  it('关闭范围 hover 预览后，点击第二个日期仍展示已选区间', async () => {
    const currentMonth = startOfMonth(new Date())
    const firstDate = addDays(currentMonth, 9)
    const secondDate = addDays(currentMonth, 3)
    renderWithI18n(<DateSpanPicker enableRangeHoverPreview={ false } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }))
    fireEvent.mouseEnter(screen.getByRole('button', { name: format(secondDate, 'yyyy-MM-dd') }))

    expect(screen.getByRole('button', { name: format(secondDate, 'yyyy-MM-dd') }).dataset.rangePosition).toBeUndefined()

    fireEvent.click(screen.getByRole('button', { name: format(secondDate, 'yyyy-MM-dd') }))

    expect(screen.getByRole('button', { name: format(secondDate, 'yyyy-MM-dd') }).dataset.rangePosition).toBe('start')
    expect(screen.getByRole('button', { name: format(firstDate, 'yyyy-MM-dd') }).dataset.rangePosition).toBe('end')
  })

  it('只在 Confirm 时通知确认值', async () => {
    const onConfirm = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateSpanPicker onChange={ vi.fn() } onConfirm={ onConfirm } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))

    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: '完成' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0].start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(onConfirm.mock.calls[0][0].end).toBeNull()
    expect(onConfirm.mock.calls[0][1].reason).toBe('confirm')
  })

  it('按 Enter 时走 Confirm 事务', async () => {
    const onConfirm = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateSpanPicker onChange={ vi.fn() } onConfirm={ onConfirm } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))
    fireEvent.keyDown(document, { key: 'Enter' })

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expectDate(onConfirm.mock.calls[0][0].start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(onConfirm.mock.calls[0][1].reason).toBe('confirm')
  })

  it('按 Escape 丢弃本次日期草稿并恢复打开前值', async () => {
    const onChange = vi.fn()
    const onCancel = vi.fn()
    const selectedDate = addDays(startOfMonth(new Date()), 9)
    renderWithI18n(<ControlledDateSpanPicker onChange={ onChange } onCancel={ onCancel } />)

    fireEvent.click(screen.getByText('选择日期'))
    fireEvent.click(await screen.findByRole('button', { name: format(selectedDate, 'yyyy-MM-dd') }))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(1)
    expectDate(onCancel.mock.calls[0][0].start, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    expect(onCancel.mock.calls[0][1].reason).toBe('escape')
    expect(onChange.mock.calls.at(-1)?.[0]).toEqual({ start: null, end: null })
  })
})
