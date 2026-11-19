import type { HtmlHTMLAttributes, PropsWithChildren, Ref } from 'react'

/**
 * Slot 组件属性类型
 *
 * 透传给唯一子元素的属性集合（className 与 style 会与子元素合并）
 */
export type SlotProps = PropsWithChildren<HtmlHTMLAttributes<HTMLElement>> & {
  ref?: Ref<HTMLElement>
}
