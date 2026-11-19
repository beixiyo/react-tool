import type { ReactNode } from 'react'
import { cloneElement, Fragment, isValidElement } from 'react'

/**
 * 把触发器的 ARIA 状态注入到唯一的子元素上
 *
 * 浮层组件用一层 div 包裹 children 来绑定事件，但真正获得焦点的是 children；
 * ARIA 状态挂在包裹层时读屏聚焦子元素读不到，且 aria-expanded 不允许出现在 generic 角色上
 *
 * - children 是单个有效 React 元素（非 Fragment）时：通过 cloneElement 注入，保留其 ref 与事件；
 *   `aria-describedby` 与子元素已有值合并，其余属性以子元素显式声明的值为准
 * - 否则返回 `injected: false`，调用方继续把属性挂在包裹层
 */
export function injectTriggerAria(children: ReactNode, aria: TriggerAriaProps): InjectTriggerAriaResult {
  if (!isValidElement<Record<string, unknown>>(children) || children.type === Fragment) {
    return { children, injected: false }
  }

  const own = children.props
  const next: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(aria) as [keyof TriggerAriaProps, string | boolean | undefined][]) {
    if (value === undefined) continue

    if (key === 'aria-describedby') {
      const ids = new Set([
        ...String(own[key] ?? '').split(/\s+/),
        ...String(value).split(/\s+/),
      ].filter(Boolean))
      next[key] = Array.from(ids).join(' ')
      continue
    }

    if (own[key] === undefined) next[key] = value
  }

  return {
    children: cloneElement(children, next),
    injected: true,
  }
}

/** 可注入到触发元素上的 ARIA 属性 */
export type TriggerAriaProps = {
  'aria-haspopup'?: 'dialog' | 'menu' | 'listbox' | 'grid' | 'tree' | boolean
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-describedby'?: string
}

type InjectTriggerAriaResult = {
  children: ReactNode
  /** 是否已注入到子元素；为 false 时调用方应把属性挂在包裹层 */
  injected: boolean
}
