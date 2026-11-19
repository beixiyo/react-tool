import type { RefObject } from 'react'
import { useEffect } from 'react'
import { useLatestRef } from '../ref'
import type { ClickOutsideOpts } from './types'

/**
 * 检测当前点击区域，是否在元素外部
 *
 * `refs`、`additionalSelectors`、`ignore` 每次事件触发时读取最新值
 * 调用方传内联数组不会导致重复订阅；只有 `enabled` / `trigger` 变化才重新绑定
 * @param refs 需要监听点击的元素
 * @param handler 事件处理函数
 * @param options 配置选项
 */
export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: (event: MouseEvent) => void,
  options: ClickOutsideOpts = {},
) {
  const {
    enabled = true,
    trigger = 'mousedown',
    capture = false,
  } = options

  const handlerRef = useLatestRef(handler)
  const refsRef = useLatestRef(refs)
  const optionsRef = useLatestRef(options)

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return

    const handleClickOutside = (e: MouseEvent | PointerEvent) => {
      const target = e.target
      if (!(target instanceof Node)) return

      /** 点击在被跟踪元素内部 */
      if (refsRef.current.some((ref) => ref.current?.contains(target))) return

      const { additionalSelectors, ignore } = optionsRef.current

      /** 点击在额外选择器匹配的元素内部（如 Portal 浮层） */
      if (additionalSelectors?.length) {
        const element = target instanceof Element
          ? target
          : target.parentElement
        if (element?.closest(additionalSelectors.join(', '))) return
      }

      if (ignore?.(target, e)) return

      handlerRef.current(e)
    }

    document.addEventListener(trigger, handleClickOutside, capture)
    return () => {
      document.removeEventListener(trigger, handleClickOutside, capture)
    }
  }, [enabled, trigger, capture, handlerRef, refsRef, optionsRef])
}
