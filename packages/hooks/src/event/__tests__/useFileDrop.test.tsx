/**
 * 文件拖入（useFileDrop）
 *
 * 守的硬契约：
 * - 文件悬停必须 preventDefault，否则松手时浏览器 / Electron 会直接导航到该文件，整个应用被替换
 * - 页面内的拖放区已接手的拖拽必须让位，不能被蒙层抢走
 * - 指针离开目标蒙层必须消失，不能卡在拖拽态；传入元素时，目标内子元素之间的移动不算离开
 * - 传入元素时只响应落在该元素内的拖拽
 */

import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFileDrop } from '../useFileDrop'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

/** jsdom 没有 DragEvent / DataTransfer，用普通 Event 挂上 dataTransfer 即可被 hook 读取 */
function dispatchDrag(
  target: EventTarget,
  type: string,
  init: { files?: File[]; relatedTarget?: EventTarget | null } = {},
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      types: init.files
        ? ['Files']
        : ['text/plain'],
      files: init.files ?? [],
      dropEffect: 'none',
    },
  })
  Object.defineProperty(event, 'relatedTarget', { value: init.relatedTarget ?? null })

  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

function mount(tag = 'div', parent: Element = document.body) {
  const el = document.createElement(tag)
  parent.append(el)
  return el
}

const file = new File(['x'], 'a.png', { type: 'image/png' })

describe('useFileDrop（默认 window）', () => {
  it('文件悬停时进入拖拽态并阻止默认导航，指针离开窗口后恢复', () => {
    const { result } = renderHook(() => useFileDrop({ onDrop: vi.fn() }))

    const over = dispatchDrag(window, 'dragover', { files: [file] })
    expect(over.defaultPrevented).toBe(true)
    expect(result.current).toBe(true)

    dispatchDrag(window, 'dragleave', { relatedTarget: null })
    expect(result.current).toBe(false)
  })

  it('页面内拖放区已 preventDefault 的拖拽不介入，也不触发 onDrop', () => {
    const onDrop = vi.fn()
    const zone = mount()
    zone.addEventListener('dragover', (e) => e.preventDefault())
    zone.addEventListener('drop', (e) => e.preventDefault())
    const { result } = renderHook(() => useFileDrop({ onDrop }))

    dispatchDrag(zone, 'dragover', { files: [file] })
    dispatchDrag(zone, 'drop', { files: [file] })

    expect(result.current).toBe(false)
    expect(onDrop).not.toHaveBeenCalled()
  })

  it('松手交出文件并收起蒙层；非文件拖拽与 enabled=false 时都不处理', () => {
    const onDrop = vi.fn()
    const { result, rerender } = renderHook(
      ({ enabled }) => useFileDrop({ enabled, onDrop }),
      { initialProps: { enabled: true } },
    )

    dispatchDrag(window, 'dragover', { files: [file] })
    dispatchDrag(window, 'drop', { files: [file] })
    expect(onDrop).toHaveBeenCalledWith([file])
    expect(result.current).toBe(false)

    const textOver = dispatchDrag(window, 'dragover')
    expect(textOver.defaultPrevented).toBe(false)
    expect(result.current).toBe(false)

    rerender({ enabled: false })
    const disabledOver = dispatchDrag(window, 'dragover', { files: [file] })
    expect(disabledOver.defaultPrevented).toBe(false)
    expect(result.current).toBe(false)
  })
})

describe('useFileDrop（传入 target 元素）', () => {
  it('只响应落在目标元素内的拖拽，目标外不介入', () => {
    const onDrop = vi.fn()
    const el = mount()
    const outside = mount()
    const { result } = renderHook(() => useFileDrop({ target: el, onDrop }))

    const outsideOver = dispatchDrag(outside, 'dragover', { files: [file] })
    dispatchDrag(outside, 'drop', { files: [file] })
    expect(outsideOver.defaultPrevented).toBe(false)
    expect(result.current).toBe(false)
    expect(onDrop).not.toHaveBeenCalled()

    dispatchDrag(el, 'dragover', { files: [file] })
    expect(result.current).toBe(true)
    dispatchDrag(el, 'drop', { files: [file] })
    expect(onDrop).toHaveBeenCalledWith([file])
    expect(result.current).toBe(false)
  })

  it('目标内子元素之间的 leave 不收起，移出目标才收起', () => {
    const el = mount()
    const child = mount('span', el)
    const outside = mount()
    const { result } = renderHook(() => useFileDrop({ target: el, onDrop: vi.fn() }))

    dispatchDrag(el, 'dragover', { files: [file] })
    dispatchDrag(el, 'dragleave', { relatedTarget: child })
    expect(result.current).toBe(true)

    dispatchDrag(child, 'dragleave', { relatedTarget: outside })
    expect(result.current).toBe(false)
  })

  it('支持传 ref，target 为 null（元素未就绪）时不监听', () => {
    const el = mount()
    const { result, rerender } = renderHook(
      ({ target }) => useFileDrop({ target, onDrop: vi.fn() }),
      { initialProps: { target: null as { current: HTMLElement | null } | null } },
    )

    const notReady = dispatchDrag(el, 'dragover', { files: [file] })
    expect(notReady.defaultPrevented).toBe(false)

    rerender({ target: { current: el } })
    dispatchDrag(el, 'dragover', { files: [file] })
    expect(result.current).toBe(true)
  })
})
