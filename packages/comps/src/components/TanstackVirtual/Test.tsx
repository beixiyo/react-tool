'use client'

import type { VirtualGroupItemCtx, VirtualGroupLayoutAnimationOptions, VirtualGroupSection } from './types'
import { ChevronDown } from 'lucide-react'
import type { Transition } from 'motion/react'
import { useState } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { StackedCards } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
import { Switch } from '../Switch'
import { ThemeToggle } from '../ThemeToggle'
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
      </div>

      <GithubSourceLink />
    </div>
  )
}

export default TestTanstackVirtualPage
