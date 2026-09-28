import type { TextAlign } from '../types'

/**
 * 获取对齐方式的 Tailwind 类名（用于文本对齐）
 */
export function getTextAlignClassName(align?: TextAlign): string {
  switch (align) {
    case 'center':
      return 'text-center'
    case 'right':
      return 'text-right'
    case 'left':
    default:
      return 'text-left'
  }
}

/**
 * 获取对齐方式的 Tailwind 类名（用于 flex 对齐）
 */
export function getFlexAlignClassName(align?: TextAlign): string {
  switch (align) {
    case 'center':
      return 'justify-center'
    case 'right':
      return 'justify-end'
    case 'left':
    default:
      return 'justify-start'
  }
}
