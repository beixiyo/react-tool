import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

/**
 * Drawer 焦点管理：
 * 打开时记录当前焦点元素并把焦点移入抽屉（首个可聚焦元素或容器自身），
 * 关闭时把焦点归还给打开前的元素。
 *
 * @param open 抽屉是否打开
 * @param containerRef 抽屉容器引用
 */
export function useDrawerFocus(
  open: boolean,
  containerRef: RefObject<HTMLElement | null>,
) {
  /** 打开前持有焦点的元素，用于关闭后归还 */
  const prevFocusedRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open)
      return

    if (typeof document !== 'undefined') {
      prevFocusedRef.current = document.activeElement as HTMLElement | null
    }

    const container = containerRef.current
    if (!container)
      return

    /** 下一帧再聚焦，确保进入动画 / DOM 已就绪 */
    const raf = requestAnimationFrame(() => {
      const focusable = container.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )
      const target = focusable ?? container
      try {
        target.focus({ preventScroll: true })
      }
      catch {
        target.focus()
      }
    })

    return () => {
      cancelAnimationFrame(raf)

      /** 关闭时归还焦点 */
      const prev = prevFocusedRef.current
      prevFocusedRef.current = null
      if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
        try {
          prev.focus({ preventScroll: true })
        }
        catch {
          prev.focus()
        }
      }
    }
  }, [open, containerRef])
}
