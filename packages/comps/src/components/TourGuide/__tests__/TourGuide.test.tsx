// @vitest-environment jsdom

/**
 * TourGuide 契约：步骤内输入框里的方向键不翻步、Esc 仍关闭；
 * 点击卡片与高亮目标以外区域跳过引导
 */
import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TourGuide } from '../TourGuide'
import type { TourStepData } from '../types'

const STEPS: TourStepData[] = [
  { title: 'One', content: <input aria-label="answer" /> },
  { title: 'Two', content: 'second' },
]

describe('TourGuide', () => {
  it('open 控制开合', async () => {
    const { queryByText, rerender } = render(<TourGuide steps={ STEPS } open />)
    expect(queryByText('One')).not.toBeNull()

    rerender(<TourGuide steps={ STEPS } open={ false } />)
    await waitFor(() => expect(queryByText('One')).toBeNull())
  })

  it('输入框内方向键不翻步，Esc 仍跳过', () => {
    const onStepChange = vi.fn()
    const onSkip = vi.fn()
    const { getByRole } = render(<TourGuide steps={ STEPS } open onStepChange={ onStepChange } onSkip={ onSkip } />)
    const input = getByRole('textbox', { name: 'answer' })

    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(onStepChange).not.toHaveBeenCalled()

    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    expect(onStepChange).toHaveBeenCalledWith(1, STEPS[1])

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onSkip).toHaveBeenCalledTimes(1)
  })

  it('点击卡片内不跳过，点击外部跳过；closeOnOutsideClick=false 时不跳过', () => {
    const onSkip = vi.fn()
    const { getByText, rerender } = render(<TourGuide steps={ STEPS } open onSkip={ onSkip } />)

    fireEvent.mouseDown(getByText('One'))
    expect(onSkip).not.toHaveBeenCalled()

    rerender(<TourGuide steps={ STEPS } open onSkip={ onSkip } closeOnOutsideClick={ false } />)
    fireEvent.mouseDown(document.body)
    expect(onSkip).not.toHaveBeenCalled()

    rerender(<TourGuide steps={ STEPS } open onSkip={ onSkip } />)
    fireEvent.mouseDown(document.body)
    expect(onSkip).toHaveBeenCalledTimes(1)
  })
})
