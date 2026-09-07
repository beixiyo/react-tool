/**
 * TaskBanner 的 Esc 关闭
 *
 * 守两条契约：
 * - Esc 与 ✕ 同源：只关最新的一条画了 ✕ 的彩条；处理中的任务、只有操作按钮而没有 ✕ 的提示条
 *   与 `escToClose: false` 的条子不动，自绘 ✕ 的条子靠 `escToClose: true` 接入
 * - 可关彩条在场时同一下 Esc 不会穿透到底下的 Modal，彩条清空后 Esc 才轮到弹窗
 */

import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from '../../Modal'
import { TaskBanner } from '..'
import { taskBannerStore } from '../taskBannerStore'

function pressEscape(): void {
  act(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  })
}

afterEach(() => {
  cleanup()
  act(() => {
    for (const item of taskBannerStore.getSnapshot()) taskBannerStore.remove(item.id)
  })
})

describe('TaskBanner 的退场', () => {
  /** 最后一条出栈时整组为空，栈若随之卸载，AnimatePresence 也没了，条子会当场消失 */
  it('关掉最后一条彩条后节点仍留在 DOM 里等退场动画', () => {
    act(() => {
      TaskBanner.notify({ content: 'last one', duration: 0, showClose: true })
    })
    expect(document.body.textContent).toContain('last one')

    pressEscape()
    expect(taskBannerStore.getSnapshot()).toHaveLength(0)
    expect(document.body.textContent).toContain('last one')
  })
})

describe('TaskBanner 的 Esc', () => {
  it('带 ✕ 的彩条在场：Esc 先关最新的一条，弹窗原地不动；彩条清空后 Esc 才轮到弹窗', () => {
    const onModalClose = vi.fn()
    const onOldClose = vi.fn()
    const onNewClose = vi.fn()
    render(<Modal isOpen onClose={ onModalClose }>modal</Modal>)

    act(() => {
      TaskBanner.notify({ content: 'old', duration: 0, showClose: true, onClose: onOldClose })
    })
    act(() => {
      /** 自绘 ✕ 的条子：组件推断不出，显式声明 */
      TaskBanner.notify({
        content: 'new',
        duration: 0,
        render: ({ close }) => <button type="button" onClick={ close }>x</button>,
        escToClose: true,
        onClose: onNewClose,
      })
    })

    pressEscape()
    expect(onNewClose).toHaveBeenCalledOnce()
    expect(onOldClose).not.toHaveBeenCalled()
    expect(onModalClose).not.toHaveBeenCalled()

    pressEscape()
    expect(onOldClose).toHaveBeenCalledOnce()
    expect(onModalClose).not.toHaveBeenCalled()

    pressEscape()
    expect(onModalClose).toHaveBeenCalledOnce()
  })

  it('没有 ✕ 的提示条、处理中的任务与 escToClose: false 不接 Esc；失败后画了 ✕ 才可关', () => {
    const onModalClose = vi.fn()
    const onUndoClose = vi.fn()
    const onLockedClose = vi.fn()
    const onFailClose = vi.fn()
    render(<Modal isOpen onClose={ onModalClose }>modal</Modal>)

    let task!: ReturnType<typeof TaskBanner.start>
    act(() => {
      task = TaskBanner.start('creating')
      /** 只有操作按钮、没有 ✕ 的提示条 */
      TaskBanner.notify({ content: 'action only', duration: 0, action: { text: 'Do it', onClick: vi.fn() }, onClose: onUndoClose })
      TaskBanner.notify({ content: 'locked', duration: 0, showClose: true, escToClose: false, onClose: onLockedClose })
    })

    pressEscape()
    expect(onUndoClose).not.toHaveBeenCalled()
    expect(onLockedClose).not.toHaveBeenCalled()
    expect(onModalClose).toHaveBeenCalledOnce()

    act(() => {
      task.fail({ reason: 'boom', onRetry: vi.fn(), onClose: onFailClose })
    })
    pressEscape()
    expect(onFailClose).not.toHaveBeenCalled()
    expect(onModalClose).toHaveBeenCalledTimes(2)

    act(() => {
      task.close()
      task = TaskBanner.start('creating again')
      task.fail({ reason: 'boom', showClose: true, onRetry: vi.fn(), onClose: onFailClose })
    })
    pressEscape()
    expect(onFailClose).toHaveBeenCalledOnce()
    expect(onModalClose).toHaveBeenCalledTimes(2)
  })
})
