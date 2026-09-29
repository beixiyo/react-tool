// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ControlButtons } from '../subcomponents/ControlButtons'

const handlers = {
  onRotate: vi.fn(),
  onReset: vi.fn(),
  onDownload: vi.fn(),
}

/** 裸 render 无 I18nProvider，aria 文案走英文兜底 */
function queryButtons() {
  return {
    rotate: screen.queryByRole('button', { name: 'Rotate image' }),
    reset: screen.queryByRole('button', { name: 'Reset image' }),
    download: screen.queryByRole('button', { name: 'Download image' }),
  }
}

describe('ControlButtons 显隐契约', () => {
  it('不传 visibility 时内置按钮全部显示，点击回调正常', () => {
    render(<ControlButtons { ...handlers } />)
    const buttons = queryButtons()
    expect(buttons.rotate).toBeTruthy()
    expect(buttons.reset).toBeTruthy()
    expect(buttons.download).toBeTruthy()

    fireEvent.click(buttons.download!)
    expect(handlers.onDownload).toHaveBeenCalledTimes(1)
  })

  it('visibility=false 隐藏全部内置按钮，children 仍渲染', () => {
    render(
      <ControlButtons { ...handlers } visibility={ false }>
        <span>custom</span>
      </ControlButtons>,
    )
    expect(queryButtons()).toEqual({ rotate: null, reset: null, download: null })
    expect(screen.getByText('custom')).toBeTruthy()
  })

  it('对象形态按按钮精细控制，未提及的按钮默认显示', () => {
    render(<ControlButtons { ...handlers } visibility={ { download: false } } />)
    const buttons = queryButtons()
    expect(buttons.rotate).toBeTruthy()
    expect(buttons.reset).toBeTruthy()
    expect(buttons.download).toBeNull()
  })
})
