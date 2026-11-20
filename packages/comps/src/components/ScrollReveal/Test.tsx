'use client'

import { useState } from 'react'
import { Button } from '../Button'
import { ThemeToggle } from '../ThemeToggle'
import { ScrollReveal } from './ScrollReveal'
import type { RevealVariant } from './types'

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
function ScrollRevealTestPage() {
  const [key, setKey] = useState(0)

  return (
    <div key={ key } className="bg-background text-text min-h-screen">
      { /* Header */ }
      <div className="bg-background/80 border-border sticky top-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-text text-2xl font-bold">ScrollReveal Test</h1>
          <p className="text-text2 text-sm">向下滚动查看动画效果</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={ () => setKey((k) => k + 1) } size="sm">
            重置动画
          </Button>
          <ThemeToggle />
        </div>
      </div>

      { /* Spacer */ }
      <div className="text-text3 flex h-[50vh] items-center justify-center text-lg">
        ↓ 向下滚动
      </div>

      { /* 1. Single variants */ }
      <section className="mx-auto max-w-3xl space-y-12 px-6 pb-24">
        <ScrollReveal variant="fadeUp">
          <h2 className="text-text mb-2 text-xl font-semibold">单元素动画变体</h2>
          <p className="text-text2 text-sm">每个卡片使用不同的 variant</p>
        </ScrollReveal>

        { VARIANTS.map((variant, i) => (
          <ScrollReveal
            key={ variant }
            variant={ variant }
            className={ `p-6 rounded-xl border ${COLORS[i % COLORS.length]}` }
          >
            <p className="font-mono text-sm font-medium text-gray-700">
              variant=&quot;
              { variant }
              &quot;
            </p>
            <p className="mt-1 text-sm text-gray-500">
              { variantDesc[variant] }
            </p>
          </ScrollReveal>
        )) }
      </section>

      { /* Spacer */ }
      <div className="h-32" />

      { /* 2. Delay + Duration */ }
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <ScrollReveal variant="blurIn">
          <h2 className="text-text mb-8 text-xl font-semibold">自定义 delay + duration</h2>
        </ScrollReveal>

        <div className="space-y-6">
          <ScrollReveal variant="fadeUp" delay={ 0 } duration={ 0.5 }>
            <div className="bg-background2 border-border rounded-lg border p-4">
              delay=0 duration=0.5
            </div>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={ 0.2 } duration={ 0.8 }>
            <div className="bg-background2 border-border rounded-lg border p-4">
              delay=0.2 duration=0.8
            </div>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={ 0.4 } duration={ 1.2 }>
            <div className="bg-background2 border-border rounded-lg border p-4">
              delay=0.4 duration=1.2（更慢更晚）
            </div>
          </ScrollReveal>
        </div>
      </section>

      { /* Spacer */ }
      <div className="h-32" />

      { /* 3. ScrollReveal.Container + ScrollReveal.Item */ }
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <ScrollReveal variant="fadeUp">
          <h2 className="text-text mb-8 text-xl font-semibold">
            ScrollReveal.Container + ScrollReveal.Item
          </h2>
        </ScrollReveal>

        <h3 className="text-text2 mb-4 text-sm font-medium">默认紧凑入场（20px / 300ms / 错峰 100ms）</h3>
        <ScrollReveal.Container className="mb-12 grid grid-cols-3 gap-4">
          { Array.from({ length: 6 }).map((_, i) => (
            <ScrollReveal.Item
              key={ i }
              className="rounded-xl border border-violet-200 bg-violet-50 p-6 text-center"
            >
              <span className="text-2xl font-bold text-violet-600">{ i + 1 }</span>
            </ScrollReveal.Item>
          )) }
        </ScrollReveal.Container>

        <h3 className="text-text2 mb-4 text-sm font-medium">stagger=0.15 variant=scaleUp</h3>
        <ScrollReveal.Container stagger={ 0.15 } className="mb-12 grid grid-cols-4 gap-3">
          { Array.from({ length: 8 }).map((_, i) => (
            <ScrollReveal.Item
              key={ i }
              variant="scaleUp"
              className={ `p-4 rounded-lg border text-center ${COLORS[i % COLORS.length]}` }
            >
              <span className="text-lg font-semibold">{ String.fromCharCode(65 + i) }</span>
            </ScrollReveal.Item>
          )) }
        </ScrollReveal.Container>

        <h3 className="text-text2 mb-4 text-sm font-medium">stagger=0.08 variant=slideLeft distance=32 (list)</h3>
        <ScrollReveal.Container stagger={ 0.08 } className="space-y-3">
          { ['Record', 'Organize', 'Utilize', 'Share', 'Archive'].map((item) => (
            <ScrollReveal.Item
              key={ item }
              variant="slideLeft"
              distance={ 32 }
              className="bg-background2 border-border text-text rounded-lg border p-4 font-medium"
            >
              { item }
            </ScrollReveal.Item>
          )) }
        </ScrollReveal.Container>
      </section>

      { /* Spacer */ }
      <div className="h-32" />

      { /* 4. as prop */ }
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <ScrollReveal variant="fadeUp">
          <h2 className="text-text mb-8 text-xl font-semibold">as prop — 渲染不同元素</h2>
        </ScrollReveal>

        <ScrollReveal variant="blurIn" as="h2" className="text-text mb-4 text-3xl font-bold">
          我是 h2 元素
        </ScrollReveal>

        <ScrollReveal variant="fadeUp" as="p" className="text-text2 mb-6">
          我是 p 元素，使用 fadeUp 动画
        </ScrollReveal>

        <ScrollReveal variant="scaleUp" as="section" className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
          我是 section 元素，使用 scaleUp 动画
        </ScrollReveal>
      </section>

      { /* Footer */ }
      <div className="text-text3 flex h-[30vh] items-center justify-center text-sm">
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

export default ScrollRevealTestPage
