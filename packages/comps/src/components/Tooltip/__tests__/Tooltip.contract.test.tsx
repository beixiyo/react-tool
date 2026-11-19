import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getIdRefViolations, isTabbable } from '../../../__tests__/utils/ariaPatterns'
import { Tooltip } from '../Tooltip'

function dispatchEscape() {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  act(() => {
    document.dispatchEvent(event)
  })
  return event
}

/** jsdom 不区分键盘 / 鼠标聚焦，按键盘聚焦（:focus-visible 命中）模拟 */
function markFocusVisible(el: HTMLElement) {
  const matches = el.matches.bind(el)
  el.matches = ((selector: string) => selector === ':focus-visible' || matches(selector)) as typeof el.matches
}

describe('Tooltip ARIA 契约', () => {
  it('键盘聚焦显示 role=tooltip，tooltip 内无可 Tab 聚焦元素，aria-describedby 可解析', () => {
    render(
      <Tooltip content="保存当前草稿">
        <button type="button">保存</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button', { name: '保存' })
    markFocusVisible(button)
    act(() => button.focus())

    const tooltip = screen.getByRole('tooltip')
    expect(tooltip.textContent).toContain('保存当前草稿')
    expect(Array.from(tooltip.querySelectorAll('*')).filter(isTabbable)).toEqual([])
    expect(document.querySelector(`[aria-describedby="${tooltip.id}"]`)).not.toBeNull()
    expect(getIdRefViolations(document.body)).toEqual([])
  })

  it('Escape 关闭后焦点仍在触发器、aria-describedby 不再悬空，之后不再消费 Escape', () => {
    render(
      <Tooltip content="保存当前草稿">
        <button type="button">保存</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button', { name: '保存' })
    markFocusVisible(button)
    act(() => button.focus())
    expect(screen.getByRole('tooltip')).toBeTruthy()

    expect(dispatchEscape().defaultPrevented).toBe(true)
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(document.activeElement).toBe(button)
    expect(document.querySelector('[aria-describedby]')).toBeNull()

    expect(dispatchEscape().defaultPrevented).toBe(false)
  })

  it('可聚焦的触发元素本身通过 aria-describedby 关联 tooltip，并保留其已有描述', () => {
    render(
      <>
        <span id="own-hint">快捷键 Ctrl+S</span>
        <Tooltip open content="保存当前草稿">
          <button type="button" aria-describedby="own-hint">保存</button>
        </Tooltip>
      </>,
    )
    const tooltip = screen.getByRole('tooltip')
    const button = screen.getByRole('button', { name: '保存' })
    expect(button.getAttribute('aria-describedby')?.split(' ')).toEqual(['own-hint', tooltip.id])
    expect(button.parentElement!.hasAttribute('aria-describedby')).toBe(false)
  })

  it('children 不是单个元素时描述关系回退到包裹层', () => {
    render(<Tooltip open content="说明">纯文本</Tooltip>)
    expect(screen.getByText('纯文本').getAttribute('aria-describedby')).toBe(screen.getByRole('tooltip').id)
  })
})
