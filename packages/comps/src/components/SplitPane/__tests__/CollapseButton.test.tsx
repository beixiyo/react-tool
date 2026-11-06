import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CollapseButton } from '../subcomponents/CollapseButton'

describe('分栏收起按钮', () => {
  it('拖出后回到起点松手也不能当成点击', () => {
    const onClick = vi.fn()
    render(<CollapseButton direction="left" collapsed={ false } onClick={ onClick } />)
    const button = screen.getByRole('button')
    fireEvent.mouseDown(button, { clientX: 280, button: 0 })
    fireEvent.mouseMove(document, { clientX: 300 })
    fireEvent.mouseMove(document, { clientX: 280 })
    fireEvent.mouseUp(document)
    fireEvent.click(button, { clientX: 280, detail: 1 })
    expect(onClick).not.toHaveBeenCalled()
  })

  it('从按钮开始拖动后松手不触发收起，但仍允许点击和键盘激活', () => {
    const onClick = vi.fn()
    render(<CollapseButton direction="left" collapsed={ false } onClick={ onClick } />)
    const button = screen.getByRole('button')
    fireEvent.mouseDown(button, { clientX: 280 })
    fireEvent.click(button, { clientX: 305, detail: 1 })
    expect(onClick).not.toHaveBeenCalled()

    fireEvent.mouseDown(button, { clientX: 280 })
    fireEvent.click(button, { clientX: 280, detail: 1 })
    expect(onClick).toHaveBeenCalledTimes(1)

    fireEvent.click(button, { detail: 0 })
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
