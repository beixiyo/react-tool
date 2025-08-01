'use client'

import type { WaterfallItem } from './types'
import { useNotifyParentReady } from '@/hooks'
import { cn } from '@/utils'
import { VirtualWaterfall } from './'

export default function Test() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  const [data, setData] = useState<WaterfallItem[]>([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    const request = await fetch(
      `https://www.vilipix.com/api/v1/picture/public?limit=${pageSize}&sort=hot&offset=${(page - 1) * pageSize}`,
    )

    const { data: { rows, count } } = await request.json()
    setHasMore(data.length < count)
    setPage(pre => pre + 1)

    const newData = rows.map((item: any) => ({
      id: item.picture_id,
      width: item.width,
      height: item.height,
      src: `${item.regular_url}?x-oss-process=image/resize,w_240/format,jpg`,
    }))
    setData(pre => [...pre, ...newData])
  }

  return (
    <div className="size-full flex items-center justify-center">
      <VirtualWaterfall
        loadMore={ loadMore }
        hasMore={ hasMore }
        pageSize={ pageSize }
        col={ 4 }
        gap={ 10 }
        data={ data }
        className="border border-red-700 border-solid !size-10/12"
      >
        {
          detail => (
            <img
              src={ detail.src }
              decoding="async"
              className={ cn(
                'w-full h-full object-cover',
              ) }
            />
          )
        }
      </VirtualWaterfall>
    </div>
  )
}
