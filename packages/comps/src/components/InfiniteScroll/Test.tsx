'use client'

import { memo, useCallback, useState } from 'react'
import { cn } from 'utils'
import { Card } from '../Card'
import { InfiniteScroll } from './index'

function DemoSection({ title, mode, color }: { title: string, mode: 'scroll' | 'intersection', color: string }) {
  const [items, setItems] = useState<number[]>(Array.from({ length: 10 }, (_, i) => i))
  const [hasMore, setHasMore] = useState(true)

  const loadMore = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setItems((prev) => {
      if (prev.length >= 50) {
        setHasMore(false)
        return prev
      }
      return [...prev, ...Array.from({ length: 10 }, (_, i) => prev.length + i)]
    })
  }, [])

  const isIntersection = mode === 'intersection'

  return (
    <div className="flex-1 flex flex-col min-w-[320px] bg-backgroundPrimary rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background2/20">
        <h2 className="font-bold text-text">{ title }</h2>
        <span className={ cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', color) }>
          { mode }
        </span>
      </div>

      { /* 如果是 intersection 模式，测试外部容器滚动，内部组件不定高 */ }
      <div className={ cn('flex-1', isIntersection ? 'h-[400px] overflow-auto bg-background2/5' : '') }>
        <InfiniteScroll
          mode={ mode }
          loadMore={ loadMore }
          hasMore={ hasMore }
          className={ isIntersection ? 'h-auto overflow-visible' : 'h-[400px]' }
          contentClassName="p-4 space-y-3"
          loadingContent={
            <div className="flex items-center justify-center gap-2 text-sm text-text2 py-2">
              <div className="w-4 h-4 border-2 border-systemOrange border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Loading...</span>
            </div>
          }
        >
          { items.map(item => (
            <Card key={ item } className="p-3 bg-background2/30 border-dashed hover:border-solid transition-colors">
              Item #
              { item + 1 }
            </Card>
          )) }
          { !hasMore && (
            <div className="text-center text-xs text-text3 py-4 bg-background2/10 rounded-lg">
              ✨ No more data
            </div>
          ) }
        </InfiniteScroll>
      </div>
    </div>
  )
}

export const InfiniteScrollTest = memo(() => {
  return (
    <div className="min-h-screen bg-background2 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-text tracking-tight">Infinite Scroll</h1>
          <p className="text-text2 mt-1">Comparison of Scroll vs Intersection detection modes</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <DemoSection
            title="Standard Scroll"
            mode="scroll"
            color="bg-systemBlue/10 text-systemBlue border border-systemBlue/20"
          />
          <DemoSection
            title="Intersection Sentinel"
            mode="intersection"
            color="bg-systemOrange/10 text-systemOrange border border-systemOrange/20"
          />
        </div>

        <div className="p-6 bg-backgroundPrimary rounded-xl border border-border">
          <h3 className="font-bold text-text mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-systemBlue rounded-full" />
            Implementation Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wide">Scroll Mode</h4>
              <p className="text-xs text-text2 leading-relaxed">
                Triggers when scroll position reaches a specific threshold (default 50px) from the bottom. Good for pre-fetching.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wide">Intersection Mode</h4>
              <p className="text-xs text-text2 leading-relaxed">
                Uses a sentinel element at the bottom. Tested with an outer scroll container and auto-height component to verify viewport detection.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wide">Ref Management</h4>
              <p className="text-xs text-text2 leading-relaxed">
                Uses a
                {' '}
                <code>loadingRef</code>
                {' '}
                to ensure only one request is active at a time, preventing duplicate data loads.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

InfiniteScrollTest.displayName = 'InfiniteScrollTest'

export default InfiniteScrollTest
