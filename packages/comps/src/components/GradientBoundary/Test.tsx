'use client'

import { useChangeTheme } from 'hooks'
import { memo, useState } from 'react'
import { Card } from '../Card'
import { ThemeToggle } from '../ThemeToggle'
import { GradientBoundary } from './index'

const GradientBoundaryTest = memo(() => {
  const [fromColor, setFromColor] = useState('#fff')
  const [direction, setDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('left')

  useChangeTheme({
    onLight: () => setFromColor('#fff'),
    onDark: () => setFromColor('#1F2937'),
  })

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
              <div key={ i } className="h-24 w-24 flex shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
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
                  className="h-24 w-24 flex shrink-0 items-center justify-center rounded-lg text-white font-bold"
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
              <div key={ i } className="h-24 w-24 flex shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
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

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold dark:text-white">方向设置</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            { ([
              { name: '左侧', value: 'left' },
              { name: '右侧', value: 'right' },
              { name: '顶部', value: 'top' },
              { name: '底部', value: 'bottom' },
            ] as const).map(dir => (
              <button
                key={ dir.value }
                className={ `px-4 py-2 rounded-md transition-colors ${
                  direction === dir.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }` }
                onClick={ () => setDirection(dir.value) }
              >
                { dir.name }
              </button>
            )) }
          </div>

          { (direction === 'left' || direction === 'right') && (
            <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center overflow-x-auto whitespace-nowrap p-4 space-x-4">
                { new Array(20).fill(0).map((_, i) => (
                  <div key={ i } className="h-24 w-24 flex shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
                    { i + 1 }
                  </div>
                )) }
              </div>
              <GradientBoundary fromColor={ fromColor } direction={ direction } />
            </div>
          ) }

          { (direction === 'top' || direction === 'bottom') && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="flex flex-col items-center overflow-y-auto whitespace-nowrap p-4 space-y-4 h-full">
                { new Array(20).fill(0).map((_, i) => (
                  <div key={ i } className="h-24 w-24 flex shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
                    { i + 1 }
                  </div>
                )) }
              </div>
              <GradientBoundary fromColor={ fromColor } direction={ direction } />
            </div>
          ) }

          <p className="text-sm text-gray-600 dark:text-gray-400">
            当前方向:
            {' '}
            { ({
              left: '左侧',
              right: '右侧',
              top: '顶部',
              bottom: '底部',
            })[direction] }
          </p>
        </div>
      </Card>
    </div>
  )
})

GradientBoundaryTest.displayName = 'GradientBoundaryTest'

export default GradientBoundaryTest
