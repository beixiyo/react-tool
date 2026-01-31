import type { WinListenerParams } from '@jl-org/tool'
import { bindWinEvent } from '@jl-org/tool'
import { useEffect } from 'react'
import { useLatestRef } from '../ref'

/**
 * 监听窗口隐藏
 * @param hiddenFn 窗口隐藏时执行的函数
 * @param showFn 窗口显示时执行的函数
 */
export function useOnWinHidden(
  hiddenFn: VoidFunction,
  showFn?: VoidFunction,
) {
  const watchHiddenFn = useLatestRef(hiddenFn)
  const watchShowFn = useLatestRef(showFn)

  useEffect(() => {
    const fn = () => {
      const isHidden = document.visibilityState === 'hidden'
      if (isHidden) {
        watchHiddenFn.current()
        return
      }

      const isVisible = document.visibilityState === 'visible'
      if (isVisible && watchShowFn.current) {
        watchShowFn.current()
      }
    }

    document.addEventListener('visibilitychange', fn)

    return () => {
      document.removeEventListener('visibilitychange', fn)
    }
  }, [watchHiddenFn, watchShowFn])
}

/**
 * 绑定 window 事件，并自动解绑事件
 * @param eventName 事件名称
 * @param listener 事件回调
 * @returns 解绑事件函数
 */
export function useBindWinEvent<K extends keyof WindowEventMap>(
  eventName: K,
  listener: WinListenerParams<K>[1],
  deps: any[] = [],
  options?: WinListenerParams<K>[2],
) {
  const stableListener = useLatestRef(listener)

  useEffect(() => {
    const unBind = bindWinEvent(eventName, stableListener.current, options)
    return unBind
  }, [eventName, options, ...deps])

  return () => {
    window.removeEventListener(eventName, stableListener.current, options)
  }
}
