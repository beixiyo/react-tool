'use client'

import { memo, useState } from 'react'
import { Card } from '../Card'
import { Input } from '../Input'
import { Slider } from '../Slider'
import { ThemeToggle } from '../ThemeToggle'
import { DyBgc } from './index'

const DyBgcTest = memo(() => {
  const [blurAmount, setBlurAmount] = useState(10)
  const [animationDuration, setAnimationDuration] = useState(10)

  const customColors: [string, string][] = [
    ['rgba(66, 133, 244, 1)', 'rgba(66, 133, 244, 0)'],
    ['rgba(219, 68, 55, 1)', 'rgba(219, 68, 55, 0)'],
    ['rgba(244, 180, 0, 1)', 'rgba(244, 180, 0, 0)'],
    ['rgba(15, 157, 88, 1)', 'rgba(15, 157, 88, 0)'],
    ['rgba(171, 71, 188, 1)', 'rgba(171, 71, 188, 0)'],
  ]

  const darkColors: [string, string][] = [
    ['rgba(45, 55, 72, 1)', 'rgba(45, 55, 72, 0)'],
    ['rgba(26, 32, 44, 1)', 'rgba(26, 32, 44, 0)'],
    ['rgba(74, 85, 104, 1)', 'rgba(74, 85, 104, 0)'],
    ['rgba(49, 46, 129, 1)', 'rgba(49, 46, 129, 0)'],
    ['rgba(76, 29, 149, 1)', 'rgba(76, 29, 149, 0)'],
  ]

  return (
    <div className="h-screen overflow-auto">
      <div className="mx-auto p-6 container space-y-8">
        <ThemeToggle />
        <h1 className="mb-6 text-2xl font-bold dark:text-white">DyBgc 组件测试</h1>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">基础用法</h2>
          <div className="h-64 w-full overflow-hidden rounded-lg">
            <DyBgc>
              <div className="h-full flex items-center justify-center">
                <h3 className="text-2xl text-white font-bold drop-shadow-lg">动态背景默认效果</h3>
              </div>
            </DyBgc>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">自定义颜色</h2>
          <div className="h-64 w-full overflow-hidden rounded-lg">
            <DyBgc colors={ customColors }>
              <div className="h-full flex items-center justify-center">
                <h3 className="text-2xl text-white font-bold drop-shadow-lg">自定义颜色效果</h3>
              </div>
            </DyBgc>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">深色主题</h2>
          <div className="h-64 w-full overflow-hidden rounded-lg">
            <DyBgc colors={ darkColors }>
              <div className="h-full flex items-center justify-center">
                <h3 className="text-2xl text-white font-bold drop-shadow-lg">深色主题效果</h3>
              </div>
            </DyBgc>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">可调节参数</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">
                模糊程度:
                {blurAmount}
                px
              </label>
              <Slider
                min={ 0 }
                max={ 30 }
                value={ blurAmount }
                onChange={ val => setBlurAmount(val) }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-gray-300">
                动画时长:
                {animationDuration}
                s
              </label>
              <Slider
                min={ 1 }
                max={ 20 }
                value={ animationDuration }
                onChange={ val => setAnimationDuration(val) }
              />
            </div>

            <div className="h-64 w-full overflow-hidden rounded-lg">
              <DyBgc
                blurAmount={ blurAmount }
                animationDuration={ animationDuration }
              >
                <div className="h-full flex items-center justify-center">
                  <h3 className="text-2xl text-white font-bold drop-shadow-lg">
                    模糊:
                    {' '}
                    {blurAmount}
                    px | 动画:
                    {' '}
                    {animationDuration}
                    s
                  </h3>
                </div>
              </DyBgc>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">实际应用场景</h2>
          <div className="h-96 w-full overflow-hidden rounded-lg">
            <DyBgc blurAmount={ 5 } animationDuration={ 15 }>
              <div className="h-full flex flex-col items-center justify-center p-6">
                <h3 className="mb-6 text-3xl text-white font-bold drop-shadow-lg">欢迎使用我们的应用</h3>
                <div className="max-w-md w-full rounded-xl bg-white/20 p-8 backdrop-blur-md">
                  <form className="space-y-4">
                    <div>
                      <Input
                        placeholder="用户名"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Input
                        type="password"
                        placeholder="密码"
                        className="w-full"
                      />
                    </div>
                    <button
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-semibold transition-colors hover:bg-blue-700"
                    >
                      登录
                    </button>
                  </form>
                </div>
              </div>
            </DyBgc>
          </div>
        </Card>
      </div>
    </div>
  )
})

DyBgcTest.displayName = 'DyBgcTest'

export default DyBgcTest
