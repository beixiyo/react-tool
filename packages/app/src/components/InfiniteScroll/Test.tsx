'use client'

import { genArr } from '@jl-org/tool'
import { useMemoFn } from 'hooks'
import { cn, createSuspenseData } from 'utils'
import { InfiniteScroll } from '.'

const count = 10

const dataLoader = createSuspenseData<{ data: number }[]>(
  () => new Promise((resolve) => {
    setTimeout(() => {
      resolve(genArr(count, i => ({ data: i })))
    }, 2000)
  }),
  lastData => new Promise((resolve) => {
    setTimeout(() => {
      const lastIndex = lastData.at(-1)!.data
      resolve(lastData.concat(genArr(count, i => ({ data: i + lastIndex }))))
    }, 500)
  }),
)

export default function Test() {

  const [data, setData] = useState(dataLoader.read())
  const hasMore = data.length <= 100

  const loadMore = useMemoFn(() =>
    dataLoader.loadMore().then((res) => {
      setData(res)
    }))

  return (
    <InfiniteScroll
      className={ cn(
        'h-40! w-60 m-auto my-4',
      ) }
      loadMore={ loadMore }
      hasMore={ hasMore }
    >
      {data.map((item, index) => (
        <div
          style={ {
            height: 40,
            backgroundColor: index % 2
              ? '#fff'
              : '#409eff',
            border: '1px solid',
          } }
          key={ index }
        >
          {item?.data}
        </div>
      ),
      )}

    </InfiniteScroll>
  )
}

export interface TestProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}
