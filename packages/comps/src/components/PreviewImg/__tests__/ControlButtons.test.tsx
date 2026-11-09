// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ControlButtons } from '../subcomponents/ControlButtons'
import type { PreviewImgOverlayCtx } from '../types'

const ctx: PreviewImgOverlayCtx = {
  images: ['a.png'],
  currentIndex: 0,
  currentSrc: 'a.png',
  scale: 1,
  rotation: 0,
  select: vi.fn(),
  prev: vi.fn(),
  next: vi.fn(),
  rotate: vi.fn(),
  reset: vi.fn(),
  copy: vi.fn(async () => {}),
  download: vi.fn(async () => {}),
  close: vi.fn(),
}

describe('ControlButtons 有序按钮契约', () => {
  it('按指定顺序渲染内置与自定义项，点击传递当前上下文', () => {
    const onClick = vi.fn()
    render(
      <ControlButtons
        ctx={ ctx }
        items={ [
          'download',
          { key: 'delete', icon: <span>×</span>, label: '删除', onClick },
          'copy',
        ] }
      />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(['Download image', '删除', 'Copy image'])
    fireEvent.click(buttons[1])
    expect(onClick).toHaveBeenCalledWith(ctx)
  })

  it('悬停按钮显示对应提示并置于预览层之上', () => {
    render(<ControlButtons ctx={ ctx } items={ ['copy'] } tooltipZIndex={ 1901 } />)
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Copy image' }).parentElement!)
    const tooltip = screen.getByText('Copy image')
    expect(tooltip.style.zIndex).toBe('1901')
    fireEvent.mouseLeave(screen.getByRole('button', { name: 'Copy image' }).parentElement!)
    expect(screen.queryByText('Copy image')).toBeNull()
  })

  it('全局关闭时可为内置项和自定义项单独开启提示', () => {
    render(
      <ControlButtons
        ctx={ ctx }
        tooltip={ false }
        items={ [
          'copy',
          { name: 'download', tooltip: true },
          { key: 'delete', label: '删除', icon: <span>×</span>, tooltip: true, onClick: vi.fn() },
        ] }
      />,
    )
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Copy image' }).parentElement!)
    expect(screen.queryByText('Copy image')).toBeNull()
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Download image' }).parentElement!)
    expect(screen.getByText('Download image')).toBeTruthy()
    fireEvent.mouseEnter(screen.getByRole('button', { name: '删除' }).parentElement!)
    expect(screen.getByText('删除')).toBeTruthy()
  })

  it('全局开启时可单独关闭提示', () => {
    render(<ControlButtons ctx={ ctx } items={ [{ name: 'copy', tooltip: false }] } />)
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Copy image' }).parentElement!)
    expect(screen.queryByText('Copy image')).toBeNull()
  })

  it('空列表不渲染容器；加载时禁用复制和下载', () => {
    const view = render(<ControlButtons ctx={ ctx } items={ [] } />)
    expect(view.container.firstChild).toBeNull()
    view.rerender(<ControlButtons ctx={ ctx } items={ ['copy', 'download'] } disabled />)
    expect((screen.getByRole('button', { name: 'Copy image' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Download image' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
