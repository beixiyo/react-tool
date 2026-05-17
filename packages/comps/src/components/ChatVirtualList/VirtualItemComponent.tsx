import type { VirtualItem } from './core/types'
import { memo, useEffect, useLayoutEffect, useRef } from 'react'

/**
 * 虚拟 item 包裹组件
 *
 * - absolute + translateY 定位（不影响文档流）
 * - useLayoutEffect 首次精确测量
 * - ResizeObserver 持续监听尺寸变化
 */
export const VirtualItemComponent = memo<VirtualItemComponentProps>(({
  virtualItem,
  measureItem,
  children,
}) => {
  const elRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = elRef.current
    if (!el)
      return
    const size = Math.round(el.getBoundingClientRect().height)
    if (size > 0)
      measureItem(virtualItem.key, size)
  }, [])

  useEffect(() => {
    const el = elRef.current
    if (!el)
      return

    const observer = new ResizeObserver(([entry]) => {
      const size = Math.round(
        entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height,
      )
      if (size > 0)
        measureItem(virtualItem.key, size)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [virtualItem.key, measureItem])

  return (
    <div
      ref={ elRef }
      style={ {
        position: 'absolute',
        top: 0,
        transform: `translateY(${virtualItem.start}px)`,
        width: '100%',
        willChange: 'transform',
        contain: 'layout',
        overflowAnchor: 'none',
      } }
    >
      { children }
    </div>
  )
})

VirtualItemComponent.displayName = 'VirtualItemComponent'

type VirtualItemComponentProps = {
  virtualItem: VirtualItem
  measureItem: (key: string | number, size: number) => void
  children: React.ReactNode
}
