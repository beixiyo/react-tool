import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SplitPane } from '../SplitPane'

function Demo({ storageKey, disabled = false }: { storageKey?: string; disabled?: boolean }) {
  return (
    <SplitPane storageKey={ storageKey } animationDuration={ 0 } draggableDividers={ [!disabled, !disabled] }>
      <SplitPane.Panel id="left" minWidth={ 200 } defaultWidth={ 280 }>左栏</SplitPane.Panel>
      <SplitPane.Panel id="center">中栏</SplitPane.Panel>
      <SplitPane.Panel id="right" minWidth={ 240 } defaultWidth={ 320 }>右栏</SplitPane.Panel>
    </SplitPane>
  )
}

function mockWidth() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 1200,
    height: 600,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 1200,
    bottom: 600,
    toJSON: () => ({}),
  })
}

function save(key: string, sizes: number[]) {
  localStorage.setItem(key, JSON.stringify({ sizes, widthsBeforeCollapse: sizes, collapsedStates: [false, false, false] }))
}

describe('SplitPane 公共交互', () => {
  it('初始化后继续监听存活容器，窗口缩放会同步调整预算', () => {
    let width = 1200
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function(this: Element) {
      const current = this.isConnected
        ? width
        : 0
      return { width: current, height: 600, x: 0, y: 0, top: 0, left: 0, right: current, bottom: 600, toJSON: () => ({}) }
    })
    render(<Demo />)
    width = 800
    fireEvent(window, new Event('resize'))
    const separator = screen.getAllByRole('separator')[0]
    fireEvent.keyDown(separator, { key: 'End' })
    expect(separator.getAttribute('aria-valuenow')).toBe('372')
  })

  it('切换存储身份时恢复目标布局，不把待保存的旧布局写入新键', () => {
    vi.useFakeTimers()
    mockWidth()
    save('A', [280, 592, 320])
    save('B', [220, 680, 292])
    const { rerender } = render(<Demo storageKey="A" />)
    const separator = screen.getAllByRole('separator')[0]
    fireEvent.mouseDown(separator, { clientX: 280, button: 0 })
    fireEvent.mouseMove(document, { clientX: 310 })
    fireEvent.mouseUp(document)
    rerender(<Demo storageKey="B" />)
    act(() => vi.advanceTimersByTime(100))
    expect(JSON.parse(localStorage.getItem('B')!).sizes).toEqual([220, 680, 292])
    expect(screen.getByText('左栏').closest('[id]')?.getAttribute('style')).toContain('220px')
  })

  it('键盘可调整、跳到边界并收起展开，状态与焦点保持同步', () => {
    mockWidth()
    render(<Demo />)
    const separator = screen.getAllByRole('separator')[0]
    separator.focus()
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(separator.getAttribute('aria-valuenow')).toBe('290')
    fireEvent.keyDown(separator, { key: 'Home' })
    expect(separator.getAttribute('aria-valuenow')).toBe('200')
    fireEvent.keyDown(separator, { key: 'End' })
    expect(separator.getAttribute('aria-valuenow')).toBe('772')
    fireEvent.keyDown(separator, { key: 'Enter' })
    expect(separator.getAttribute('aria-valuenow')).toBe('0')
    expect(document.activeElement).toBe(separator)
    const button = screen.getByRole('button', { name: 'Expand left panel' })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    button.focus()
    // 原生按钮的键盘激活会生成 detail=0 的 click
    fireEvent.click(button, { detail: 0 })
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(button)
  })

  it('禁用分隔条不响应键盘调整', () => {
    mockWidth()
    render(<Demo disabled />)
    const separator = screen.getAllByRole('separator')[0]
    fireEvent.keyDown(separator, { key: 'ArrowRight' })
    expect(separator.getAttribute('aria-valuenow')).toBe('280')
    expect(separator.getAttribute('tabindex')).toBe('-1')
  })
})
