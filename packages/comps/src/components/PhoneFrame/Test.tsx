'use client'

import { useCallback, useState } from 'react'
import { PhoneFrame } from '.'
import { GithubSourceLink } from '../GithubSourceLink'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'

function Test() {
  const [settings, setSettings] = useState({
    scale: 0.8,
    showStatusBar: true,
    showHomeIndicator: true,
  })

  /** 使用useCallback处理scale变化，避免频繁重渲染导致闪动 */
  const handleScaleChange = useCallback((value: number) => {
    setSettings(prev => ({ ...prev, scale: value as number }))
  }, [])

  /** 使用useCallback处理开关状态变化 */
  const handleStatusBarChange = useCallback((checked: boolean) => {
    setSettings(prev => ({ ...prev, showStatusBar: checked }))
  }, [])

  const handleHomeIndicatorChange = useCallback((checked: boolean) => {
    setSettings(prev => ({ ...prev, showHomeIndicator: checked }))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background p-8 text-text">
      <div className="mx-auto max-w-6xl w-full">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1 text-center">
            <h1 className="mb-2 text-3xl font-bold">
              手机外壳组件
            </h1>
            <p className="text-text2">
              用于模拟移动设备界面的可定制组件
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <GithubSourceLink className="static" />
          </div>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-12">
          {/* 主要演示 */}
          <div className="flex flex-col items-center">
            <PhoneFrame
              scale={ settings.scale }
              showStatusBar={ settings.showStatusBar }
              showHomeIndicator={ settings.showHomeIndicator }
            >
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <h2 className="mb-2 text-lg font-semibold">PhoneFrame 演示</h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  这是一个模拟移动设备的容器组件
                </p>
                <div className="mb-4 w-full rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    可以放置任何内容在这里
                  </p>
                </div>
                <div className="grid grid-cols-2 w-full gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={ i }
                      className="aspect-square flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700"
                    >
                      App
                      {' '}
                      {i}
                    </div>
                  ))}
                </div>
              </div>
            </PhoneFrame>
            <p className="mt-4 text-sm text-text2">
              当前比例:
              {' '}
              {settings.scale.toFixed(1)}
            </p>
          </div>

          {/* 控制面板 */}
          <div className="fixed left-2 top-2 w-72 rounded-xl bg-background2 p-6 shadow-md">
            <h3 className="mb-4 text-lg font-medium">
              组件配置
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-text2 font-medium">
                  比例:
                  {' '}
                  {settings.scale.toFixed(1)}
                </label>
                <div className="py-2">
                  <Slider
                    min={ 0.5 }
                    max={ 1.3 }
                    step={ 0.01 }
                    value={ settings.scale }
                    onChange={ handleScaleChange }
                    onChangeComplete={ handleScaleChange }
                    tooltip
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-text2 font-medium">
                  显示状态栏
                </label>
                <Switch
                  checked={ settings.showStatusBar }
                  onChange={ handleStatusBarChange }
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-text2 font-medium">
                  显示Home指示器
                </label>
                <Switch
                  checked={ settings.showHomeIndicator }
                  onChange={ handleHomeIndicatorChange }
                  size="sm"
                />
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <h4 className="mb-2 text-sm font-medium">
                组件说明
              </h4>
              <ul className="list-disc pl-4 text-xs text-text2 space-y-1">
                <li>可自定义缩放比例</li>
                <li>可控制状态栏显示</li>
                <li>可控制底部Home指示器显示</li>
                <li>支持深色模式</li>
                <li>可嵌套任意内容</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 多种配置展示 */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-semibold">
            不同配置效果
          </h2>

          <div className="flex flex-wrap justify-center gap-8">
            {/* 无状态栏 */}
            <div className="flex flex-col items-center">
              <PhoneFrame scale={ 0.6 } showStatusBar={ false }>
                <div className="h-full flex items-center justify-center from-purple-400 to-pink-500 bg-linear-to-br">
                  <p className="text-white font-medium">无状态栏</p>
                </div>
              </PhoneFrame>
              <p className="mt-2 text-sm text-text2">无状态栏</p>
            </div>

            {/* 无Home指示器 */}
            <div className="flex flex-col items-center">
              <PhoneFrame scale={ 0.6 } showHomeIndicator={ false }>
                <div className="h-full flex items-center justify-center from-green-400 to-blue-500 bg-linear-to-br">
                  <p className="text-white font-medium">无Home指示器</p>
                </div>
              </PhoneFrame>
              <p className="mt-2 text-sm text-text2">无Home指示器</p>
            </div>

            {/* 小尺寸 */}
            <div className="flex flex-col items-center">
              <PhoneFrame scale={ 0.4 }>
                <div className="h-full flex items-center justify-center from-yellow-400 to-orange-500 bg-linear-to-br">
                  <p className="text-xs text-white font-medium">小尺寸</p>
                </div>
              </PhoneFrame>
              <p className="mt-2 text-sm text-text2">缩放比例: 0.4</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Test
