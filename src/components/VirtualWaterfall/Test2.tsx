'use client'

import type { WaterfallItem } from './types'
import { useVirtualWaterfall } from './useVirtualWaterfall'

export default function TestHook() {
  const containerRef = useRef<HTMLDivElement>(null)
  const translateRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<WaterfallItem[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    const request = await fetch(
      `https://www.vilipix.com/api/v1/picture/public?limit=${pageSize}&sort=hot&offset=${(page - 1) * pageSize}`,
    )

    const { data: { rows } } = await request.json()
    setHasMore(!!rows.length)
    setPage(pre => pre + 1)

    const data = rows.map((item: any) => ({
      id: item.picture_id,
      width: item.width,
      height: item.height,
      src: `${item.regular_url}?x-oss-process=image/resize,w_240/format,jpg`,
    }))
    setData(pre => [...pre, ...data])
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
    <div className="size-full flex items-center justify-center">
      <div
        ref={ containerRef }
        onScroll={ onScroll }
        className={ `overflow-y-scroll overflow-x-hidden
        !size-10/12 border-red-700 border-solid border
     ` }
      >
        <div className="relative w-full" ref={ translateRef }>
          { renderData.map(({ item, style }) => (
            <div
              className="absolute left-0 top-0 box-border"
              key={ item.id }
              style={ style }
            >

              <img
                src={ item.src }
                className="h-full w-full object-cover"
                decoding="async"
              />
            </div>
          )) }
        </div>
      </div>
    </div>
  )
}
