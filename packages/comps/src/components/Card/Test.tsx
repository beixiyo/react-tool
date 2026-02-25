'use client'

import type { StackedCardsVariant } from './StackedCards'
import { Check, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from 'utils'
import { Button, ButtonGroup, Slider } from '../index'
import { ThemeToggle } from '../ThemeToggle'
import { Card } from './Card'
import { Card3D } from './Card3D'
import { GlowBorder } from './GlowBorder'
import { StackedCards } from './StackedCards'

function VariantBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-72 overflow-hidden rounded-2xl p-4">
      <div className="absolute inset-0 bg-linear-to-br from-systemBlue/30 via-systemPurple/25 to-systemOrange/30" />
      <div className="absolute inset-0 bg-background/30 dark:bg-background/10" />
      <div className="relative">
        { children }
      </div>
    </div>
  )
}

export default function TestCard() {
  const [settings, setSettings] = useState({
    enable3D: true,
    transitionSpeed: 0.3,
    minRotateX: -15,
    maxRotateX: 15,
    minRotateY: -15,
    maxRotateY: 15,
    intensity: 1,
    disableOnMobile: true,
  })

  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'3d' | '2d' | 'glow' | 'stacked'>('3d')

  const [stackedVariant, setStackedVariant] = useState<StackedCardsVariant>('shadow-sm')
  const [layers, setLayers] = useState(3)
  const [offsetX, setOffsetX] = useState(10)
  const [offsetY, setOffsetY] = useState(10)
  const [scaleStep, setScaleStep] = useState(0.03)
  const [opacityStep, setOpacityStep] = useState(0.08)

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const updateSetting = (key: keyof typeof settings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 bg-background">

      {/* 标签切换 */ }
      <div className="mb-6 flex items-center gap-4">
        <ThemeToggle />
        <ButtonGroup active={ activeTab } onChange={ setActiveTab }>
          <Button name="3d" size="sm">
            3D 卡片
          </Button>
          <Button name="2d" size="sm">
            2D 卡片
          </Button>
          <Button name="glow" size="sm">
            发光边框
          </Button>
          <Button name="stacked" size="sm">
            堆叠卡片
          </Button>
        </ButtonGroup>
      </div>

      { activeTab === '3d'
        ? (
            <div className="flex flex-wrap gap-8">
              <Card3D
                shadowColor="#00f3ff"
                className="rounded-md bg-linear-to-br from-slate-700 to-slate-800 text-white shadow-2xl shadow-black/60"
                gradientColors={ ['#db2777', '#fde047', '#34d399', '#db2777'] }
                animationDuration="3.5s"
                enable3D={ settings.enable3D }
                intensity={ settings.intensity }
                disableOnMobile={ settings.disableOnMobile }
              >
                <div className="h-full flex flex-col items-center justify-between rounded-md bg-slate-600/50 backdrop-blur-xs p-6 text-center">
                  <h3 className="text-2xl font-semibold">Cleaned Up Card</h3>
                  <p className="text-gray-300">Hover to see the effect.</p>
                  <button className="mt-4 rounded-xs bg-indigo-600 px-4 py-2 transition-colors hover:bg-indigo-500">
                    Action
                  </button>
                </div>
              </Card3D>

              <Card3D
                className="w-72 rounded-lg bg-linear-to-br from-sky-900/80 to-sky-600/40 backdrop-blur-xs"
                enable3D={ settings.enable3D }
                enableBorder={ false }
                xRotateRange={ [settings.minRotateX, settings.maxRotateX] }
                yRotateRange={ [settings.minRotateY, settings.maxRotateY] }
                transitionSpeed={ settings.transitionSpeed }
                intensity={ settings.intensity }
                disableOnMobile={ settings.disableOnMobile }
              >
                <div className="flex flex-col p-4">
                  <div className="mb-4">
                    <h2 className="text-xl text-sky-400 font-bold">天空之城</h2>
                    <p className="text-sm text-text2">探索云端的奇幻世界</p>
                  </div>

                  <div className="flex grow items-center justify-center">
                    <div className="h-48 w-full flex items-center justify-center rounded-lg bg-linear-to-br from-sky-900/60 to-sky-600/30 backdrop-blur-xs">
                      <span className="text-5xl text-sky-300">✨</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-text2">
                      漂浮在云端的神秘城市，充满了未知的魔法和科技。每一个角落都蕴藏着令人惊叹的奇迹。
                    </p>
                    <button className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-white transition-colors hover:bg-sky-500">
                      开始探索
                    </button>
                  </div>
                </div>
              </Card3D>

              <Card3D
                className="w-72 rounded-lg bg-linear-to-br from-fuchsia-900/80 to-fuchsia-600/40 backdrop-blur-xs"
                enable3D={ settings.enable3D }
                enableBorder={ false }
                xRotateRange={ [settings.minRotateX, settings.maxRotateX] }
                yRotateRange={ [settings.minRotateY, settings.maxRotateY] }
                transitionSpeed={ settings.transitionSpeed }
                intensity={ settings.intensity }
                disableOnMobile={ settings.disableOnMobile }
              >
                <div className="flex flex-col p-4">
                  <div className="mb-4">
                    <h2 className="text-xl text-fuchsia-400 font-bold">梦幻花园</h2>
                    <p className="text-sm text-slate-400">奇幻植物的秘密世界</p>
                  </div>

                  <div className="flex grow items-center justify-center">
                    <div className="h-48 w-full flex items-center justify-center rounded-lg bg-linear-to-br from-fuchsia-900/60 to-fuchsia-600/30 backdrop-blur-xs">
                      <span className="text-5xl text-fuchsia-300">🌸</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-text2">
                      这里的花朵会在夜晚发光，树木会唱歌，每一种植物都有自己独特的魔法能力。
                    </p>
                    <button className="mt-4 rounded-md bg-fuchsia-600 px-4 py-2 text-white transition-colors hover:bg-fuchsia-500">
                      探索花园
                    </button>
                  </div>
                </div>
              </Card3D>
            </div>
          )
        : activeTab === '2d'
          ? (
              <div className="flex flex-wrap gap-8">
                {/* 基础卡片 */ }
                <Card
                  title="基础卡片"
                  className="w-72"
                >
                  <p className="text-sm">这是一个基础的2D卡片组件，支持标题、内容和底部区域。</p>
                </Card>

                {/* 带图片的卡片 */ }
                <Card
                  title="带图片的卡片"
                  image="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
                  imageAlt="抽象渐变图"
                  className="w-72"
                  shadow="lg"
                >
                  <p className="text-sm">卡片支持添加图片，可以是URL或React节点。</p>
                </Card>

                {/* 带底部的卡片 */ }
                <Card
                  title="带底部的卡片"
                  footer={
                    <div className="flex justify-end">
                      <button className="rounded-md bg-sky-500 px-3 py-1 text-white transition-colors hover:bg-sky-600">
                        确认
                      </button>
                    </div>
                  }
                  footerDivider
                  className="w-72"
                >
                  <p className="text-sm">卡片底部可以添加操作按钮或其他内容。</p>
                </Card>

                {/* 带操作的卡片 */ }
                <Card
                  title="带操作的卡片"
                  headerActions={
                    <button className="rounded-full p-1 hover:bg-background2">
                      <Settings className="h-4 w-4" />
                    </button>
                  }
                  headerDivider
                  className="w-72"
                >
                  <p className="text-sm">卡片头部可以添加操作按钮。</p>
                </Card>

                {/* 不同变体的卡片 */ }
                <Card
                  title="Primary 变体"
                  variant="primary"
                  className="w-72"
                >
                  <p className="text-sm">卡片支持多种预设的变体样式。</p>
                </Card>

                <Card
                  title="Success 变体"
                  variant="success"
                  className="w-72"
                >
                  <p className="text-sm">卡片支持多种预设的变体样式。</p>
                </Card>

                <Card
                  title="Warning 变体"
                  variant="warning"
                  className="w-72"
                >
                  <p className="text-sm">卡片支持多种预设的变体样式。</p>
                </Card>

                <Card
                  title="Danger 变体"
                  variant="danger"
                  className="w-72"
                >
                  <p className="text-sm">卡片支持多种预设的变体样式。</p>
                </Card>

                {/* 新增变体 */ }
                <VariantBackdrop>
                  <Card
                    title="Glass 变体"
                    variant="glass"
                    className="w-full"
                  >
                    <p className="text-sm">毛玻璃效果：需要有背景对比才能明显看到模糊与半透明。</p>
                  </Card>
                </VariantBackdrop>

                <VariantBackdrop>
                  <Card
                    title="Transparent 变体"
                    variant="transparent"
                    className="w-full"
                    bordered
                  >
                    <p className="text-sm">完全透明：会透出背后的渐变背景。</p>
                  </Card>
                </VariantBackdrop>

                {/* 不同阴影效果 */ }
                <Card
                  title="无阴影"
                  shadow="none"
                  className="w-72"
                >
                  <p className="text-sm">无阴影效果。</p>
                </Card>

                <Card
                  title="小阴影 (sm)"
                  shadow="sm"
                  className="w-72"
                >
                  <p className="text-sm">小阴影效果。</p>
                </Card>

                <Card
                  title="中阴影 (md)"
                  shadow="md"
                  className="w-72"
                >
                  <p className="text-sm">中阴影效果。</p>
                </Card>

                <Card
                  title="大阴影 (lg)"
                  shadow="lg"
                  className="w-72"
                >
                  <p className="text-sm">大阴影效果。</p>
                </Card>

                <Card
                  title="特大阴影 (xl)"
                  shadow="xl"
                  className="w-72"
                >
                  <p className="text-sm">特大阴影效果。</p>
                </Card>

                <Card
                  title="超大阴影 (2xl)"
                  shadow="2xl"
                  className="w-72"
                >
                  <p className="text-sm">超大阴影效果。</p>
                </Card>

                <Card
                  title="内阴影"
                  shadow="inner"
                  className="w-72"
                >
                  <p className="text-sm">内阴影效果。</p>
                </Card>

                <Card
                  title="自定义阴影 (number)"
                  shadow={ 35 }
                  className="w-72"
                >
                  <p className="text-sm">通过 number 自定义阴影强度。</p>
                </Card>

                {/* 不同圆角效果 */ }
                <Card
                  title="无圆角"
                  rounded="none"
                  className="w-72"
                >
                  <p className="text-sm">无圆角效果。</p>
                </Card>

                <Card
                  title="小圆角 (sm)"
                  rounded="sm"
                  className="w-72"
                >
                  <p className="text-sm">小圆角效果。</p>
                </Card>

                <Card
                  title="中圆角 (md)"
                  rounded="md"
                  className="w-72"
                >
                  <p className="text-sm">中圆角效果。</p>
                </Card>

                <Card
                  title="大圆角 (lg)"
                  rounded="lg"
                  className="w-72"
                >
                  <p className="text-sm">大圆角效果。</p>
                </Card>

                <Card
                  title="特大圆角 (xl)"
                  rounded="xl"
                  className="w-72"
                >
                  <p className="text-sm">特大圆角效果。</p>
                </Card>

                <Card
                  title="超大圆角 (2xl)"
                  rounded="2xl"
                  className="w-72"
                >
                  <p className="text-sm">超大圆角效果。</p>
                </Card>

                <Card
                  title="极大圆角 (3xl)"
                  rounded="3xl"
                  className="w-72"
                >
                  <p className="text-sm">极大圆角效果。</p>
                </Card>

                <Card
                  title="全圆角"
                  rounded="full"
                  className="w-72"
                >
                  <p className="text-sm">全圆角效果（适合正方形卡片）。</p>
                </Card>

                <Card
                  title="自定义圆角 (number)"
                  rounded={ 14 }
                  className="w-72"
                >
                  <p className="text-sm">通过 number 自定义圆角像素值。</p>
                </Card>

                {/* 悬浮效果 */ }
                <Card
                  title="悬浮效果"
                  className="w-72"
                  hoverEffect
                >
                  <p className="text-sm">鼠标悬浮时显示阴影和边框效果。</p>
                </Card>

                {/* 完整示例卡片 */ }
                <Card
                  title="完整示例"
                  image="https://images.unsplash.com/photo-1682687982107-14492010e05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  imageAlt="风景图"
                  headerActions={
                    <div className="flex space-x-1">
                      <button className="rounded-full p-1 hover:bg-background2">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-1 hover:bg-background2">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  }
                  footer={
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text2">最后更新: 今天</span>
                      <Button variant="primary">查看详情</Button>
                    </div>
                  }
                  headerDivider
                  footerDivider
                  shadow="xl"
                  rounded="lg"
                  className="w-72"
                  hoverEffect
                >
                  <div className="space-y-2">
                    <h4 className="font-medium">完整功能展示</h4>
                    <p className="text-sm text-text2">
                      这个卡片展示了所有可用的功能，包括标题、图片、内容、底部、分隔线和自定义样式。
                    </p>
                    <div className="flex space-x-2">
                      <span className="rounded-sm bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">标签1</span>
                      <span className="rounded-sm bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-200">标签2</span>
                    </div>
                  </div>
                </Card>
              </div>
            )
          : activeTab === 'glow'
            ? (
                <div className="flex flex-wrap gap-8">
                  {/* 发光边框测试 */ }
                  <div className="h-64 w-72">
                    <GlowBorder
                      className="h-full rounded-lg"
                      borderSize={ 2 }
                      gradientColors={ ['#f0f', '#0ff', '#ff0'] }
                      animationDuration="4s"
                    >
                      <div className="h-full flex flex-col items-center justify-center rounded-lg bg-gray-900 p-4">
                        <h3 className="text-xl text-white font-semibold">基础发光边框</h3>
                        <p className="mt-2 text-center text-text2">默认配置的发光边框效果</p>
                      </div>
                    </GlowBorder>
                  </div>

                  <div className="h-64 w-72">
                    <GlowBorder
                      className="h-full rounded-lg"
                      borderSize={ 4 }
                      gradientColors={ ['#db2777', '#fde047', '#34d399', '#db2777'] }
                      animationDuration="3s"
                    >
                      <div className="h-full flex flex-col items-center justify-center rounded-lg bg-gray-900 p-4">
                        <h3 className="text-xl text-white font-semibold">自定义边框</h3>
                        <p className="mt-2 text-center text-text2">更宽的边框和自定义颜色</p>
                      </div>
                    </GlowBorder>
                  </div>

                  <div className="h-64 w-72">
                    <GlowBorder
                      className="h-full rounded-lg"
                      borderSize={ 6 }
                      gradientColors={ ['#3b82f6', '#8b5cf6', '#ec4899', '#3b82f6'] }
                      animationDuration="6s"
                    >
                      <div className="h-full flex flex-col items-center justify-center rounded-lg bg-gray-900 p-4">
                        <h3 className="text-xl text-white font-semibold">慢速旋转</h3>
                        <p className="mt-2 text-center text-text2">更慢的动画速度和更宽的边框</p>
                      </div>
                    </GlowBorder>
                  </div>

                  <div className="h-64 w-72">
                    <GlowBorder
                      className="h-full rounded-full"
                      borderSize={ 3 }
                      gradientColors={ ['#f43f5e', '#fb923c', '#f43f5e'] }
                      animationDuration="2s"
                    >
                      <div className="h-full flex flex-col items-center justify-center rounded-full bg-gray-900 p-4">
                        <h3 className="text-xl text-white font-semibold">圆形边框</h3>
                        <p className="mt-2 text-center text-text2">圆形容器的发光边框效果</p>
                      </div>
                    </GlowBorder>
                  </div>
                </div>
              )
            : (
                <div className="w-full max-w-5xl flex flex-col gap-10">
                  <div className="space-y-2">
                    <p className="text-xs text-text2">Stacked Cards</p>
                    <h2 className="text-2xl font-semibold text-text">
                      多层堆叠卡片预览
                    </h2>
                    <p className="text-sm text-text2">
                      可调节层数、偏移、缩放与透明度，最大支持 3 层
                    </p>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="flex items-center justify-center rounded-2xl border border-border bg-background5/20 p-8">
                      <StackedCards
                        variant={ stackedVariant }
                        layers={ layers as 1 | 2 | 3 }
                        offsetX={ offsetX }
                        offsetY={ offsetY }
                        scaleStep={ scaleStep }
                        opacityStep={ opacityStep }
                        className="h-64 w-80"
                        topLayerClassName="bg-background"
                        contentClassName="p-5"
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div className="space-y-2">
                            <div className="text-xs text-text2">Today</div>
                            <div className="text-lg font-semibold text-text">
                              Design Sync
                            </div>
                            <div className="text-sm text-text2">
                              12:30 - 13:15 · Studio 4A
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button>Join</Button>
                            <Button variant="primary">Details</Button>
                          </div>
                        </div>
                      </StackedCards>
                    </div>

                    <div className="rounded-2xl border border-border bg-background p-6 shadow-xs">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <span className="text-sm text-text2">样式变体</span>
                          <ButtonGroup
                            active={ stackedVariant }
                            onChange={ v => setStackedVariant(v as StackedCardsVariant) }
                          >
                            <Button name="border" size="sm">
                              边框
                            </Button>
                            <Button name="shadow" size="sm">
                              阴影
                            </Button>
                            <Button name="background" size="sm">
                              背景色
                            </Button>
                          </ButtonGroup>
                        </div>
                        <ControlSlider
                          label="层数"
                          value={ layers }
                          min={ 1 }
                          max={ 3 }
                          step={ 1 }
                          onChange={ v => setLayers(v) }
                        />
                        <ControlSlider
                          label="X 偏移"
                          value={ offsetX }
                          min={ 0 }
                          max={ 20 }
                          step={ 1 }
                          unit="px"
                          onChange={ v => setOffsetX(v) }
                        />
                        <ControlSlider
                          label="Y 偏移"
                          value={ offsetY }
                          min={ 0 }
                          max={ 20 }
                          step={ 1 }
                          unit="px"
                          onChange={ v => setOffsetY(v) }
                        />
                        <ControlSlider
                          label="缩放差"
                          value={ scaleStep }
                          min={ 0 }
                          max={ 0.08 }
                          step={ 0.01 }
                          onChange={ v => setScaleStep(v) }
                        />
                        <ControlSlider
                          label="透明度差"
                          value={ opacityStep }
                          min={ 0 }
                          max={ 0.2 }
                          step={ 0.01 }
                          onChange={ v => setOpacityStep(v) }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <StackedCards
                      variant={ stackedVariant }
                      layers={ 2 }
                      offsetX={ 6 }
                      offsetY={ 12 }
                      className="h-44 w-full"
                      topLayerClassName="bg-background"
                      contentClassName="p-5"
                    >
                      <div className="space-y-3">
                        <div className="text-xs text-text2">Quick View</div>
                        <div className="text-base font-semibold text-text">
                          Weekly Insights
                        </div>
                        <p className="text-sm text-text2">
                          5 updates · 2 pending approvals
                        </p>
                      </div>
                    </StackedCards>

                    <StackedCards
                      variant={ stackedVariant }
                      layers={ 3 }
                      offsetX={ 12 }
                      offsetY={ 6 }
                      scaleStep={ 0.02 }
                      opacityStep={ 0.06 }
                      className="h-44 w-full"
                      topLayerClassName="bg-background"
                      contentClassName="p-5"
                    >
                      <div className="space-y-3">
                        <div className="text-xs text-text2">Focus</div>
                        <div className="text-base font-semibold text-text">
                          Release Checklist
                        </div>
                        <p className="text-sm text-text2">
                          3 items remaining · ETA 2h
                        </p>
                      </div>
                    </StackedCards>
                  </div>
                </div>
              ) }

      {/* 设置按钮 */ }
      { activeTab === '3d' && (
        <button
          onClick={ () => setShowSettings(!showSettings) }
          className="fixed bottom-6 right-6 rounded-full bg-slate-800 p-3 shadow-lg hover:bg-slate-700"
        >
          <Settings className="h-6 w-6 text-sky-400" />
        </button>
      ) }

      {/* 设置面板 */ }
      { showSettings && activeTab === '3d' && (
        <div className="fixed bottom-20 right-6 w-64 rounded-lg bg-slate-800 p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sky-400 font-medium">卡片设置</h3>
            <button onClick={ () => setShowSettings(false) }>
              <X className="h-5 w-5 text-slate-400 hover:text-slate-200" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">3D 效果</span>
              <button
                onClick={ () => toggleSetting('enable3D') }
                className={ cn(
                  'p-1 rounded-xs',
                  settings.enable3D
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-400',
                ) }
              >
                { settings.enable3D
                  ? <Check className="h-4 w-4" />
                  : <X className="h-4 w-4" /> }
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">移动端禁用</span>
              <button
                onClick={ () => toggleSetting('disableOnMobile') }
                className={ cn(
                  'p-1 rounded-xs',
                  settings.disableOnMobile
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-700 text-slate-400',
                ) }
              >
                { settings.disableOnMobile
                  ? <Check className="h-4 w-4" />
                  : <X className="h-4 w-4" /> }
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">最小旋转角度 X</span>
                <span className="text-sm text-slate-400">
                  { settings.minRotateX }
                  °
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="0"
                value={ settings.minRotateX }
                onChange={ e => updateSetting('minRotateX', Number(e.target.value)) }
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">最大旋转角度 X</span>
                <span className="text-sm text-slate-400">
                  { settings.maxRotateX }
                  °
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={ settings.maxRotateX }
                onChange={ e => updateSetting('maxRotateX', Number(e.target.value)) }
                className="w-full accent-sky-500"
              />

              <div className="flex justify-between">
                <span className="text-sm text-slate-300">最小旋转角度 Y</span>
                <span className="text-sm text-slate-400">
                  { settings.minRotateY }
                  °
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="0"
                value={ settings.minRotateY }
                onChange={ e => updateSetting('minRotateY', Number(e.target.value)) }
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">最大旋转角度 Y</span>
                <span className="text-sm text-slate-400">
                  { settings.maxRotateY }
                  °
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={ settings.maxRotateY }
                onChange={ e => updateSetting('maxRotateY', Number(e.target.value)) }
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">过渡速度</span>
                <span className="text-sm text-slate-400">
                  { settings.transitionSpeed }
                  s
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={ settings.transitionSpeed }
                onChange={ e => updateSetting('transitionSpeed', Number(e.target.value)) }
                className="w-full accent-sky-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">效果强度</span>
                <span className="text-sm text-slate-400">
                  { settings.intensity }
                  x
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={ settings.intensity }
                onChange={ e => updateSetting('intensity', Number(e.target.value)) }
                className="w-full accent-sky-500"
              />
            </div>
          </div>
        </div>
      ) }
    </div>
  )
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text2">{ label }</span>
        <span className="text-sm font-mono text-text3 tabular-nums">
          { value.toFixed(step < 1
            ? 2
            : 0) }
          { unit ?? '' }
        </span>
      </div>
      <Slider
        value={ value }
        min={ min }
        max={ max }
        step={ step }
        onChange={ v => onChange(v as number) }
      />
    </div>
  )
}
