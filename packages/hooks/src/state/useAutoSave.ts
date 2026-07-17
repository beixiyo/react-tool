import { deepCompare } from '@jl-org/tool'
import { useEffect, useRef } from 'react'
import { useCustomEffect } from '../lifecycle'
import { useLatestRef } from '../ref'
import { useWatchDebounceState } from './state'

/**
 * 自动保存 hook，使用防抖来延迟保存操作
 * - 深比较（deepCompare）值变化，与上次已保存值 / 初始值相同时不触发保存
 * - 保存期间产生的新变更会在本次保存完成后追平，避免保存窗口内的改动丢失
 * - 防抖链路依赖 setState 重渲染，组件卸载后挂起的保存会被吞掉；
 *   需要保留时开启 flushOnUnmount，在卸载时同步冲刷最新值
 */
export function useAutoSave<T>(options: UseAutoSaveOptions<T>) {
  const {
    value,
    saveFn,
    delayMS = 1000 * 5,
    enable = true,
    initialValue,
    flushOnUnmount = false,
  } = options

  const debouncedValue = useWatchDebounceState(value, delayMS)
  const lastSavedValueRef = useRef<T | undefined>(initialValue)
  const isSavingRef = useRef(false)

  const valueRef = useLatestRef(value)
  const saveFnRef = useLatestRef(saveFn)
  const enableRef = useLatestRef(enable)
  const initialValueRef = useLatestRef(initialValue)
  const flushOnUnmountRef = useLatestRef(flushOnUnmount)

  /** 该值是否无需保存（深比较，与上次已保存值或初始值相同） */
  const isUnchanged = (val: T) => {
    if (deepCompare(val, lastSavedValueRef.current)) {
      return true
    }

    return initialValueRef.current !== undefined
      && deepCompare(val, initialValueRef.current)
  }

  /** 执行保存，并循环追平保存期间产生的新变更 */
  const runSave = async (val: T) => {
    isSavingRef.current = true

    try {
      let toSave = val
      while (true) {
        lastSavedValueRef.current = toSave
        await saveFnRef.current(toSave)

        const latest = valueRef.current
        if (isUnchanged(latest)) {
          break
        }
        toSave = latest
      }
    }
    finally {
      isSavingRef.current = false
    }
  }

  useCustomEffect(
    async () => {
      /** 如果正在保存，跳过；保存完成后由 runSave 内部追平 */
      if (!enable || isSavingRef.current) {
        return
      }

      if (isUnchanged(debouncedValue)) {
        return
      }

      await runSave(debouncedValue)
    },
    [debouncedValue, enable, initialValue, saveFnRef],
  )

  /**
   * 卸载冲刷：防抖经由 setState → 重渲染 → effect 触发保存，
   * 卸载后 setState 变 no-op，挂起的保存永远不会发出，必须在这里补发。
   * 若卸载时保存正在进行，runSave 的追平循环会继续消化最新值，无需重复发送
   */
  useEffect(
    () => {
      return () => {
        if (!flushOnUnmountRef.current || !enableRef.current || isSavingRef.current) {
          return
        }

        const latest = valueRef.current
        if (isUnchanged(latest)) {
          return
        }

        lastSavedValueRef.current = latest
        saveFnRef.current(latest)
      }
    },
    [],
  )

  return {
    /** 是否正在保存 */
    isSavingRef,
  }
}

export type UseAutoSaveOptions<T> = {
  /**
   * 需要保存的值，即输入值
   * - 对象 / 数组请保持引用稳定（useMemo），否则每次渲染都会重置防抖计时
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
  /**
   * 组件卸载时，若存在未保存的变更则立即冲刷保存
   * @default false
   */
  flushOnUnmount?: boolean
}
