'use client'

import type { RevealVariant } from './types'
import { useState } from 'react'
import { ScrollReveal } from './ScrollReveal'
import { StaggerContainer } from './StaggerContainer'
import { StaggerItem } from './StaggerItem'

const VARIANTS: RevealVariant[] = [
  'fadeUp',
  'fadeDown',
  'fadeIn',
  'slideLeft',
  'slideRight',
  'scaleUp',
  'blurIn',
]

const COLORS = [
  'bg-violet-100 border-violet-300',
  'bg-blue-100 border-blue-300',
  'bg-emerald-100 border-emerald-300',
  'bg-amber-100 border-amber-300',
  'bg-rose-100 border-rose-300',
  'bg-cyan-100 border-cyan-300',
]

/**
 * ScrollReveal / StaggerContainer / StaggerItem 组件测试页面
 * 需要滚动页面来触发各种动画效果
 */
export default function ScrollRevealTestPage() {
  const [key, setKey] = useState(0)

  return (
    <div key={ key } className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ScrollReveal Test</h1>
          <p className="text-sm text-gray-500">向下滚动查看动画效果</p>
        </div>
        <button
          onClick={ () => setKey(k => k + 1) }
          className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors"
        >
          重置动画
        </button>
      </div>

      {/* Spacer */}
      <div className="h-[50vh] flex items-center justify-center text-gray-400 text-lg">
        ↓ 向下滚动
      </div>

      {/* 1. Single variants */}
      <section className="max-w-3xl mx-auto px-6 space-y-12 pb-24">
        <ScrollReveal variant="fadeUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">单元素动画变体</h2>
          <p className="text-gray-500 text-sm">每个卡片使用不同的 variant</p>
        </ScrollReveal>

        {VARIANTS.map((variant, i) => (
          <ScrollReveal
            key={ variant }
            variant={ variant }
            className={ `p-6 rounded-xl border ${COLORS[i % COLORS.length]}` }
          >
            <p className="font-mono text-sm font-medium text-gray-700">
              variant=&quot;
              {variant}
              &quot;
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {variantDesc[variant]}
            </p>
          </ScrollReveal>
        ))}
      </section>

      {/* Spacer */}
      <div className="h-32" />

      {/* 2. Delay + Duration */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <ScrollReveal variant="blurIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">自定义 delay + duration</h2>
        </ScrollReveal>

        <div className="space-y-6">
          <ScrollReveal variant="fadeUp" delay={ 0 } duration={ 0.5 }>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              delay=0 duration=0.5
            </div>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={ 0.2 } duration={ 0.8 }>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              delay=0.2 duration=0.8
            </div>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={ 0.4 } duration={ 1.2 }>
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              delay=0.4 duration=1.2（更慢更晚）
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Spacer */}
      <div className="h-32" />

      {/* 3. StaggerContainer + StaggerItem */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <ScrollReveal variant="fadeUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            StaggerContainer + StaggerItem
          </h2>
        </ScrollReveal>

        <h3 className="text-sm font-medium text-gray-500 mb-4">stagger=0.1 (grid)</h3>
        <StaggerContainer stagger={ 0.1 } className="grid grid-cols-3 gap-4 mb-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <StaggerItem
              key={ i }
              variant="fadeUp"
              className="p-6 rounded-xl bg-violet-50 border border-violet-200 text-center"
            >
              <span className="text-2xl font-bold text-violet-600">{i + 1}</span>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <h3 className="text-sm font-medium text-gray-500 mb-4">stagger=0.15 variant=scaleUp</h3>
        <StaggerContainer stagger={ 0.15 } className="grid grid-cols-4 gap-3 mb-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <StaggerItem
              key={ i }
              variant="scaleUp"
              className={ `p-4 rounded-lg border text-center ${COLORS[i % COLORS.length]}` }
            >
              <span className="text-lg font-semibold">{String.fromCharCode(65 + i)}</span>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <h3 className="text-sm font-medium text-gray-500 mb-4">stagger=0.08 variant=slideLeft (list)</h3>
        <StaggerContainer stagger={ 0.08 } className="space-y-3">
          {['Record', 'Organize', 'Utilize', 'Share', 'Archive'].map(item => (
            <StaggerItem
              key={ item }
              variant="slideLeft"
              className="p-4 rounded-lg bg-gray-50 border border-gray-200 font-medium text-gray-700"
            >
              {item}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Spacer */}
      <div className="h-32" />

      {/* 4. as prop */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <ScrollReveal variant="fadeUp">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">as prop — 渲染不同元素</h2>
        </ScrollReveal>

        <ScrollReveal variant="blurIn" as="h2" className="text-3xl font-bold text-gray-900 mb-4">
          我是 h2 元素
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" as="p" className="text-gray-500 mb-6">
          我是 p 元素，使用 fadeUp 动画
        </ScrollReveal>

        <ScrollReveal variant="scaleUp" as="section" className="p-6 rounded-xl bg-emerald-50 border border-emerald-200">
          我是 section 元素，使用 scaleUp 动画
        </ScrollReveal>
      </section>

      {/* Footer */}
      <div className="h-[30vh] flex items-center justify-center text-gray-300 text-sm">
        ✓ 测试结束
      </div>
    </div>
  )
}

const variantDesc: Record<RevealVariant, string> = {
  fadeUp: '从下方 40px 淡入上移',
  fadeDown: '从上方 40px 淡入下移',
  fadeIn: '原地淡入',
  slideLeft: '从左侧 60px 滑入',
  slideRight: '从右侧 60px 滑入',
  scaleUp: '从 0.92 缩放淡入',
  blurIn: '从 blur(10px) 模糊淡入',
}
