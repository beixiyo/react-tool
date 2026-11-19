import { useEffect, useRef } from 'react'
import type { TypeaheadMatchOptions } from 'utils/keyboard'
import { findTypeaheadIndex, isTypeaheadKey } from 'utils/keyboard'
import { useLatestCallback } from '../memo'

/**
 * 列表 typeahead：累积连续输入的字符，在超时后清空，并返回匹配项下标
 *
 * 只维护输入缓冲，不绑定任何事件；在组件自身的 keydown 处理器里调用返回的 `handleKey`
 *
 * @example
 * ```tsx
 * const typeahead = useTypeahead({ count: items.length, getLabel: i => items[i].label })
 * const onKeyDown = (e) => {
 *   const index = typeahead.handleKey(e, activeIndex)
 *   if (index !== -1) setActiveIndex(index)
 * }
 * ```
 */
export function useTypeahead(options: UseTypeaheadOptions = {}) {
  const { timeout = DEFAULT_TYPEAHEAD_TIMEOUT } = options

  const bufferRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const reset = useLatestCallback(() => {
    clearTimeout(timerRef.current)
    bufferRef.current = ''
  })

  /**
   * 处理一次按键；不是 typeahead 字符时返回 -1 且不修改缓冲
   *
   * 缓冲为空时的空格不进入 typeahead（留给激活操作）
   * @param source 本次查询的列表来源；列表只能在按键时从 DOM 读取时传入，覆盖 options 中的同名字段
   */
  const handleKey = useLatestCallback((
    event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>,
    current: number,
    source?: TypeaheadSource,
  ) => {
    if (!isTypeaheadKey(event)) return -1
    if (event.key === ' ' && !bufferRef.current) return -1

    bufferRef.current += event.key
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      bufferRef.current = ''
    }, timeout)

    const count = source?.count ?? options.count
    const getLabel = source?.getLabel ?? options.getLabel
    if (count === undefined || !getLabel) return -1

    return findTypeaheadIndex({
      query: bufferRef.current,
      count,
      current,
      getLabel,
      isDisabled: source?.isDisabled ?? options.isDisabled,
    })
  })

  /**
   * 缓冲中是否有未超时的输入
   *
   * 用于区分空格的语义：输入进行中空格属于查询字符，否则用于激活当前项
   */
  const isTyping = useLatestCallback(() => bufferRef.current !== '')

  return { handleKey, reset, isTyping }
}

/** 连续输入判定为同一次查询的间隔 */
export const DEFAULT_TYPEAHEAD_TIMEOUT = 500

/** 参与 typeahead 匹配的列表 */
export type TypeaheadSource = Pick<TypeaheadMatchOptions, 'count' | 'getLabel' | 'isDisabled'>

/**
 * `count` / `getLabel` 可在渲染时给出，也可在每次 `handleKey` 时通过 `source` 传入；
 * 两处都没有时 `handleKey` 返回 -1
 */
export type UseTypeaheadOptions = Partial<TypeaheadSource> & {
  /**
   * 两次输入超过该间隔（毫秒）后清空缓冲
   * @default 500
   */
  timeout?: number
}
