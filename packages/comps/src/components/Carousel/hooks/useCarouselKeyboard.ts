import { useEffect } from 'react'

/**
 * 轮播图键盘导航 Hook
 *
 * @param enableKeyboardNav 是否启用键盘导航
 * @param paginate 翻页回调
 * @param scope 监听范围：
 *   - `'global'`：挂在 window 上，页面任意位置按方向键都会切换（默认，向后兼容）
 *   - `'container'`：挂在传入的容器元素上，需容器获得焦点后才响应，避免多实例互相干扰
 * @param containerRef 当 scope 为 `'container'` 时监听的容器元素 ref
 */
export function useCarouselKeyboard(
  enableKeyboardNav: boolean,
  paginate: (direction: number) => void,
  scope: 'global' | 'container' = 'global',
  containerRef?: { readonly current: HTMLElement | null },
) {
  useEffect(() => {
    if (!enableKeyboardNav) {
      return
    }

    const target: Window | HTMLElement | null = scope === 'container'
      ? containerRef?.current ?? null
      : window

    if (!target) {
      return
    }

    const handleKeyDown = (e: Event) => {
      const key = (e as KeyboardEvent).key
      if (key === 'ArrowLeft') {
        paginate(-1)
      }
      else if (key === 'ArrowRight') {
        paginate(1)
      }
    }

    target.addEventListener('keydown', handleKeyDown)
    return () => {
      target.removeEventListener('keydown', handleKeyDown)
    }
  }, [enableKeyboardNav, paginate, scope, containerRef])
}
