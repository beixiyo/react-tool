'use client'

import type { VirtualGroupItemCtx, VirtualGroupLayoutAnimationOptions, VirtualGroupSection, VirtualListLayoutAnimationOptions } from './types'
import { ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import type { Transition } from 'motion/react'
import type { CSSProperties, KeyboardEvent, RefObject } from 'react'
import { useLatestCallback, useTextOverflow } from 'hooks'
import { memo, useRef, useState } from 'react'
import { cn } from 'utils'
import { Button, ButtonGroup } from '../Button'
import { StackedCards } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
import { Tooltip } from '../Tooltip'
import { TanstackVirtualList } from './TanstackVirtualList'
import { VirtualGroupList } from './VirtualGroupList'

type MockCard = {
  id: string
  title: string
  desc: string
}

const GROUP_LIST_LAYOUT_TRANSITION = {
  layout: {
    type: 'spring',
    visualDuration: 0.45,
    bounce: 0,
  },
  opacity: {
    duration: 0.12,
    ease: 'easeOut',
  },
} satisfies Transition

const GROUP_LIST_LAYOUT_ANIMATION = {
  getItemLayoutId: (item) => `tanstack-virtual-demo-card-${item.id}`,
  transition: GROUP_LIST_LAYOUT_TRANSITION,
} satisfies VirtualGroupLayoutAnimationOptions<MockCard>

const PAGE_SIZE = 20

/** 用索引生成确定性的「伪随机」内容，行高真实不一 */
function makeCard(group: string, index: number): MockCard {
  const sentences = [
    '一句话待办。',
    '中等长度的描述，撑出第二行，验证动态高度测量。',
    '这是一条很长的会议纪要式描述，包含大量上下文细节，目的是让该行明显高于其他行，验证大高度差下虚拟滚动是否漂移、折叠展开后位置是否正确。',
  ]

  return {
    id: `${group}-${index}`,
    title: `[${group}] 卡片 #${index}`,
    desc: sentences[index % sentences.length],
  }
}

function makeCards(group: string, count: number): MockCard[] {
  return Array.from({ length: count }, (_, index) => makeCard(group, index))
}

function makePage(group: string, page: number): MockCard[] {
  return Array.from(
    { length: PAGE_SIZE },
    (_, i) => makeCard(group, page * PAGE_SIZE + i),
  )
}

/** ============ 演示一：TanstackVirtualList 基础列表 ============ */

function BasicListDemo() {
  const [items, setItems] = useState<MockCard[]>(() => makePage('basic', 0))
  const [page, setPage] = useState(1)

  const hasMore = page < 20

  const loadMore = async () => {
    await new Promise(resolve => setTimeout(resolve, 400))
    setItems(prev => [...prev, ...makePage('basic', page)])
    setPage(prev => prev + 1)
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text">TanstackVirtualList（基础列表）</h2>
      <p className="text-sm text-text2">
        动态高度 + 无限加载（共 20 页 / 每页
        {' '}
        { PAGE_SIZE }
        {' '}
        条），已加载
        { ' ' }
        <span className="font-medium text-text">{ items.length }</span>
        { ' ' }
        条
      </p>

      <TanstackVirtualList
        data={ items }
        className="h-105 rounded-2xl border border-border bg-background2"
        estimateSize={ 72 }
        hasMore={ hasMore }
        loadMore={ loadMore }
        itemClassName={ (_, index) => index % 2 === 1
          ? 'bg-background3/40'
          : undefined }
      >
        { (item, index) => (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-text">{ item.title }</span>
              <span className="shrink-0 text-xs text-text3">
                index
                { ' ' }
                { index }
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-text2">{ item.desc }</p>
          </div>
        ) }
      </TanstackVirtualList>
    </section>
  )
}

/** ============ 演示二：VirtualGroupList 分组收放动画 ============ */

const GROUP_KEYS = ['short', 'long', 'stacked', 'tail'] as const

const INITIAL_GROUPS: Record<GroupKey, MockCard[]> = {
  short: makeCards('short', 3),
  long: makeCards('long', 300),
  stacked: makeCards('stacked', 6),
  tail: makeCards('tail', 8),
}

const GROUP_TITLES: Record<GroupKey, string> = {
  short: '短分组（3 条）',
  long: '长分组（300 条）',
  stacked: '层叠预览（默认收起，从未测量）',
  tail: '尾部分组',
}

const ALL_EXPANDED: string[] = [...GROUP_KEYS]
const DEFAULT_EXPANDED: string[] = ['short', 'long', 'tail']

function GroupListDemo() {
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [expanded, setExpanded] = useState<string[]>(DEFAULT_EXPANDED)
  const [animated, setAnimated] = useState(true)

  /** 点击卡片展开/收起长文，验证运行时高度变化能被重新测量 */
  const [openedIds, setOpenedIds] = useState<Set<string>>(new Set())

  const toggleCard = (id: string) => {
    setOpenedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      }
      else {
        next.add(id)
      }
      return next
    })
  }

  const shuffleItems = () => {
    setGroups(prev => ({
      ...prev,
      long: shuffleCards(prev.long),
    }))
  }

  const groupHeader = (title: string, count: number) => (isExpanded: boolean) => (
    <div className="flex h-10 items-center gap-1.5 rounded-xl px-3 transition-colors hover:bg-background2/60">
      <ChevronDown
        size={ 16 }
        className={ cn(
          'shrink-0 text-text2 transition-transform',
          isExpanded && 'rotate-180',
        ) }
      />
      <h2 className="text-sm font-semibold text-text">{ title }</h2>
      <span className="ml-auto text-xs text-text4">
        { count }
        {' 条'}
      </span>
    </div>
  )

  const buildStackedPreview = (items: MockCard[]) => (
    <div className="px-1 pb-3 pt-1">
      <StackedCards
        autoHeight
        variant="background"
        layers={ 2 }
        offsetY={ 7 }
        opacityStep={ 0.01 }
        layersContent={ items.slice(0, 2).map(card => (
          <div key={ card.id } className="rounded-2xl p-3">
            <div className="text-sm font-medium text-text">{ card.title }</div>
            <p className="mt-1 truncate text-sm text-text2">{ card.desc }</p>
          </div>
        )) }
      />
    </div>
  )

  const sections: VirtualGroupSection<MockCard>[] = GROUP_KEYS.map(key => ({
    key,
    header: groupHeader(GROUP_TITLES[key], groups[key].length),
    items: groups[key],
    collapsedPreview: key === 'stacked'
      ? buildStackedPreview(groups[key])
      : undefined,
  }))

  const renderCard = (card: MockCard, ctx: VirtualGroupItemCtx<MockCard>) => {
    const isOpened = openedIds.has(card.id)

    return (
      <div className="px-1 pb-2">
        <div
          className="cursor-pointer rounded-2xl border border-border bg-background2 px-4 py-3 transition-colors hover:bg-background3/60"
          onClick={ () => toggleCard(card.id) }
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-text">{ card.title }</span>
            <span className="shrink-0 text-xs text-text3">
              #
              { ctx.indexInSection }
            </span>
          </div>
          <p className={ cn('mt-1 text-sm leading-relaxed text-text2', !isOpened && 'truncate') }>
            { card.desc }
          </p>
          { isOpened && (
            <p className="mt-2 text-xs leading-relaxed text-text3">
              点击展开的附加内容：运行时高度变化会被 measureElement 重新测量，
              下方行的位置应平滑跟随、不跳动。再次点击收起
            </p>
          ) }
        </div>
      </div>
    )
  }

  const totalItems = Object.values(groups).reduce((sum, items) => sum + items.length, 0)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text">VirtualGroupList（分组收放动画）</h2>
      <p className="text-sm text-text2">
        共
        { ' ' }
        <span className="font-medium text-text">{ totalItems }</span>
        { ' ' }
        条；展开组：
        { expanded.join(' / ') || '（无）' }
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={ () => setExpanded(ALL_EXPANDED) }>
          全部展开
        </Button>
        <Button size="sm" variant="secondary" onClick={ () => setExpanded([]) }>
          全部收起
        </Button>
        <Button size="sm" variant="secondary" onClick={ shuffleItems }>
          打乱长分组
        </Button>
        <label className="ml-auto flex items-center gap-2 text-xs text-text2">
          收放动画
          <Switch checked={ animated } onChange={ setAnimated } />
        </label>
      </div>

      <VirtualGroupList
        sections={ sections }
        renderItem={ renderCard }
        expanded={ expanded }
        onExpandedChange={ setExpanded }
        estimateSize={ 76 }
        layoutAnimation={ GROUP_LIST_LAYOUT_ANIMATION }
        collapseAnimation={ animated
          ? {}
          : undefined }
        className="h-140 rounded-2xl border border-border bg-background p-2"
      />

      <ul className="list-disc pl-5 text-xs leading-relaxed text-text3">
        <li>点击「短分组」与「长分组」对比：3 条和 300 条的收放时长一致，动画中任意一帧内容不重叠</li>
        <li>「层叠预览」默认收起且从未测量过：展开动画的终点应与随后真实行的实测高度一致，收尾不跳不闪</li>
        <li>「全部收起 / 全部展开」走受控 expanded，不经过组头点击，同样播放动画</li>
        <li>「打乱长分组」验证组内可见行的换序动画；点击任意卡片展开长文，验证动态高度重新测量</li>
        <li>关闭「收放动画」后收放为瞬时切换，用于对照</li>
      </ul>
    </section>
  )
}

