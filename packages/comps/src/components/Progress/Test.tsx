'use client'

import { useState } from 'react'
import { FakeProgress } from '../Progress/FakeProgress'
import { ProgressBar } from '../Progress/ProgressBar'

export default function ProgressBarTest() {
  const [progress, setProgress] = useState(0.6)
  const [showFakeProgress, setShowFakeProgress] = useState(false)
  const [fakeProgressDone, setFakeProgressDone] = useState(false)

  const gradientExamples = [
    {
      id: 'default',
      name: '默认渐变',
      colors: undefined,
      description: '蓝色到粉色的默认渐变',
    },
    {
      id: 'three-color',
      name: '三色渐变',
      colors: ['#3b82f6', '#a855f7', '#ec4899'],
      description: '蓝色→紫色→粉色',
    },
    {
      id: 'green',
      name: '绿色渐变',
      colors: ['#10b981', '#34d399'],
      description: '深绿到浅绿',
    },
    {
      id: 'orange',
      name: '橙色渐变',
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      description: '橙色系渐变',
    },
    {
      id: 'rainbow',
      name: '彩虹渐变',
      colors: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
      description: '彩虹色渐变',
    },
    {
      id: 'single',
      name: '单色',
      colors: ['#6366f1'],
      description: '纯色进度条',
    },
    {
      id: 'track-override',
      name: 'trackStyle 覆盖',
      colors: ['#ef4444', '#f59e0b'],
      trackStyle: { background: '#6366f1' },
      description: 'trackStyle 的 background 会覆盖 colors',
    },
  ]

  return (
    <div className="h-screen overflow-auto bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl text-gray-900 font-bold dark:text-white">
            ProgressBar 组件测试
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            重构后的 ProgressBar 组件，支持 colors 数组配置
          </p>
        </div>

        {/* 进度控制 */ }
        <div className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800">
          <h2 className="mb-4 text-xl text-gray-900 font-semibold dark:text-white">
            进度控制
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                进度值:
                { ' ' }
                { Math.round(progress * 100) }
                %
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={ progress }
                onChange={ e => setProgress(Number(e.target.value)) }
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={ () => setProgress(0) }
                className="rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700"
              >
                0%
              </button>
              <button
                onClick={ () => setProgress(0.25) }
                className="rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700"
              >
                25%
              </button>
              <button
                onClick={ () => setProgress(0.5) }
                className="rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700"
              >
                50%
              </button>
              <button
                onClick={ () => setProgress(0.75) }
                className="rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700"
              >
                75%
              </button>
              <button
                onClick={ () => setProgress(1) }
                className="rounded bg-gray-200 px-3 py-1 text-sm dark:bg-gray-700"
              >
                100%
              </button>
            </div>
          </div>
        </div>

        {/* 渐变样式示例 */ }
        <div className="rounded-lg bg-white p-6 shadow-xs dark:bg-gray-800">
          <h2 className="mb-4 text-xl text-gray-900 font-semibold dark:text-white">
            colors 数组示例
          </h2>
          <div className="space-y-6">
            { gradientExamples.map(example => (
              <div key={ example.id } className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900 font-medium dark:text-white">
                    { example.name }
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    { example.description }
                  </span>
                </div>
                <ProgressBar
                  value={ progress }
                  colors={ example.colors }
                  height={ 3 }
                />
                <pre className="overflow-x-auto rounded-sm bg-gray-100 p-2 text-xs dark:bg-gray-700">
                  { example.colors
                    ? `colors={${JSON.stringify(example.colors)}}`
                    : 'colors={undefined} // 使用默认值' }
                  { example.trackStyle && `\ntrackStyle={${JSON.stringify(example.trackStyle)}}` }
                </pre>
              </div>
            )) }
          </div>
        </div>

        {/* API 说明 */ }
        <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
          <h2 className="mb-4 text-xl text-blue-900 font-semibold dark:text-blue-100">
            新的 colors API
          </h2>
          <div className="text-sm text-blue-800 space-y-3 dark:text-blue-200">
            <p>
              ✅
              <strong>colors 数组</strong>
              ：支持任意数量的颜色，自动生成渐变
            </p>
            <p>
              ✅
              <strong>默认值</strong>
              ：['#3b82f6', '#ec4899'] 蓝色到粉色
            </p>
            <p>
              ✅
              <strong>向后兼容</strong>
              ：trackStyle 的 background 属性会覆盖 colors
            </p>
            <p>
              ✅
              <strong>简洁易用</strong>
              ：直接传递颜色数组，无需手写 linear-gradient
            </p>
            <p>
              ✅
              <strong>灵活配置</strong>
              ：支持单色、双色、多色渐变
            </p>
          </div>
        </div>

        {/* 使用示例 */ }
        <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
          <h2 className="mb-4 text-xl text-green-900 font-semibold dark:text-green-100">
            使用示例
          </h2>
          <div className="text-sm text-green-800 space-y-3 dark:text-green-200">
            <pre className="overflow-x-auto rounded-sm bg-green-100 p-3 text-xs dark:bg-green-800/30">
              { `// 默认渐变
<ProgressBar value={0.6} />

// 三色渐变
<ProgressBar
  value={0.6}
  colors={['#3b82f6', '#a855f7', '#ec4899']}
/>

// 彩虹渐变
<ProgressBar
  value={0.6}
  colors={['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']}
/>

// trackStyle 覆盖 colors
<ProgressBar
  value={0.6}
  colors={['#ef4444', '#f59e0b']}
  trackStyle={{ background: '#6366f1' }}
/>`}
            </pre>
          </div>
        </div>

        {/* FakeProgress 测试 */ }
        <div className="rounded-lg bg-purple-50 p-6 dark:bg-purple-900/20">
          <h2 className="mb-4 text-xl text-purple-900 font-semibold dark:text-purple-100">
            FakeProgress 组件测试
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              FakeProgress 是一个模拟进度的组件，会自动从 0 开始增长到接近 100%，适用于需要显示加载进度但无法获取真实进度的场景。
            </p>

            <div className="flex gap-4">
              <button
                onClick={ () => {
                  setShowFakeProgress(true)
                  setFakeProgressDone(false)
                } }
                className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                开始 FakeProgress
              </button>
              <button
                onClick={ () => setFakeProgressDone(true) }
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                disabled={ !showFakeProgress }
              >
                完成进度
              </button>
              <button
                onClick={ () => {
                  setShowFakeProgress(false)
                  setFakeProgressDone(false)
                } }
                className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                重置
              </button>
            </div>

            {/* FakeProgress 演示区域 */ }
            <div className="relative h-32 overflow-hidden border-2 border-purple-300 rounded-lg border-dashed dark:border-purple-600">
              { showFakeProgress && (
                <FakeProgress
                  done={ fakeProgressDone }
                  uniqueKey="test-fake-progress"
                  onChange={ (val) => {
                    console.log('FakeProgress value:', val)
                  } }
                  showText
                  showBar
                  className="bg-white dark:bg-gray-800"
                />
              ) }
              { !showFakeProgress && (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  点击"开始 FakeProgress"查看效果
                </div>
              ) }
            </div>

            <div className="text-sm text-purple-800 space-y-2 dark:text-purple-200">
              <p><strong>特性：</strong></p>
              <ul className="ml-4 list-disc space-y-1">
                <li>自动模拟进度增长，无需手动控制</li>
                <li>支持持久化进度（通过 uniqueKey）</li>
                <li>可配置显示文本、进度条、Logo</li>
                <li>支持完成回调和手动结束</li>
                <li>基于时间常数的平滑增长算法</li>
              </ul>
            </div>

            <pre className="overflow-x-auto rounded-sm bg-purple-100 p-3 text-xs dark:bg-purple-800/30">
              { `<FakeProgress
  done={false}
  uniqueKey="my-progress"
  onChange={(val) => console.log(val)}
  showText={true}
  showBar={true}
  showLogo={false}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
