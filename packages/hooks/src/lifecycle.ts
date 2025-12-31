/* eslint-disable react-hooks/rules-of-hooks */
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * @returns 强制刷新函数
 */
export function useRefresh() {
  const [_, refresh] = useState({})
  return useCallback(() => refresh({}), [])
}

/**
 * 挂载生命周期
 */
export function onMounted(fn: EffectFn) {
  return useEffect(fn, [])
}

/**
 * 卸载生命周期
 */
export function onUnmounted(fn: ReturnType<EffectFn>) {
  return useEffect(() => {
    return fn
  }, [])
}

/**
 * 只在更新时执行，首次挂载不执行的 useEffect
 */
export function useUpdateEffect(
  fn: EffectFn,
  deps: any[] = [],
  options: EffectOpts = {},
) {
  const { effectFn = useEffect } = options
  const isFirstRender = useRef(true)

  return effectFn(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    return fn()
  }, deps)
}

/**
 * 支持异步的 useEffect
 * @param onlyRunInUpdate 是否只在更新时执行，首次挂载不执行
 */
export function useAsyncEffect(
  fn: () => Promise<any>,
  deps: any[] = [],
  options: EffectOpts & { onlyRunInUpdate?: boolean } = {},
) {
  const {
    onlyRunInUpdate = false,
    effectFn = useEffect,
  } = options
  const isFirstRender = useRef(true)

  return effectFn(() => {
    if (isFirstRender.current && onlyRunInUpdate) {
      isFirstRender.current = false
      return
    }

    const clean = fn()

    return () => {
      clean.then((fn) => {
        fn?.()
      })
    }
  }, deps)
}

/**
 * 通用的 ref 合并 Hook
 *
 * 用于同时支持外部 forwardRef 和内部 ref 需求，并可选择性地注册到外部系统
 *
 * @example
 * ```tsx
 * const MyComponent = forwardRef<HTMLInputElement, Props>((props, ref) => {
 *   const { setRef, elementRef } = useSaveRef({
 *     ref,
 *     onMounted: (node) => { },
 *     onUnmounted: () => { }
 *   })
 *
 *   console.log(elementRef.current)
 *
 *   return <input ref={setRef} />
 * })
 * ```
 */
export function useSaveRef<T extends HTMLElement = HTMLElement>(options: {
  /** 外部传入的 ref（来自 forwardRef） */
  ref: React.ForwardedRef<T>
  /** 注册回调，当元素挂载时调用 */
  onMounted?: (node: T | null) => void
  /** 注销回调，当元素卸载时调用 */
  onUnmounted?: () => void
}) {
  const { ref, onMounted, onUnmounted } = options

  /** 本地 ref，用于组件内部使用 */
  const elementRef = useRef<T | null>(null)

  /** 合并转发 ref（forwardRef）与本地 ref，并在需要时调用注册回调 */
  const setRef = (node: T | null) => {
    // 保存到本地 ref
    elementRef.current = node

    // 转发给外部 ref（支持函数式和对象式）
    if (typeof ref === 'function') {
      ref(node)
    }
    else if (ref) {
      try {
        ref.current = node
      }
      catch (e) {
        // 忽略只读 ref 等错误
      }
    }

    // 调用注册回调
    if (onMounted) {
      try {
        onMounted(node)
      }
      catch (err) {
        // 忽略注册错误
      }
    }
  }

  /** 在卸载时调用注销回调 */
  useEffect(() => {
    return () => {
      if (onUnmounted) {
        try {
          onUnmounted()
        }
        catch (err) {
          // 忽略注销错误
        }
      }
    }
  }, [onUnmounted])

  return {
    /** 用于赋值给元素的 ref 属性 */
    setRef,
    /** 内部使用的 ref，方便组件内部访问 DOM 元素 */
    elementRef,
  }
}

type EffectFn = Parameters<typeof useEffect>[0]

type EffectOpts = {
  /**
   * useEffect | useLayoutEffect ...
   * @default useEffect
   */
  effectFn?: typeof useEffect
}