function shuffleCards(items: MockCard[]) {
  if (items.length < 2) return items

  const next = [...items]
  for (let index = next.length - 1; index > 0; index--) {
    const targetIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = currentItem
  }

  /** 保证原首项仍在首屏内发生位移，连续点击也能明确看到动画 */
  const firstItemIndex = next.indexOf(items[0])
  const [firstItem] = next.splice(firstItemIndex, 1)
  next.splice(Math.min(3, next.length), 0, firstItem)

  return next
}

/** ============ 演示三：吸顶头部 + 圆角滚动容器 ============ */

const STICKY_TURN_PARAGRAPHS = [
  '这是一段回答正文，用来撑出卡片高度，让上一轮的头部有机会被滚到容器顶边。',
  '滚动时留意容器左上角：吸顶头部自己带 rounded-t-2xl，但 section 的底色与滚到头部下方的正文会把圆角外侧填满，圆角形同虚设。',
  '给滚动容器加圆角后，浏览器会按圆角裁剪全部滚动内容，露出的是面板真实的渐变底，比在角上补一块纯色精确。',
  '头部带 backdrop-blur 时是独立合成层；被 section 尾部顶出容器顶边后，Chromium 对合成层只按矩形裁剪，圆角外侧会漏出一圈发白。',
]

/** 每三轮放一条超出单行的长提问，用来演示截断态的悬停提示与点击展开 */
const LONG_QUESTION_TAIL = '请帮我整理这场会议里关于产品路线图、预算分配和人员安排的全部决定，并按优先级排序，'
  + '标出还没有拍板的事项和对应负责人，最后给一版可以直接转发给团队的摘要。'

