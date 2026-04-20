import { Book, Camera, Coffee, Heart, Moon, Music, Palette, Sparkles, Star, Sun } from 'lucide-react'
import { useState } from 'react'
import { SeamlessScroll } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function Test() {
  const [wide, setWide] = useState(true)

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="relative mx-auto max-w-5xl">
        <ThemeToggle className="absolute right-0 top-0 shadow-button" />

        <header className="mb-12 text-center">
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-text">
            SeamlessScroll · Test Matrix
          </h1>
          <p className="text-sm text-text3">
            动态副本数 · 不限制元素 / 容器宽度
          </p>
        </header>

        <div className="space-y-6">
          {/* 场景 1：原场景 */ }
          <Section
            n={ 1 }
            label="原场景：多元素 · 容器较窄"
            desc="回归测试 — 与旧版行为一致"
          >
            <SeamlessScroll
              speed={ 40 }
              className="w-full border border-border rounded-xl"
              pauseOnHover
              gap={ 16 }
            >
              <HorizontalCard icon={ Sparkles } text="Magic happens" />
              <HorizontalCard icon={ Star } text="Favorite moments" />
              <HorizontalCard icon={ Heart } text="Love this design" />
              <HorizontalCard icon={ Music } text="Smooth rhythm" />
              <HorizontalCard icon={ Coffee } text="Stay focused" />
            </SeamlessScroll>
          </Section>

          {/* 场景 2：新能力——1 个元素 */ }
          <Section
            n={ 2 }
            label="1 个元素 + 宽容器"
            desc="旧版会露出白边 — 新版应无缝填满"
            highlight
          >
            <SeamlessScroll
              speed={ 60 }
              className="toning-green-border w-full rounded-xl"
              pauseOnHover
              gap={ 24 }
            >
              <HorizontalCard icon={ Sparkles } text="Single card fills any width" />
            </SeamlessScroll>
          </Section>

          {/* 场景 3：新能力——2 个元素 */ }
          <Section
            n={ 3 }
            label="2 个元素 + 宽容器"
            desc="应自动复制多份填满整个容器"
            highlight
          >
            <SeamlessScroll
              speed={ 50 }
              className="toning-green-border w-full rounded-xl"
              pauseOnHover
              gap={ 20 }
            >
              <HorizontalCard icon={ Star } text="First" />
              <HorizontalCard icon={ Heart } text="Second" />
            </SeamlessScroll>
          </Section>

          {/* 场景 4：方向 right */ }
          <Section
            n={ 4 }
            label={ <>
              方向
              <code className="rounded bg-background3 px-1.5 py-0.5 text-xs">right</code>
              {' '}
              — 从左向右
            </> }
            desc="反向起始位置应在左边，不应有突兀跳跃"
          >
            <SeamlessScroll
              speed={ 40 }
              direction="right"
              className="w-full border border-border rounded-xl"
              gap={ 16 }
            >
              <HorizontalCard icon={ Sparkles } text="A" />
              <HorizontalCard icon={ Star } text="B" />
              <HorizontalCard icon={ Heart } text="C" />
              <HorizontalCard icon={ Music } text="D" />
            </SeamlessScroll>
          </Section>

          {/* 场景 5：垂直 up & down */ }
          <Section
            n={ 5 }
            label="垂直方向 · up & down"
            desc="两列并排对照，分别向上 / 向下滚动"
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Tag>direction="up"</Tag>
                <SeamlessScroll
                  speed={ 30 }
                  direction="up"
                  className="mt-2 h-[300px] border border-border rounded-xl"
                  pauseOnHover
                  gap={ 12 }
                >
                  <VerticalCard icon={ Palette } text="Creative" />
                  <VerticalCard icon={ Camera } text="Capture" />
                  <VerticalCard icon={ Book } text="Read" />
                  <VerticalCard icon={ Sun } text="Bright" />
                  <VerticalCard icon={ Moon } text="Peaceful" />
                </SeamlessScroll>
              </div>
              <div>
                <Tag>direction="down"</Tag>
                <SeamlessScroll
                  speed={ 30 }
                  direction="down"
                  className="mt-2 h-[300px] border border-border rounded-xl"
                  pauseOnHover
                  gap={ 12 }
                >
                  <VerticalCard icon={ Palette } text="Creative" />
                  <VerticalCard icon={ Camera } text="Capture" />
                  <VerticalCard icon={ Book } text="Read" />
                </SeamlessScroll>
              </div>
            </div>
          </Section>

          {/* 场景 6：垂直 + 1 个元素 */ }
          <Section
            n={ 6 }
            label="垂直 up · 1 个元素 + 高容器"
            desc="垂直方向的自动扩份"
            highlight
          >
            <div className="mx-auto w-64">
              <SeamlessScroll
                speed={ 40 }
                direction="up"
                className="toning-green-border h-[400px] rounded-xl"
                pauseOnHover
                gap={ 12 }
              >
                <VerticalCard icon={ Sun } text="Only one" />
              </SeamlessScroll>
            </div>
          </Section>

          {/* 场景 7：pauseOnHover 对照 */ }
          <Section
            n={ 7 }
            label="pauseOnHover 对照"
            desc="左：悬停暂停 · 右：悬停不停"
          >
            <div className="grid grid-cols-2 gap-4">
              <SeamlessScroll
                speed={ 50 }
                pauseOnHover
                className="toning-yellow-border rounded-xl"
                gap={ 12 }
              >
                <HorizontalCard icon={ Sparkles } text="pauseOnHover = true" />
                <HorizontalCard icon={ Star } text="悬停我会停" />
                <HorizontalCard icon={ Heart } text="离开继续" />
              </SeamlessScroll>

              <SeamlessScroll
                speed={ 50 }
                pauseOnHover={ false }
                className="rounded-xl border border-border"
                gap={ 12 }
              >
                <HorizontalCard icon={ Sparkles } text="pauseOnHover = false" />
                <HorizontalCard icon={ Star } text="悬停也不停" />
                <HorizontalCard icon={ Heart } text="一直滚" />
              </SeamlessScroll>
            </div>
          </Section>

          {/* 场景 8：动态 resize */ }
          <Section
            n={ 8 }
            label="动态 resize"
            desc="切换容器宽度 — 副本数应自动重算"
            highlight
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={ () => setWide(w => !w) }
                className="rounded-md bg-button px-4 py-1.5 text-sm text-text transition-colors hover:bg-button2"
              >
                切换宽度
              </button>
              <span className="text-xs text-text3">
                当前：
                <code className="ml-1 rounded bg-background3 px-1.5 py-0.5">
                  {wide
                    ? '1200px'
                    : '400px'}
                </code>
              </span>
            </div>
            <SeamlessScroll
              speed={ 40 }
              className="toning-red-border mx-auto rounded-xl transition-[width] duration-300"
              pauseOnHover
              gap={ 16 }
              style={ { width: wide
                ? 1200
                : 400 } }
            >
              <HorizontalCard icon={ Sparkles } text="Resize me" />
              <HorizontalCard icon={ Heart } text="I adapt" />
            </SeamlessScroll>
            <p className="mt-3 text-center text-xs text-text3">
              DevTools → 观察 track 下
              {' '}
              <code className="rounded bg-background3 px-1 py-0.5">.shrink-0</code>
              {' '}
              节点数自动变化
            </p>
          </Section>

          {/* 场景 9：空 children */ }
          <Section
            n={ 9 }
            label="边界 · 空 children"
            desc="不应崩溃，容器保持空"
          >
            <SeamlessScroll
              speed={ 40 }
              className="h-10 w-full border border-border border-dashed rounded-xl"
              gap={ 16 }
            >
              {null}
            </SeamlessScroll>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ n, label, desc, highlight, children }: {
  n: number
  label: React.ReactNode
  desc?: string
  highlight?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="border border-border rounded-2xl bg-background2 p-6 shadow-button">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={ `flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
              highlight
                ? 'bg-brand text-white'
                : 'bg-background3 text-text2'
            }` }
          >
            {n}
          </span>
          <div className="text-left">
            <h2 className="text-sm text-text font-medium leading-6">{ label }</h2>
            { desc && <p className="mt-0.5 text-xs text-text3">{ desc }</p> }
          </div>
        </div>
        { highlight && (
          <span className="toning-green shrink-0 rounded px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase">
            Key
          </span>
        ) }
      </header>
      { children }
    </section>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-block rounded bg-background3 px-2 py-0.5 text-xs text-text2 font-mono">
    { children }
  </span>
}

function HorizontalCard({ icon: Icon, text }: { icon: React.ElementType, text: string }) {
  return <div className="flex items-center gap-3 border border-border2 rounded-xl bg-background3 px-6 py-4 transition-colors hover:border-brand">
    <Icon className="h-5 w-5 text-systemBlue" />
    <span className="whitespace-nowrap text-sm text-text">{ text }</span>
  </div>
}

function VerticalCard({ icon: Icon, text }: { icon: React.ElementType, text: string }) {
  return <div className="flex items-center gap-3 border border-border2 rounded-xl bg-background3 px-6 py-4 transition-colors hover:border-systemRed">
    <Icon className="h-5 w-5 text-systemRed" />
    <span className="text-sm text-text">{ text }</span>
  </div>
}
