'use client'

import { RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { VirtualDyScroll } from '.'

export default function VirtualScrollTest() {
  const [items, setItems] = useState<ReturnType<typeof generateItems>>([])
  const [hasMore, setHasMore] = useState(true)

  /** 加载更多数据 */
  const loadMoreItems = useCallback(async () => {
    /** 模拟网络请求延迟 */
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (items.length >= 500) {
          setHasMore(false)
        }
        else {
          setItems(prev => [...prev, ...generateItems(15, prev.length)])
        }
        resolve()
      }, 200)
    })
  }, [items.length])

  /** 重置数据 */
  const resetData = () => {
    setItems(generateItems(20))
    setHasMore(true)
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-semibold">动态虚拟滚动组件测试</h1>
        <p className="mb-4 text-gray-600">
          此组件支持动态高度的项目，并在滚动到底部时加载更多数据。
        </p>
        <button
          onClick={ resetData }
          className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          <RefreshCw size={ 16 } />
          重置数据
        </button>
      </div>

      <div className="overflow-hidden border border-gray-300 rounded-lg shadow-2xs">
        <VirtualDyScroll
          data={ items }
          itemHeight={ 50 }
          overscan={ 10 }
          hasMore={ hasMore }
          showLoading
          loadMore={ loadMoreItems }
          className="h-[600px] w-full"
        >
          { (item, index) => (
            <div
              className="border-b border-gray-200 p-3"
              style={ { backgroundColor: item.color } }
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  项目 #
                  { item.id }
                </div>
              </div>
              <div
                className="mt-2 rounded-md p-3"
                style={ { backgroundColor: item.accentColor } }
              >
                <p>
                  这是项目 #
                  { item.id }
                  { ' ' }
                  的详细内容
                </p>
                <p>
                  随机高度:
                  { item.height }
                  px
                </p>
                <div style={ { height: `${item.height}px` } } className="mt-2 rounded-xs bg-black/5" />
              </div>
            </div>
          ) }
        </VirtualDyScroll>
      </div>

      { !hasMore && (
        <div className="mt-4 text-center text-gray-500">
          已加载全部数据
        </div>
      ) }
    </div>
  )
}

/** 生成随机高度的数据 */
function generateItems(count: number, startIndex = 0) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${startIndex + i}`,
    height: Math.floor(Math.random() * 80) + 20, // 30-80px 的随机高度
    color: getRandomColor(0.2),
    accentColor: getRandomColor(0.8),
    expanded: false,
  }))
}

/** 生成随机颜色 */
function getRandomColor(saturation: number) {
  const hue = Math.floor(Math.random() * 360)
  return `hsl(${hue}, ${saturation * 100}%, 70%)`
}
