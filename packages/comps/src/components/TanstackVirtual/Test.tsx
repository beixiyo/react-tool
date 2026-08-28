'use client'

import type { VirtualGroupItemCtx, VirtualGroupLayoutAnimationOptions, VirtualGroupSection } from './types'
import { ChevronDown } from 'lucide-react'
import type { Transition } from 'motion/react'
import { useState } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { StackedCards } from '../Card'
import { GithubSourceLink } from '../GithubSourceLink'
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

/** ============ 演示二：VirtualGroupList 分组与排序动画 ============ */

const INITIAL_GROUPS: Record<GroupKey, MockCard[]> = {
  short: Array.from({ length: 4 }, (_, index) => makeCard('short', index)),
  long: makePage('long', 0),
  stacked: Array.from({ length: 6 }, (_, index) => makeCard('stacked', index)),
}

const GROUP_TITLES: Record<GroupKey, string> = {
  short: '短分组',
  long: '长分组',
  stacked: '层叠预览',
}

function GroupListDemo() {
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [expanded, setExpanded] = useState<string[]>(['short', 'long'])

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

  const sections: VirtualGroupSection<MockCard>[] = (['short', 'long', 'stacked'] as const).map(key => ({
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
      <h2 className="text-lg font-semibold text-text">VirtualGroupList（分组与排序动画）</h2>
      <p className="text-sm text-text2">
        共
        { ' ' }
        <span className="font-medium text-text">{ totalItems }</span>
        { ' ' }
        条；展开组：
        { expanded.join(' / ') || '（无）' }
      </p>

      <Button className="self-start" size="sm" variant="secondary" onClick={ shuffleItems }>
        打乱顺序
      </Button>

      <VirtualGroupList
        sections={ sections }
        renderItem={ renderCard }
        expanded={ expanded }
        onExpandedChange={ setExpanded }
        estimateSize={ 76 }
        layoutAnimation={ GROUP_LIST_LAYOUT_ANIMATION }
        className="h-140 rounded-2xl border border-border bg-background p-2"
      />

      <ul className="list-disc pl-5 text-xs leading-relaxed text-text3">
        <li>点击「短分组」或「长分组」验证不同内容高度的折叠动画</li>
        <li>点击「打乱顺序」验证长分组内可见行的排序动画</li>
        <li>点击任意卡片展开长文，验证动态高度重新测量</li>
        <li>长短分组折叠统一使用 0.45s spring；离屏组头保持挂载，长列表也能看到连续位移</li>
        <li>底部「层叠预览」默认收起，点击组头或层叠卡片可展开</li>
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

type GroupKey = 'long' | 'short' | 'stacked'

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
