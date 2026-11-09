// @vitest-environment jsdom

/**
 * Ctrl/Cmd+C 复制当前图片的契约：
 * 剪贴板写入、平台主修饰键区分、可编辑焦点不拦截、Message 反馈与 onCopy 交接
 */
import { fireEvent, render, waitFor } from '@testing-library/react'
import { I18nProvider } from 'i18n/react'
import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Z } from '../../../constants/z-index'
import { allResources } from '../../../i18n'
import { messageStore } from '../../Message/subcomponents/messageStore'
import { PreviewImg } from '../PreviewImg'
import type { PreviewImgCopyResult } from '../types'
import { copyImageToClipboard } from '../utils'

/** 拦住全局消息容器注入，反馈改从 messageStore 断言，避免动画与跨用例残留 */
vi.mock('utils', async (importOriginal) => ({
  ...await importOriginal<typeof import('utils')>(),
  injectReactApp: vi.fn(() => () => {}),
}))

const pngBlob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' })
const jpegBlob = new Blob([new Uint8Array([4, 5, 6])], { type: 'image/jpeg' })

let fetchMock: ReturnType<typeof vi.fn>
let writeMock: ReturnType<typeof vi.fn>

/** 仿冒剪贴板条目：只承载数据，写入语义由 writeMock 模拟 */
class FakeClipboardItem {
  data: Record<string, unknown>

  constructor(data: Record<string, unknown>) {
    this.data = data
  }
}

beforeEach(() => {
  /** 模拟真实剪贴板：数据 Promise 兑现后才写入成功，任一失败则整次写入失败 */
  writeMock = vi.fn(async (items: FakeClipboardItem[]) => {
    await Promise.all(items.flatMap((item) => Object.values(item.data)))
  })
  fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => pngBlob })

  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('ClipboardItem', FakeClipboardItem)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { write: writeMock },
  })

  setPlatform('Win32', 'Windows')
})

afterEach(() => {
  vi.unstubAllGlobals()
  for (const item of messageStore.getSnapshot()) messageStore.remove(item.id)
})

describe('copyImageToClipboard', () => {
  it('PNG 图片原样写入剪贴板的 image/png 通道', async () => {
    await copyImageToClipboard('https://example.com/a.png')

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/a.png')
    expect(writeMock).toHaveBeenCalledTimes(1)

    const item = writeMock.mock.calls[0][0][0] as FakeClipboardItem
    expect(Object.keys(item.data)).toEqual(['image/png'])
    await expect(item.data['image/png'] as Promise<Blob>).resolves.toBe(pngBlob)
  })

  it('非 PNG 图片转码成 PNG 后写入', async () => {
    const encodedPng = new Blob([new Uint8Array([7])], { type: 'image/png' })
    const bitmap = { width: 4, height: 2, close: vi.fn() }
    const createImageBitmapMock = vi.fn().mockResolvedValue(bitmap)
    const drawImageMock = vi.fn()
    vi.stubGlobal('createImageBitmap', createImageBitmapMock)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: drawImageMock } as any)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback: any) => callback(encodedPng))
    fetchMock.mockResolvedValue({ ok: true, blob: async () => jpegBlob })

    await copyImageToClipboard('https://example.com/b.jpg')

    expect(createImageBitmapMock).toHaveBeenCalledWith(jpegBlob)
    expect(drawImageMock).toHaveBeenCalled()
    expect(bitmap.close).toHaveBeenCalled()

    const item = writeMock.mock.calls[0][0][0] as FakeClipboardItem
    await expect(item.data['image/png'] as Promise<Blob>).resolves.toBe(encodedPng)
  })

  it('取图失败时抛错，调用方可感知', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 })

    await expect(copyImageToClipboard('https://example.com/x.png')).rejects.toThrow()
  })
})

