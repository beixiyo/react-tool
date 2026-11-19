import { useLatestCallback, useScrollIntoView } from 'hooks'
import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

/** 为列表的虚拟焦点调度滚动 */
export function useActiveDescendantScroll({
  enabled,
  activeDescendantId,
  panelRef,
  behavior = 'instant',
}: UseActiveDescendantScrollOptions) {
  const frameRef = useRef<number | null>(null)
  const { scrollIntoView, cancelScroll } = useScrollIntoView({ enabled, behavior, boundary: panelRef })

  const cancelPendingScroll = useLatestCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    cancelScroll()
  })

  const revealActiveOption = useLatestCallback(() => {
    if (!enabled || !activeDescendantId) return
    const option = document.getElementById(activeDescendantId)
    if (option) scrollIntoView(option)
  })

  const scrollActiveOption = useLatestCallback(() => {
    cancelPendingScroll()
    if (!enabled) return
    /** 等状态提交后读取最新高亮，连续按键只保留一帧请求 */
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      revealActiveOption()
    })
  })

  useEffect(() => {
    if (enabled) scrollActiveOption()
    return cancelPendingScroll
  }, [enabled, scrollActiveOption, cancelPendingScroll])

  return scrollActiveOption
}

type UseActiveDescendantScrollOptions = {
  enabled: boolean
  activeDescendantId?: string
  panelRef: RefObject<HTMLElement | null>
  /** 滚动动画策略，由组件传入 @default 'instant' */
  behavior?: ScrollBehavior
}
