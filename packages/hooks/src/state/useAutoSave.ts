import { useRef } from 'react'
import { useCustomEffect } from '../lifecycle'
import { useLatestRef } from '../ref'
import { useWatchDebounceState } from './state'

/**
 * 自动保存 hook，使用防抖来延迟保存操作
 */
export function useAutoSave<T>(options: {
  /**
   * 需要保存的值，即输入值
   */
  value: T
  /**
   * 保存函数
   */
  saveFn: (value: T) => void | Promise<void>
  /**
   * 防抖时间（毫秒），默认 1000 * 5（5秒）
   * @default 1000 * 5
   */
  delayMS?: number
  /**
   * 是否启用自动保存
   * @default true
   */
  enable?: boolean
  /**
   * 初始值，用于判断是否需要保存（如果 value 等于 initialValue，则不保存）
   */
  initialValue?: T
}) {
  const {
    value,
    saveFn,
    delayMS = 1000 * 5,
    enable = true,
    initialValue,
  } = options
  const debouncedValue = useWatchDebounceState(value, delayMS)
  const lastSavedValueRef = useRef<T | undefined>(initialValue)
  const saveFnRef = useLatestRef(saveFn)
  const isSavingRef = useRef(false)

  useCustomEffect(
    async () => {
      /** 如果正在保存，跳过 */
      if (!enable || isSavingRef.current) {
        return
      }

      /** 如果防抖后的值没有变化，不执行保存 */
      if (debouncedValue === lastSavedValueRef.current) {
        return
      }

      /** 如果值等于初始值，不执行保存 */
      if (initialValue !== undefined && debouncedValue === initialValue) {
        return
      }

      /** 执行保存 */
      lastSavedValueRef.current = debouncedValue
      isSavingRef.current = true

      try {
        await saveFnRef.current(debouncedValue)
      }
      finally {
        isSavingRef.current = false
      }
    },
    [debouncedValue, enable, initialValue, saveFnRef],
  )

  return {
    /** 是否正在保存 */
    isSavingRef,
  }
}
