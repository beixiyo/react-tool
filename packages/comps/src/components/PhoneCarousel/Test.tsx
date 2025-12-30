'use client'

import { useState } from 'react'
import { PhoneCarousel } from '.'
import { Button } from '../Button'
import { Slider } from '../Slider'
import { ThemeToggle } from '../ThemeToggle'

export default function Page() {
  const [showPreview, setShowPreview] = useState(true)
  const [scale, setScale] = useState(1)
  const imgs = Array.from({ length: 5 }, (_, i) => `https://picsum.photos/id/${i}/600/400`)

  /** 缩放范围最小值和最大值 */
  const minScale = 0.5
  const maxScale = 1.5

  /** 处理滑块值变化 */
  const handleScaleChange = (value: number | [number, number]) => {
    if (typeof value === 'number') {
      setScale(value)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <div className="fixed right-0 top-0 z-50 flex gap-4 p-4">
        <ThemeToggle></ThemeToggle>
        <Button
          onClick={ () => setShowPreview(!showPreview) }
          className="rounded-md bg-gray-200 px-4 py-2 dark:bg-gray-700 dark:text-white"
        >
          { showPreview
            ? '隐藏预览图'
            : '显示预览图' }
        </Button>
        <div className="w-72 flex items-center gap-2">
          <span className="text-sm font-medium dark:text-white">
            缩放:
          </span>
          <Slider
            min={ minScale }
            max={ maxScale }
            step={ 0.01 }
            value={ scale }
            onChange={ handleScaleChange as any }
            tooltip={ {
              formatter: value => `${(value * 100).toFixed(0)}%`,
              position: 'bottom',
            } }
          />
          <span className="text-sm font-medium dark:text-white">
            { (scale * 100).toFixed(0) }
            %
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <PhoneCarousel
          imgs={ imgs }
          showPreview={ showPreview }
          scale={ scale }
          title="深色模式适配演示"
          description="这是一个深色模式适配的演示，支持多种配置选项 #深色模式 #组件演示"
          followButtonText="关注"
          initialLikeCount={ 888 }
          initialFavoriteCount={ 666 }
          initialCommentCount={ 42 }
        />
      </div>
    </div>
  )
}
