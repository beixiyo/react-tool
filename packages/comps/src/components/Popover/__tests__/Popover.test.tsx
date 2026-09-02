import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Popover } from '..'

describe('Popover', () => {
  it('hover 触发：移出后延迟关闭，移入浮层内容可取消关闭', async () => {
    render(
      <Popover
        trigger="hover"
        removeDelay={ 120 }
        content={ <div>Hover popover content</div> }
      >
        <button type="button">Hover me</button>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Hover me' }).parentElement!
    fireEvent.mouseEnter(trigger)
    const floating = screen.getByText('Hover popover content').parentElement!
    expect(floating.style.display).not.toBe('none')

    /** 移出触发器后，在 removeDelay 内移入浮层内容，不应关闭 */
    fireEvent.mouseLeave(trigger)
    await sleep(40)
    fireEvent.mouseEnter(floating)
    await sleep(250)
    expect(floating.style.display).not.toBe('none')

    /** 移出浮层内容后才延迟关闭 */
    fireEvent.mouseLeave(floating)
    await waitFor(() => expect(floating.style.display).toBe('none'))
  })

  it('开启箭头时把箭头凸出量计入定位偏移，保证可见间距与无箭头一致', async () => {
    /** jsdom 中触发器矩形为 0，右侧浮层的 left 即为定位偏移 */
    const getFloatingLeft = async (arrow: boolean) => {
      const label = arrow
        ? 'Open arrow popover'
        : 'Open plain popover'
      const text = arrow
        ? 'Arrow popover content'
        : 'Plain popover content'
      const view = render(
        <Popover
          trigger="click"
          position="right"
          arrow={ arrow }
          content={ <div>{ text }</div> }
        >
          <button type="button">{ label }</button>
        </Popover>,
      )

      fireEvent.click(screen.getByRole('button', { name: label }))
      const floating = (await screen.findByText(text)).parentElement!
      await waitFor(() => expect(floating.style.left).not.toBe('-9999px'))
      const left = floating.style.left
      view.unmount()
      return left
    }

    /** 默认 offset 8：无箭头时面板边缘距目标 8px */
    expect(await getFloatingLeft(false)).toBe('8px')
    /** 默认箭头宽 12、高 6，压入面板 1px，尖端凸出 5px，面板需再远 5px */
    expect(await getFloatingLeft(true)).toBe('13px')
  })

  it('关闭控件使用可聚焦的原生按钮并能关闭浮层', async () => {
    render(
      <Popover
        trigger="click"
        showCloseBtn
        content={ <div>Popover content</div> }
      >
        <button type="button">Open popover</button>
      </Popover>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open popover' }))

    const closeButton = await screen.findByRole('button', { name: 'Close popover' })
    closeButton.focus()
    expect(document.activeElement).toBe(closeButton)
    expect(closeButton).toHaveProperty('tabIndex', 0)

    fireEvent.click(closeButton)

    await waitFor(() => expect(closeButton.parentElement?.style.display).toBe('none'))
  })

  it('自定义非 Escape 关闭键只响应浮层自身事件', async () => {
    render(
      <Popover
        trigger="click"
        closeKeys={ ['ArrowRight'] }
        content={ <div>Scoped popover content</div> }
      >
        <button type="button">Open scoped popover</button>
      </Popover>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open scoped popover' }))
    const content = await screen.findByText('Scoped popover content')
    const outsideEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
      cancelable: true,
    })

    fireEvent(document, outsideEvent)
    expect(outsideEvent.defaultPrevented).toBe(false)
    expect(content.parentElement?.style.display).not.toBe('none')

    fireEvent.keyDown(content, { key: 'ArrowRight' })
    await waitFor(() => expect(content.parentElement?.style.display).toBe('none'))
  })
})

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}
