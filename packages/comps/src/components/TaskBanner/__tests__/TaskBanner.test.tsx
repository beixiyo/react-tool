/**
 * TaskBanner 的 Esc 关闭
 *
 * 守两条契约：
 * - Esc 与 ✕ 同源：只关最新的一条画了 ✕ 的彩条；处理中的任务、只有操作按钮而没有 ✕ 的提示条
 *   与 `escToClose: false` 的条子不动，自绘 ✕ 的条子靠 `escToClose: true` 接入
 * - 可关彩条在场时同一下 Esc 不会穿透到底下的 Modal，彩条清空后 Esc 才轮到弹窗
 */

import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react'
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

describe('TaskBanner 的整摞收拢', () => {
  /** 配置是全局单例，测完必须还原，否则污染同文件其他用例 */
  afterEach(() => {
    act(() => {
      TaskBanner.config({ collapse: undefined })
    })
  })

  /** 回归：旧实现卸载列表，导致输入状态丢失、超出三层的卡片直接消失。 */
  it('展开、收起和中途反向保留全部真实卡片及其本地输入状态', async () => {
    act(() => {
      TaskBanner.config({ collapse: { threshold: 2 } })
      for (let index = 0; index < 4; index++) {
        TaskBanner.notify({
          content: `persistent-${index}`,
          duration: 0,
          render: () => <input aria-label={ `persistent-${index}` } defaultValue="draft" />,
        })
      }
    })
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[aria-label^="persistent-"]'))
    expect(inputs).toHaveLength(4)
    const hiddenInput = inputs.find((input) => input.getAttribute('aria-label') === 'persistent-0')!
    fireEvent.change(hiddenInput, { target: { value: 'edited draft' } })

    const expand = () => fireEvent.click(document.querySelector('[role="button"][aria-expanded="false"]')!)
    expand()
    pressEscape()
    expand()
    await waitFor(() => expect(document.querySelector('[role="button"][aria-expanded="false"]')).toBeNull())
    inputs.forEach((input) => expect(input.isConnected).toBe(true))
    expect(hiddenInput.value).toBe('edited draft')
    expect(hiddenInput.closest('[inert]')).toBeNull()

    pressEscape()
    inputs.forEach((input) => expect(input.isConnected).toBe(true))
    expect(hiddenInput.closest('[inert]')).not.toBeNull()
  })

  it('不参与收拢的高优先级失败条始终置顶平铺，且不计入收拢阈值', () => {
    act(() => {
      TaskBanner.config({ collapse: { threshold: 4 } })
      for (let index = 0; index < 3; index++) {
        TaskBanner.start({ content: `pending-${index}` })
      }
      const failed = TaskBanner.start({ content: 'pending-failed' })
      failed.fail({
        reason: 'failed-fixed',
        collapseEligible: false,
        priority: 1,
        showClose: true,
      })
    })

    /** 三条处理中任务未达到阈值；失败条不能把它们推入叠层。 */
    expect(document.querySelector('[role="button"][aria-expanded="false"]')).toBeNull()
    const bars = Array.from(document.querySelectorAll('.pointer-events-auto.relative'))
    expect(bars[0]?.textContent).toContain('failed-fixed')

    act(() => {
      TaskBanner.start({ content: 'pending-3' })
    })
    const collapsed = document.querySelector('[role="button"][aria-expanded="false"]')
    expect(collapsed).not.toBeNull()
    expect(collapsed?.textContent).not.toContain('failed-fixed')
    expect(document.body.textContent).toContain('failed-fixed')
  })

  it('达到阈值收拢为层叠卡片；点击展开，Esc 先折回整摞再逐条关彩条', async () => {
    act(() => {
      TaskBanner.config({ collapse: { threshold: 2 } })
      TaskBanner.notify({ content: 'older', duration: 0, showClose: true })
      TaskBanner.notify({ content: 'newer', duration: 0, showClose: true })
    })

    const collapsed = document.querySelector('[role="button"][aria-expanded="false"]')
    expect(collapsed).not.toBeNull()
    /** 下层 DOM 保留但不可交互；两条任务只生成一层露边，不补虚构卡片。 */
    expect(collapsed!.textContent).toContain('newer')
    expect(collapsed!.textContent).toContain('older')
    const stackLayers = Array.from(collapsed!.children)
      .filter((layer) => layer.getAttribute('aria-hidden') === 'true')
    expect(stackLayers).toHaveLength(1)

    fireEvent.click(collapsed!)
    /** 展开后收拢态退出（退场动画期间节点仍在，等它落定），两条独立彩条都在场 */
    await waitFor(() => {
      expect(document.querySelector('[role="button"][aria-expanded="false"]')).toBeNull()
    })
    expect(document.body.textContent).toContain('older')
    expect(document.body.textContent).toContain('newer')

    /** Esc 先折回整摞 */
    pressEscape()
    expect(document.querySelector('[role="button"][aria-expanded="false"]')).not.toBeNull()

    /** 再 Esc 逐条关最新的可关彩条；只剩一条时低于阈值，回到普通彩条 */
    pressEscape()
    expect(taskBannerStore.getSnapshot().map((item) => item.content)).toEqual(['older'])
    await waitFor(() => {
      expect(document.querySelector('[role="button"][aria-expanded="false"]')).toBeNull()
    })

    pressEscape()
    expect(taskBannerStore.getSnapshot()).toHaveLength(0)
  })
})

