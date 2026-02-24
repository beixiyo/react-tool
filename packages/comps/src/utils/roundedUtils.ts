import type { Rounded } from '../types'

/**
 * 圆角类型对应的 Tailwind 类名映射
 */
export const roundedMapping: Record<Rounded, string> = {
  'none': 'rounded-none',
  'sm': 'rounded-xs',
  'md': 'rounded-md',
  'lg': 'rounded-lg',
  'xl': 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  'full': 'rounded-full',
}

/**
 * 获取圆角样式
 * @param rounded 圆角大小或数值
 * @returns 对应的类名或样式对象
 */
export function getRoundedStyles(rounded: Rounded | number | undefined) {
  if (rounded === undefined) {
    return { className: '', style: {} }
  }

  if (typeof rounded === 'number') {
    return {
      className: '',
      style: { borderRadius: `${rounded}px` },
    }
  }

  return {
    className: roundedMapping[rounded] || '',
    style: {},
  }
}
