import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Drawer } from '../Drawer'

describe('Drawer 焦点管理', () => {
  it('打开时跳过隐藏和禁用控件，关闭后恢复原焦点', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()

    const { rerender } = render(
      <Drawer open closeButton={ false } ariaLabel="编辑抽屉">
        <div hidden>
          <button>隐藏操作</button>
        </div>
        <input disabled aria-label="禁用输入" />
        <button>可用操作</button>
      </Drawer>,
    )

    const enabledButton = screen.getByRole('button', { name: '可用操作' })
    await waitFor(() => expect(document.activeElement).toBe(enabledButton))

    rerender(
      <Drawer open={ false } closeButton={ false } ariaLabel="编辑抽屉">
        <button>可用操作</button>
      </Drawer>,
    )
    expect(document.activeElement).toBe(trigger)

    trigger.remove()
  })
})
