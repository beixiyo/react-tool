'use client'

import { genArr } from '@jl-org/tool'
import { useMemoFn } from 'hooks'
import { useState } from 'react'
import { cn, createSuspenseData } from 'utils'
import { InfiniteScroll } from '.'
import { Card } from '../Card'

const count = 10
const MAX_COUNT = 1000

const dataLoader = createSuspenseData<{ data: number }[]>(
  () => new Promise((resolve) => {
    setTimeout(() => {
      resolve(genArr(count, i => ({ data: i })))
    }, 2000)
  }),
  lastData => new Promise((resolve) => {
    setTimeout(() => {
      const lastIndex = lastData.at(-1)!.data
      resolve(lastData.concat(genArr(count, i => ({ data: i + lastIndex + 1 }))))
    }, 500)
  }),
)

export default function Test() {
  const [data, setData] = useState(dataLoader.read())
  const hasMore = data.length < MAX_COUNT

  const loadMore = useMemoFn(() =>
    dataLoader.loadMore().then((res) => {
      setData(res)
    }))

  return (
    <div className="min-h-screen bg-backgroundSecondary p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card
          variant="default"
          shadow="lg"
          rounded="xl"
          padding="lg"
          className="bg-background"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-textPrimary mb-2">
              无限滚动示例
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-textSecondary">已加载:</span>
                <span className="font-medium text-textPrimary">{data.length}</span>
              </div>
              <span className="text-textTertiary">/</span>
              <div className="flex items-center gap-2">
                <span className="text-textSecondary">最多:</span>
                <span className="font-medium text-textPrimary">{MAX_COUNT}</span>
              </div>
              <div className="ml-auto">
                <div className="h-2 w-32 bg-backgroundTertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-systemBlue transition-all duration-300 ease-out"
                    style={ {
                      width: `${(data.length / MAX_COUNT) * 100}%`,
                    } }
                  />
                </div>
              </div>
            </div>
          </div>

          <Card
            variant="default"
            bordered
            rounded="lg"
            className="bg-backgroundSecondary border-border"
          >
            <InfiniteScroll
              className="h-[600px]"
              loadMore={ loadMore }
              hasMore={ hasMore }
              showLoading
            >
              <div className="p-4 space-y-2">
                {data.map((item, index) => (
                  <div
                    key={ index }
                    className={ cn(
                      'px-4 py-3 rounded-lg transition-all duration-200',
                      'border border-border hover:border-borderStrong',
                      'bg-background hover:bg-backgroundTertiary',
                      'flex items-center justify-between',
                      index % 2 === 0 && 'bg-backgroundSecondary',
                    ) }
                  >
                    <div className="flex items-center gap-3">
                      <div className={ cn(
                        'w-8 h-8 rounded-md flex items-center justify-center',
                        'text-xs font-medium',
                        index % 2 === 0
                          ? 'bg-systemBlue/10 text-systemBlue'
                          : 'bg-systemOrange/10 text-systemOrange',
                      ) }>
                        {index + 1}
                      </div>
                      <span className="text-textPrimary font-medium">
                        项目 #
                        {item?.data}
                      </span>
                    </div>
                    <div className="text-xs text-textTertiary">
                      {index < 9
                        ? `0${index + 1}`
                        : index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </InfiniteScroll>
          </Card>

          {!hasMore && (
            <div className="mt-4 text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-backgroundTertiary">
                <span className="text-sm text-textSecondary">
                  已加载全部
                  {' '}
                  {MAX_COUNT}
                  {' '}
                  项数据
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export interface TestProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}
