import { fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from 'i18n/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { allResources } from '../../../i18n'
import { Uploader } from '../index'

describe('Uploader keyboard accessibility', () => {
  it('默认上传区域可用 Enter 和 Space 打开文件选择', () => {
    const { container } = renderWithI18n(<Uploader aria-label="Upload attachments" />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const click = vi.spyOn(input, 'click')
    const trigger = screen.getByRole('button', { name: 'Upload attachments' })

    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.keyDown(trigger, { key: ' ' })

    expect(click).toHaveBeenCalledTimes(2)
    expect(trigger.getAttribute('tabindex')).toBe('0')
  })

  it('禁用时退出 Tab 顺序且不响应键盘', () => {
    const { container } = renderWithI18n(<Uploader aria-label="Upload attachments" disabled />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const click = vi.spyOn(input, 'click')
    const trigger = screen.getByRole('button', { name: 'Upload attachments' })

    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(click).not.toHaveBeenCalled()
    expect(input.disabled).toBe(true)
    expect(trigger.getAttribute('tabindex')).toBe('-1')
  })

  it('自定义上传区域通过 getRootProps 获得同一键盘契约', () => {
    const { container } = renderWithI18n(
      <Uploader
        renderUploadArea={ (context) => <div { ...context.getRootProps() } /> }
      />,
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const click = vi.spyOn(input, 'click')

    fireEvent.keyDown(screen.getByRole('button', { name: 'Upload files' }), { key: 'Enter' })

    expect(click).toHaveBeenCalledOnce()
  })
})

describe('Uploader drag state DOM contract', () => {
  it('exposes active dragging state on the default upload area', () => {
    const { container } = renderWithI18n(<Uploader />)
    const trigger = screen.getByRole('button')

    fireEvent.dragEnter(trigger, { dataTransfer: { items: [] } })

    expect(trigger.getAttribute(DATA_ATTR.dragging)).toBe('true')
    expect(trigger.getAttribute(DATA_ATTR.invalid)).toBe('false')
    expect(container.querySelector(`[${DATA_ATTR.dragging}="true"]`)).toBe(trigger)
  })

  it('exposes invalid dragging state through custom getRootProps', () => {
    renderWithI18n(
      <Uploader
        accept="image/png"
        renderUploadArea={ (context) => <div { ...context.getRootProps() }>Custom upload</div> }
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Upload files' })
    const invalidFile = new File(['text'], 'note.txt', { type: 'text/plain' })

    fireEvent.dragEnter(trigger, {
      dataTransfer: {
        items: [{ kind: 'file', getAsFile: () => invalidFile }],
      },
    })

    expect(trigger.getAttribute(DATA_ATTR.dragging)).toBe('true')
    expect(trigger.getAttribute(DATA_ATTR.invalid)).toBe('true')
  })
})

function renderWithI18n(ui: ReactElement) {
  return render(
    <I18nProvider resources={ allResources } defaultLanguage="zh-CN" language="zh-CN">
      { ui }
    </I18nProvider>,
  )
}
