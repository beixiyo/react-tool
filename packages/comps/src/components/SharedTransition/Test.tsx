/** 卡片进入详情、图片跨 Portal 放大；仅使用共享端点，不接入图片预览系统 */
import { useKeyboardLayer } from 'hooks'
import { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import coast from '../../assets/svg/shared-transition-coast.svg'
import desert from '../../assets/svg/shared-transition-desert.svg'
import { Z } from '../../constants/z-index'
import { Button } from '../Button'
import { Card } from '../Card'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { createSharedTransition, SharedTransitionProvider } from '.'
import type { SharedTransitionPair } from './types'

const STORIES: DemoStory[] = [
  {
    title: '海岸线',
    category: 'COAST · 01',
    description: '沿着海岸，留一点时间给风和潮汐',
    image: coast,
    pair: createSharedTransition(),
  },
  {
    title: '暮色山谷',
    category: 'LANDSCAPE · 02',
    description: '当光线落下，山谷显露出另一种颜色',
    image: desert,
    pair: createSharedTransition(),
  },
]

const Zoom = createSharedTransition()

/** 每张卡片持有独立凭证，业务视图与共享状态在同一次事务中切换 */
const StoryCard = memo(function StoryCard({ story, onSelect }: StoryCardProps) {
  const { show } = story.pair.useTransition()
  const [ready, setReady] = useState(false)
  const Pair = story.pair

  return (
    <Button
      type="button"
      variant="ghost"
      disabled={ !ready }
      aria-label={ `查看${story.title}详情` }
      className="block h-auto w-full overflow-hidden rounded-2xl border border-border bg-background2 p-3 text-left text-text"
      onClick={ (event) => {
        const trigger = event.currentTarget
        show({ update: () => onSelect(story, trigger) })
      } }
    >
      <div className="aspect-8/5">
        <Pair.Source>
          <img
            src={ story.image }
            alt={ story.title }
            className="block aspect-8/5 w-full rounded-xl object-cover"
            onLoad={ () => setReady(true) }
          />
        </Pair.Source>
      </div>
      <div className="space-y-2 px-2 pb-3 pt-5">
        <p className="text-xs tracking-widest text-text2">{ story.category }</p>
        <h3 className="text-xl font-semibold">{ story.title }</h3>
        <p className="whitespace-normal text-sm font-normal leading-relaxed text-text2">{ story.description }</p>
        <p className="pt-2 text-sm text-systemOrange">阅读详情 ↗</p>
      </div>
    </Button>
  )
})

/** 详情封面直接作为 Target；标题、正文与导航不参与封面共享 */
const StoryDetail = memo(function StoryDetail({ story, onBack }: StoryDetailProps) {
  const { hide } = story.pair.useTransition()
  const backButton = useRef<HTMLButtonElement>(null)
  const Pair = story.pair

  useEffect(() => {
    backButton.current?.focus()
  }, [])

  return (
    <div role="region" aria-label={ `${story.title}详情` } className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button ref={ backButton } type="button" variant="ghost" onClick={ () => hide({ update: onBack }) }>
          ← 返回列表
        </Button>
        <span className="text-xs text-text2">列表视图 → 详情视图</span>
      </div>
      <Pair.Target>
        <img src={ story.image } alt={ `${story.title}封面` } className="block aspect-8/5 w-full rounded-2xl object-cover" />
      </Pair.Target>
      <div className="grid gap-4 sm:grid-cols-[1fr_1.5fr]">
        <div className="space-y-2">
          <p className="text-xs tracking-widest text-text2">{ story.category }</p>
          <h3 className="text-2xl font-semibold">{ story.title }</h3>
        </div>
        <div className="space-y-3 text-sm leading-7 text-text2">
          <p>{ story.description }</p>
          <p>小卡片的封面变成了详情页的大图。点击返回，观察它回到原来的卡片位置，而不是重新淡入一张图片。</p>
          <p>这里模拟路由页面的布局切换，不修改实际浏览器路由，也不依赖路由库。</p>
        </div>
      </div>
    </div>
  )
})

/** 来源始终保留注册；仅切换列表可见性，避免详情返回时丢失原始端点 */
const StoryScene = memo(function StoryScene() {
  const [selected, setSelected] = useState<DemoStory | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!selected && trigger.current?.isConnected) trigger.current.focus()
  }, [selected])

  return (
    <Card padding="lg" shadow="none" bordered hoverEffect={ false } bodyClassName="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-systemOrange">01 / 页面布局切换</p>
        <h2 className="text-xl font-semibold">从作品卡片，走进详情页</h2>
        <p className="text-sm leading-relaxed text-text2">任选一张卡片。观察同一张封面的位置、大小和圆角在两个 UI 之间连续变化。</p>
      </div>
      <div className={ selected
        ? 'hidden'
        : 'grid gap-5 sm:grid-cols-2' }>
        { STORIES.map((story) => (
          <StoryCard
            key={ story.title }
            story={ story }
            onSelect={ (next, element) => {
              trigger.current = element
              setSelected(next)
            } }
          />
        )) }
      </div>
      { selected && <StoryDetail story={ selected } onBack={ () => setSelected(null) } /> }
    </Card>
  )
})

