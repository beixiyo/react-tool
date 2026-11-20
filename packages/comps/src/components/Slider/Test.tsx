'use client'

import { useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { Slider } from './index'

/**
 * Slider 组件测试页面
 */
function SliderTest() {
  const [value1, setValue1] = useState(30)
  const [value2, setValue2] = useState<[number, number]>([20, 60])
  const [value3, setValue3] = useState(50)
  const [value4, setValue4] = useState(75)
  const [value5, setValue5] = useState(40)

  return (
    <div className="bg-background h-screen overflow-auto p-6">
      <div className="mx-auto max-w-4xl space-y-12">
        { /* 页面头部 */ }
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <ThemeToggle />
          </div>
          <h1 className="text-text mb-4 text-3xl font-bold">
            Slider 组件测试
          </h1>
          <p className="text-text2 text-lg">
            测试滑块小球对齐、Tooltip 跟随和拖拽响应性
          </p>
        </div>

        { /* 测试区域 */ }
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          { /* 基础滑块 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              基础滑块 - 测试小球对齐
            </h2>
            <div className="mb-4">
              <Slider
                ariaLabel="基础滑块数值"
                value={ value1 }
                onChange={ (val) => setValue1(val as number) }
                tooltip={ { formatter: (val) => `${val}%` } }
              />
            </div>
            <p className="text-text2 text-sm">
              当前值:{' '}
              <span className="text-systemBlue font-medium">
                { value1 }
                %
              </span>
            </p>
            <p className="text-text3 mt-2 text-xs">
              点击轨道或按 Tab 聚焦手柄后，使用上下左右方向键调整数值
            </p>
          </div>

          { /* 范围滑块 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              范围滑块 - 测试双 Tooltip
            </h2>
            <div className="mb-4">
              <Slider
                range
                value={ value2 }
                onChange={ (val) => setValue2(val) }
                tooltip={ { formatter: (val) => `${val}%` } }
              />
            </div>
            <p className="text-text2 text-sm">
              当前范围: [
              <span className="text-systemBlue font-medium">
                { value2[0] }
                %
              </span>
              ,
              <span className="text-systemBlue font-medium">
                { value2[1] }
                %
              </span>
              ]
            </p>
            <p className="text-text3 mt-2 text-xs">
              拖拽测试：两个小球都应有独立的 Tooltip 跟随
            </p>
          </div>

          { /* 带刻度滑块 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
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
                onChange={ (val) => setValue3(val as number) }
                tooltip={ { formatter: (val) => `${val}` } }
              />
            </div>
            <p className="text-text2 text-sm">
              当前值: <span className="text-systemBlue font-medium">{ value3 }</span>
            </p>
          </div>

          { /* 步长滑块 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              步长滑块 (step=10)
            </h2>
            <div className="mb-4">
              <Slider
                value={ value3 }
                step={ 10 }
                onChange={ (val) => setValue3(val as number) }
                tooltip={ { formatter: (val) => `${val}` } }
              />
            </div>
            <p className="text-text2 text-sm">
              步长值: <span className="text-systemBlue font-medium">{ value3 }</span>
            </p>
          </div>
        </div>

        { /* 特殊布局测试 */ }
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          { /* 垂直滑块 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              垂直滑块 - 测试垂直对齐
            </h2>
            <div className="flex h-48 items-center justify-center">
              <Slider
                vertical
                value={ value1 }
                onChange={ (val) => setValue1(val as number) }
                tooltip={ { formatter: (val) => `${val}%` } }
              />
            </div>
            <p className="text-text2 mt-4 text-center text-sm">
              垂直值:{' '}
              <span className="text-systemBlue font-medium">
                { value1 }
                %
              </span>
            </p>
            <p className="text-text3 mt-2 text-center text-xs">
              垂直模式：小球应居中对齐，Tooltip 在侧边显示
            </p>
          </div>

          { /* 禁用状态 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              禁用滑块
            </h2>
            <div className="mb-4">
              <Slider
                disabled
                value={ 40 }
              />
            </div>
            <p className="text-text2 text-sm">
              禁用状态的滑块无法交互
            </p>
          </div>
        </div>

        { /* 样式自定义测试 */ }
        <div className="space-y-8">
          { /* 自定义主题 1 - 绿色主题 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              自定义样式 - 绿色主题
            </h2>
            <div className="mb-4">
              <Slider
                value={ value1 }
                onChange={ (val) => setValue1(val as number) }
                tooltip={ { formatter: (val) => `${val}%` } }
                styleConfig={ {
                  handle: {
                    color: 'bg-background border-systemGreen',
                    focus: 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-systemGreen',
                  },
                  fill: {
                    color: 'bg-systemGreen',
                  },
                  marks: {
                    activeDotColor: 'bg-systemGreen border-systemGreen',
                  },
                } }
              />
            </div>
            <p className="text-text2 text-sm">
              绿色主题滑块
            </p>
          </div>

          { /* 自定义主题 2 - 紫色主题，大尺寸 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              自定义样式 - 紫色主题（大尺寸）
            </h2>
            <div className="mb-4">
              <Slider
                value={ value2 }
                range
                onChange={ (val) => setValue2(val as [number, number]) }
                tooltip={ { formatter: (val) => `${val}%` } }
                styleConfig={ {
                  handle: {
                    sizeClassName: 'w-6 h-6',
                    color: 'bg-background border-systemPurple',
                    border: 'border-3',
                    focus: 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-systemPurple',
                  },
                  track: {
                    sizeClassName: 'h-2',
                    background: 'bg-systemPurple/10',
                  },
                  fill: {
                    color: 'bg-systemPurple',
                  },
                  marks: {
                    activeDotColor: 'bg-systemPurple border-systemPurple',
                  },
                } }
              />
            </div>
            <p className="text-text2 text-sm">
              紫色主题，更大的手柄和轨道
            </p>
          </div>

          { /* 自定义主题 3 - 橙色主题，方形手柄 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              自定义样式 - 橙色主题（方形手柄）
            </h2>
            <div className="mb-4">
              <Slider
                value={ value3 }
                onChange={ (val) => setValue3(val as number) }
                tooltip={ { formatter: (val) => `${val}` } }
                styleConfig={ {
                  handle: {
                    sizeClassName: 'w-4 h-4',
                    color: 'bg-systemOrange border-systemOrange',
                    rounded: 'rounded-xs',
                    focus: 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-systemOrange',
                  },
                  track: {
                    background: 'bg-systemOrange/10',
                    rounded: 'rounded-xs',
                  },
                  fill: {
                    color: 'bg-systemOrange',
                    rounded: 'rounded-xs',
                  },
                } }
              />
            </div>
            <p className="text-text2 text-sm">
              橙色主题，方形设计
            </p>
          </div>

          { /* 新增：自定义主题 4 - 红色渐变主题 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              自定义样式 - 红色渐变主题
            </h2>
            <div className="mb-4">
              <Slider
                value={ value4 }
                onChange={ (val) => setValue4(val as number) }
                tooltip={ { formatter: (val) => `${val}%` } }
                styleConfig={ {
                  handle: {
                    sizeClassName: 'w-5 h-5',
                    color: 'bg-linear-to-br from-systemRed/70 to-systemRed border-systemRed',
                    border: 'border',
                    hover: 'hover:shadow-button hover:shadow-systemRed/30',
                    focus: 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-systemRed',
                  },
                  track: {
                    background: 'bg-systemRed/10',
                  },
                  fill: {
                    color: 'bg-linear-to-r from-systemRed to-systemRed/70',
                  },
                } }
              />
            </div>
            <p className="text-text2 text-sm">
              红色渐变主题，带阴影效果
            </p>
          </div>

          { /* 新增：自定义主题 5 - 天蓝色主题，带刻度 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              自定义样式 - 天蓝色主题（带刻度）
            </h2>
            <div className="mb-8">
              <Slider
                value={ value5 }
                onChange={ (val) => setValue5(val as number) }
                marks={ {
                  0: '低',
                  25: '较低',
                  50: '中',
                  75: '较高',
                  100: '高',
                } }
                tooltip={ { formatter: (val) => `${val}%` } }
                styleConfig={ {
                  handle: {
                    color: 'bg-background border-systemBlue',
                    focus: 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-systemBlue',
                  },
                  track: {
                    background: 'bg-systemBlue/10',
                  },
                  fill: {
                    color: 'bg-systemBlue',
                  },
                  marks: {
                    dotColor: 'bg-background border-systemBlue/30',
                    activeDotColor: 'bg-systemBlue border-systemBlue',
                    labelColor: 'text-systemBlue',
                  },
                } }
              />
            </div>
            <p className="text-text2 text-sm">
              天蓝色主题，带自定义刻度标签
            </p>
          </div>
        </div>

        { /* 高级功能测试 */ }
        <div className="space-y-8">
          { /* 反向滑块 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
              反向滑块 (reverse=true)
            </h2>
            <div className="mb-4">
              <Slider
                reverse
                value={ value1 }
                onChange={ (val) => setValue1(val as number) }
                tooltip={ { formatter: (val) => `${val}%` } }
              />
            </div>
            <p className="text-text2 text-sm">
              反向滑块，最大值在左侧
            </p>
          </div>

          { /* 只能拖拽到刻度点 */ }
          <div className="bg-background2 border-border rounded-lg border p-6 shadow-lg">
            <h2 className="text-text mb-4 text-lg font-semibold">
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
                onChange={ (val) => setValue3(val as number) }
                tooltip={ {
                  formatter: (val) => {
                    const marks = { 0: 'A', 25: 'B', 50: 'C', 75: 'D', 100: 'E' }
                    return marks[val as keyof typeof marks] || val
                  },
                } }
              />
            </div>
            <p className="text-text2 text-sm">
              当前等级:{' '}
              <span className="text-systemBlue font-medium">
                { (() => {
                  const marks = { 0: 'A', 25: 'B', 50: 'C', 75: 'D', 100: 'E' }
                  return marks[value3 as keyof typeof marks] || value3
                })() }
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SliderTest
