'use client'

import type { CSSProperties } from 'react'
import type { ColumnQueue, ItemRect, RenderItem, VirtualWaterFallProps, WaterfallItem } from './types'
import { rafThrottle } from '@jl-org/tool'
import { onMounted, useUpdateEffect } from 'hooks'
import { useMemo, useRef, useState } from 'react'
import { cn } from 'utils'

function VirtualWaterfallComp<T extends WaterfallItem>({
  data,
  col = 5,
  gap = 10,

  prevBuffer = 400,
  nextBuffer = 400,

  hasMore,
  pageSize,
  loadMore,

  children,
  className,
  style,
}: VirtualWaterFallProps<T>) {
  const containerRef = useRef<null | HTMLDivElement>(null)

  /**
   * state
   */
  const loading = useRef(false)
  const [scrollState, setScrollState] = useState({
    clientWidth: 0,
    /** 容器高度 */
    clientHeight: 0,
    /** scrollTop */
    scrollTop: 0,
  })

  /** 可视范围底部的 scrollHeight */
  const bottom = useMemo(() => scrollState.clientHeight + scrollState.scrollTop, [scrollState])
  const [listStyle, setListStyle] = useState<CSSProperties>({})

  const [queueState, setQueueState] = useState({
    /** 所有卡片的二维数组，每个数组是一列 */
    queue: new Array(col).fill(0).map<ColumnQueue>(() => ({ list: [], height: 0 })),
    /** 当前视图上展示的所有卡片数量 */
    len: 0,
  })

  /** 把列二维数组转为一维数组 */
  const cardList = useMemo(
    () => queueState.queue.reduce<RenderItem<T>[]>((pre, { list }) => pre.concat(list), []),
    [queueState.queue],
  )
  /** 可视范围内需要渲染的数组 */
  const renderList = useMemo(
    () => cardList.filter(i =>
      i.h + i.y > scrollState.scrollTop - prevBuffer
      && i.y < bottom + nextBuffer,
    ),
    [cardList, bottom, prevBuffer, nextBuffer, scrollState.scrollTop],
  )

  /**
   * ### 当数据源变化时自动计算
   * 实际尺寸信息，包括每个卡片的宽高、列表的宽高、卡片之间的间距
   */
  const itemSizeInfo = useMemo(() => {
    return data.reduce<Map<WaterfallItem['id'], ItemRect>>((pre, current) => {
      const itemWidth = Math.floor((scrollState.clientWidth - (col - 1) * gap) / col)
      pre.set(current.id, {
        width: itemWidth,
        height: Math.floor((itemWidth * current.height) / current.width),
      })

      return pre
    }, new Map())
  }, [data, col, gap, scrollState.clientWidth])

  /**
   * 设置 style，获取最小索引、最大高度
   */
  const getComputedHeight = () => {
    let minIndex = 0
    let minHeight = Infinity
    let maxHeight = -Infinity

    queueState.queue.forEach(({ height, list }, index) => {
      const totalHeightWithGap = height + gap * (list.length - 1)

      if (totalHeightWithGap < minHeight) {
        minHeight = totalHeightWithGap
        minIndex = index
      }
      if (totalHeightWithGap > maxHeight) {
        maxHeight = totalHeightWithGap
      }
    })

    setListStyle({
      height: `${maxHeight}px`,
      contentVisibility: 'auto',
      containIntrinsicWidth: '100%',
      containIntrinsicHeight: `${scrollState.clientHeight}px`,
    })

    return {
      minIndex,
      minHeight,
    }
  }

  /**
   * 生成一个元素，包含它的位置、样式信息
   */
  const genItem = (item: WaterfallItem, before: RenderItem | null, index: number): RenderItem => {
    const rect = itemSizeInfo.get(item.id)
    const width = rect!.width
    const height = rect!.height
    let y = 0
    if (before)
      y = before.y + before.h + gap

    return {
      item,
      y,
      h: height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${index === 0
          ? 0
          : (width + gap) * index
        }px, ${y}px, 0)`,
      },
    }
  }

  const addInQueue = (size = pageSize) => {
    const queue = queueState.queue
    let len = queueState.len

    for (let i = 0; i < size; i++) {
      if (len >= data.length)
        break

      const minIndex = getComputedHeight().minIndex
      const currentColumn = queue[minIndex]

      const before = currentColumn.list[currentColumn.list.length - 1] || null
      const lastItem = data[len]
      const item = genItem(lastItem, before, minIndex)

      currentColumn.list.push(item)
      currentColumn.height += item.h
      len++
    }
    setQueueState({ queue: [...queue], len })
    getComputedHeight()
  }

  const loadDataList = async () => {
    if (!hasMore || loading.current)
      return
    loading.current = true

    loadMore().finally(() => {
      loading.current = false
    })
  }

  const handleScroll = rafThrottle(() => {
    const { scrollTop, clientHeight } = containerRef.current!
    setScrollState({ ...scrollState, scrollTop })

    if (scrollTop + clientHeight > getComputedHeight().minHeight) {
      loadDataList()
    }
  })

  const initScrollState = () => {
    const { scrollTop, clientHeight, clientWidth } = containerRef.current!
    setScrollState({ scrollTop, clientHeight, clientWidth })
  }

  /**
   * 确保高度足够撑开
   */
  useUpdateEffect(() => {
    if (
      listStyle.height
      && scrollState.clientHeight >= Number.parseFloat(`${listStyle.height}`)
    ) {
      loadDataList()
    }
  }, [listStyle.height, scrollState.clientHeight])

  /**
   * 数据源变化时，重新计算尺寸
   */
  useUpdateEffect(() => {
    /** 当 data 变化时重置状态 */
    if (data.length === 0) {
      /** 重置所有状态 */
      setQueueState({
        queue: new Array(col).fill(0).map<ColumnQueue>(() => ({ list: [], height: 0 })),
        len: 0,
      })
      setListStyle({})
      loadDataList()
    }

    /** 数据源变化时，重新计算尺寸并重新生成队列 */
    itemSizeInfo.size && addInQueue()
  }, [data, itemSizeInfo, pageSize])

  /**
   * init
   */
  onMounted(() => {
    initScrollState()
    loadDataList()
  })

  return (
    <div
      className={ cn(
        'w-full h-full overflow-y-scroll overflow-x-hidden',
        className,
      ) }
      style={ style }
      ref={ containerRef }
      onScroll={ handleScroll }
    >

      <div className="relative w-full" style={ listStyle }>
        { renderList.map(({ item, style }, index) => (
          <div
            className="absolute left-0 top-0 box-border"
            key={ item.id }
            style={ style }
          >

            { children(item, index) }
          </div>
        )) }
      </div>
    </div>
  )
}

VirtualWaterfallComp.displayName = 'VirtualWaterfall'
export const VirtualWaterfall = memo(VirtualWaterfallComp) as typeof VirtualWaterfallComp
