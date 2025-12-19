'use client'

import { Check, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from 'utils'
import { ThemeToggle } from '../ThemeToggle'
import { Card } from './Card'
import { Card3D } from './Card3D'
import { GlowBorder } from './GlowBorder'

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
  const [activeTab, setActiveTab] = useState<'3d' | '2d' | 'glow'>('3d')

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
      <div className="mb-6 flex space-x-4">
        <ThemeToggle />

        <button
          onClick={ () => setActiveTab('3d') }
          className={ cn(
            'px-4 py-2 rounded-md transition-colors',
            activeTab === '3d'
              ? 'bg-sky-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
          ) }
        >
          3D 卡片
        </button>
        <button
          onClick={ () => setActiveTab('2d') }
          className={ cn(
            'px-4 py-2 rounded-md transition-colors',
            activeTab === '2d'
              ? 'bg-sky-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
          ) }
        >
          2D 卡片
        </button>
        <button
          onClick={ () => setActiveTab('glow') }
          className={ cn(
            'px-4 py-2 rounded-md transition-colors',
            activeTab === 'glow'
              ? 'bg-sky-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700',
          ) }
        >
          发光边框
        </button>
      </div>

      <h1 className="mb-4 text-sky-400 font-bold">
        { activeTab === '3d'
          ? '3D 卡片组件演示'
          : activeTab === '2d'
            ? '2D 卡片组件演示'
            : '发光边框组件演示' }
      </h1>

      { activeTab === '3d'
        ? (
            <div className="flex flex-wrap gap-8">
              <Card3D
                shadowColor="#00f3ff"
                className="rounded-md bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-2xl shadow-black/60"
                gradientColors={ ['#db2777', '#fde047', '#34d399', '#db2777'] }
                animationDuration="3.5s"
                enable3D={ settings.enable3D }
                intensity={ settings.intensity }
                disableOnMobile={ settings.disableOnMobile }
              >
                <div className="h-full flex flex-col items-center justify-between rounded-md bg-slate-600/50 backdrop-blur-sm p-6 text-center">
                  <h3 className="text-2xl font-semibold">Cleaned Up Card</h3>
                  <p className="text-gray-300">Hover to see the effect.</p>
                  <button className="mt-4 rounded-sm bg-indigo-600 px-4 py-2 transition-colors hover:bg-indigo-500">
                    Action
                  </button>
                </div>
              </Card3D>

              <Card3D
                className="w-72 rounded-lg bg-gradient-to-br from-sky-900/80 to-sky-600/40 backdrop-blur-sm"
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
                    <p className="text-sm text-textSecondary">探索云端的奇幻世界</p>
                  </div>

                  <div className="flex grow items-center justify-center">
                    <div className="h-48 w-full flex items-center justify-center rounded-lg bg-gradient-to-br from-sky-900/60 to-sky-600/30 backdrop-blur-sm">
                      <span className="text-5xl text-sky-300">✨</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-textSecondary">
                      漂浮在云端的神秘城市，充满了未知的魔法和科技。每一个角落都蕴藏着令人惊叹的奇迹。
                    </p>
                    <button className="mt-4 rounded-md bg-sky-600 px-4 py-2 text-white transition-colors hover:bg-sky-500">
                      开始探索
                    </button>
                  </div>
                </div>
              </Card3D>

              <Card3D
                className="w-72 rounded-lg bg-gradient-to-br from-fuchsia-900/80 to-fuchsia-600/40 backdrop-blur-sm"
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
                    <div className="h-48 w-full flex items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-900/60 to-fuchsia-600/30 backdrop-blur-sm">
                      <span className="text-5xl text-fuchsia-300">🌸</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-textSecondary">
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
                    <button className="rounded-full p-1 hover:bg-backgroundSecondary">
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
                <Card
                  title="Glass 变体"
                  variant="glass"
                  className="w-72"
                >
                  <p className="text-sm">毛玻璃效果，透明背景带模糊效果。</p>
                </Card>

                <Card
                  title="Transparent 变体"
                  variant="transparent"
                  className="w-72"
                  bordered
                >
                  <p className="text-sm">完全透明的背景，只有边框。</p>
                </Card>

                <Card
                  title="Dark 变体"
                  variant="dark"
                  className="w-72"
                >
                  <p className="text-sm">深色主题变体，适合深色模式。</p>
                </Card>

                <Card
                  title="Elevated 变体"
                  variant="elevated"
                  className="w-72"
                >
                  <p className="text-sm">提升效果变体，带有增强的阴影。</p>
                </Card>

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

                {/* 悬浮效果 */ }
                <Card
                  title="悬浮效果"
                  className="w-72"
                  hoverEffect
                >
                  <p className="text-sm">鼠标悬浮时显示阴影和边框效果。</p>
                </Card>

                <Card
                  title="提升效果 (2px)"
                  className="w-72"
                  elevation={ 2 }
                >
                  <p className="text-sm">鼠标悬浮时卡片上移2像素。</p>
                </Card>

                <Card
                  title="提升效果 (4px)"
                  className="w-72"
                  elevation={ 4 }
                >
                  <p className="text-sm">鼠标悬浮时卡片上移4像素。</p>
                </Card>

                <Card
                  title="提升效果 (8px)"
                  className="w-72"
                  elevation={ 8 }
                >
                  <p className="text-sm">鼠标悬浮时卡片上移8像素。</p>
                </Card>

                {/* 内边距 */ }
                <Card
                  title="无内边距"
                  className="w-72"
                  padding="none"
                >
                  <div className="bg-backgroundSecondary p-4">
                    <p className="text-sm">无内边距效果，内容区域没有默认的内边距。</p>
                  </div>
                </Card>

                <Card
                  title="小内边距"
                  className="w-72"
                  padding="sm"
                >
                  <p className="text-sm">小内边距效果。</p>
                </Card>

                <Card
                  title="默认内边距"
                  className="w-72"
                  padding="default"
                >
                  <p className="text-sm">默认内边距效果。</p>
                </Card>

                <Card
                  title="大内边距"
                  className="w-72"
                  padding="lg"
                >
                  <p className="text-sm">大内边距效果。</p>
                </Card>

                <Card
                  title="特大内边距"
                  className="w-72"
                  padding="xl"
                >
                  <p className="text-sm">特大内边距效果。</p>
                </Card>

                {/* 完整示例卡片 */ }
                <Card
                  title="完整示例"
                  image="https://images.unsplash.com/photo-1682687982107-14492010e05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  imageAlt="风景图"
                  headerActions={
                    <div className="flex space-x-1">
                      <button className="rounded-full p-1 hover:bg-backgroundSecondary">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="rounded-full p-1 hover:bg-backgroundSecondary">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  }
                  footer={
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-textSecondary">最后更新: 今天</span>
                      <button className="rounded-md bg-sky-500 px-3 py-1 text-white transition-colors hover:bg-sky-600">
                        查看详情
                      </button>
                    </div>
                  }
                  headerDivider
                  footerDivider
                  shadow="xl"
                  rounded="lg"
                  className="w-72"
                  hoverEffect
                  elevation={ 2 }
                >
                  <div className="space-y-2">
                    <h4 className="font-medium">完整功能展示</h4>
                    <p className="text-sm text-textSecondary">
                      这个卡片展示了所有可用的功能，包括标题、图片、内容、底部、分隔线和自定义样式。
                    </p>
                    <div className="flex space-x-2">
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">标签1</span>
                      <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-200">标签2</span>
                    </div>
                  </div>
                </Card>
              </div>
            )
          : (
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
                      <p className="mt-2 text-center text-textSecondary">默认配置的发光边框效果</p>
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
                      <p className="mt-2 text-center text-textSecondary">更宽的边框和自定义颜色</p>
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
                      <p className="mt-2 text-center text-textSecondary">更慢的动画速度和更宽的边框</p>
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
                      <p className="mt-2 text-center text-textSecondary">圆形容器的发光边框效果</p>
                    </div>
                  </GlowBorder>
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
                  'p-1 rounded-sm',
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
                  'p-1 rounded-sm',
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
