'use client'

import { memo, useState } from 'react'
import { Button } from '../Button'
import { Card } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Input } from '../Input'
import { Slider } from '../Slider'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { GradientText } from './index'

const GradientTextTest = memo(() => {
  const [showBorder, setShowBorder] = useState(false)
  const [showAnimate, setShowAnimate] = useState(true)
  const [animationDuration, setAnimationDuration] = useState(8)
  const [customColors, setCustomColors] = useState<string[]>(['#ffaa40', '#9c40ff', '#ffaa40'])
  const [newColor, setNewColor] = useState('#ff4040')

  const presetColors = [
    { name: '默认橙紫', colors: ['#ffaa40', '#9c40ff', '#ffaa40'] },
    { name: '蓝绿', colors: ['#3b82f6', '#10b981', '#3b82f6'] },
    { name: '红粉', colors: ['#ef4444', '#ec4899', '#ef4444'] },
    { name: '彩虹', colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'] },
    { name: '深蓝', colors: ['#1e40af', '#3b82f6', '#93c5fd', '#3b82f6', '#1e40af'] },
  ]

  const handleAddColor = () => {
    setCustomColors([...customColors, newColor])
  }

  const handleRemoveColor = (index: number) => {
    if (customColors.length > 2) {
      const newColors = [...customColors]
      newColors.splice(index, 1)
      setCustomColors(newColors)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 text-text">
      <div className="mx-auto container space-y-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">GradientText 组件测试</h1>
          <ThemeToggle />
        </header>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">基础用法</h2>
          <div className="space-y-6">
            <GradientText seamlessLoop>
              <h3 className="text-4xl font-bold">渐变文本效果</h3>
            </GradientText>

            <GradientText>
              <p className="text-2xl">这是一段带有渐变色彩的文本</p>
            </GradientText>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">预设颜色方案</h2>
          <div className="space-y-6">
            {presetColors.map((preset, index) => (
              <div key={ index } className="space-y-2">
                <p className="text-sm font-medium text-text2">{preset.name}</p>
                <GradientText colors={ preset.colors }>
                  <h3 className="text-3xl font-bold">渐变文本示例</h3>
                </GradientText>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">边框效果</h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Switch
                checked={ showBorder }
                onChange={ setShowBorder }
                label="显示边框"
              />
              <Switch
                checked={ showAnimate }
                onChange={ setShowAnimate }
                label="显示动画"
              />
            </div>

            <GradientText
              showBorder={ showBorder }
              showAnimate={ showAnimate }
              className="p-4"
            >
              <h3 className="text-3xl font-bold">带边框的渐变文本</h3>
            </GradientText>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">动画速度</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text2">
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

            <GradientText
              animationDuration={ `${animationDuration}s` }
            >
              <h3 className="text-3xl font-bold">自定义动画速度</h3>
            </GradientText>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">自定义颜色</h2>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {customColors.map((color, index) => (
                <div key={ index } className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 border border-border rounded-full"
                    style={ { backgroundColor: color } }
                  />
                  <span className="text-sm text-text2">{color}</span>
                  <button
                    className="text-sm text-systemRed transition-opacity hover:opacity-70 disabled:opacity-40"
                    onClick={ () => handleRemoveColor(index) }
                    disabled={ customColors.length <= 2 }
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={ newColor }
                  onChange={ setNewColor }
                  className="h-10 w-10 p-1"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={ handleAddColor }
                >
                  添加
                </Button>
              </div>
            </div>

            <GradientText colors={ customColors }>
              <h3 className="text-3xl font-bold">自定义颜色渐变</h3>
            </GradientText>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">实际应用场景</h2>
          <div className="flex flex-col items-center justify-center rounded-lg bg-background2 py-12 space-y-8">
            <GradientText
              colors={ ['#3b82f6', '#8b5cf6', '#ec4899'] }
              showBorder
              className="p-6"
            >
              <h2 className="text-5xl font-bold">欢迎使用我们的产品</h2>
            </GradientText>

            <p className="max-w-lg text-center text-text2">
              这是一个演示如何在实际应用中使用渐变文本组件的示例。渐变文本可以用于标题、强调文本或特殊提示等场景。
            </p>

            <button className="rounded-lg from-blue-500 to-purple-600 bg-linear-to-r px-6 py-3 text-white font-medium transition-all hover:from-blue-600 hover:to-purple-700">
              开始使用
            </button>
          </div>
        </Card>
      </div>

      <GithubSourceLink />
    </div>
  )
})

GradientTextTest.displayName = 'GradientTextTest'

export default GradientTextTest
