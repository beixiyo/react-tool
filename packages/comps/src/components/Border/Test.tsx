'use client'

import { useState } from 'react'
import { Border } from '.'

export default function BorderDemoPage() {
  const [dashLength, setDashLength] = useState(10)
  const [dashGap, setDashGap] = useState(12)
  const [strokeColor, setStrokeColor] = useState('#bbb')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [animated, setAnimated] = useState(true)
  const [borderRadius, setBorderRadius] = useState(20)

  return (
    <div className="min-h-screen from-slate-900 to-slate-800 bg-gradient-to-br p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-center text-3xl font-bold">SVG虚线边框组件演示</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 控制面板 */ }
          <div className="rounded-xl bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-6 text-xl font-semibold">控制面板</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block">
                  虚线长度:
                  { dashLength }
                  px
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={ dashLength }
                  onChange={ e => setDashLength(Number(e.target.value)) }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block">
                  虚线间距:
                  { dashGap }
                  px
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={ dashGap }
                  onChange={ e => setDashGap(Number(e.target.value)) }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block">
                  边框宽度:
                  { strokeWidth }
                  px
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={ strokeWidth }
                  onChange={ e => setStrokeWidth(Number(e.target.value)) }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block">
                  边框圆角:
                  { borderRadius }
                  px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={ borderRadius }
                  onChange={ e => setBorderRadius(Number(e.target.value)) }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block">边框颜色</label>
                <input
                  type="color"
                  value={ strokeColor }
                  onChange={ e => setStrokeColor(e.target.value) }
                  className="h-10 w-16"
                />
                <span className="ml-2">{ strokeColor }</span>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="animated"
                  checked={ animated }
                  onChange={ e => setAnimated(e.target.checked) }
                  className="mr-2"
                />
                <label htmlFor="animated">启用流动动画</label>
              </div>
            </div>
          </div>

          {/* 演示区域 */ }
          <div className="h-96">
            <Border
              dashLength={ dashLength }
              dashGap={ dashGap }
              strokeColor={ strokeColor }
              strokeWidth={ strokeWidth }
              animated={ animated }
              borderRadius={ borderRadius }
            >
              <div className="h-full flex flex-col items-center justify-center rounded-lg bg-slate-800/20 p-8">
                <h2 className="mb-4 text-2xl font-bold">自定义内容区域</h2>
                <p className="mb-6 text-center">
                  当前边框样式:
                  {' '}
                  { dashLength }
                  px虚线,
                  {' '}
                  { dashGap }
                  px间距
                </p>
                <div className="text-sm text-slate-400">
                  <p>你可以在这里放置任何内容</p>
                  <p>边框会自动适应内容尺寸</p>
                </div>
              </div>
            </Border>
          </div>
        </div>
      </div>
    </div>
  )
}
