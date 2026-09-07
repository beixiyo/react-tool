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
        visible
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

  it('禁用时不渲染箭头', () => {
    render(
      <Tooltip visible content="无箭头" arrow={ false }>
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
      <Modal isOpen onClose={ onModalClose }>
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
      <Modal isOpen onClose={ onModalClose }>
        <Tooltip visible content="常显">
          <button type="button">触发器</button>
        </Tooltip>
      </Modal>,
    )

    pressEscape()
    expect(onModalClose).toHaveBeenCalledOnce()
    expect(screen.getByText('常显')).toBeTruthy()
  })
})
