'use client'

import type { CSSProperties, ReactNode } from 'react'

import { rafThrottle } from '@jl-org/tool'
import { onMounted, useUpdateEffect } from 'hooks'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'

function VirtualScrollComp<T>({
  style,
  className,
  contentStyle,
  contentClassName,

  data,
  itemHeight = 40,
  keyField,
  prev = 6,
  next = 6,

  loadMore,
  hasMore,
  children,
}: VirtualScrollProps<T>) {
  const refScroller = useRef<HTMLDivElement>(null)

  /** y 轴高度数组 */
  const [itemPool, setItemPool] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [stIndex, setStIndex] = useState(0)
  const totalHeight = itemHeight * data.length

  /**
   * 设置高度
   */
  const setPool = rafThrottle(() => {
    const top = refScroller.current!.scrollTop
    const parentHeight = refScroller.current!.offsetHeight

    const isExceeded = top + parentHeight >= totalHeight - 3
    if (
      isExceeded
      && hasMore
      && !isLoading
    ) {
      setIsLoading(true)

      loadMore().finally(() => {
        setIsLoading(false)
      })
    }

    /**
     * 根据滚动高度算索引
     */
    const stVal = Math.floor(top / itemHeight)
    const endIndex = Math.ceil((top + parentHeight) / itemHeight) + next

    const newStIndex = stVal - prev < 0
      ? 0
      : stVal - prev

    /**
     * 设置可视范围内容
     */
    setStIndex(newStIndex)
    const stPos = newStIndex * itemHeight

    setItemPool(
      data.slice(newStIndex, endIndex)
        .map((_, index) => stPos + index * itemHeight),
    )
  })

  useUpdateEffect(
    () => {
      setPool()
    },
    [
      data,
      itemHeight,
      prev,
      next,
      hasMore,
    ],
  )

  onMounted(() => {
    loadMore()
    setPool()
  })

  return (
    <div
      className={ cn(
        'overflow-auto relative',
        className,
      ) }
      style={ style }
      ref={ refScroller }
      onScroll={ setPool }
    >

      <div
        style={ {
          height: totalHeight,
          position: 'relative',
          ...contentStyle,
        } }
        className={ contentClassName }
      >
        { itemPool.map((height, index) => (
          <div
            key={ keyField
              ? (data as any)[stIndex + index][keyField]
              : index }
            className="absolute left-0 top-0 w-full"
            style={ {
              height: itemHeight,
              transform: `translate3d(0, ${height}px, 0)`,
              willChange: 'transform',
            } }
          >
            { children(data[stIndex + index], stIndex + index) }
          </div>
        ),
        ) }

        <div className="absolute bottom-1 left-0 w-full flex items-center justify-center">
          { isLoading && <LoadingIcon size={ 30 } /> }
        </div>
      </div>

    </div>
  )
}
VirtualScrollComp.displayName = 'VirtualScroll'

export const VirtualScroll = memo(VirtualScrollComp) as typeof VirtualScrollComp

export interface VirtualScrollProps<T> {
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties

  data: T[]
  itemHeight?: number
  keyField?: string
  /** 前面多加载的数量 */
  prev?: number
  /** 后面多加载的数量 */
  next?: number

  loadMore: () => Promise<any>
  hasMore?: boolean
  children: (item: T, index: number) => ReactNode
}
