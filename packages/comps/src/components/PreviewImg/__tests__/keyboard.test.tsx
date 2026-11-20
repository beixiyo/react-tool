// @vitest-environment jsdom

/**
 * 预览层键盘契约：Esc 与方向键走同一个键盘层，
 * 焦点在可编辑元素内时方向键不翻页，上层浮层在栈顶时不抢键
 */
import { fireEvent, render } from '@testing-library/react'
import { useKeyboardLayer } from 'hooks'
import { I18nProvider } from 'i18n/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Z } from '../../../constants/z-index'
import { allResources } from '../../../i18n'
import { PreviewImg } from '../PreviewImg'

const SRCS = ['https://example.com/a.png', 'https://example.com/b.png', 'https://example.com/c.png']

function renderWithI18n(ui: ReactElement) {
  return render(
    <I18nProvider resources={ allResources } defaultLanguage="zh-CN" language="zh-CN">
      { ui }
    </I18nProvider>,
  )
}

/** 模拟压在预览之上的浮层，只消费 Esc */
function UpperLayer({ onEscape }: { onEscape: () => void }) {
  useKeyboardLayer({ active: true, keys: ['Escape'], priority: Z.preview + 1, onKeyDown: onEscape })
  return null
}

it('翻到已加载的图片时，即使没有收到 load 事件也会收起加载指示器', () => {
  const complete = vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
  const naturalWidth = vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(640)

  try {
    const { getByAltText, getByRole } = renderWithI18n(
      <PreviewImg src={ SRCS } onClose={ () => {} } showThumbnails={ false } toolbar={ { items: ['download'] } } />,
    )
    const download = getByRole('button', { name: '下载图片' }) as HTMLButtonElement
    expect(download.disabled).toBe(false)

    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    expect(getByAltText('Preview').getAttribute('src')).toBe(SRCS[1])
    expect(download.disabled).toBe(false)
  }
  finally {
    complete.mockRestore()
    naturalWidth.mockRestore()
  }
})

describe('PreviewImg 键盘', () => {
  it('方向键翻页，Esc 关闭', () => {
    const onClose = vi.fn()
    const { getByAltText } = renderWithI18n(<PreviewImg src={ SRCS } onClose={ onClose } showThumbnails={ false } />)
    const currentSrc = () => getByAltText('Preview').getAttribute('src')

    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    expect(currentSrc()).toBe(SRCS[1])
    fireEvent.keyDown(document.body, { key: 'ArrowDown' })
    expect(currentSrc()).toBe(SRCS[2])
    fireEvent.keyDown(document.body, { key: 'ArrowUp' })
    expect(currentSrc()).toBe(SRCS[1])
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' })
    expect(currentSrc()).toBe(SRCS[0])

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('焦点在输入框内时方向键留给输入框，Esc 仍关闭', () => {
    const onClose = vi.fn()
    const { getByAltText, getByRole } = renderWithI18n(
      <>
        <input aria-label="note" />
        <PreviewImg src={ SRCS } onClose={ onClose } showThumbnails={ false } />
      </>,
    )
    const input = getByRole('textbox', { name: 'note' })

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    input.dispatchEvent(event)
    expect(getByAltText('Preview').getAttribute('src')).toBe(SRCS[0])
    expect(event.defaultPrevented).toBe(false)

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('上层浮层在栈顶时方向键与 Esc 都不落到预览', () => {
    const onClose = vi.fn()
    const onUpperEscape = vi.fn()
    const { getByAltText } = renderWithI18n(
      <>
        <PreviewImg src={ SRCS } onClose={ onClose } showThumbnails={ false } />
        <UpperLayer onEscape={ onUpperEscape } />
      </>,
    )

    fireEvent.keyDown(document.body, { key: 'ArrowRight' })
    expect(getByAltText('Preview').getAttribute('src')).toBe(SRCS[0])

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(onUpperEscape).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })
})
