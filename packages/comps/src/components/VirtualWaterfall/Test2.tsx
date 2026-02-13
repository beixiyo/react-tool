'use client'

import type { WaterfallItem } from './types'
import { IMG_URLS } from 'config'
import { useRef, useState } from 'react'
import { useVirtualWaterfall } from './useVirtualWaterfall'

/** 不同的尺寸组合 */
const sizePresets = [
  { width: 200, height: 300 },
  { width: 400, height: 600 },
  { width: 300, height: 500 },
  { width: 500, height: 800 },
  { width: 250, height: 400 },
  { width: 600, height: 900 },
  { width: 350, height: 550 },
  { width: 450, height: 700 },
  { width: 280, height: 420 },
  { width: 550, height: 850 },
  { width: 320, height: 480 },
  { width: 480, height: 720 },
  { width: 220, height: 330 },
  { width: 380, height: 570 },
  { width: 420, height: 630 },
]

/** 生成 100 条 mock 数据 */
function generateMockData(count: number): (WaterfallItem & { src: string })[] {
  return Array.from({ length: count }, (_, index) => {
    const sizeIndex = index % sizePresets.length
    const urlIndex = index % IMG_URLS.length
    const size = sizePresets[sizeIndex]

    return {
      id: index + 1,
      width: size.width,
      height: size.height,
      src: IMG_URLS[urlIndex],
    }
  })
}

const mockImageData = generateMockData(100)

export default function TestHook() {
  const containerRef = useRef<HTMLDivElement>(null)
  const translateRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<(WaterfallItem & { src: string })[]>([])
  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    /** 模拟异步加载 */
    await new Promise(resolve => setTimeout(resolve, 500))

    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const newData = mockImageData.slice(startIndex, endIndex)

    if (newData.length === 0) {
      setHasMore(false)
      return
    }

    setPage(pre => pre + 1)
    setData(pre => [...pre, ...newData])
  }

  const { renderData, onScroll } = useVirtualWaterfall({
    getContainerEl: () => containerRef.current!,
    getTranslateEl: () => translateRef.current!,
    data,
    hasMore,
    loadMore,
    pageSize,
    col: 4,
  })

  return (
    <div className="size-full flex items-center justify-center bg-background2 p-6">
      <div
        ref={ containerRef }
        onScroll={ onScroll }
        className="overflow-y-scroll overflow-x-hidden size-10/12 border border-border rounded-lg"
      >
        <div className="relative w-full" ref={ translateRef }>
          { renderData.map(({ item, style }) => (
            <div
              className="absolute left-0 top-0 box-border rounded-lg overflow-hidden"
              key={ item.id }
              style={ style }
            >
              <img
                src={ item.src }
                className="h-full w-full object-cover"
                decoding="async"
                alt={ `Image ${item.id}` }
              />
            </div>
          )) }
        </div>
      </div>
    </div>
  )
}
