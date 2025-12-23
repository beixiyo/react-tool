'use client'

import type { WaterfallItem } from './types'
import { Card } from 'comps'
import { useState } from 'react'
import { VirtualWaterfall } from '.'

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

/** 卡片变体样式和对应的渐变颜色 */
const cardVariants: Array<{
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  gradient: string
  accentColor: string
}> = [
  {
    variant: 'default',
    gradient: 'from-backgroundSecondary via-backgroundSecondary/90 to-backgroundSecondary/80',
    accentColor: 'text-textPrimary',
  },
  {
    variant: 'primary',
    gradient: 'from-blue-50 via-blue-100/50 to-purple-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-purple-950/30',
    accentColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    variant: 'success',
    gradient: 'from-green-50 via-emerald-100/50 to-teal-50 dark:from-green-950/30 dark:via-emerald-900/20 dark:to-teal-950/30',
    accentColor: 'text-green-600 dark:text-green-400',
  },
  {
    variant: 'warning',
    gradient: 'from-amber-50 via-yellow-100/50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-900/20 dark:to-orange-950/30',
    accentColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    variant: 'danger',
    gradient: 'from-red-50 via-rose-100/50 to-pink-50 dark:from-red-950/30 dark:via-rose-900/20 dark:to-pink-950/30',
    accentColor: 'text-red-600 dark:text-red-400',
  },
  {
    variant: 'info',
    gradient: 'from-cyan-50 via-sky-100/50 to-blue-50 dark:from-cyan-950/30 dark:via-sky-900/20 dark:to-blue-950/30',
    accentColor: 'text-cyan-600 dark:text-cyan-400',
  },
]

/** 生成 100 条 mock 数据 */
function generateMockData(count: number): (WaterfallItem & {
  title: string
  content: string
  variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  gradient: string
  accentColor: string
  label?: string
})[] {
  return Array.from({ length: count }, (_, index) => {
    const sizeIndex = index % sizePresets.length
    const variantIndex = index % cardVariants.length
    const size = sizePresets[sizeIndex]
    const variantConfig = cardVariants[variantIndex]

    return {
      id: index + 1,
      width: size.width,
      height: size.height,
      title: `Card ${index + 1}`,
      content: `This is a beautiful ${variantConfig.variant} card with size ${size.width}×${size.height}. It features a gradient background and elegant styling.`,
      variant: variantConfig.variant,
      gradient: variantConfig.gradient,
      accentColor: variantConfig.accentColor,
      label: `${size.width}×${size.height}`,
    }
  })
}

const mockCardData = generateMockData(100)

export default function Test() {
  const [data, setData] = useState<(WaterfallItem & {
    title: string
    content: string
    variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    gradient: string
    accentColor: string
    label?: string
  })[]>([])
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    /** 模拟异步加载 */
    await new Promise(resolve => setTimeout(resolve, 500))

    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const newData = mockCardData.slice(startIndex, endIndex)

    if (newData.length === 0) {
      setHasMore(false)
      return
    }

    setPage(pre => pre + 1)
    setData(pre => [...pre, ...newData])
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-backgroundSecondary p-6">
      <VirtualWaterfall
        loadMore={ loadMore }
        hasMore={ hasMore }
        pageSize={ pageSize }
        col={ 4 }
        gap={ 10 }
        data={ data }
        className="border border-border rounded-lg size-10/12"
      >
        {
          detail => (
            <Card
              variant={ detail.variant }
              title={ detail.title }
              className="w-full h-full flex flex-col relative overflow-hidden group"
              hoverEffect
              shadow="lg"
              rounded="xl"
              bordered={ false }
            >
              {/* 渐变背景 */}
              <div className={ `absolute inset-0 bg-gradient-to-br ${detail.gradient} opacity-80 dark:opacity-60` } />

              {/* 装饰性光效 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />

              {/* 内容区域 */}
              <div className="relative z-10 flex-1 flex flex-col justify-between p-4">
                <div className="flex-1">
                  {/* 标题装饰线 */}
                  <div className={ `w-12 h-1 rounded-full mb-3 bg-gradient-to-r ${detail.gradient.replace('from-', 'from-').replace('via-', 'to-')} opacity-60` } />

                  <h3 className={ `text-lg font-semibold mb-2 ${detail.accentColor} transition-colors` }>
                    { detail.title }
                  </h3>

                  <p className="text-sm text-textSecondary leading-relaxed line-clamp-4 mb-4">
                    { detail.content }
                  </p>
                </div>

                {/* 底部信息 */}
                <div className="mt-auto pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className={ `text-xs font-medium ${detail.accentColor}` }>
                      { detail.variant }
                    </span>
                    <span className="text-xs text-textSecondary font-mono">
                      { detail.label || `${detail.width} × ${detail.height}` }
                    </span>
                  </div>
                </div>
              </div>

              {/* 悬浮时的边框光效 */}
              <div className={ `absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-current transition-all duration-300 ${detail.accentColor} opacity-0 group-hover:opacity-20 pointer-events-none` } />
            </Card>
          )
        }
      </VirtualWaterfall>
    </div>
  )
}
