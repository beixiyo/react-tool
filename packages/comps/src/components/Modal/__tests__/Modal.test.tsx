import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Modal } from '../Modal'
import { closeAllModals } from '../modalStore'

describe('模态框', () => {
  it('显式 z-index 同时决定视觉栈顶和 Escape 响应层', () => {
    const onHighClose = vi.fn()
    const onLowClose = vi.fn()
    render(
      <>
        <Modal isOpen zIndex={ 5000 } onClose={ onHighClose }>high</Modal>
        <Modal isOpen zIndex={ 100 } onClose={ onLowClose }>low</Modal>
      </>,
    )

    const highMask = document.querySelector<HTMLElement>('[style*="z-index: 5000"]')
    const lowMask = document.querySelector<HTMLElement>('[style*="z-index: 100"]')
    expect(highMask?.getAttribute(DATA_ATTR.modal.top)).toBe('true')
    expect(lowMask?.getAttribute(DATA_ATTR.modal.top)).toBe('false')

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    expect(onHighClose).toHaveBeenCalledOnce()
    expect(onLowClose).not.toHaveBeenCalled()
  })

  it('提供 dialog 语义、把焦点移入并循环 Tab，关闭后恢复触发元素焦点', async () => {
    function ModalHarness() {
      const [open, setOpen] = useState(false)

      return (
        <>
          <button onClick={ () => setOpen(true) }>打开</button>
          <Modal
            isOpen={ open }
            onClose={ () => setOpen(false) }
            titleText="测试弹窗"
          >
            <button>第一个</button>
            <button>第二个</button>
          </Modal>
        </>
      )
    }

    render(<ModalHarness />)
    const trigger = screen.getByRole('button', { name: '打开' })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = await screen.findByRole('dialog', { name: '测试弹窗' })
    const first = screen.getByRole('button', { name: '第一个' })
    const second = screen.getByRole('button', { name: '第二个' })
    const cancel = screen.getByRole('button', { name: 'Cancel' })
    const ok = screen.getByRole('button', { name: 'OK' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(first))

    fireEvent.keyDown(first, { key: 'Tab' })
    expect(document.activeElement).toBe(second)
    fireEvent.keyDown(second, { key: 'Tab' })
    expect(document.activeElement).toBe(cancel)
    fireEvent.keyDown(cancel, { key: 'Tab' })
    expect(document.activeElement).toBe(ok)
    fireEvent.keyDown(ok, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(ok)

    const outsideTab = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(outsideTab)
    expect(outsideTab.defaultPrevented).toBe(false)

    fireEvent.click(cancel)
    expect(document.activeElement).toBe(trigger)
  })

  /**
   * 守的是遮罩上的 fixed 关闭按钮：它是 dialog 的兄弟节点、DOM 序在最前，
   * 键盘处理只挂 dialog 时焦点一走到它身上，下一次 Tab 就按浏览器默认导航跑出弹窗
   */
  it('遮罩上的固定关闭按钮也在 Tab 环内', async () => {
    render(
      <Modal isOpen fixedCloseBtn onClose={ () => {} } titleText="固定关闭按钮">
        <button>内容按钮</button>
      </Modal>,
    )

    const dialog = await screen.findByRole('dialog', { name: '固定关闭按钮' })
    const closeBtn = dialog.parentElement!.querySelector('button')!
    expect(dialog.contains(closeBtn)).toBe(false)

    closeBtn.focus()
    const backward = dispatchKeyFrom(closeBtn, 'Tab', { shiftKey: true })
    expect(backward.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'OK' }))

    closeBtn.focus()
    dispatchKeyFrom(closeBtn, 'Tab')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '内容按钮' }))
  })

  /**
   * 守的是「替用户关弹窗」绕过宿主规则：走各自的 onClose 才能让有草稿的弹窗先弹确认，
   * 禁了 Esc 的弹窗（强制二选一）不该被程序偷偷关掉
   */
  it('closeAllModals 从栈顶到栈底逐层请求 onClose，禁 Esc 与无 onClose 的留下', () => {
    const calls: string[] = []
    render(
      <>
        <Modal isOpen zIndex={ 100 } onClose={ () => calls.push('low') }>low</Modal>
        <Modal isOpen zIndex={ 5000 } onClose={ () => calls.push('high') }>high</Modal>
        <Modal isOpen zIndex={ 300 } escToClose={ false } onClose={ () => calls.push('forced') }>forced</Modal>
        <Modal isOpen zIndex={ 200 }>no-close</Modal>
      </>,
    )

    let result!: ReturnType<typeof closeAllModals>
    act(() => {
      result = closeAllModals()
    })

    expect(calls).toEqual(['high', 'low'])
    expect(result).toEqual({ closed: 2, blocked: 2 })
  })

  /**
   * 守的是栈的稳定性：中途改 escToClose 若导致重新入栈，弹窗会领到更高的 z-index，
   * 反过来盖住已经开在它上面的子弹窗（父弹窗写 `escToClose={ !saving }` 就会踩到）
   */
  it('中途改 escToClose 不会让弹窗重新入栈抢走栈顶', () => {
    function StackHarness({ parentEscToClose }: { parentEscToClose: boolean }) {
      return (
        <>
          <Modal isOpen escToClose={ parentEscToClose } onClose={ () => {} }>parent</Modal>
          <Modal isOpen onClose={ () => {} }>child</Modal>
        </>
      )
    }

    const { rerender } = render(<StackHarness parentEscToClose />)
    const parentMask = screen.getByText('parent').closest(`[${DATA_ATTR.modal.top}]`)
    const childMask = screen.getByText('child').closest(`[${DATA_ATTR.modal.top}]`)
    expect(childMask?.getAttribute(DATA_ATTR.modal.top)).toBe('true')

    rerender(<StackHarness parentEscToClose={ false } />)
    expect(childMask?.getAttribute(DATA_ATTR.modal.top)).toBe('true')
    expect(parentMask?.getAttribute(DATA_ATTR.modal.top)).toBe('false')
  })

  it('仅在打开期间消费 Escape，关闭后注销键盘层', async () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={ false } onClose={ onClose } titleText="生命周期弹窗" />,
    )

    const closedBeforeOpen = dispatchKey('Escape')
    expect(closedBeforeOpen.defaultPrevented).toBe(false)

    rerender(<Modal isOpen onClose={ onClose } titleText="生命周期弹窗" />)
    await screen.findByRole('dialog', { name: '生命周期弹窗' })
    const openEvent = dispatchKey('Escape')
    expect(openEvent.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledOnce()

    rerender(<Modal isOpen={ false } onClose={ onClose } titleText="生命周期弹窗" />)
    const closedAfterOpen = dispatchKey('Escape')
    expect(closedAfterOpen.defaultPrevented).toBe(false)
  })

  /**
   * 声明式与命令式的 `onOk` 必须同一套语义：早先声明式确认按钮是裸 `onClick={ onOk }`，
   * 业务层每处都得自己写「await、loading、成功后关」，漏一处就是动作跑完弹窗还在
   */
  describe('确认语义', () => {
    /** 点击真实的确认按钮会触发 Button 的 WAAPI 反馈，jsdom 没有；与 DatePicker 测试同款桩 */
    beforeAll(() => {
      if (!Element.prototype.animate) {
        Element.prototype.animate = vi.fn(() => ({
          cancel: vi.fn(),
        } as unknown as Animation))
      }
    })

    it('异步 onOk 期间确认按钮 loading 并拒绝重复提交，resolve 后自动 onClose', async () => {
      let resolveOk!: () => void
      const onOk = vi.fn(() =>
        new Promise<void>((resolve) => {
          resolveOk = resolve
        })
      )
      const onClose = vi.fn()
      render(
        <Modal isOpen onOk={ onOk } onClose={ onClose } okText="确定" titleText="异步确认">
          <input aria-label="内容" />
        </Modal>,
      )

      const okButton = await screen.findByRole('button', { name: '确定' })
      fireEvent.click(okButton)
      fireEvent.click(okButton)
      /** Enter 必须从弹窗内部发：在 document 上派发不经过遮罩，React 的 onKeyDown 收不到 */
      dispatchKeyFrom(screen.getByRole('textbox', { name: '内容' }), 'Enter')

      expect(onOk).toHaveBeenCalledOnce()
      /** 不传参：接到按钮上会把 MouseEvent 塞进带默认参数的回调 */
      expect(onOk.mock.calls[0]).toHaveLength(0)
      expect(onClose).not.toHaveBeenCalled()

      await act(async () => {
        resolveOk()
      })
      expect(onClose).toHaveBeenCalledOnce()
    })

    /**
     * 守的是过期回写：异步确认在飞时按 Esc，宿主的 onClose 已经跑过一次，
     * 请求落定后不该再跑第二次（`onClose` 里带提示、`navigate(-1)` 的会多做一次）
     */
    it('异步 onOk 落定前弹窗已被关掉，不再重复请求关闭', async () => {
      let resolveOk!: () => void
      const onClose = vi.fn()

      function AsyncOkHarness() {
        const [open, setOpen] = useState(true)

        return (
          <Modal
            isOpen={ open }
            okText="确定"
            titleText="落定前已关"
            onOk={ () =>
              new Promise<void>((resolve) => {
                resolveOk = resolve
              }) }
            onClose={ () => {
              onClose()
              setOpen(false)
            } }
          />
        )
      }

      render(<AsyncOkHarness />)
      fireEvent.click(await screen.findByRole('button', { name: '确定' }))
      dispatchKey('Escape')
      expect(onClose).toHaveBeenCalledOnce()

      await act(async () => {
        resolveOk()
      })
      expect(onClose).toHaveBeenCalledOnce()
    })

    /**
     * 守的是非离散更新的时间窗：宿主从定时器 / 消息回调翻 `isOpen` 时，
     * 把它同步进内部 `open` 的 passive effect 比这次 commit 晚一拍
     * 只认内部 `open` 会在这段窗口里把已经关掉的弹窗当成还开着，再替宿主关一次
     */
    it('宿主在非离散更新里关掉弹窗后，异步 onOk 落定不再回写', async () => {
      let resolveOk!: () => void
      let closeFromOutside!: () => void
      const onClose = vi.fn()

      function OutsideCloseHarness() {
        const [open, setOpen] = useState(true)
        closeFromOutside = () => setOpen(false)

        return (
          <Modal
            isOpen={ open }
            okText="确定"
            titleText="外部关闭"
            onOk={ () =>
              new Promise<void>((resolve) => {
                resolveOk = resolve
              }) }
            onClose={ onClose }
          />
        )
      }

      render(<OutsideCloseHarness />)
      fireEvent.click(await screen.findByRole('button', { name: '确定' }))

      await act(async () => {
        /** flushSync 同步提交这次关闭，passive effect 仍排在后面——正是那段窗口 */
        flushSync(() => closeFromOutside())
        resolveOk()
      })

      expect(onClose).not.toHaveBeenCalled()
    })

    /**
     * 守的是错误可见性：同步 throw 多半是 onOk 里的编程错误，
     * 吞成一条 console.error 之后用户看到的只是「点了没反应」，错误上报也收不到
     */
    it('onOk 同步抛出的异常照常冒泡，不被吞成日志', async () => {
      const onClose = vi.fn()
      const boom = new Error('boom')
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const escaped: unknown[] = []
      const catchError = (event: ErrorEvent) => {
        event.preventDefault()
        escaped.push(event.error)
      }

      render(
        <Modal
          isOpen
          okText="确定"
          titleText="同步抛错"
          onClose={ onClose }
          onOk={ () => {
            throw boom
          } }
        />,
      )

      window.addEventListener('error', catchError)
      try {
        fireEvent.click(await screen.findByRole('button', { name: '确定' }))
      }
      finally {
        window.removeEventListener('error', catchError)
      }

      expect(escaped).toEqual([boom])
      expect(consoleError).not.toHaveBeenCalled()
      /** 抛错等于没落定：弹窗保持打开，确认按钮也没卡在 loading */
      expect(onClose).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: '确定' }).getAttribute('disabled')).toBe(null)
      consoleError.mockRestore()
    })

    it('返回 false 或 reject 时保持打开；closeOnOk 关掉后不自动关', async () => {
      const onClose = vi.fn()
      const { rerender } = render(
        <Modal isOpen onOk={ () => false } onClose={ onClose } okText="确定" titleText="保持打开" />,
      )
      fireEvent.click(await screen.findByRole('button', { name: '确定' }))
      expect(onClose).not.toHaveBeenCalled()

      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      rerender(
        <Modal isOpen onOk={ () => Promise.reject(new Error('boom')) } onClose={ onClose } okText="确定" titleText="保持打开" />,
      )
      await act(async () => {
        fireEvent.click(await screen.findByRole('button', { name: '确定' }))
      })
      expect(onClose).not.toHaveBeenCalled()
      consoleError.mockRestore()

      rerender(
        <Modal isOpen closeOnOk={ false } onOk={ () => {} } onClose={ onClose } okText="确定" titleText="保持打开" />,
      )
      fireEvent.click(await screen.findByRole('button', { name: '确定' }))
      expect(onClose).not.toHaveBeenCalled()

      rerender(
        <Modal isOpen onOk={ () => {} } onClose={ onClose } okText="确定" titleText="保持打开" />,
      )
      fireEvent.click(await screen.findByRole('button', { name: '确定' }))
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  it('默认允许在单行输入中按 Enter 触发确认', async () => {
    const onOk = vi.fn()
    render(
      <Modal isOpen onOk={ onOk } titleText="Enter 确认">
        <input aria-label="名称" />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '名称' })
    const event = dispatchKeyFrom(input, 'Enter')

    expect(event.defaultPrevented).toBe(true)
    expect(onOk).toHaveBeenCalledOnce()
  })

  it('可关闭 Enter 确认，并保留 textarea 自身的换行语义', async () => {
    const onOk = vi.fn()
    const { rerender } = render(
      <Modal isOpen enterToConfirm={ false } onOk={ onOk } titleText="关闭 Enter 确认">
        <input aria-label="名称" />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '名称' })
    const disabledEvent = dispatchKeyFrom(input, 'Enter')
    expect(disabledEvent.defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()

    rerender(
      <Modal isOpen onOk={ onOk } titleText="保留多行输入">
        <textarea aria-label="备注" />
      </Modal>,
    )
    const textareaEvent = dispatchKeyFrom(screen.getByRole('textbox', { name: '备注' }), 'Enter')
    expect(textareaEvent.defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()
  })

  /**
   * 守的是「没有可确认目标就别接管 Enter」：早先无条件挂确认处理器，
   * 没有 `onOk` 的弹窗按 Enter 会走 `closeOnOk` 自动关闭，宿主自带 `<form>` 的隐式提交也被 preventDefault 掉
   */
  it('没有 onOk 且 footer 为 null 时 Enter 不接管、不关闭弹窗', async () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen footer={ null } onClose={ onClose } titleText="自带表单">
        <input aria-label="邮箱" />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '邮箱' })
    expect(dispatchKeyFrom(input, 'Enter').defaultPrevented).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('打开时优先聚焦标记了 autofocus 属性的元素', async () => {
    render(
      <Modal isOpen footer={ null } titleText="指定初始焦点">
        <button>关闭</button>
        <input aria-label="邮箱" { ...{ [DATA_ATTR.modal.autofocus]: true } } />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '邮箱' })
    await waitFor(() => expect(document.activeElement).toBe(input))
  })

  it('确认加载或禁用时不响应 Enter', async () => {
    const onOk = vi.fn()
    const { rerender } = render(
      <Modal isOpen footer={ null } okLoading onOk={ onOk } titleText="确认中">
        <input aria-label="内容" />
      </Modal>,
    )

    const input = await screen.findByRole('textbox', { name: '内容' })
    expect(dispatchKeyFrom(input, 'Enter').defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()

    rerender(
      <Modal isOpen footer={ null } okButtonProps={ { disabled: true } } onOk={ onOk } titleText="确认禁用">
        <input aria-label="内容" />
      </Modal>,
    )
    expect(dispatchKeyFrom(input, 'Enter').defaultPrevented).toBe(false)
    expect(onOk).not.toHaveBeenCalled()
  })

  it('多个 Modal 同时打开时只确认视觉栈顶', async () => {
    const onHighOk = vi.fn()
    const onLowOk = vi.fn()
    render(
      <>
        <Modal isOpen zIndex={ 5000 } onOk={ onHighOk } titleText="高层弹窗">
          <input aria-label="高层输入" />
        </Modal>
        <Modal isOpen zIndex={ 100 } onOk={ onLowOk } titleText="低层弹窗">
          <input aria-label="低层输入" />
        </Modal>
      </>,
    )

    const highInput = await screen.findByRole('textbox', { name: '高层输入' })
    dispatchKeyFrom(highInput, 'Enter')

    expect(onHighOk).toHaveBeenCalledOnce()
    expect(onLowOk).not.toHaveBeenCalled()
  })
})

function dispatchKey(key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  })
  act(() => document.dispatchEvent(event))
  return event
}

function dispatchKeyFrom(target: Element, key: string, init?: KeyboardEventInit) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  })
  act(() => target.dispatchEvent(event))
  return event
}
