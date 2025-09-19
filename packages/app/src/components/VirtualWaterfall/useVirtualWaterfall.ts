import type { ColumnQueue, ItemRect, RenderItem, WaterfallItem } from './types'
import { genArr, rafThrottle } from '@jl-org/tool'
import { onMounted, useUpdateEffect } from 'hooks'

/**
 * 虚拟瀑布流
 * @link ./Test2.tsx
 */
export function useVirtualWaterfall<T extends WaterfallItem>(
  {
    getContainerEl,
    getTranslateEl,
    data,
    col = 5,
    gap = 10,

    prevBuffer = 400,
    nextBuffer = 400,

    hasMore,
    pageSize,
    loadMore,
  }: WaterfallConfig<T>,
) {
  /**
   * state
   */
  const loading = useRef(false)
  const [scrollState, setScrollState] = useState({
    clientWidth: 0,
    /** 容器高度 */
    clientHeight: 0,
    scrollTop: 0,
  })

  const [totalHeight, setTotalHeight] = useState(0)
  /** 可视范围底部的 scrollHeight */
  const bottom = useMemo(() => scrollState.clientHeight + scrollState.scrollTop, [scrollState])

  const [queueState, setQueueState] = useState({
    /** 所有卡片的二维数组，每个数组是一列 */
    queue: genArr<ColumnQueue>(col, () => ({ list: [], height: 0 })),
    /** 当前视图上展示的所有卡片数量 */
    len: 0,
  })

  /** 把列二维数组转为一维数组 */
  const cardList = useMemo(
    () => queueState.queue.reduce<RenderItem[]>((pre, { list }) => pre.concat(list), []),
    [queueState.queue],
  )

  /** 可视范围内需要渲染的数组 */
  const renderData = useMemo(
    () => cardList.filter(i =>
      i.h + i.y > scrollState.scrollTop - prevBuffer
      && i.y < bottom + nextBuffer,
    ),
    [cardList, bottom, prevBuffer, nextBuffer],
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
  }, [data])

  /**
   * 设置 style，获取最小索引、最大高度
   */
  const getComputedHeight = () => {
    let minIndex = 0
    let minHeight = Infinity
    let maxHeight = -Infinity

    queueState.queue.forEach(({ height }, index) => {
      if (height < minHeight) {
        minHeight = height
        minIndex = index
      }
      if (height > maxHeight) {
        maxHeight = height
      }
    })

    setTotalHeight(maxHeight)
    const child = getTranslateEl()
    if (child) {
      child.style.height = `${maxHeight}px`
    }

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

  const addInQueue = () => {
    const queue = queueState.queue
    let len = queueState.len

    for (let i = 0; i < pageSize; i++) {
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
  }

  const loadMoreList = () => {
    if (!hasMore || loading.current)
      return
    loading.current = true

    loadMore().finally(() => {
      loading.current = false
    })
  }

  const onScroll = rafThrottle(() => {
    const { scrollTop, clientHeight } = getContainerEl()
    setScrollState({ ...scrollState, scrollTop })

    if (scrollTop + clientHeight > getComputedHeight().minHeight) {
      loadMoreList()
    }
  })

  const initScrollState = () => {
    const { scrollTop, clientHeight, clientWidth } = getContainerEl()
    setScrollState({ scrollTop, clientHeight, clientWidth })
  }

  /**
   * 确保高度足够撑开
   */
  useUpdateEffect(
    () => {
      if (
        scrollState.clientHeight
        && scrollState.clientHeight >= totalHeight
      ) {
        loadMoreList()
      }
    },
    [
      loadMoreList,
      totalHeight,
      scrollState.clientHeight,
    ],
  )

  /**
   * 数据源变化时，重新计算尺寸
   */
  useUpdateEffect(() => {
    itemSizeInfo.size && addInQueue()
  }, [itemSizeInfo, pageSize])

  /**
   * init
   */
  const init = () => {
    initScrollState()
    loadMoreList()
  }

  onMounted(init)

  return { renderData, onScroll }
}

export interface WaterfallConfig<T extends WaterfallItem> {
  data: T[]
  /**
   * 卡片之间的间距
   * @default 10
   */
  gap?: number
  /**
   * 瀑布流列数
   * @default 5
   */
  col?: number
  /**
   * 一次请求的数据量
   */
  pageSize: number
  hasMore: boolean

  /**
   * 上面额外加载的缓冲距离
   * @default 400
   */
  prevBuffer?: number
  /**
   * 下面额外加载的缓冲距离
   * @default 400
   */
  nextBuffer?: number

  loadMore: () => Promise<any>

  /**
   * 获取外层元素，用来绑定滚动事件
   */
  getContainerEl: () => HTMLDivElement
  /**
   * 获取瀑布流区域元素，用来设置高度
   */
  getTranslateEl: () => HTMLDivElement
}
