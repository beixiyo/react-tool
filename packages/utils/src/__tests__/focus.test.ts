import { describe, expect, it, vi } from 'vitest'
import { focusElement, getTabbableElements, isEditableTarget, shouldIgnoreParentEnter } from '../keyboard/focus'

describe('DOM 焦点基础能力', () => {
  it('只返回能够进入 Tab 顺序的可见元素', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <button id="button">按钮</button>
      <input id="disabled" disabled>
      <a id="link" href="#target">链接</a>
      <div id="editable" contenteditable=""></div>
      <div id="editable-parent" contenteditable="true"><span id="nested-editable" contenteditable="true"></span></div>
      <div id="negative" tabindex="-2"></div>
      <div hidden><button id="hidden">隐藏按钮</button></div>
      <div aria-hidden="true"><button id="aria-hidden">无障碍隐藏按钮</button></div>
      <div inert><button id="inert">不可交互按钮</button></div>
    `

    expect(getTabbableElements(container).map((element) => element.id)).toEqual([
      'button',
      'link',
      'editable',
      'editable-parent',
    ])
  })

  it('识别事件目标所在的表单控件和 contenteditable 区域', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <select><option id="option">选项</option></select>
      <div contenteditable="plaintext-only"><span id="editable-child">内容</span></div>
      <button id="button">按钮</button>
    `

    expect(isEditableTarget(container.querySelector('#option'))).toBe(true)
    expect(isEditableTarget(container.querySelector('#editable-child'))).toBe(true)
    expect(isEditableTarget(container.querySelector('#button'))).toBe(false)
  })

  it('父级 Enter 处理器让内部交互控件保留自身语义', () => {
    const container = document.createElement('div')
    container.innerHTML = `
      <button><span id="button-child">按钮内容</span></button>
      <div role="option" id="option">选项</div>
      <input id="checkbox" type="checkbox">
      <input id="text" type="text">
    `

    expect(shouldIgnoreParentEnter(container.querySelector('#button-child'))).toBe(true)
    expect(shouldIgnoreParentEnter(container.querySelector('#option'))).toBe(true)
    expect(shouldIgnoreParentEnter(container.querySelector('#checkbox'))).toBe(true)
    expect(shouldIgnoreParentEnter(container.querySelector('#text'))).toBe(false)
  })

  it('不支持 preventScroll 时回退到普通 focus', () => {
    const element = document.createElement('button')
    const focus = vi.fn((options?: FocusOptions) => {
      if (options) throw new TypeError('FocusOptions is not supported')
    })
    element.focus = focus

    focusElement(element)

    expect(focus).toHaveBeenNthCalledWith(1, { preventScroll: true })
    expect(focus).toHaveBeenNthCalledWith(2)
  })
})
