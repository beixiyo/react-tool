'use client'

import React, { memo, useEffect, useRef, useState } from 'react'
import { cn } from 'utils'
import { LoadingIcon } from '../Loading/LoadingIcon'

const InnerVirtualDyScroll = forwardRef<HTMLDivElement, VirtualDyScrollProps<any>>((
  {
    data,
    children,
    beforeChildren,
    itemHeight = 40,
    overscan = 5,

    className,
    contentClassName,
    style,

    hasMore = false,
    immediate = true,
    showLoading = false,
    loadMore,
    ...rest
  },
  ref,
) => {
  /** 原本类型是 T */
  const [renderData, setRenderData] = useState<any[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const [totalHeight, setTotalHeight] = useState(0)
  const [loading, setLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const itemHeightCacheRef = useRef<Record<number, number>>({})

  /** 计算总高度 */
  const updateTotalHeight = () => {
    let height = 0
    for (let i = 0; i < data.length; i++) {
      height += getItemHeight(i)
    }
    setTotalHeight(height)
  }

  /** 获取元素高度（从缓存或默认值） */
  const getItemHeight = (index: number): number => {
    return itemHeightCacheRef.current[index] || itemHeight
  }

  /** 更新可见区域的数据 */
  const updateVisibleData = (scrollTop: number) => {
    let currentOffset = 0
    let visibleStartIndex = 0

    /** 找到第一个可见元素的索引 */
    for (let i = 0; i < data.length; i++) {
      const height = getItemHeight(i)
      if (currentOffset + height > scrollTop) {
        visibleStartIndex = i
        break
      }
      currentOffset += height
    }

    /** 计算可见区域的起始索引（考虑 overscan） */
    const start = Math.max(0, visibleStartIndex - overscan)
    /** 计算可见区域的结束索引（考虑 overscan） */
    const visibleCount = Math.ceil(
      (scrollRef.current?.clientHeight || 0) / itemHeight,
    )
    const end = Math.min(
      data.length,
      visibleStartIndex + visibleCount + overscan,
    )

    setStartIndex(start)
    setRenderData(data.slice(start, end))
    setTranslateY(calculateOffsetForIndex(start))
  }

  /** 计算指定索引的偏移量 */
  const calculateOffsetForIndex = (index: number): number => {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i)
    }
    return offset
  }

  /** 更新元素高度缓存 */
  const updateItemHeightCache = () => {
    itemsRef.current.forEach((element, index) => {
      const actualIndex = startIndex + index
      if (element && !itemHeightCacheRef.current[actualIndex]) {
        itemHeightCacheRef.current[actualIndex] = element.offsetHeight
      }
    })
    updateTotalHeight()
  }

  /** 处理滚动事件 */
  const handleScroll = () => {
    if (!scrollRef.current)
      return

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    updateVisibleData(scrollTop)
    loadAndCheckHeight()

    /** 检查是否滚动到底部，如果是则加载更多数据，并确保内容高度大于滚动区域高度 */
    function loadAndCheckHeight() {
      if (
        hasMore
        && !loading
        && scrollTop + clientHeight >= scrollHeight - 50
      ) {
        setLoading(true)
        loadMore?.().finally(() => {
          setLoading(false)

          const { clientHeight } = contentRef.current!
          if (clientHeight < scrollRef.current!.clientHeight) {
            loadAndCheckHeight()
          }
        })
      }
    }
  }

  /** 初始化和数据变化时更新 */
  useEffect(() => {
    updateTotalHeight()
    updateVisibleData(scrollRef.current?.scrollTop || 0)
  }, [data])

  /** 渲染后更新高度缓存 */
  useEffect(() => {
    updateItemHeightCache()
  }, [renderData])

  useEffect(
    () => {
      immediate && handleScroll()
    },
    [],
  )

  useImperativeHandle(ref, () => scrollRef.current!, [])

  return (
    <div
      ref={ scrollRef }
      className={ cn('overflow-auto relative', className) }
      style={ style }
      onScroll={ handleScroll }
      { ...rest }
    >
      <div style={ { height: `${totalHeight}px`, position: 'relative' } }>
        <div
          style={ {
            transform: `translateY(${translateY}px)`,
            position: 'absolute',
            width: '100%',
          } }
          ref={ contentRef }
          className={ contentClassName }
        >
          { beforeChildren }

          { renderData.map((item, index) => (
            <div
              key={ item.id || startIndex + index }
              ref={ (el) => {
                if (el) {
                  itemsRef.current.set(index, el)
                }
                else {
                  itemsRef.current.delete(index)
                }
              } }
              style={ { minHeight: `${itemHeight}px` } }
              className="relative"
            >
              { children(item, startIndex + index) }
            </div>
          )) }

          <div className="absolute bottom-1 left-0 w-full flex items-center justify-center">
            { loading && showLoading && <LoadingIcon size={ 30 } /> }
          </div>
        </div>
      </div>
    </div>
  )
})

/**
 * 动态高度虚拟滚动组件
 */
export const VirtualDyScroll = memo(InnerVirtualDyScroll) as typeof InternalType

export type VirtualDyScrollProps<T extends { id?: string }> = {
  /**
   * 要渲染的数据数组
   */
  data: T[]

  /**
   * 渲染每个项目的函数
   * @param item 当前项目数据
   * @param index 当前项目索引
   */
  children: (item: T, index: number) => React.ReactNode

  beforeChildren?: React.ReactNode

  /**
   * 项目的估计高度（像素）
   * @default 40
   */
  itemHeight?: number

  /**
   * 可视区域外额外渲染的项目数量，用于防止快速滚动时出现白屏
   * @default 5
   */
  overscan?: number

  className?: string
  contentClassName?: string

  /**
   * 自定义样式
   */
  style?: React.CSSProperties

  /**
   * 是否有更多数据可加载
   * @default false
   */
  hasMore?: boolean

  /**
   * 展示 loading 按钮
   * @default false
   */
  showLoading?: boolean

  /**
   * 加载更多数据的回调函数，当滚动到底部时触发
   * @returns 返回一个 Promise，用于标记加载完成
   */
  loadMore?: () => Promise<any>

  /**
   * 是否立即加载一次
   * @default true
   */
  immediate?: boolean
}
& Omit<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'children'
>

/**
 * React.forwardRef 不能添加泛型，一堆 Shit API
 * 只能通过这种方式来实现
 */
function InternalType<T extends { id?: string }>(_props: VirtualDyScrollProps<T>): React.JSX.Element {
  return <></>
}
