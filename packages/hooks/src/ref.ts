'use client'

import type { RefObject, Ref } from 'react'
import { useCallback, useEffect, useRef } from 'react'

/**
 * 通用的 ref 合并 Hook
 *
 * 用于同时支持外部 forwardRef 和内部 ref 需求，并可选择性地提供生命周期回调
 *
 * @example
 * ```tsx
 * const MyComponent = forwardRef<HTMLDivElement, Props>((props, ref) => {
 *   const { setRef, elementRef } = useComposedRef({
 *     ref,
 *     onMounted: (node) => { console.log('mounted', node) },
 *     onUnmounted: () => { console.log('unmounted') }
 *   })
 *
 *   return <div ref={setRef}>...</div>
 * })
 * ```
 *
 * @template T - ref 指向的元素类型
 * @param options - 配置项
 * @returns - setRef 用于绑定到元素，elementRef 为内部使用的 ref 对象
 */
export function useComposedRef<T extends HTMLElement = HTMLElement>(options: {
  /** 外部传入的 ref（来自 forwardRef） */
  ref: Ref<T> | undefined
  /** 注册回调，当元素挂载/更新时调用 */
  onMounted?: (node: T | null) => void
  /** 注销回调，当组件卸载时调用 */
  onUnmounted?: () => void
}) {
  const { ref, onMounted, onUnmounted } = options

  /** 本地 ref，用于组件内部使用 */
  const elementRef = useRef<T | null>(null)

  /** 合并转发 ref 与本地 ref，并调用 onMounted 回调 */
  const setRef = useCallback(
    (node: T | null) => {
      // 保存到本地 ref
      elementRef.current = node

      // 转发给外部 ref
      if (typeof ref === 'function') {
        ref(node)
      }
      else if (ref && 'current' in ref) {
        ;(ref as RefObject<T | null>).current = node
      }

      // 调用挂载回调
      if (onMounted) {
        try {
          onMounted(node)
        }
        catch (err) {
          // 忽略回调错误
        }
      }
    },
    [ref, onMounted],
  )

  /** 在卸载时调用注销回调 */
  useEffect(() => {
    return () => {
      if (onUnmounted) {
        try {
          onUnmounted()
        }
        catch (err) {
          // 忽略回调错误
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
