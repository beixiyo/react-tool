/** 验证命令式更新保留消息节点，并正确重置计时和收尾，不测试动画像素 */
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Message } from '../Message'
import { MessageContainer } from '../subcomponents/MessageContainer'
import { messageStore } from '../subcomponents/messageStore'

// 测试自行挂载真实容器，避免全局注入的根节点跨用例存活
vi.mock('utils', async (importOriginal) => ({
  ...await importOriginal<typeof import('utils')>(),
  injectReactApp: vi.fn(),
}))

beforeEach(() => {
  vi.useFakeTimers()
  render(<MessageContainer />)
})

afterEach(() => {
  act(() => {
    for (const item of messageStore.getSnapshot()) messageStore.remove(item.id)
  })
})

it('loading 原地更新为完成时保留 DOM 节点与堆叠顺序，不关闭或重新展示', () => {
  const onShow = vi.fn()
  const onClose = vi.fn()
  let toast!: ReturnType<typeof Message.loading>

  act(() => {
    Message.info('Another notification', 0)
    toast = Message.loading({ content: 'Switching…', onShow, onClose })
  })
  const ids = messageStore.getSnapshot().map(item => item.id)
  const selector = `[${DATA_ATTR.message.id}="${ids[1]}"]`
  const node = document.querySelector(selector)
  expect(node).not.toBeNull()

  act(() => toast.update({ variant: 'neutral', content: 'Switched to speakers.', duration: 5000 }))

  expect(screen.getByText('Switched to speakers.')).toBeTruthy()
  expect(screen.queryByText('Switching…')).toBeNull()
  expect(document.querySelector(selector)).toBe(node)
  expect(messageStore.getSnapshot().map(item => item.id)).toEqual(ids)
  expect(messageStore.getSnapshot()[1].variant).toBe('neutral')
  expect(onShow).toHaveBeenCalledTimes(1)
  expect(onClose).not.toHaveBeenCalled()
})

it('相同 duration 的再次更新也从更新时间重新计时，其他消息变化不重置计时', () => {
  const onShow = vi.fn()
  const onClose = vi.fn()
  let toast!: ReturnType<typeof Message.neutral>

  act(() => { toast = Message.neutral({ content: 'First result', duration: 5000, onShow, onClose }) })
  act(() => vi.advanceTimersByTime(4000))
  act(() => toast.update({ content: 'Updated result' }))
  act(() => vi.advanceTimersByTime(4000))
  expect(onClose).not.toHaveBeenCalled()

  act(() => { Message.info('Unrelated notification', 0) })
  act(() => vi.advanceTimersByTime(1000))
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(onShow).toHaveBeenCalledTimes(1)
  expect(messageStore.getSnapshot().map(item => item.content)).toEqual(['Unrelated notification'])
})

it('更新为持久 loading 取消旧计时，关闭后的 update 不会复活消息或重复回调', () => {
  const onClose = vi.fn()
  let toast!: ReturnType<typeof Message.error>

  act(() => { toast = Message.error({ content: 'Failed', duration: 1000, onClose }) })
  act(() => toast.update({ variant: 'loading', content: 'Retrying…', duration: 0 }))
  act(() => vi.advanceTimersByTime(5000))
  expect(onClose).not.toHaveBeenCalled()
  expect(screen.getByText('Retrying…')).toBeTruthy()

  act(() => {
    toast.close()
    toast.update({ content: 'Too late', duration: 1000 })
    toast.close()
  })
  expect(messageStore.getSnapshot()).toEqual([])
  expect(onClose).toHaveBeenCalledTimes(1)
})