const STICKY_TURNS: MockTurn[] = Array.from({ length: 12 }, (_, index) => ({
  id: `turn-${index}`,
  question: index % 3 === 1
    ? `第 ${index + 1} 轮提问：${LONG_QUESTION_TAIL}`
    : `第 ${index + 1} 轮提问：这段提问会在滚动时吸顶`,
  paragraphs: STICKY_TURN_PARAGRAPHS.slice(0, (index % STICKY_TURN_PARAGRAPHS.length) + 1),
}))

/** 提问折叠成单行时的高度（px），与文字的 `leading-5` 一致 */
const QUESTION_COLLAPSED_HEIGHT = 20
const QUESTION_HEIGHT_TRANSITION = { duration: 0.25, ease: 'easeInOut' } satisfies Transition

/**
 * 吸顶的提问头部：单行截断，被截断时悬停出完整内容、点击带高度动画展开
 *
 * 没截断就没有「查看全部」可点，也不弹 Tooltip；展开后正文已全部可见，Tooltip 禁用
 */
const StickyQuestionHeader = memo<StickyQuestionHeaderProps>(({ question, blur }) => {
  /** 高度动画的目标态 */
  const [expanded, setExpanded] = useState(false)
  /**
   * 展开态排版（pre-wrap）：展开时同步切换；收起时等高度动画结束再切回单行截断，
   * 否则文字一开始就塌成一行，收缩过程里下面全是空白
   */
  const [layoutExpanded, setLayoutExpanded] = useState(false)
  const { contentRef, isOverflowing } = useTextOverflow({ deps: [question] })
  /** 展开态下文字换行后不再横向溢出，但仍要能点回去 */
  const canToggle = isOverflowing || layoutExpanded

  const toggle = useLatestCallback(() => {
    if (expanded) {
      setExpanded(false)
      return
    }
    if (!isOverflowing) return
    setExpanded(true)
    setLayoutExpanded(true)
  })

  const handleKeyDown = useLatestCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggle()
  })

  /** 高度动画落定：收起完成才切回单行截断；展开或中途反向都不动排版 */
  const handleHeightSettled = useLatestCallback(() => {
    if (!expanded) setLayoutExpanded(false)
  })

  return (
    <div
      className={ cn(
        'sticky top-0 z-10 rounded-t-2xl border-b border-background3 bg-background/90 px-4 py-3 text-sm',
        blur && 'backdrop-blur-sm',
      ) }
    >
      <Tooltip
        content={ question }
        disabled={ !isOverflowing || expanded }
        className="block min-w-0"
        contentClassName="max-h-[60vh] max-w-80 overflow-hidden text-left leading-5 whitespace-pre-wrap wrap-break-word"
      >
        <motion.div
          role={ canToggle
            ? 'button'
            : undefined }
          aria-expanded={ canToggle
            ? expanded
            : undefined }
          tabIndex={ canToggle
            ? 0
            : undefined }
          className={ cn(
            'overflow-hidden transition-colors',
            layoutExpanded
              ? 'text-text'
              : 'text-text2 hover:text-text',
            canToggle && 'cursor-pointer',
          ) }
          initial={ false }
          animate={ { height: expanded
            ? 'auto'
            : QUESTION_COLLAPSED_HEIGHT } }
          transition={ QUESTION_HEIGHT_TRANSITION }
          onAnimationComplete={ handleHeightSettled }
          onClick={ canToggle
            ? toggle
            : undefined }
          onKeyDown={ canToggle
            ? handleKeyDown
            : undefined }
        >
          <div
            ref={ contentRef as RefObject<HTMLDivElement | null> }
            className={ cn(
              'leading-5',
              layoutExpanded
                ? 'hide-scroll max-h-25 overflow-y-auto whitespace-pre-wrap wrap-break-word'
                : 'truncate',
            ) }
          >
            { question }
          </div>
        </motion.div>
      </Tooltip>
    </div>
  )
})

