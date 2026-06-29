'use client'

import { genArr } from '@jl-org/tool'
import { useCallback, useMemo, useRef, useState } from 'react'
import { cn } from 'utils'
import { VirtualScroll } from '.'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'
import { Tooltip } from '../Tooltip'

function Test() {
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
    <div className="min-h-screen bg-background p-8 text-text">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">VirtualScroll 组件</h1>
            <p className="mt-1 text-sm text-text2">虚拟滚动列表，滚动到底自动加载更多（配合 Tooltip）</p>
          </div>
          <ThemeToggle />
        </header>

        <VirtualScroll
          className={ cn(
            'h-60 w-60 m-auto my-4 rounded-lg border border-border',
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
                className={ cn(
                  'flex h-10 w-full items-center justify-center border-b border-border text-sm',
                  index % 2
                    ? 'bg-background2 text-text'
                    : 'bg-systemBlue/10 text-systemBlue',
                ) }
              >
                { item?.data }
              </div>
            </Tooltip>
          ) }
        </VirtualScroll>
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default Test
