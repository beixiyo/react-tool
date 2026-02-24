'use client'

import { genArr } from '@jl-org/tool'
import { CloseBtn } from 'comps'
import { Check, Settings2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useState } from 'react'
import { Carousel } from '.'

/** 使用16:9的比例图片 */
const testImages = genArr(5, i => `https://picsum.photos/id/${i.toString()}/800/450`)

const CarouselTest = memo(() => {
  const [showSettings, setShowSettings] = useState(false)
  const [carouselConfig, setCarouselConfig] = useState({
    imgHeight: 400,
    autoPlayInterval: 5000,
    initialIndex: 0,
    showArrows: true,
    showDots: true,
    showPreview: true,
    previewCount: 3,
    previewPosition: 'right' as 'right' | 'bottom',
    transitionType: 'slide' as 'slide' | 'fade' | 'zoom',
    animationDuration: 0.5,
    indicatorType: 'dot' as 'dot' | 'line',
    enableSwipe: true,
    enableKeyboardNav: true,
    enableAutoHeight: false,
    objectFit: 'cover' as 'cover' | 'contain' | 'fill',
    useAspectRatio: true,
    aspectRatio: 16 / 9,
    pauseOnHover: true,
  })

  const handleConfigChange = (key: string, value: any) => {
    setCarouselConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen from-gray-50 to-gray-100 bg-linear-to-br p-8 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <h1 className="mb-2 text-4xl text-gray-900 font-bold dark:text-white">轮播图组件</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">具有多种配置选项的现代化轮播图组件</p>
        </header>

        <div className="relative mb-10">
          {/* 主轮播图 */ }
          <div className="overflow-hidden rounded-xl shadow-2xl">
            <Carousel
              imgs={ testImages }
              imgHeight={ carouselConfig.imgHeight }
              autoPlayInterval={ carouselConfig.autoPlayInterval }
              initialIndex={ carouselConfig.initialIndex }
              showArrows={ carouselConfig.showArrows }
              showDots={ carouselConfig.showDots }
              showPreview={ carouselConfig.showPreview }
              previewCount={ carouselConfig.previewCount }
              previewPosition={ carouselConfig.previewPosition }
              transitionType={ carouselConfig.transitionType }
              animationDuration={ carouselConfig.animationDuration }
              indicatorType={ carouselConfig.indicatorType }
              enableSwipe={ carouselConfig.enableSwipe }
              enableKeyboardNav={ carouselConfig.enableKeyboardNav }
              enableAutoHeight={ carouselConfig.enableAutoHeight }
              pauseOnHover={ carouselConfig.pauseOnHover }
              objectFit={ carouselConfig.objectFit }
              aspectRatio={ carouselConfig.useAspectRatio
                ? carouselConfig.aspectRatio
                : undefined }
            />
          </div>

          {/* 设置按钮 */ }
          <button
            onClick={ () => setShowSettings(!showSettings) }
            className="absolute right-4 top-4 z-20 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-lg transition-all hover:scale-105 dark:bg-gray-800/80 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <Settings2 className="h-5 w-5" />
          </button>

          {/* 设置面板 */ }
          <AnimatePresence>
            { showSettings && (
              <motion.div
                initial={ { opacity: 0, x: 100 } }
                animate={ { opacity: 1, x: 0 } }
                exit={ { opacity: 0, x: 100 } }
                className="fixed right-0 top-0 z-30 overflow-y-auto rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-800"
              >
                <div className="relative mb-4">
                  <h2 className="text-xl text-gray-900 font-bold dark:text-white">轮播图配置</h2>
                  <CloseBtn
                    mode="absolute"
                    corner="top-right"
                    offset={ { top: 0, right: 0 } }
                    onClick={ () => setShowSettings(false) }
                  />
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
                  {/* 图片高度 */ }
                  <div className={ carouselConfig.useAspectRatio
                    ? 'opacity-50 pointer-events-none'
                    : '' }>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      图片高度:
                      { ' ' }
                      { carouselConfig.imgHeight }
                      px
                    </label>
                    <input
                      type="range"
                      min="200"
                      max="600"
                      value={ carouselConfig.imgHeight }
                      onChange={ e => handleConfigChange('imgHeight', Number.parseInt(e.target.value)) }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                      disabled={ carouselConfig.useAspectRatio }
                    />
                  </div>

                  {/* 使用宽高比 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      高度控制方式
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={ () => handleConfigChange('useAspectRatio', true) }
                        className={ `rounded-md px-3 py-1 text-sm transition-colors ${carouselConfig.useAspectRatio
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }` }
                      >
                        固定比例
                      </button>
                      <button
                        onClick={ () => handleConfigChange('useAspectRatio', false) }
                        className={ `rounded-md px-3 py-1 text-sm transition-colors ${!carouselConfig.useAspectRatio
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }` }
                      >
                        固定高度
                      </button>
                    </div>
                  </div>

                  {/* 宽高比 */ }
                  <div className={ !carouselConfig.useAspectRatio
                    ? 'opacity-50 pointer-events-none'
                    : '' }>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      宽高比:
                      { ' ' }
                      { carouselConfig.aspectRatio.toFixed(2) }
                      { ' ' }
                      (
                      { Math.round(carouselConfig.aspectRatio * 100) / 100 === 16 / 9
                        ? '16:9'
                        : Math.round(carouselConfig.aspectRatio * 100) / 100 === 4 / 3
                          ? '4:3'
                          : Math.round(carouselConfig.aspectRatio * 100) / 100 === 1
                            ? '1:1'
                            : '自定义' }
                      )
                    </label>
                    <div className="mb-2 flex gap-2">
                      <button
                        onClick={ () => handleConfigChange('aspectRatio', 16 / 9) }
                        className={ `rounded-md px-3 py-1 text-xs transition-colors ${Math.abs(carouselConfig.aspectRatio - 16 / 9) < 0.01
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }` }
                        disabled={ !carouselConfig.useAspectRatio }
                      >
                        16:9
                      </button>
                      <button
                        onClick={ () => handleConfigChange('aspectRatio', 4 / 3) }
                        className={ `rounded-md px-3 py-1 text-xs transition-colors ${Math.abs(carouselConfig.aspectRatio - 4 / 3) < 0.01
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }` }
                        disabled={ !carouselConfig.useAspectRatio }
                      >
                        4:3
                      </button>
                      <button
                        onClick={ () => handleConfigChange('aspectRatio', 1) }
                        className={ `rounded-md px-3 py-1 text-xs transition-colors ${Math.abs(carouselConfig.aspectRatio - 1) < 0.01
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }` }
                        disabled={ !carouselConfig.useAspectRatio }
                      >
                        1:1
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={ carouselConfig.aspectRatio }
                      onChange={ e => handleConfigChange('aspectRatio', Number.parseFloat(e.target.value)) }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                      disabled={ !carouselConfig.useAspectRatio }
                    />
                  </div>

                  {/* 图片适配方式 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      图片适配方式
                    </label>
                    <div className="flex gap-2">
                      { ['cover', 'contain', 'fill'].map(fit => (
                        <button
                          key={ fit }
                          onClick={ () => handleConfigChange('objectFit', fit) }
                          className={ `rounded-md px-3 py-1 text-sm transition-colors ${carouselConfig.objectFit === fit
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }` }
                        >
                          { fit }
                        </button>
                      )) }
                    </div>
                  </div>

                  {/* 自动播放间隔 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      自动播放间隔:
                      { ' ' }
                      { carouselConfig.autoPlayInterval / 1000 }
                      秒
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      step="1000"
                      value={ carouselConfig.autoPlayInterval }
                      onChange={ e => handleConfigChange('autoPlayInterval', Number.parseInt(e.target.value)) }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                    />
                  </div>

                  {/* 动画持续时间 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      动画持续时间:
                      { ' ' }
                      { carouselConfig.animationDuration }
                      秒
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={ carouselConfig.animationDuration }
                      onChange={ e => handleConfigChange('animationDuration', Number.parseFloat(e.target.value)) }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                    />
                  </div>

                  {/* 预览图数量 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      预览图数量:
                      { ' ' }
                      { carouselConfig.previewCount }
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      value={ carouselConfig.previewCount }
                      onChange={ e => handleConfigChange('previewCount', Number.parseInt(e.target.value)) }
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                    />
                  </div>

                  {/* 过渡动画类型 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      过渡动画类型
                    </label>
                    <div className="flex gap-2">
                      { ['slide', 'fade', 'zoom'].map(type => (
                        <button
                          key={ type }
                          onClick={ () => handleConfigChange('transitionType', type) }
                          className={ `rounded-md px-3 py-1 text-sm transition-colors ${carouselConfig.transitionType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }` }
                        >
                          { type }
                        </button>
                      )) }
                    </div>
                  </div>

                  {/* 指示器类型 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      指示器类型
                    </label>
                    <div className="flex gap-2">
                      { ['dot', 'line'].map(type => (
                        <button
                          key={ type }
                          onClick={ () => handleConfigChange('indicatorType', type) }
                          className={ `rounded-md px-3 py-1 text-sm transition-colors ${carouselConfig.indicatorType === type
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }` }
                        >
                          { type }
                        </button>
                      )) }
                    </div>
                  </div>

                  {/* 预览图位置 */ }
                  <div>
                    <label className="mb-2 block text-sm text-gray-700 font-medium dark:text-gray-300">
                      预览图位置
                    </label>
                    <div className="flex gap-2">
                      { ['right', 'bottom'].map(position => (
                        <button
                          key={ position }
                          onClick={ () => handleConfigChange('previewPosition', position) }
                          className={ `rounded-md px-3 py-1 text-sm transition-colors ${carouselConfig.previewPosition === position
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }` }
                        >
                          { position }
                        </button>
                      )) }
                    </div>
                  </div>

                  {/* 复选框选项 */ }
                  <div className="space-y-3">
                    <ToggleOption
                      label="显示导航箭头"
                      checked={ carouselConfig.showArrows }
                      onChange={ value => handleConfigChange('showArrows', value) }
                    />
                    <ToggleOption
                      label="显示导航指示器"
                      checked={ carouselConfig.showDots }
                      onChange={ value => handleConfigChange('showDots', value) }
                    />
                    <ToggleOption
                      label="显示预览图"
                      checked={ carouselConfig.showPreview }
                      onChange={ value => handleConfigChange('showPreview', value) }
                    />
                  </div>

                  <div className="space-y-3">
                    <ToggleOption
                      label="启用滑动切换"
                      checked={ carouselConfig.enableSwipe }
                      onChange={ value => handleConfigChange('enableSwipe', value) }
                    />
                    <ToggleOption
                      label="启用键盘导航"
                      checked={ carouselConfig.enableKeyboardNav }
                      onChange={ value => handleConfigChange('enableKeyboardNav', value) }
                    />
                    <ToggleOption
                      label="鼠标悬停暂停自动播放"
                      checked={ carouselConfig.pauseOnHover }
                      onChange={ value => handleConfigChange('pauseOnHover', value) }
                    />
                  </div>
                </div>
              </motion.div>
            ) }
          </AnimatePresence>
        </div>

        {/* 使用示例 */ }
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* 示例1：基础用法 */ }
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="bg-white p-4 dark:bg-gray-800">
                <h3 className="mb-2 text-lg text-gray-900 font-semibold dark:text-white">基础轮播图</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">最简单的轮播图实现</p>
              </div>
              <Carousel
                imgs={ testImages.slice(0, 3) }
                aspectRatio={ 16 / 9 }
                objectFit="cover"
              />
            </div>

            {/* 示例2：无箭头，仅指示器 */ }
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="bg-white p-4 dark:bg-gray-800">
                <h3 className="mb-2 text-lg text-gray-900 font-semibold dark:text-white">无箭头轮播图</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">仅使用指示器导航</p>
              </div>
              <Carousel
                imgs={ testImages.slice(1, 4) }
                aspectRatio={ 4 / 3 }
                showArrows={ false }
                indicatorType="line"
                objectFit="contain"
              />
            </div>

            {/* 示例3：淡入淡出效果 */ }
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="bg-white p-4 dark:bg-gray-800">
                <h3 className="mb-2 text-lg text-gray-900 font-semibold dark:text-white">淡入淡出效果</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">使用淡入淡出过渡动画</p>
              </div>
              <Carousel
                imgs={ testImages.slice(2, 5) }
                aspectRatio={ 16 / 9 }
                transitionType="fade"
                autoPlayInterval={ 3000 }
                objectFit="cover"
              />
            </div>

            {/* 示例4：缩放效果 */ }
            <div className="overflow-hidden rounded-lg shadow-lg">
              <div className="bg-white p-4 dark:bg-gray-800">
                <h3 className="mb-2 text-lg text-gray-900 font-semibold dark:text-white">缩放效果</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">使用缩放过渡动画</p>
              </div>
              <Carousel
                imgs={ testImages.slice(0, 3) }
                aspectRatio={ 1 }
                transitionType="zoom"
                autoPlayInterval={ 4000 }
                objectFit="fill"
              />
            </div>
          </div>

          {/* 自定义内容示例 */ }
          <div className="overflow-hidden rounded-lg shadow-lg">
            <div className="bg-white p-4 dark:bg-gray-800">
              <h3 className="mb-2 text-lg text-gray-900 font-semibold dark:text-white">自定义内容</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">使用children属性添加自定义内容</p>
            </div>
            <Carousel
              imgs={ testImages }
              aspectRatio={ 16 / 9 }
              showPreview
              previewPosition="bottom"
              objectFit="cover"
            >
              { testImages.map((_, index) => (
                <div
                  key={ index }
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 p-8 text-center text-white"
                >
                  <h2 className="mb-4 text-3xl font-bold">
                    幻灯片
                    { index + 1 }
                  </h2>
                  <p className="mb-6 max-w-md text-lg">这是一个自定义内容示例，您可以在轮播图上添加任何React组件。</p>
                  <button className="rounded-full bg-white px-6 py-2 text-black transition-transform hover:scale-105">
                    了解更多
                  </button>
                </div>
              )) }
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  )
})

/** 开关选项组件 */
function ToggleOption({ label, checked, onChange }: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center">
      <button
        onClick={ () => onChange(!checked) }
        className={ `relative mr-3 inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked
          ? 'bg-blue-500'
          : 'bg-gray-300 dark:bg-gray-600'
        }` }
      >
        <span
          className={ `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked
            ? 'translate-x-6'
            : 'translate-x-1'
          }` }
        />
        { checked && (
          <Check className="absolute right-1 h-3 w-3 text-blue-100" />
        ) }
      </button>
      <span className="text-sm text-gray-700 font-medium dark:text-gray-300">{ label }</span>
    </div>
  )
}

export default CarouselTest