StickyQuestionHeader.displayName = 'StickyQuestionHeader'

/**
 * 「上一轮只剩头部一截」时卡片底边距容器顶边的距离（px）
 *
 * 这时头部已被 section 尾部顶出容器顶边，只有底部几像素可见，是合成层裁剪问题最明显的位置
 */
const TAIL_EDGE_VISIBLE_PX = 8

const SCROLLER_CLIP_CLASS: Record<ScrollerClip, string | undefined> = {
  none: undefined,
  radius: 'rounded-2xl',
  radiusClipPath: 'rounded-2xl [clip-path:inset(0_round_var(--radius-2xl))]',
  mask: undefined,
}

/** 滚动容器上的 CSS 变量：滚动条槽宽（px），由 ResizeObserver 实时量出 */
const SCROLLBAR_GUTTER_VAR = '--demo-scrollbar-gutter'

/** 与卡片同为 16px 圆角的矩形；SVG 不带 viewBox，rx 的用户单位即 CSS px，尺寸由 mask-size 决定 */
const ROUNDED_RECT_MASK = "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'><rect width='100%' height='100%' rx='16' fill='black'/></svg>\")"

/**
 * 双层 mask：内容区一张圆角矩形，宽度扣掉滚动条槽；滚动条列一张全不透明纯色，滑块照常可见
 *
 * border-radius 与 clip-path 都以边框盒为准，而滚动条槽占布局宽度，卡片右边缘在槽内侧，
 * 圆角圆心落在槽外沿，右上角几乎裁不到
 */
const SCROLLER_MASK_STYLE: CSSProperties = {
  maskImage: `${ROUNDED_RECT_MASK}, linear-gradient(black, black)`,
  maskSize: `calc(100% - var(${SCROLLBAR_GUTTER_VAR}, 0px)) 100%, var(${SCROLLBAR_GUTTER_VAR}, 0px) 100%`,
  maskPosition: 'left top, right top',
  maskRepeat: 'no-repeat',
}

/**
 * 只为让行走 `top` 定位：默认的 PlainVirtualRow 用 `transform: translateY` 摆放行，
 * sticky 在布局坐标系里算完再被 transform 整体平移，非首行的吸顶头部会错位到正文中间；
 * 传了 layoutAnimation 后行改用 `top: start`，sticky 才在每一行都正确。数据静态，没有动画会播放
 */
const STICKY_ROW_LAYOUT_ANIMATION = {} satisfies VirtualListLayoutAnimationOptions<MockTurn>

