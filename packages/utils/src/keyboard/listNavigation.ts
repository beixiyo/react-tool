/**
 * 列表键盘导航的纯函数：方向键移动、Home / End、disabled 跳过与 typeahead
 *
 * 只负责计算下标，不涉及 DOM 与焦点；组件各自决定用 roving tabindex 还是 aria-activedescendant
 */

/**
 * 返回指定方向上的首个可用项下标；没有可用项时返回 -1
 * @param direction 1 取第一个可用项（Home），-1 取最后一个可用项（End）
 */
export function getBoundaryEnabledIndex(
  count: number,
  direction: 1 | -1,
  isDisabled: (index: number) => boolean = alwaysEnabled,
): number {
  if (direction === 1) {
    for (let index = 0; index < count; index += 1) {
      if (!isDisabled(index)) return index
    }
    return -1
  }

  for (let index = count - 1; index >= 0; index -= 1) {
    if (!isDisabled(index)) return index
  }
  return -1
}

/**
 * 从 `current` 沿 `direction` 找下一个可用项
 *
 * - `current` 无效（越界或 disabled）时返回该方向的端点
 * - 到头时：`loop` 为 true 绕回另一端，否则停在当前项
 * - 没有任何可用项时返回 -1
 */
export function getNextEnabledIndex(options: NextEnabledIndexOptions): number {
  const {
    count,
    current,
    direction,
    loop = false,
    isDisabled = alwaysEnabled,
  } = options

  if (count <= 0) return -1

  const currentValid = current >= 0 && current < count && !isDisabled(current)
  if (!currentValid) return getBoundaryEnabledIndex(count, direction, isDisabled)

  for (let step = 1; step < count; step += 1) {
    const raw = current + direction * step
    if (!loop && (raw < 0 || raw >= count)) return current

    const index = (raw + count) % count
    if (!isDisabled(index)) return index
  }

  return current
}

/**
 * 按首字母（或已输入的前缀）查找匹配项，从当前项之后开始循环查找，跳过 disabled
 *
 * 同一字母重复输入时依次在以该字母开头的项之间轮换（WAI-ARIA listbox / menu 的 typeahead 约定）
 * @returns 匹配项下标，未命中返回 -1
 */
export function findTypeaheadIndex(options: TypeaheadMatchOptions): number {
  const {
    query,
    count,
    current,
    getLabel,
    isDisabled = alwaysEnabled,
  } = options

  const normalized = query.toLocaleLowerCase()
  if (!normalized || count <= 0) return -1

  /** 重复同一字符视为单字符轮换 */
  const isRepeated = normalized.length > 1 && [...normalized].every((char) => char === normalized[0])
  const search = isRepeated
    ? normalized[0]!
    : normalized

  /** 单字符从下一项开始找，避免停在当前项；多字符包含当前项，继续输入时不跳走 */
  const offset = search.length === 1
    ? 1
    : 0
  const start = current < 0
    ? 0
    : current + offset

  for (let step = 0; step < count; step += 1) {
    const index = (start + step) % count
    if (isDisabled(index)) continue

    const label = getLabel(index)
    if (label && label.trim().toLocaleLowerCase().startsWith(search)) return index
  }

  return -1
}

/**
 * 判断按键是否应进入 typeahead 缓冲：单个可打印字符且无 Ctrl / Meta / Alt
 *
 * 空格单独作为首字符时通常用于激活，由调用方决定是否排除
 */
export function isTypeaheadKey(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): boolean {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
}

function alwaysEnabled() {
  return false
}

export type NextEnabledIndexOptions = {
  /** 列表长度 */
  count: number
  /** 当前下标；-1 表示尚无高亮 */
  current: number
  /** 1 向后，-1 向前 */
  direction: 1 | -1
  /**
   * 到头时是否绕回另一端
   * @default false
   */
  loop?: boolean
  /** 判断下标对应项是否禁用 */
  isDisabled?: (index: number) => boolean
}

export type TypeaheadMatchOptions = {
  /** 累积的输入前缀 */
  query: string
  /** 列表长度 */
  count: number
  /** 当前下标；-1 表示尚无高亮 */
  current: number
  /** 返回下标对应项用于匹配的纯文本 */
  getLabel: (index: number) => string | null | undefined
  /** 判断下标对应项是否禁用 */
  isDisabled?: (index: number) => boolean
}
