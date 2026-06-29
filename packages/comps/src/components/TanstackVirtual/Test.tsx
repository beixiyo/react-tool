'use client'

import type { VirtualGroupItemCtx, VirtualGroupSection } from './types'
import { ChevronDown, Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from 'utils'
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
        className="h-[420px] rounded-2xl border border-border bg-background2"
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

/** ============ 演示二：VirtualGroupList 分组列表（模拟 cards 页场景） ============ */

type GroupState = {
  items: MockCard[]
  page: number
  totalPages: number
  loading: boolean
}

const INITIAL_GROUPS: Record<string, GroupState> = {
  important: {
    items: Array.from({ length: 6 }, (_, i) => makeCard('important', i)),
    page: 1,
    totalPages: 1,
    loading: false,
  },
  ongoing: { items: makePage('ongoing', 0), page: 1, totalPages: 3, loading: false },
  taskPool: { items: makePage('taskPool', 0), page: 1, totalPages: 6, loading: false },
  /** 已完成组初始为空，展开后由 loader 行自动拉首页 */
  done: { items: [], page: 0, totalPages: 12, loading: false },
}

const GROUP_TITLES: Record<string, string> = {
  ongoing: '进行中',
  taskPool: '任务池',
  done: '已完成',
}

function GroupListDemo() {
  const [groups, setGroups] = useState(INITIAL_GROUPS)
  const [expanded, setExpanded] = useState<string[]>(['important', 'ongoing'])

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

  const loadMore = async (key: string) => {
    setGroups(prev => ({
      ...prev,
      [key]: { ...prev[key], loading: true },
    }))

    await new Promise(resolve => setTimeout(resolve, 600))

    setGroups((prev) => {
      const group = prev[key]
      return {
        ...prev,
        [key]: {
          ...group,
          items: [...group.items, ...makePage(key, group.page)],
          page: group.page + 1,
          loading: false,
        },
      }
    })
  }

  const groupHeader = (title: string, group: GroupState) => (isExpanded: boolean) => (
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
        { group.items.length }
        { ' ' }
        /
        { ' ' }
        { group.totalPages * PAGE_SIZE }
      </span>
    </div>
  )

  const buildPreview = (items: MockCard[]) => {
    if (items.length === 0)
      return undefined

    return (
      <div className="px-1 pb-2">
        <StackedCards
          autoHeight
          variant="background"
          layers={ Math.min(items.length, 2) as 1 | 2 }
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
  }

  const sections: VirtualGroupSection<MockCard>[] = [
    {
      key: 'important',
      collapsible: false,
      header: (
        <div className="flex h-10 items-center gap-1.5 px-3">
          <Star size={ 14 } className="shrink-0 fill-systemOrange text-systemOrange" />
          <h2 className="text-sm font-semibold text-systemOrange">重要</h2>
        </div>
      ),
      items: groups.important.items,
    },
    ...(['ongoing', 'taskPool', 'done'] as const).map(key => ({
      key,
      header: groupHeader(GROUP_TITLES[key], groups[key]),
      items: groups[key].items,
      collapsedPreview: buildPreview(groups[key].items),
      hasMore: groups[key].page < groups[key].totalPages,
      loadMore: () => loadMore(key),
      loading: groups[key].loading,
    })),
  ]

  const renderCard = (card: MockCard, ctx: VirtualGroupItemCtx<MockCard>) => {
    const isImportant = ctx.section.key === 'important'
    const isOpened = openedIds.has(card.id)

    /** 重要组：橙框容器由首末行圆角 + 分割线拼接，演示 ctx 的用法 */
    if (isImportant) {
      return (
        <div
          className={ cn(
            'cursor-pointer border-x border-systemOrange bg-background2 px-4 py-3 transition-colors hover:bg-background3/60',
            ctx.isFirst && 'rounded-t-2xl border-t',
            ctx.isLast && 'rounded-b-2xl border-b',
            !ctx.isFirst && 'border-t border-t-border/60',
          ) }
          onClick={ () => toggleCard(card.id) }
        >
          <div className="text-sm font-medium text-text">{ card.title }</div>
          <p className={ cn('mt-1 text-sm leading-relaxed text-text2', !isOpened && 'truncate') }>
            { card.desc }
          </p>
        </div>
      )
    }

    /** 普通组：间距用 padding 实现（margin 不参与测量会导致滚动漂移） */
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
              下方行的位置应平滑跟随、不跳动。再次点击收起。
            </p>
          ) }
        </div>
      </div>
    )
  }

  const totalLoaded = Object.values(groups).reduce((sum, g) => sum + g.items.length, 0)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-text">VirtualGroupList（分组列表，模拟 cards 页）</h2>
      <p className="text-sm text-text2">
        已加载
        { ' ' }
        <span className="font-medium text-text">{ totalLoaded }</span>
        { ' ' }
        条；展开组：
        { expanded.join(' / ') || '（无）' }
      </p>

      <VirtualGroupList
        sections={ sections }
        renderItem={ renderCard }
        expanded={ expanded }
        onExpandedChange={ setExpanded }
        estimateSize={ 76 }
        className="h-[560px] rounded-2xl border border-border bg-background p-2"
      />

      <ul className="list-disc pl-5 text-xs leading-relaxed text-text3">
        <li>整个列表只有一个滚动条，组头/卡片/收起预览/loading 全部是虚拟行</li>
        <li>收起的组展示 StackedCards 堆叠预览，点击预览或组头展开</li>
        <li>「已完成」初始为空，首次展开时由 loader 行自动拉取首页</li>
        <li>滚动到某组最后一项时自动加载该组下一页（每页 20 条，模拟 600ms 延迟）</li>
        <li>点击任意卡片展开长文，验证运行时高度变化的重新测量</li>
      </ul>
    </section>
  )
}

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