function StickyHeaderDemo() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const gutterObserver = useRef<ResizeObserver | null>(null)
  const [clip, setClip] = useState<ScrollerClip>('mask')
  const [blur, setBlur] = useState(true)

  /** 绑定滚动容器并持续量出滚动条槽宽；槽宽随环境与是否溢出变化，不能写死 */
  const bindScroller = useLatestCallback((el: HTMLDivElement | null) => {
    scrollRef.current = el
    gutterObserver.current?.disconnect()
    gutterObserver.current = null
    if (!el) return

    const observer = new ResizeObserver(() => {
      el.style.setProperty(SCROLLBAR_GUTTER_VAR, `${el.offsetWidth - el.clientWidth}px`)
    })
    observer.observe(el)
    gutterObserver.current = observer
  })

  /** 先回到顶部让首行挂载，再把首轮卡片底边停在容器顶边下方几像素 */
  const scrollToTailEdge = useLatestCallback(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    scroller.scrollTop = 0
    requestAnimationFrame(() => {
      const section = scroller.querySelector<HTMLElement>('[data-index="0"] section')
      if (!section) return
      const offset = section.getBoundingClientRect().bottom - scroller.getBoundingClientRect().top
      scroller.scrollTop = offset - TAIL_EDGE_VISIBLE_PX
    })
  })

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text">吸顶头部 + 圆角滚动容器</h2>
      <p className="text-sm text-text2">
        每轮是一张圆角卡片，提问头部在卡片内 sticky；面板底是渐变色。切换容器裁剪方式对照两种坏状态；
        每三轮有一条被截断的长提问，悬停看完整内容，点击带高度动画展开
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <ButtonGroup active={ clip } onChange={ setClip }>
          <Button name="none" size="sm">不裁剪</Button>
          <Button name="radius" size="sm">border-radius</Button>
          <Button name="radiusClipPath" size="sm">border-radius + clip-path</Button>
          <Button name="mask" size="sm">mask</Button>
        </ButtonGroup>
        <label className="flex items-center gap-2 text-xs text-text2">
          头部毛玻璃
          <Switch checked={ blur } onChange={ setBlur } />
        </label>
        <Button size="sm" variant="secondary" className="ml-auto" onClick={ scrollToTailEdge }>
          定位到「上一轮只剩头部一截」
        </Button>
      </div>

      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-background3 bg-linear-to-b from-systemPurple/5 to-background3 to-50%">
        <div className="flex h-11 shrink-0 items-center px-3 text-sm font-medium text-text">Ask 面板</div>

        <TanstackVirtualList
          scrollRef={ bindScroller }
          data={ STICKY_TURNS }
          estimateSize={ 200 }
          layoutAnimation={ STICKY_ROW_LAYOUT_ANIMATION }
          className={ cn('mx-1.5 h-105', SCROLLER_CLIP_CLASS[clip]) }
          style={ clip === 'mask'
            ? SCROLLER_MASK_STYLE
            : undefined }
        >
          { (turn, index) => (
            <div className={ cn(index < STICKY_TURNS.length - 1 && 'pb-2') }>
              <section className="overflow-clip rounded-2xl bg-background">
                <StickyQuestionHeader question={ turn.question } blur={ blur } />
                <div className="space-y-3 px-4 py-3 text-sm leading-relaxed text-text">
                  { turn.paragraphs.map(paragraph => (
                    <p key={ paragraph }>{ paragraph }</p>
                  )) }
                </div>
              </section>
            </div>
          ) }
        </TanstackVirtualList>
      </div>

      <ul className="list-disc pl-5 text-xs leading-relaxed text-text3">
        <li>「不裁剪」再滚动：吸顶头部的两个上角变直角，因为 section 底色与正文把圆角外侧填成了同色</li>
        <li>「border-radius」并点「定位到上一轮只剩头部一截」：左上角漏出一圈比面板底色发白的模糊边，这是合成层只按矩形裁剪</li>
        <li>同一位置关掉「头部毛玻璃」：发白消失，证明漏边来自 backdrop-filter 的合成层</li>
        <li>「border-radius + clip-path」左上角正常，但右上角仍是直角：滚动条槽占布局宽度，裁剪以边框盒为准，圆角落在槽外沿；系统滚动条设为「总是显示」或接了鼠标时最明显</li>
        <li>「mask」是修复后的状态：圆角矩形只覆盖扣掉槽宽的内容区，滚动条列单独一层全透，两个上角都圆且滑块照常可见</li>
        <li>第 2 / 5 / 8 / 11 轮的长提问：悬停出完整内容的 Tooltip，点击高度动画展开、再点收起；收起时先跑动画再切回单行截断。短提问既不可点也不弹 Tooltip</li>
      </ul>
    </section>
  )
}

type ScrollerClip = 'none' | 'radius' | 'radiusClipPath' | 'mask'

type MockTurn = {
  id: string
  question: string
  paragraphs: string[]
}

type StickyQuestionHeaderProps = {
  question: string
  /** 头部是否带 backdrop-blur，演示合成层裁剪问题 */
  blur: boolean
}

type GroupKey = typeof GROUP_KEYS[number]

function TestTanstackVirtualPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text">TanstackVirtual 演示</h1>
          <ThemeToggle />
        </div>

        <BasicListDemo />
        <GroupListDemo />
        <StickyHeaderDemo />
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default TestTanstackVirtualPage
