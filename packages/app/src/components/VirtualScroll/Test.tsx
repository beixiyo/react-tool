'use client'

import { genArr } from '@jl-org/tool'
import { cn } from 'utils'
import { VirtualScroll } from '.'

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
        <div
          style={ {
            height: 40,
            backgroundColor: index % 2
              ? '#fff'
              : '#409eff',
            border: '1px solid',
          } }
        >
          { item?.data }
        </div>
      ) }

    </VirtualScroll>
  )
}
