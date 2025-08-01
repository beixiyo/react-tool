'use client'

import { useChangeTheme, useNotifyParentReady } from '@/hooks'
import { memo, useState } from 'react'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { GradientBoundary } from './index'

const GradientBoundaryTest = memo(() => {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  const [fromColor, setFromColor] = useState('#fff')

  useChangeTheme(
    () => setFromColor('#fff'),
    () => setFromColor('#1F2937'),
  )

  const colorOptions = [
    { name: '白色', value: '#ffffff' },
    { name: '黑色', value: '#000000' },
    { name: '蓝色', value: '#3b82f6' },
    { name: '红色', value: '#ef4444' },
    { name: '绿色', value: '#10b981' },
    { name: '紫色', value: '#8b5cf6' },
  ]

  return (
    <div className="mx-auto p-6 container space-y-8">
      <ThemeToggle />
      <h1 className="mb-6 text-2xl font-bold dark:text-white">GradientBoundary 组件测试</h1>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">基础用法</h2>
        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center overflow-x-auto whitespace-nowrap p-4 space-x-4">
            { new Array(20).fill(0).map((_, i) => (
              <div key={ i } className="h-24 w-24 flex flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
                { i + 1 }
              </div>
            )) }
          </div>
          <GradientBoundary fromColor={ fromColor } />
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          默认渐变边界效果，从白色渐变到透明
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">自定义颜色</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            { colorOptions.map(color => (
              <button
                key={ color.value }
                className={ `px-3 py-1 rounded-md ${fromColor === color.value
                  ? 'ring-2 ring-blue-500'
                  : ''}` }
                style={ {
                  backgroundColor: color.value,
                  color: color.value === '#ffffff'
                    ? '#000000'
                    : '#ffffff',
                } }
                onClick={ () => setFromColor(color.value) }
              >
                { color.name }
              </button>
            )) }
          </div>

          <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <div className="flex items-center overflow-x-auto whitespace-nowrap p-4 space-x-4">
              { new Array(20).fill(0).map((_, i) => (
                <div
                  key={ i }
                  className="h-24 w-24 flex flex-shrink-0 items-center justify-center rounded-lg text-white font-bold"
                  style={ {
                    backgroundColor: colorOptions[i % colorOptions.length].value,
                    color: ['#ffffff', '#10b981'].includes(colorOptions[i % colorOptions.length].value)
                      ? '#000000'
                      : '#ffffff',
                  } }
                >
                  { i + 1 }
                </div>
              )) }
            </div>
            <GradientBoundary fromColor={ fromColor } />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            当前渐变颜色:
            { ' ' }
            { colorOptions.find(c => c.value === fromColor)?.name || '自定义' }
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">自定义宽度</h2>
        <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center overflow-x-auto whitespace-nowrap p-4 space-x-4">
            { new Array(20).fill(0).map((_, i) => (
              <div key={ i } className="h-24 w-24 flex flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
                { i + 1 }
              </div>
            )) }
          </div>
          <GradientBoundary className="w-48" />
        </div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          宽度更大的渐变边界效果
        </p>
      </Card>
    </div>
  )
})

GradientBoundaryTest.displayName = 'GradientBoundaryTest'

export default GradientBoundaryTest
