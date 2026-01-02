'use client'

import { genArr } from '@jl-org/tool'
import { useCallback, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { VirtualScroll } from '.'
import { Tooltip } from '../Tooltip'

export default function Test() {
  const count = useRef(200)
  const [data, setData] = useState<{ data: number }[]>([])
  const hasMore = useMemo(() => data.length <= 5000000, [data.length])

  const loadMore = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        count.current += 20
        setData(genArr(count.current, i => ({
          data: i + 1,
        })))
        resolve(null)
      }, 1000)
    })
  }, [])

  return (
    <VirtualScroll
      className={ cn(
        'h-60 w-60 m-auto my-4',
      ) }
      data={ data }
      itemHeight={ 40 }
      loadMore={ loadMore }
      hasMore={ hasMore }
    >
      { (item, index) => (
        <Tooltip
          content={ `项目 ${item?.data}，索引 ${index}` }
          placement="right"
          className="w-full"
        >
          <div
            style={ {
              height: 40,
              backgroundColor: index % 2
                ? '#fff'
                : '#409eff',
              border: '1px solid',
            } }
            className="w-full"
          >
            { item?.data }
          </div>
        </Tooltip>
      ) }

    </VirtualScroll>
  )
}
