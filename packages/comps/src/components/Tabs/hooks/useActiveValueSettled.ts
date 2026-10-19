/** 用轨道的原生过渡结束事件通知当前 Tab；不检测几何、页面曝光或用户身份 */
import { useLatestCallback } from 'hooks'
import type { TransitionEvent } from 'react'
import { useEffect, useRef } from 'react'
import type { TabsContentProps } from '../types'

/** 初次显示和无动画切换直接通知；其余切换等待轨道 transform 过渡结束 */
export function useActiveValueSettled({
  activeValue,
  activeIndex,
  duration,
  onActiveValueSettled,
}: ActiveValueSettledOptions) {
  const previousIndex = useRef(activeIndex)
  const pendingValue = useRef<string | undefined>(undefined)
  const enabled = !!onActiveValueSettled

  const notifySettled = useLatestCallback(() => {
    const value = pendingValue.current
    pendingValue.current = undefined
    if (value === undefined) return

    try {
      void Promise.resolve(onActiveValueSettled?.(value)).catch(() => {})
    }
    catch {
      // 可选通知失败不影响内容显示和切换
    }
  })

  useEffect(() => {
    const indexChanged = previousIndex.current !== activeIndex
    previousIndex.current = activeIndex
    pendingValue.current = enabled && activeValue
      ? activeValue
      : undefined

    if (!indexChanged || duration <= 0) notifySettled()

    return () => {
      pendingValue.current = undefined
    }
  }, [activeValue, activeIndex, duration, enabled, notifySettled])

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    // 忽略内容子节点冒泡的动画，以及轨道上其他属性的过渡
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') return

    notifySettled()
  }

  return { onTransitionEnd }
}

type ActiveValueSettledOptions = Pick<TabsContentProps, 'activeValue' | 'onActiveValueSettled'> & {
  activeIndex: number
  duration: number
}
