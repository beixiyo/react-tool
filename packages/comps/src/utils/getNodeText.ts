import type { ReactNode } from 'react'
import { isValidElement } from 'react'

/**
 * 提取 ReactNode 中的可读纯文本，用于 typeahead 等文本匹配
 *
 * 字符串 / 数字直接返回；数组与元素递归读取 `children`；其他（图标、函数组件内部渲染的文本等）视为无文本
 */
export function getNodeText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return getNodeText(node.props.children)
  return ''
}
