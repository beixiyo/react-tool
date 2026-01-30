import type { ReactNode } from 'react'

/** 树形选项通用结构（Select Option / Cascader Option） */
export interface OptionLike {
  value: string
  label: ReactNode
  disabled?: boolean
  children?: OptionLike[]
}

/** 在树形选项中按 value 查找选项 */
export function findOption<T extends OptionLike>(opts: T[], value: string): T | undefined {
  for (const opt of opts) {
    if (opt.value === value)
      return opt
    if (opt.children?.length) {
      const found = findOption(opt.children as T[], value)
      if (found)
        return found
    }
  }
  return undefined
}

/** 在树形选项中按 value 查找 label */
export function findLabel<T extends OptionLike>(opts: T[], val: string): ReactNode {
  const opt = findOption(opts, val)
  return opt
    ? opt.label
    : ''
}

/** 在列表中找下一个/上一个非 disabled 的下标，用于键盘上下移动高亮 */
export function getNextHighlightIndex<T extends { disabled?: boolean }>(
  list: T[],
  current: number,
  direction: 1 | -1,
): number {
  if (list.length === 0)
    return -1
  let next = current + direction
  while (next >= 0 && next < list.length && list[next]?.disabled)
    next += direction
  if (next < 0)
    return 0
  if (next >= list.length)
    return list.length - 1
  return next
}