describe('TaskBanner 失败态统一布局', () => {
  it('默认图标与业务替换图标共用重试、关闭行为', () => {
    const onRetry = vi.fn()
    const onClose = vi.fn()
    let task!: ReturnType<typeof TaskBanner.start>

    act(() => {
      task = TaskBanner.start({ content: 'creating' })
      task.fail({ reason: 'first failure', showClose: true, onRetry, onClose })
    })
    expect(document.querySelector('[aria-label="Retry"] svg')).not.toBeNull()
    expect(document.querySelector('[aria-label="Close"] svg')).not.toBeNull()
    fireEvent.click(document.querySelector('[aria-label="Retry"]')!)
    expect(onRetry).toHaveBeenCalledOnce()
    expect(taskBannerStore.getSnapshot()).toHaveLength(0)

    act(() => {
      task = TaskBanner.start({ content: 'creating again' })
      task.fail({
        reason: 'second failure',
        showClose: true,
        retryIcon: <span data-testid="custom-retry">R</span>,
        failureCloseIcon: <span data-testid="custom-close">C</span>,
        onClose,
      })
    })
    expect(document.querySelector('[aria-label="Retry"] [data-testid="custom-retry"]')).not.toBeNull()
    expect(document.querySelector('[aria-label="Close"] [data-testid="custom-close"]')).not.toBeNull()
    fireEvent.click(document.querySelector('[data-testid="custom-close"]')!)
    expect(onClose).toHaveBeenCalledOnce()
    expect(taskBannerStore.getSnapshot()).toHaveLength(0)
  })
})

describe('TaskBanner 的 Esc', () => {
  it('带 ✕ 的彩条在场：Esc 先关最新的一条，弹窗原地不动；彩条清空后 Esc 才轮到弹窗', () => {
    const onModalClose = vi.fn()
    const onOldClose = vi.fn()
    const onNewClose = vi.fn()
    render(
      <Modal isOpen onClose={ onModalClose }>
        modal
      </Modal>,
    )

    act(() => {
      TaskBanner.notify({ content: 'old', duration: 0, showClose: true, onClose: onOldClose })
    })
    act(() => {
      /** 自绘 ✕ 的条子：组件推断不出，显式声明 */
      TaskBanner.notify({
        content: 'new',
        duration: 0,
        render: ({ close }) => (
          <button type="button" onClick={ close }>
            x
          </button>
        ),
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
    render(
      <Modal isOpen onClose={ onModalClose }>
        modal
      </Modal>,
    )

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