describe('PreviewImg 复制快捷键', () => {
  it('Windows：Ctrl+C 复制成功，弹出 Message 且盖过预览层；Cmd+C 不触发', async () => {
    renderWithI18n(<PreviewImg src="https://example.com/a.png" onClose={ () => {} } />)

    const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, cancelable: true })
    window.dispatchEvent(event)

    /** 默认行为被阻止，避免浏览器再复制空选区 */
    expect(event.defaultPrevented).toBe(true)
    expect(writeMock).toHaveBeenCalledTimes(1)

    await waitFor(() => expect(messageStore.getSnapshot()).toHaveLength(1))
    const message = messageStore.getSnapshot()[0]
    expect(message.variant).toBe('neutral')
    expect(message.content).toBe('已复制')
    expect(message.zIndex).toBeGreaterThan(Z.preview)

    fireEvent.keyDown(window, { key: 'c', metaKey: true })
    expect(writeMock).toHaveBeenCalledTimes(1)
  })

  it('Mac：Cmd+C 触发复制，Ctrl+C 不触发', () => {
    setPlatform('MacIntel', 'Macintosh')
    renderWithI18n(<PreviewImg src="https://example.com/a.png" onClose={ () => {} } />)

    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    expect(writeMock).not.toHaveBeenCalled()

    fireEvent.keyDown(window, { key: 'c', metaKey: true })
    expect(writeMock).toHaveBeenCalledTimes(1)
  })

  it('焦点在可编辑元素上时不拦截系统复制', () => {
    renderWithI18n(<PreviewImg src="https://example.com/a.png" onClose={ () => {} } />)

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })

    expect(writeMock).not.toHaveBeenCalled()
    expect(messageStore.getSnapshot()).toHaveLength(0)
    input.remove()
  })

  it('复制失败时弹出「复制失败」', async () => {
    renderWithI18n(<PreviewImg src="https://example.com/a.png" onClose={ () => {} } />)
    fetchMock.mockResolvedValue({ ok: false, status: 404 })

    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })

    await waitFor(() => expect(messageStore.getSnapshot()).toHaveLength(1))
    expect(messageStore.getSnapshot()[0].content).toBe('复制失败')
  })
})

describe('onCopy 交接反馈', () => {
  it('传入 onCopy 后不再弹 Message，成功与失败都回调结果', async () => {
    const onCopy = vi.fn()
    renderWithI18n(
      <PreviewImg
        src="https://example.com/a.png"
        onClose={ () => {} }
        onCopy={ onCopy }
      />,
    )

    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1))

    const success = onCopy.mock.calls[0][0] as PreviewImgCopyResult
    expect(success).toMatchObject({ src: 'https://example.com/a.png', success: true })
    expect(messageStore.getSnapshot()).toHaveLength(0)

    fetchMock.mockResolvedValue({ ok: false, status: 404 })
    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })
    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(2))

    const failure = onCopy.mock.calls[1][0] as PreviewImgCopyResult
    expect(failure.success).toBe(false)
    expect(failure.error).toBeInstanceOf(Error)
    expect(messageStore.getSnapshot()).toHaveLength(0)
  })

  it('onCopy 抛错被隔离，不影响复制流程', async () => {
    const onCopy = vi.fn(() => {
      throw new Error('observer boom')
    })
    renderWithI18n(
      <PreviewImg
        src="https://example.com/a.png"
        onClose={ () => {} }
        onCopy={ onCopy }
      />,
    )

    fireEvent.keyDown(window, { key: 'c', ctrlKey: true })

    await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1))
    expect(writeMock).toHaveBeenCalledTimes(1)
    expect(messageStore.getSnapshot()).toHaveLength(0)
  })
})

/** 模拟平台探测输入：isApplePlatform 依次看 platform / userAgent */
function setPlatform(platform: string, userAgent: string) {
  Object.defineProperty(navigator, 'platform', { configurable: true, value: platform })
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent })
}

/** useT 依赖 Provider；zh-CN 渲染，断言 locale 值 */
function renderWithI18n(ui: ReactElement) {
  return render(
    <I18nProvider resources={ allResources } defaultLanguage="zh-CN" language="zh-CN">
      { ui }
    </I18nProvider>,
  )
}
