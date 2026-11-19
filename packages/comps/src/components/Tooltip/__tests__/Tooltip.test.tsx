import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Modal } from '../../Modal'
import { Tooltip } from '..'

function pressEscape(): void {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  })
}

const floatingArrowSelector = `[${DATA_ATTR.floatingArrow}]`

describe('提示框', () => {
  it('渲染带有配置箭头的单个提示框', () => {
    render(
      <Tooltip
        open
        content="提示内容"
        arrow={ { size: 16 } }
      >
        <button type="button">触发器</button>
      </Tooltip>,
    )

    expect(screen.getAllByText('提示内容')).toHaveLength(1)
    expect(document.querySelectorAll(floatingArrowSelector)).toHaveLength(1)
    expect(document.querySelector(floatingArrowSelector)?.getAttribute('width')).toBe('16')
  })

  /** 只给高度时宽度要按默认宽高比跟随，且绘制区与定位用的宽度一致，否则箭头会偏离触发器中心 */
  it('只配置箭头高度时按默认宽高比推算宽度', () => {
    render(
      <Tooltip open content="提示内容" arrow={ { height: 14 } }>
        <button type="button">触发器</button>
      </Tooltip>,
    )

    expect(document.querySelector(floatingArrowSelector)?.getAttribute('width')).toBe('48')
  })

  it('禁用时不渲染箭头', () => {
    render(
      <Tooltip open content="无箭头" arrow={ false }>
        <button type="button">触发器</button>
      </Tooltip>,
    )

    expect(screen.getByText('无箭头')).toBeTruthy()
    expect(document.querySelector(floatingArrowSelector)).toBeNull()
  })

  /** Tooltip 视觉上压过弹窗，Esc 顺序也要一致：先关提示，再关弹窗 */
  it('弹窗里点开的提示框：第一下 Esc 只关提示，第二下才关弹窗', () => {
    const onModalClose = vi.fn()
    render(
      <Modal open onClose={ onModalClose }>
        <Tooltip trigger="click" content="提示内容">
          <button type="button">触发器</button>
        </Tooltip>
      </Modal>,
    )

    fireEvent.click(screen.getByText('触发器').parentElement!)
    expect(screen.getByText('提示内容')).toBeTruthy()

    pressEscape()
    expect(screen.queryByText('提示内容')).toBeNull()
    expect(onModalClose).not.toHaveBeenCalled()

    pressEscape()
    expect(onModalClose).toHaveBeenCalledOnce()
  })

  /** 受控可见的提示框关不掉自己，不能占着栈顶把弹窗的 Esc 吃掉 */
  it('受控常显的提示框不拦截 Esc', () => {
    const onModalClose = vi.fn()
    render(
      <Modal open onClose={ onModalClose }>
        <Tooltip open content="常显">
          <button type="button">触发器</button>
        </Tooltip>
      </Modal>,
    )

    pressEscape()
    expect(onModalClose).toHaveBeenCalledOnce()
    expect(screen.getByText('常显')).toBeTruthy()
  })

  it('浮层为 role="tooltip"，显示时触发器经 aria-describedby 关联', () => {
    const { rerender } = render(
      <Tooltip open={ false } content="说明文字">
        <button type="button">触发器</button>
      </Tooltip>,
    )
    /** 单个元素 children 时描述关系注入到该元素本身 */
    const triggerEl = screen.getByText('触发器')
    expect(triggerEl.hasAttribute('aria-describedby')).toBe(false)

    rerender(
      <Tooltip open content="说明文字">
        <button type="button">触发器</button>
      </Tooltip>,
    )
    const tooltip = screen.getByRole('tooltip')
    expect(tooltip.textContent).toContain('说明文字')
    expect(triggerEl.getAttribute('aria-describedby')).toBe(tooltip.id)
  })

  it('hover 模式下键盘聚焦触发器显示，Esc 关闭，失焦隐藏', () => {
    const onOpenChange = vi.fn()
    render(
      <Tooltip content="键盘提示" onOpenChange={ onOpenChange }>
        <button type="button">触发器</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button', { name: '触发器' })
    /** jsdom 不区分键盘 / 鼠标聚焦，按键盘聚焦（:focus-visible 命中）模拟 */
    const matches = button.matches.bind(button)
    button.matches = ((selector: string) => selector === ':focus-visible' || matches(selector)) as typeof button.matches

    act(() => button.focus())
    expect(screen.getByRole('tooltip').textContent).toContain('键盘提示')
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    pressEscape()
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    act(() => button.blur())
    act(() => button.focus())
    expect(screen.getByRole('tooltip')).toBeTruthy()
    act(() => button.blur())
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('鼠标点击产生的聚焦（非 :focus-visible）不显示提示', () => {
    render(
      <Tooltip content="不该出现">
        <button type="button">触发器</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button', { name: '触发器' })
    button.matches = ((_selector: string) => false) as typeof button.matches

    act(() => button.focus())
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('defaultOpen 非受控初始显示', () => {
    render(
      <Tooltip defaultOpen content="初始显示">
        <button type="button">触发器</button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip').textContent).toContain('初始显示')
  })

  it('受控 open 配合 onOpenChange 时 Esc 请求关闭', () => {
    const onOpenChange = vi.fn()
    render(
      <Tooltip open onOpenChange={ onOpenChange } content="受控">
        <button type="button">触发器</button>
      </Tooltip>,
    )
    expect(screen.getByRole('tooltip')).toBeTruthy()

    pressEscape()
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false)
    /** 受控：关闭由调用方决定 */
    expect(screen.getByRole('tooltip')).toBeTruthy()
  })
})
