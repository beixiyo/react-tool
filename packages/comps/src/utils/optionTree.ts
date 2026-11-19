/**
 * 树形选项（Select / Cascader）的查找与键盘导航辅助
 *
 * 导航计算统一委托 `utils/keyboard` 的纯函数，这里只做「选项数组 → 下标谓词」的适配
 */
import type { ReactNode } from 'react'
import { getBoundaryEnabledIndex, getNextEnabledIndex as getNextEnabledListIndex } from 'utils/keyboard'

/** 在树形选项中按 value 查找选项 */
export function findOption<T extends OptionLike>(opts: T[], value: string): T | undefined {
  for (const opt of opts) {
    if (opt.value === value) return opt
    if (opt.children?.length) {
      const found = findOption(opt.children as T[], value)
      if (found) return found
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

/** 选项是否禁用的默认判定 */
export function isOptionDisabled(option: { disabled?: boolean } | undefined): boolean {
  return !!option?.disabled
}

/**
 * 返回指定方向上的首个可用项；没有可用项时返回 -1
 * @param direction 1 取第一个可用项（Home），-1 取最后一个可用项（End）
 */
export function getEnabledBoundaryIndex<T>(
  list: T[],
  direction: 1 | -1,
  isDisabled: (item: T) => boolean = isOptionDisabled as (item: T) => boolean,
): number {
  return getBoundaryEnabledIndex(list.length, direction, (index) => isDisabled(list[index]!))
}

/**
 * 从当前高亮沿 `direction` 寻找下一个可用项
 *
 * - 当前项无效（越界或 disabled）时返回该方向的端点
 * - 到头时 `loop` 为 true 绕回另一端，否则停在当前项
 * - 没有任何可用项时返回 -1
 */
export function getNextEnabledIndex<T>(
  list: T[],
  current: number,
  direction: 1 | -1,
  options: NextEnabledOptions<T> = {},
): number {
  const { loop = false, isDisabled = isOptionDisabled as (item: T) => boolean } = options
  return getNextEnabledListIndex({
    count: list.length,
    current,
    direction,
    loop,
    isDisabled: (index) => isDisabled(list[index]!),
  })
}

/** 保留当前可用索引，否则回退到首个可用项 */
export function normalizeEnabledIndex<T>(
  list: T[],
  current: number,
  isDisabled: (item: T) => boolean = isOptionDisabled as (item: T) => boolean,
): number {
  const currentItem = list[current]
  if (currentItem && !isDisabled(currentItem)) return current
  return getEnabledBoundaryIndex(list, 1, isDisabled)
}

/**
 * 渲染阶段的高亮归一：有高亮时越界或 disabled 回退到首个可用项，无高亮（-1）保持不变
 *
 * 用于打开期间 options 变短或项变 disabled 时，避免高亮 / aria-activedescendant 指向无效项
 */
export function normalizeHighlightIndex<T>(
  list: T[],
  index: number,
  isDisabled: (item: T) => boolean = isOptionDisabled as (item: T) => boolean,
): number {
  return index < 0
    ? index
    : normalizeEnabledIndex(list, index, isDisabled)
}

/** 树形选项通用结构（Select Option / Cascader Option） */
export interface OptionLike {
  value: string
  label: ReactNode
  disabled?: boolean
  children?: OptionLike[]
}

export type NextEnabledOptions<T> = {
  /**
   * 到头时是否绕回另一端
   * @default false
   */
  loop?: boolean
  /**
   * 判断选项是否禁用
   * @default 读取 `item.disabled`
   */
  isDisabled?: (item: T) => boolean
}
