'use client'

import type { CSSProperties, ReactNode } from 'react'
import { rafThrottle } from '@jl-org/tool'

import { onMounted, useLatestCallback, useResizeObserver, useUpdateEffect } from 'hooks'
import { forwardRef, memo, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'

const InnerVirtualScroll = forwardRef<HTMLDivElement, VirtualScrollProps<any>>(({
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
  empty,
  renderLoading,
  children,
}, ref) => {
  const refScroller = useRef<HTMLDivElement>(null)

  /** y 轴高度数组 */
  const [itemPool, setItemPool] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [stIndex, setStIndex] = useState(0)
  const totalHeight = itemHeight * data.length

  useImperativeHandle(ref, () => refScroller.current!, [])

  /**
   * 计算可视范围，读取最新的 state/props，无闭包陷阱
   */
  const updatePool = useLatestCallback(() => {
    if (!refScroller.current)
      return

    const top = refScroller.current.scrollTop
    const parentHeight = refScroller.current.offsetHeight

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

  /**
   * rAF 节流后的稳定函数，只创建一次，内部读取最新值
   */
  const setPool = useMemo(
    () => rafThrottle(() => updatePool()),
    [updatePool],
  )

  /** 监听容器尺寸变化，父容器高度改变后重算可视窗口 */
  useResizeObserver([refScroller], () => {
    setPool()
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
              ? (data[stIndex + index][keyField] as React.Key)
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

        { data.length === 0 && !isLoading && empty }

        <div className="absolute bottom-1 left-0 w-full flex items-center justify-center">
          { isLoading && (renderLoading
            ? renderLoading()
            : <LoadingIcon size={ 30 } />) }
        </div>
      </div>

    </div>
  )
})

InnerVirtualScroll.displayName = 'VirtualScroll'

export const VirtualScroll = memo(InnerVirtualScroll) as typeof InternalType

export interface VirtualScrollProps<T> {
  className?: string
  style?: CSSProperties
  contentClassName?: string
  contentStyle?: CSSProperties

  data: T[]
  /**
   * 每一项的高度（像素）
   * @default 40
   */
  itemHeight?: number
  /**
   * 作为 key 的字段名，取自数据项；不传则使用索引
   */
  keyField?: keyof T
  /**
   * 前面多加载的数量
   * @default 6
   */
  prev?: number
  /**
   * 后面多加载的数量
   * @default 6
   */
  next?: number

  loadMore: () => Promise<any>
  /**
   * 是否还有更多数据可加载
   */
  hasMore?: boolean
  /**
   * 数据为空且非加载中时展示的占位内容
   */
  empty?: ReactNode
  /**
   * 自定义加载中渲染，不传则使用内置 LoadingIcon
   */
  renderLoading?: () => ReactNode
  children: (item: T, index: number) => ReactNode
}

/**
 * React.forwardRef 不能添加泛型，只能通过这种方式来保留泛型推断
 */
function InternalType<T>(
  _props: VirtualScrollProps<T> & { ref?: React.Ref<HTMLDivElement> },
): React.JSX.Element {
  return <></>
}
