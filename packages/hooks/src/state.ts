import type { CSSProperties } from 'react'
import type { SetStateParam } from './types'
import { debounce, deepCompare, isBrowser, isFn, throttle } from '@jl-org/tool'
import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

/**
 * 返回一个状态值和一个切换状态值的函数
 */
export function useToggle(initState = false) {
  const [state, setState] = useState(initState)
  const toggle = (val?: boolean) => {
    if (val != undefined) {
      setState(val)
      return
    }

    setState(val => !val)
  }

  return [state, toggle] as const
}

/**
 * 节流 useState
 * @param initState 初始值
 * @param delayMS 节流时间
 */
export function useThrottle<T>(initState: T, delayMS: number = 500) {
  const [state, _setState] = useState<T>(initState)
  const setState = (useMemo(
    () => {
      return throttle(_setState, delayMS)
    },
    [delayMS],
  )
  ) as unknown as typeof _setState

  return [
    state,
    setState,
  ] as const
}

/**
 * 防抖 useState
 * @param initState 初始值
 * @param delayMS 防抖时间
 */
export function useDebounce<T>(initState: T, delayMS: number = 500) {
  const [state, _setState] = useState<T>(initState)
  const setState = (useMemo(
    () => {
      return debounce(_setState, delayMS)
    },
    [delayMS],
  )
  ) as unknown as typeof _setState

  return [
    state,
    setState,
  ] as const
}

/**
 * 监听值，设置时使用防抖
 * @param value 监听的值
 * @param delayMS 防抖时间
 */
export function useWatchDebounce<T>(value: T, delayMS: number = 100) {
  const [state, setState] = useDebounce<T>(value, delayMS)
  useEffect(
    () => {
      setState(value)
    },
    [value, setState],
  )
  return state
}

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
  const debouncedValue = useWatchDebounce(value, delayMS)
  const lastSavedValueRef = useRef<T | undefined>(initialValue)
  const saveFnRef = useWatchRef(saveFn)
  const isSavingRef = useRef(false)

  useEffect(
    () => {
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
      const result = saveFnRef.current(debouncedValue)

      /** 如果是 Promise，处理保存状态 */
      if (result instanceof Promise) {
        result
          .then(() => {
            isSavingRef.current = false
          })
          .catch(() => {
            isSavingRef.current = false
          })
      }
      else {
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

/**
 * 监听值，设置时使用节流
 * @param value 监听的值
 * @param delayMS 节流时间
 */
export function useWatchThrottle<T>(value: T, delayMS: number = 100, options: UseWatchThrottleOptions = {}) {
  const {
    enable = true,
    syncLastValueTime = 1000,
  } = options

  const actualSyncLastValueTime = Math.max(syncLastValueTime, delayMS + 2)
  const timerRef = useRef<number | null>(null)
  const [state, setState] = useThrottle<T>(value, delayMS)

  useEffect(
    () => {
      if (enable) {
        setState(value)
      }

      timerRef.current = window.setTimeout(() => {
        setState(value)
      }, actualSyncLastValueTime)

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    },
    [value, setState, enable, actualSyncLastValueTime],
  )

  return enable
    ? state
    : value
}

/**
 * Vue v-show
 * @example
 * ```ts
 * style={{
 *   ...vShow(loading)
 * }}>
 * ```
 */
export function vShow(
  show: boolean,
  opts: { visibility?: boolean } = {},
): CSSProperties {
  if (opts.visibility) {
    return show
      ? { visibility: 'visible' }
      /**
       * 不显示元素，大小拉满，但不占位置
       * 适用于隐藏元素，但不影响布局计算情况
       */
      : {
          visibility: 'hidden',
          position: 'absolute',
          zIndex: -99,
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
        }
  }

  return show
    ? {}
    : { display: 'none' }
}

export function useConst<T>(value: T | (() => T)) {
  const refValue = useRef<T>(
    isFn(value)
      ? value()
      : value,
  )
  return refValue.current
}

export function useWatchRef<T>(state: T) {
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  return stateRef
}

/**
 * 稳定化对象，只有当对象内容变化时才更新引用
 * 解决在 useEffect 依赖中直接传入对象字面量导致的重复执行问题
 */
export function useStable<T>(obj: T): T {
  const ref = useRef(obj)

  const isSame = useMemo(() => {
    return deepCompare(ref.current, obj)
  }, [obj])

  if (!isSame) {
    ref.current = obj
  }

  return ref.current
}

const isViewTransitionSupported = isBrowser && !!document.startViewTransition
/**
 * 实现 View Transition 动画的 useState
 */
export function useViewTransitionState<T>(initState: T | (() => T)) {
  const [state, setState] = useState<T>(initState)

  const setTransiton = (val: SetStateParam<T>) => {
    if (!isViewTransitionSupported) {
      setState(val)
      return
    }

    document.startViewTransition(() => {
      flushSync(() => setState(val))
    })
  }

  return [state, setTransiton] as const
}

export type UseWatchThrottleOptions = {
  /**
   * @default true
   */
  enable?: boolean
  /**
   * 同步最新值的时间（毫秒 MS）
   * @default 1000
   */
  syncLastValueTime?: number
}