/** 大图与小图仅共享 img；浮层为普通背景，不加入模糊、拖拽等额外编排 */
const ZoomScene = memo(function ZoomScene() {
  const { open, show, hide, enabled } = Zoom.useTransition()
  const [ready, setReady] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)

  useKeyboardLayer({
    active: open,
    keys: ['Escape'],
    priority: Z.preview,
    allowRepeat: false,
    onKeyDown: () => hide(),
  })

  useEffect(() => {
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()

    return () => {
      document.body.style.overflow = overflow
      if (trigger.current?.isConnected) trigger.current.focus()
    }
  }, [open])

  return (
    <Card padding="lg" shadow="none" bordered hoverEffect={ false } bodyClassName="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium tracking-widest text-systemOrange">02 / 跨 Portal 图片共享</p>
        <h2 className="text-xl font-semibold">从缩略图，展开为大图</h2>
        <p className="text-sm leading-relaxed text-text2">点击封面放大。关闭、点击空白处或按 Escape，图片会缩回原来的位置。</p>
      </div>
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Button
          ref={ trigger }
          type="button"
          variant="ghost"
          disabled={ !ready }
          aria-label="放大海岸线图片"
          className="block h-auto w-full shrink-0 overflow-hidden rounded-xl border border-border p-0 sm:w-64"
          onClick={ () => show() }
        >
          <div className="aspect-8/5 w-full">
            <Zoom.Source>
              <img src={ coast } alt="海岸线缩略图" className="block aspect-8/5 w-full rounded-xl object-cover" onLoad={ () => setReady(true) } />
            </Zoom.Source>
          </div>
        </Button>
        <div className="space-y-2 text-sm leading-relaxed text-text2">
          <p className="font-medium text-text">小图留在页面，大图挂载到 document.body。</p>
          <p>只使用一组 Source / Target，不调用 LazyImg、PreviewImg 或图库控制器。</p>
          <p>{ enabled
            ? '当前：原生 View Transition'
            : '当前：无 VT，直接切换' }</p>
        </div>
      </div>

      { open && typeof document !== 'undefined' && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="海岸线大图"
          tabIndex={ -1 }
          className="fixed inset-0 flex flex-col items-center justify-center gap-5 bg-background/95 p-4 sm:p-8"
          style={ { zIndex: Z.preview } }
          onClick={ (event) => {
            if (event.target === event.currentTarget) hide()
          } }
          onKeyDown={ (event) => {
            if (event.key !== 'Tab') return
            event.preventDefault()
            closeButton.current?.focus()
          } }
        >
          <Zoom.Target>
            <img src={ coast } alt="海岸线大图" className="block max-h-[75vh] max-w-full rounded-2xl object-contain" />
          </Zoom.Target>
          <Button ref={ closeButton } type="button" onClick={ () => hide() }>关闭大图 · Esc</Button>
        </div>,
        document.body,
      ) }
    </Card>
  )
})

/** 演示时长为 650ms；关闭开关可对比同一 UI 在没有 VT 时的直接切换 */
export default function Test() {
  const [enabled, setEnabled] = useState(true)

  return (
    <div className="min-h-screen bg-background p-4 text-text sm:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold sm:text-3xl">看见 UI 之间的过渡</h1>
            <p className="text-sm leading-relaxed text-text2">不是两个面板的显隐，而是同一个视觉元素在不同布局之间移动。</p>
          </div>
          <ThemeToggle />
        </header>
        <Card shadow="none" bordered hoverEffect={ false }>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Switch label="启用 View Transition" checked={ enabled } onChange={ setEnabled } />
            <p className="text-xs text-text2">演示放慢至 650ms · 关闭开关对比直接切换</p>
          </div>
        </Card>
        <SharedTransitionProvider enabled={ enabled }>
          <StoryScene />
          <ZoomScene />
        </SharedTransitionProvider>
      </div>
    </div>
  )
}

interface DemoStory {
  title: string
  category: string
  description: string
  image: string
  pair: SharedTransitionPair
}

interface StoryCardProps {
  story: DemoStory
  onSelect: (story: DemoStory, trigger: HTMLButtonElement) => void
}

interface StoryDetailProps {
  story: DemoStory
  onBack: () => void
}
