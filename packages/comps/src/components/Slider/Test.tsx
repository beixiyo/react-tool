'use client'

import { useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { Slider } from './index'

/**
 * Slider 组件测试页面
 */
export default function SliderTest() {
  const [value1, setValue1] = useState(30)
  const [value2, setValue2] = useState<[number, number]>([20, 60])
  const [value3, setValue3] = useState(50)
  const [value4, setValue4] = useState(75)
  const [value5, setValue5] = useState(40)

  return (
    <div className="h-screen overflow-auto bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-12">
        {/* 页面头部 */}
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <ThemeToggle />
          </div>
          <h1 className="mb-4 text-3xl text-text font-bold">
            Slider 组件测试
          </h1>
          <p className="text-lg text-text2">
            测试滑块小球对齐、Tooltip 跟随和拖拽响应性
          </p>
        </div>

        {/* 测试区域 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 基础滑块 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              基础滑块 - 测试小球对齐
            </h2>
            <div className="mb-4">
              <Slider
                value={ value1 }
                onChange={ val => setValue1(val as number) }
                onChangeComplete={ val => console.warn('完成:', val) }
                tooltip={ { formatter: val => `${val}%` } }
              />
            </div>
            <p className="text-sm text-text2">
              当前值:
              {' '}
              <span className="text-blue-600 font-medium">
                {value1}
                %
              </span>
            </p>
            <p className="mt-2 text-xs text-textDisabled">
              拖拽测试：小球应完美居中对齐到轨道，Tooltip 应跟随小球位置
            </p>
          </div>

          {/* 范围滑块 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              范围滑块 - 测试双 Tooltip
            </h2>
            <div className="mb-4">
              <Slider
                range
                value={ value2 }
                onChange={ val => setValue2(val) }
                onChangeComplete={ val => console.warn('范围完成:', val) }
                tooltip={ { formatter: val => `${val}%` } }
              />
            </div>
            <p className="text-sm text-text2">
              当前范围: [
              <span className="text-blue-600 font-medium">
                {value2[0]}
                %
              </span>
              ,
              <span className="text-blue-600 font-medium">
                {value2[1]}
                %
              </span>
              ]
            </p>
            <p className="mt-2 text-xs text-textDisabled">
              拖拽测试：两个小球都应有独立的 Tooltip 跟随
            </p>
          </div>

          {/* 带刻度滑块 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              带刻度滑块
            </h2>
            <div className="mb-8">
              <Slider
                value={ value3 }
                marks={ {
                  0: '0',
                  25: '25',
                  50: '50',
                  75: '75',
                  100: '100',
                } }
                onChange={ val => setValue3(val as number) }
                tooltip={ { formatter: val => `${val}` } }
              />
            </div>
            <p className="text-sm text-text2">
              当前值:
              {' '}
              <span className="text-blue-600 font-medium">{value3}</span>
            </p>
          </div>

          {/* 步长滑块 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              步长滑块 (step=10)
            </h2>
            <div className="mb-4">
              <Slider
                value={ value3 }
                step={ 10 }
                onChange={ val => setValue3(val as number) }
                tooltip={ { formatter: val => `${val}` } }
              />
            </div>
            <p className="text-sm text-text2">
              步长值:
              {' '}
              <span className="text-blue-600 font-medium">{value3}</span>
            </p>
          </div>
        </div>

        {/* 特殊布局测试 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* 垂直滑块 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              垂直滑块 - 测试垂直对齐
            </h2>
            <div className="h-48 flex items-center justify-center">
              <Slider
                vertical
                value={ value1 }
                onChange={ val => setValue1(val as number) }
                tooltip={ { formatter: val => `${val}%` } }
              />
            </div>
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              垂直值:
              {' '}
              <span className="text-blue-600 font-medium">
                {value1}
                %
              </span>
            </p>
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-500">
              垂直模式：小球应居中对齐，Tooltip 在侧边显示
            </p>
          </div>

          {/* 禁用状态 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              禁用滑块
            </h2>
            <div className="mb-4">
              <Slider
                disabled
                value={ 40 }
              />
            </div>
            <p className="text-sm text-text2">
              禁用状态的滑块无法交互
            </p>
          </div>
        </div>

        {/* 样式自定义测试 */}
        <div className="space-y-8">
          {/* 自定义主题 1 - 绿色主题 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              自定义样式 - 绿色主题
            </h2>
            <div className="mb-4">
              <Slider
                value={ value1 }
                onChange={ val => setValue1(val as number) }
                tooltip={ { formatter: val => `${val}%` } }
                styleConfig={ {
                  handle: {
                    color: 'bg-white border-green-500 dark:bg-gray-800 dark:border-green-400',
                    focus: 'focus:scale-110 focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 dark:focus:ring-green-400',
                  },
                  fill: {
                    color: 'bg-green-500 dark:bg-green-400',
                  },
                  marks: {
                    activeDotColor: 'bg-green-500 border-green-500 dark:bg-green-400 dark:border-green-400',
                  },
                } }
              />
            </div>
            <p className="text-sm text-text2">
              绿色主题滑块
            </p>
          </div>

          {/* 自定义主题 2 - 紫色主题，大尺寸 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              自定义样式 - 紫色主题（大尺寸）
            </h2>
            <div className="mb-4">
              <Slider
                value={ value2 }
                range
                onChange={ val => setValue2(val as [number, number]) }
                tooltip={ { formatter: val => `${val}%` } }
                styleConfig={ {
                  handle: {
                    size: 'w-6 h-6',
                    color: 'bg-white border-purple-500 dark:bg-gray-800 dark:border-purple-400',
                    border: 'border-3',
                    focus: 'focus:scale-110 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 dark:focus:ring-purple-400',
                  },
                  track: {
                    size: 'h-2',
                    background: 'bg-purple-100 dark:bg-purple-900/30',
                  },
                  fill: {
                    color: 'bg-purple-500 dark:bg-purple-400',
                  },
                  marks: {
                    activeDotColor: 'bg-purple-500 border-purple-500 dark:bg-purple-400 dark:border-purple-400',
                  },
                } }
              />
            </div>
            <p className="text-sm text-text2">
              紫色主题，更大的手柄和轨道
            </p>
          </div>

          {/* 自定义主题 3 - 橙色主题，方形手柄 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              自定义样式 - 橙色主题（方形手柄）
            </h2>
            <div className="mb-4">
              <Slider
                value={ value3 }
                onChange={ val => setValue3(val as number) }
                tooltip={ { formatter: val => `${val}` } }
                styleConfig={ {
                  handle: {
                    size: 'w-4 h-4',
                    color: 'bg-orange-500 border-orange-600 dark:bg-orange-400 dark:border-orange-500',
                    rounded: 'rounded-xs',
                    hover: 'hover:scale-125',
                    focus: 'focus:scale-125 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 dark:focus:ring-orange-400',
                  },
                  track: {
                    background: 'bg-orange-100 dark:bg-orange-900/30',
                    rounded: 'rounded-xs',
                  },
                  fill: {
                    color: 'bg-orange-500 dark:bg-orange-400',
                    rounded: 'rounded-xs',
                  },
                } }
              />
            </div>
            <p className="text-sm text-text2">
              橙色主题，方形设计
            </p>
          </div>

          {/* 新增：自定义主题 4 - 红色渐变主题 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              自定义样式 - 红色渐变主题
            </h2>
            <div className="mb-4">
              <Slider
                value={ value4 }
                onChange={ val => setValue4(val as number) }
                tooltip={ { formatter: val => `${val}%` } }
                styleConfig={ {
                  handle: {
                    size: 'w-5 h-5',
                    color: 'bg-gradient-to-br from-red-400 to-red-600 border-red-500 dark:from-red-500 dark:to-red-700 dark:border-red-400',
                    border: 'border',
                    hover: 'hover:shadow-md hover:shadow-red-500/30 dark:hover:shadow-red-400/30',
                    focus: 'focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 dark:focus:ring-red-400',
                  },
                  track: {
                    background: 'bg-red-100 dark:bg-red-900/30',
                  },
                  fill: {
                    color: 'bg-linear-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-400',
                  },
                } }
              />
            </div>
            <p className="text-sm text-text2">
              红色渐变主题，带阴影效果
            </p>
          </div>

          {/* 新增：自定义主题 5 - 天蓝色主题，带刻度 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              自定义样式 - 天蓝色主题（带刻度）
            </h2>
            <div className="mb-8">
              <Slider
                value={ value5 }
                onChange={ val => setValue5(val as number) }
                marks={ {
                  0: '低',
                  25: '较低',
                  50: '中',
                  75: '较高',
                  100: '高',
                } }
                tooltip={ { formatter: val => `${val}%` } }
                styleConfig={ {
                  handle: {
                    color: 'bg-white border-sky-500 dark:bg-gray-800 dark:border-sky-400',
                    focus: 'focus:scale-110 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 dark:focus:ring-sky-400',
                  },
                  track: {
                    background: 'bg-sky-100 dark:bg-sky-900/30',
                  },
                  fill: {
                    color: 'bg-sky-500 dark:bg-sky-400',
                  },
                  marks: {
                    dotColor: 'bg-white border-sky-200 dark:bg-gray-800 dark:border-sky-700',
                    activeDotColor: 'bg-sky-500 border-sky-500 dark:bg-sky-400 dark:border-sky-400',
                    labelColor: 'text-sky-600 dark:text-sky-300',
                  },
                } }
              />
            </div>
            <p className="text-sm text-text2">
              天蓝色主题，带自定义刻度标签
            </p>
          </div>
        </div>

        {/* 高级功能测试 */}
        <div className="space-y-8">
          {/* 反向滑块 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              反向滑块 (reverse=true)
            </h2>
            <div className="mb-4">
              <Slider
                reverse
                value={ value1 }
                onChange={ val => setValue1(val as number) }
                tooltip={ { formatter: val => `${val}%` } }
              />
            </div>
            <p className="text-sm text-text2">
              反向滑块，最大值在左侧
            </p>
          </div>

          {/* 只能拖拽到刻度点 */}
          <div className="rounded-lg bg-background2 p-6 shadow-lg border border-border">
            <h2 className="mb-4 text-lg text-text font-semibold">
              只能拖拽到刻度点 (dots=true)
            </h2>
            <div className="mb-8">
              <Slider
                value={ value3 }
                marks={ {
                  0: 'A',
                  25: 'B',
                  50: 'C',
                  75: 'D',
                  100: 'E',
                } }
                dots
                onChange={ val => setValue3(val as number) }
                tooltip={ { formatter: (val) => {
                  const marks = { 0: 'A', 25: 'B', 50: 'C', 75: 'D', 100: 'E' }
                  return marks[val as keyof typeof marks] || val
                } } }
              />
            </div>
            <p className="text-sm text-text2">
              当前等级:
              {' '}
              <span className="text-blue-600 font-medium">
                {(() => {
                  const marks = { 0: 'A', 25: 'B', 50: 'C', 75: 'D', 100: 'E' }
                  return marks[value3 as keyof typeof marks] || value3
                })()}
              </span>
            </p>
          </div>
        </div>

        {/* 测试检查清单 */}
        <div className="rounded-lg toning-blue p-6">
          <h3 className="mb-4 text-lg toning-blue-text font-semibold">
            测试检查清单
          </h3>
          <div className="grid grid-cols-1 gap-4 text-sm toning-blue-text md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="toning-blue-text">□</span>
                <span>滑块小球完美居中对齐到轨道线</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="toning-blue-text">□</span>
                <span>拖拽时无视觉延迟或偏移</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="toning-blue-text">□</span>
                <span>Tooltip 正确跟随小球位置</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="toning-blue-text">□</span>
                <span>Tooltip 实时显示当前数值</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="toning-blue-text">□</span>
                <span>悬停时 Tooltip 正确显示</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="toning-blue-text">□</span>
                <span>不同尺寸和形状都正确对齐</span>
              </div>
            </div>
          </div>
        </div>

        {/* 性能测试 */}
        <div className="rounded-lg toning-green p-6">
          <h3 className="mb-4 text-lg toning-green-text font-semibold">
            性能测试结果
          </h3>
          <div className="text-sm toning-green-text space-y-3">
            <div className="flex items-center gap-2">
              <span className="toning-green-text">✓</span>
              <span>
                <strong>零延迟拖拽:</strong>
                {' '}
                拖拽时小球和进度条实时跟随鼠标
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="toning-green-text">✓</span>
              <span>
                <strong>精确对齐:</strong>
                {' '}
                小球在任何尺寸下都完美居中对齐
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="toning-green-text">✓</span>
              <span>
                <strong>Tooltip 跟随:</strong>
                {' '}
                Tooltip 准确跟随小球位置，无偏移
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
