import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Slider } from '..'

describe('Slider 键盘交互', () => {
  it('支持上下左右方向键按步长调整数值', () => {
    const onChange = vi.fn()
    render(
      <Slider
        ariaLabel="音量"
        defaultValue={ 50 }
        step={ 5 }
        onChange={ onChange }
      />,
    )

    const handle = screen.getByRole('slider', { name: '音量' })

    fireEvent.keyDown(handle, { key: 'ArrowLeft' })
    expect(handle.getAttribute('aria-valuenow')).toBe('45')

    fireEvent.keyDown(handle, { key: 'ArrowRight' })
    expect(handle.getAttribute('aria-valuenow')).toBe('50')

    fireEvent.keyDown(handle, { key: 'ArrowDown' })
    expect(handle.getAttribute('aria-valuenow')).toBe('45')

    fireEvent.keyDown(handle, { key: 'ArrowUp' })
    expect(handle.getAttribute('aria-valuenow')).toBe('50')
    expect(onChange.mock.calls.map(([value]) => value)).toEqual([45, 50, 45, 50])
  })

  it('点击轨道后聚焦将被调整的手柄', () => {
    render(<Slider ariaLabel="亮度" defaultValue={ 30 } />)

    const handle = screen.getByRole('slider', { name: '亮度' })
    const track = handle.parentElement!
    mockSliderRect(handle)

    fireEvent.mouseDown(track, { clientX: 40, clientY: 10 })

    expect(document.activeElement).toBe(handle)
    fireEvent.keyDown(handle, { key: 'ArrowUp' })
    expect(handle.getAttribute('aria-valuenow')).toBe('41')
  })

  it('范围滑块点击轨道后聚焦距离最近的手柄', () => {
    render(<Slider range defaultValue={ [20, 80] } />)

    const handles = screen.getAllByRole('slider')
    const track = handles[0].parentElement!
    mockSliderRect(handles[0])

    fireEvent.mouseDown(track, { clientX: 75, clientY: 10 })

    expect(document.activeElement).toBe(handles[1])
    fireEvent.keyDown(handles[1], { key: 'ArrowRight' })
    expect(handles.map(handle => handle.getAttribute('aria-valuenow'))).toEqual(['20', '76'])
  })
})

function mockSliderRect(handle: HTMLElement) {
  const slider = handle.parentElement!.parentElement!.parentElement!
  vi.spyOn(slider, 'getBoundingClientRect').mockReturnValue({
    bottom: 20,
    height: 20,
    left: 0,
    right: 100,
    top: 0,
    width: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })
}
