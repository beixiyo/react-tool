'use client'

import type { ScrollCarouselRef } from './types'
import { useRef, useState } from 'react'
import { ScrollCarousel } from './ScrollCarousel'

const DEMO_CARDS = [
  { label: 'Executives', color: 'bg-violet-200 border-violet-400', emoji: '👔' },
  { label: 'Lawyers', color: 'bg-blue-200 border-blue-400', emoji: '⚖️' },
  { label: 'Sales', color: 'bg-emerald-200 border-emerald-400', emoji: '📈' },
  { label: 'Clinicians', color: 'bg-amber-200 border-amber-400', emoji: '🩺' },
  { label: 'Educators', color: 'bg-rose-200 border-rose-400', emoji: '📚' },
  { label: 'Freelancers', color: 'bg-cyan-200 border-cyan-400', emoji: '💻' },
  { label: 'Designers', color: 'bg-pink-200 border-pink-400', emoji: '🎨' },
  { label: 'Engineers', color: 'bg-indigo-200 border-indigo-400', emoji: '⚙️' },
]

/**
 * ScrollCarousel 组件测试页面
 *
 * 测试项：拖拽手势、快速轻扫、边界橡皮筋、导航按钮、进度回调、
 * 图片拖拽禁用、不同 gap 值、ref API
 */
export default function ScrollCarouselTestPage() {
  const [progress1, setProgress1] = useState(0)
  const [progress2, setProgress2] = useState(0)
  const [index, setIndex] = useState(0)
  const ref1 = useRef<ScrollCarouselRef>(null)
  const ref2 = useRef<ScrollCarouselRef>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */ }
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">ScrollCarousel Test</h1>
        <p className="text-sm text-gray-500">拖拽 / 轻扫 / 箭头导航</p>
      </div>

      {/* 1. Basic — 多卡片可见 + 拖拽 */ }
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">1. 基础拖拽（gap=16）</h2>
        <p className="text-sm text-gray-500 mb-4">
          鼠标/触摸拖拽滑动，松手吸附最近卡片，边界有橡皮筋效果
        </p>

        <ScrollCarousel
          ref={ ref1 }
          gap={ 16 }
          onProgressChange={ setProgress1 }
          onIndexChange={ setIndex }
        >
          { DEMO_CARDS.map(card => (
            <div
              key={ card.label }
              className={ `w-[200px] h-[260px] rounded-2xl border-2 ${card.color} flex flex-col items-center justify-center gap-3` }
            >
              <span className="text-4xl">{ card.emoji }</span>
              <span className="text-sm font-semibold text-gray-700">{ card.label }</span>
            </div>
          )) }
        </ScrollCarousel>

        {/* Progress + Nav */ }
        <div className="flex items-center mt-4 gap-4">
          <div className="flex-1 h-[2px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full transition-[width] duration-150"
              style={ { width: `${Math.max(5, progress1 * 100)}%` } }
            />
          </div>
          <span className="text-xs text-gray-400 font-mono w-20 text-right">
            idx=
            { index }
            { ' ' }
            { (progress1 * 100).toFixed(0) }
            %
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={ () => ref1.current?.prev() }
              className="size-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-colors cursor-pointer"
            >
              ←
            </button>
            <button
              type="button"
              onClick={ () => ref1.current?.next() }
              className="size-8 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors cursor-pointer"
            >
              →
            </button>
          </div>
        </div>

        {/* goToIndex buttons */ }
        <div className="flex gap-2 mt-3">
          { DEMO_CARDS.map((card, i) => (
            <button
              key={ card.label }
              type="button"
              onClick={ () => ref1.current?.goToIndex(i) }
              className={ `px-2 py-1 text-xs rounded cursor-pointer transition-colors ${i === index
                ? 'bg-violet-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }` }
            >
              { i }
            </button>
          )) }
        </div>
      </section>

      {/* 2. Large gap + 图片卡片 */ }
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">2. 图片卡片（gap=20）</h2>
        <p className="text-sm text-gray-500 mb-4">
          验证图片拖拽被禁用（img 不会被浏览器拖走）
        </p>

        <ScrollCarousel
          ref={ ref2 }
          gap={ 20 }
          onProgressChange={ setProgress2 }
        >
          { Array.from({ length: 6 }).map((_, i) => (
            <div key={ i } className="w-[280px] h-[180px] rounded-xl overflow-hidden relative">
              <img
                src={ `https://picsum.photos/seed/${i + 10}/560/360` }
                alt={ `demo-${i}` }
                draggable={ false }
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-4 text-white text-sm font-medium">
                Photo #
                { i + 1 }
              </span>
            </div>
          )) }
        </ScrollCarousel>

        <div className="flex items-center mt-4 gap-4">
          <div className="flex-1 h-[2px] bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-[width] duration-150"
              style={ { width: `${Math.max(5, progress2 * 100)}%` } }
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={ () => ref2.current?.prev() }
              className="size-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              ←
            </button>
            <button
              type="button"
              onClick={ () => ref2.current?.next() }
              className="size-8 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* 3. disableDrag */ }
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">3. 禁用拖拽（disableDrag）</h2>
        <p className="text-sm text-gray-500 mb-4">
          仅能通过按钮导航，拖拽无响应
        </p>

        <ScrollCarousel gap={ 12 } disableDrag>
          { DEMO_CARDS.slice(0, 5).map(card => (
            <div
              key={ card.label }
              className={ `w-[160px] h-[100px] rounded-xl border-2 ${card.color} flex items-center justify-center` }
            >
              <span className="text-sm font-medium text-gray-600">{ card.label }</span>
            </div>
          )) }
        </ScrollCarousel>
      </section>

      {/* 4. Single item — 边界情况 */ }
      <section className="max-w-4xl mx-auto px-6 py-12 pb-24">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">4. 单元素（边界）</h2>
        <p className="text-sm text-gray-500 mb-4">
          只有一个子元素，不应有滚动行为
        </p>

        <ScrollCarousel gap={ 16 }>
          <div className="w-[300px] h-[120px] rounded-xl border-2 bg-gray-100 border-gray-300 flex items-center justify-center">
            <span className="text-sm text-gray-500">唯一卡片</span>
          </div>
        </ScrollCarousel>
      </section>
    </div>
  )
}
