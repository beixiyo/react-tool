import type { SetStateAction } from 'react'
import { useRef, useState } from 'react'
import { useLatestCallback } from '../memo'

/**
 * 统一受控 / 非受控状态
 *
 * `value !== undefined` 时为受控，内部状态不再生效，只通过 `onChange` 通知上层；
 * 否则使用 `defaultValue` 初始化的内部状态。值未变化（`Object.is`）时不触发 `onChange`
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useControllableState({
 *   value: props.open,
 *   defaultValue: props.defaultOpen ?? false,
 *   onChange: props.onOpenChange,
 * })
 * ```
 */
export function useControllableState<T>(options: UseControllableStateOptions<T>) {
  const { value, defaultValue, onChange } = options

  const [innerValue, setInnerValue] = useState<T>(defaultValue)
  const isControlled = value !== undefined
  const currentValue = isControlled
    ? value
    : innerValue

  /** 同一渲染周期内连续调用 setter 时，函数式更新需要基于上一次的结果 */
  const latestValueRef = useRef(currentValue)
  latestValueRef.current = currentValue

  const setValue = useLatestCallback((next: SetStateAction<T>) => {
    const prev = latestValueRef.current
    const resolved = typeof next === 'function'
      ? (next as (prev: T) => T)(prev)
      : next

    if (Object.is(prev, resolved)) return

    /**
     * 受控时值以上层为准，不记录请求值：上层拒绝变更且组件未重渲染时，
     * ref 若停在被拒绝的值，后续同值请求会被判等吞掉、onChange 不再触发
     */
    if (!isControlled) {
      latestValueRef.current = resolved
      setInnerValue(resolved)
    }
    onChange?.(resolved)
  })

  return [currentValue, setValue, isControlled] as const
}

export type UseControllableStateOptions<T> = {
  /** 受控值；`undefined` 表示非受控 */
  value?: T
  /** 非受控时的初始值 */
  defaultValue: T
  /** 值变化时回调；受控与非受控模式都会触发 */
  onChange?: (value: T) => void
}
