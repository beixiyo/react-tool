// @vitest-environment jsdom

/**
 * 容器层级契约：单条消息的 zIndex 能把整个堆叠容器抬到更高层之上（如预览层）
 * 容器是 fixed 层叠上下文，不抬容器的话消息会被更高层遮住
 */
import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Z } from '../../../constants/z-index'
import { Message } from '../Message'
import { MessageContainer } from '../subcomponents/MessageContainer'
import { messageStore } from '../subcomponents/messageStore'

/** 不真的注入全局容器，本测试自行渲染 MessageContainer */
vi.mock('utils', async (importOriginal) => ({
  ...await importOriginal<typeof import('utils')>(),
  injectReactApp: vi.fn(),
}))

afterEach(() => {
  act(() => {
    for (const item of messageStore.getSnapshot()) messageStore.remove(item.id)
  })
})

describe('MessageContainer 层叠上下文', () => {
  it('容器 z-index 取消息里的最高 zIndex，无消息或未传时保持 Z.toast', () => {
    const { container } = render(<MessageContainer />)
    const root = container.firstElementChild as HTMLElement
    expect(root.style.zIndex).toBe(String(Z.toast))

    act(() => Message.neutral({ content: 'plain', duration: 0 }))
    expect(root.style.zIndex).toBe(String(Z.toast))

    act(() => Message.neutral({ content: 'over preview', duration: 0, zIndex: Z.preview + 1 }))
    expect(root.style.zIndex).toBe(String(Z.preview + 1))

    /** 高层消息关闭后回落到默认层 */
    act(() => {
      for (const item of messageStore.getSnapshot()) messageStore.remove(item.id)
    })
    expect(root.style.zIndex).toBe(String(Z.toast))
  })
})
