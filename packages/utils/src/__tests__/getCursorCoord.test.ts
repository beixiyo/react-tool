import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getCursorCoord, trackCursorCoord } from '../getCursorCoord'

let getContextSpy: ReturnType<typeof vi.spyOn>

describe('getCursorCoord', () => {
  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((contextId: string) => {
      if (contextId !== '2d')
        return null

      return {
        font: '',
        measureText: (text: string) => ({
          width: text.length * 8,
        }),
      } as CanvasRenderingContext2D
    }) as HTMLCanvasElement['getContext'])
  })

  afterEach(() => {
    getContextSpy.mockRestore()
    document.body.innerHTML = ''
  })

  it('对脱离文档的输入元素返回零坐标', () => {
    const input = document.createElement('input')
    input.value = 'abc'
    input.setSelectionRange(2, 2)

    expect(getCursorCoord(input)).toEqual({
      height: 0,
      x: 0,
      y: 0,
    })
  })

  it('根据测量文本和盒模型样式计算输入光标位置', () => {
    const input = createInput()
    input.value = 'abcd'
    input.setSelectionRange(3, 3)
    mockElementRect(input, {
      height: 40,
      left: 10,
      top: 30,
      width: 160,
    })
    document.body.appendChild(input)

    expect(getCursorCoord(input)).toEqual({
      height: 20,
      x: 40,
      y: 40,
    })
  })

  it('测量光标位置后清理 textarea 镜像', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'hello'
    textarea.setSelectionRange(5, 5)
    textarea.style.fontSize = '10px'
    textarea.style.lineHeight = '18px'
    textarea.style.paddingLeft = '3px'
    textarea.style.paddingTop = '4px'
    textarea.style.borderLeftWidth = '1px'
    textarea.style.borderTopWidth = '2px'
    document.body.appendChild(textarea)

    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this === textarea) {
        return createRect({
          height: 80,
          left: 20,
          top: 40,
          width: 140,
        })
      }

      if (this.textContent === '|') {
        return createRect({
          height: 18,
          left: 15,
          top: 10,
          width: 0,
        })
      }

      if (this.style.visibility === 'hidden') {
        return createRect({
          height: 18,
          left: 5,
          top: 4,
          width: 140,
        })
      }

      return createRect()
    })

    const beforeMirrorCount = document.body.querySelectorAll('div').length

    expect(getCursorCoord(textarea)).toEqual({
      height: 18,
      x: 34,
      y: 52,
    })
    expect(document.body.querySelectorAll('div').length).toBe(beforeMirrorCount)

    rectSpy.mockRestore()
  })
})

describe('trackCursorCoord', () => {
  beforeEach(() => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => ({
      font: '',
      measureText: (text: string) => ({
        width: text.length * 8,
      }),
    }) as CanvasRenderingContext2D)
  })

  afterEach(() => {
    getContextSpy.mockRestore()
    document.body.innerHTML = ''
  })

  it('立即报告、响应光标事件并在清理后停止', () => {
    const input = createInput()
    input.value = 'abc'
    input.setSelectionRange(1, 1)
    mockElementRect(input, {
      height: 40,
      left: 10,
      top: 30,
      width: 160,
    })
    document.body.appendChild(input)

    const callback = vi.fn()
    const stop = trackCursorCoord(input, callback)

    expect(callback).toHaveBeenCalledTimes(1)

    input.setSelectionRange(2, 2)
    input.dispatchEvent(new Event('input'))

    expect(callback).toHaveBeenCalledTimes(2)

    stop()
    input.setSelectionRange(3, 3)
    input.dispatchEvent(new Event('keyup'))
    window.dispatchEvent(new Event('resize'))

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('对空元素返回安全的空操作清理函数', () => {
    expect(() => trackCursorCoord(null, vi.fn())()).not.toThrow()
  })
})

function createInput() {
  const input = document.createElement('input')
  input.style.fontSize = '10px'
  input.style.lineHeight = '20px'
  input.style.paddingLeft = '4px'
  input.style.borderLeftWidth = '2px'

  return input
}

function mockElementRect(element: HTMLElement, rect: Partial<DOMRect>) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => createRect(rect),
  })
}

function createRect(rect: Partial<DOMRect> = {}): DOMRect {
  return {
    bottom: rect.bottom ?? (rect.top ?? 0) + (rect.height ?? 0),
    height: rect.height ?? 0,
    left: rect.left ?? 0,
    right: rect.right ?? (rect.left ?? 0) + (rect.width ?? 0),
    toJSON: () => ({}),
    top: rect.top ?? 0,
    width: rect.width ?? 0,
    x: rect.x ?? rect.left ?? 0,
    y: rect.y ?? rect.top ?? 0,
  } as DOMRect
}
