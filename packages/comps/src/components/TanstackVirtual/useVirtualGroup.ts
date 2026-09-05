import type {
  VirtualGroupListProps,
  VirtualGroupRow,
  VirtualGroupSection,
  VirtualSizeTransitionDirection,
} from './types'
import { onUnmounted, useLatestCallback } from 'hooks'
import { useMemo, useRef, useState } from 'react'

/**
 * 解析分组展开态（纯函数，供 memo 与回调共用）
 * 优先级：不可折叠恒展开 > 受控 expanded > 用户切换记录 > defaultExpanded（缺省全展开）
 */
function resolveExpanded<T>(
  section: VirtualGroupSection<T>,
  expanded: string[] | undefined,
  toggledMap: Record<string, boolean>,
  defaultExpanded: string[] | undefined,
): boolean {
  if (!section.header || section.collapsible === false)
    return true

  if (expanded)
    return expanded.includes(section.key)

  return toggledMap[section.key] ?? (defaultExpanded
    ? defaultExpanded.includes(section.key)
    : true)
}

/** 收放期间某分组涉及的驱动组；全部播完后才切回终态行模型 */
function transitionGroupsOf<T>(
  section: VirtualGroupSection<T>,
  direction: VirtualSizeTransitionDirection,
) {
  const groups = [`items:${section.key}`]
  if (direction === 'expand' && section.collapsedPreview)
    groups.push(`preview:${section.key}`)

  return groups
}

/**
 * 分组虚拟列表的状态编排：
 * - 展开态：受控 / 非受控双模式；非受控用「用户切换记录」叠加默认值，
 *   异步晚到的新分组也能按默认态展示
 * - 行模型：sections 拍平为 header/item/preview/loader 异构行
 * - 收放动画：展开态翻转不直接增删行，整组 item 行先留在行模型里、标记为
 *   尺寸驱动，等驱动组全部播完才落到真正的终态行模型。动画由「展开态变化」
 *   派生而非由点击派生，受控方式改 expanded 同样会播
 * - 分组级加载：可视范围触达某组尾行（最后一项或 loader 行）时触发该组 loadMore，
 *   带在途守卫防重复请求
 */
export function useVirtualGroup<T>(params: UseVirtualGroupParams<T>) {
  const {
    sections,
    expanded,
    defaultExpanded,
    onExpandedChange,
    getItemKey,
    showLoading,
    animateCollapse,
  } = params

  /** 用户手动切换记录（仅非受控模式参与展开态计算） */
  const [toggledMap, setToggledMap] = useState<Record<string, boolean>>({})

  /**
   * 组内 loadMore 在途状态（驱动组尾 loading 行展示）
   * 不依赖 section.loading：调用方的 loading 往往只覆盖首屏加载（如 RQ 的
   * isLoading 在 fetchNextPage 期间为 false），翻页 loading 必须由组件自管
   */
  const [loadingKeys, setLoadingKeys] = useState<ReadonlySet<string>>(new Set())

  const expandedMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const section of sections)
      map[section.key] = resolveExpanded(section, expanded, toggledMap, defaultExpanded)
    return map
  }, [sections, expanded, toggledMap, defaultExpanded])
  const expandedSignature = useMemo(() => JSON.stringify(expandedMap), [expandedMap])

  /**
   * 正在播放收放动画的分组
   *
   * 这里是「视觉终态」和「行模型终态」之间的缓冲：expanded 一点即到终态，
   * 而行模型要等动画把高度走完才切换，否则 virtualizer 的几何会先跳到终态
   */
  const [transitions, setTransitions] = useState<Record<string, SectionTransition>>({})
  /** 上一次已消费的展开态快照，用于在渲染期识别本轮翻转了哪些分组 */
  const [committed, setCommitted] = useState({ signature: expandedSignature, map: expandedMap })

  if (committed.signature !== expandedSignature) {
    const next: Record<string, SectionTransition> = {}
    let changed = false

    for (const section of sections) {
      const previous = committed.map[section.key]
      const current = expandedMap[section.key]
      const running = transitions[section.key]

      if (running) next[section.key] = running
      if (previous === undefined || previous === current) continue
      /** 空组没有高度可动，直接落终态，免得驱动组卡在 0 高度上等一轮动画 */
      if (!animateCollapse || section.items.length === 0) continue

      const direction = current
        ? 'expand'
        : 'collapse'
      next[section.key] = {
        direction,
        groups: transitionGroupsOf(section, direction),
        settledGroups: [],
      }
      changed = true
    }

    /** 分组消失（切视图、数据换源）时一并清掉残留动画态 */
    if (Object.keys(next).length !== Object.keys(transitions).length) changed = true

    setCommitted({ signature: expandedSignature, map: expandedMap })
    if (changed) setTransitions(next)
  }

  const toggleSection = useLatestCallback((key: string) => {
    const target = sections.find(section => section.key === key)
    if (!target || !target.header || target.collapsible === false)
      return

    const willExpand = !expandedMap[key]
    const nextExpandedKeys = sections
      .filter(section => section.key === key
        ? willExpand
        : expandedMap[section.key])
      .map(section => section.key)

    if (!expanded) {
      setToggledMap(prev => ({ ...prev, [key]: willExpand }))
    }
    onExpandedChange?.(nextExpandedKeys)
  })

  /** 某个驱动组播完；该分组所有驱动组都播完才把行模型切到终态 */
  const settleGroup = useLatestCallback((group: string | number) => {
    setTransitions((prev) => {
      const entry = Object.entries(prev).find(([, running]) => running.groups.includes(String(group)))
      if (!entry) return prev

      const [sectionKey, running] = entry
      if (running.settledGroups.includes(String(group))) return prev

      const settledGroups = [...running.settledGroups, String(group)]
      const next = { ...prev }

      if (running.groups.every(item => settledGroups.includes(item)))
        delete next[sectionKey]
      else
        next[sectionKey] = { ...running, settledGroups }

      return next
    })
  })

  const rows = useMemo(() => {
    const keyOf = (item: T, index: number) => getItemKey
      ? getItemKey(item, index)
      : ((item as { id?: string | number })?.id ?? index)

    const result: VirtualGroupRow<T>[] = []

    for (const section of sections) {
      const sectionExpanded = expandedMap[section.key]
      const transition = transitions[section.key]

      if (section.header) {
        result.push({
          type: 'header',
          key: `header-${section.key}`,
          section,
          expanded: sectionExpanded,
        })
      }

      if (transition || sectionExpanded) {
        section.items.forEach((item, index) => {
          result.push({
            type: 'item',
            key: `item-${section.key}-${keyOf(item, index)}`,
            section,
            item,
            ctx: {
              section,
              indexInSection: index,
              isFirst: index === 0,
              isLast: index === section.items.length - 1,
            },
            transition: transition
              ? { group: `items:${section.key}`, direction: transition.direction }
              : undefined,
          })
        })
      }

      if (transition) {
        if (transition.direction === 'expand' && section.collapsedPreview) {
          /** 展开：预览行留在组体下方，从自身高度缩到 0 */
          result.push({
            type: 'preview',
            key: `preview-${section.key}`,
            section,
            transition: { group: `preview:${section.key}`, direction: 'collapse' },
          })
        }
        else if (transition.direction === 'collapse' && section.collapsedPreview) {
          /** 收起：预览行从一开始就以普通行出现在组体下方，动画结束时几何已是终态 */
          result.push({
            type: 'preview',
            key: `preview-${section.key}`,
            section,
          })
        }
      }
      else if (sectionExpanded) {
        /** 加载中（外部 loading 或组件自管的翻页在途）、或空组待拉首页时，挂一个 loader 行（兼作可视触发锚点） */
        const needLoader = showLoading
          && (
            section.loading
            || loadingKeys.has(section.key)
            || (section.items.length === 0 && section.hasMore)
          )
        if (needLoader) {
          result.push({
            type: 'loader',
            key: `loader-${section.key}`,
            section,
          })
        }
      }
      else if (section.collapsedPreview) {
        result.push({
          type: 'preview',
          key: `preview-${section.key}`,
          section,
        })
      }
    }

    return result
  }, [sections, expandedMap, transitions, showLoading, getItemKey, loadingKeys])

  /** 每组的「尾行」索引：最后一个 item 行或 loader 行，作为组内加载更多的触发锚点 */
  const sectionTails = useMemo(() => {
    const tails: { rowIndex: number, section: VirtualGroupSection<T> }[] = []

    rows.forEach((row, rowIndex) => {
      if (
        (row.type === 'item' && row.ctx.isLast && !row.transition)
        || (row.type === 'loader' && row.section.items.length === 0)
      ) {
        tails.push({ rowIndex, section: row.section })
      }
    })

    return tails
  }, [rows])

  /** 在途请求守卫，防止可视范围高频回调期间重复发起同组请求 */
  const inflightRef = useRef(new Set<string>())

  /** 卸载守卫，防止 loadMore 在途时组件卸载后仍 setLoadingKeys */
  const mountedRef = useRef(true)
  onUnmounted(() => {
    mountedRef.current = false
  })

  /**
   * 普通渲染期闭包，不能用 useLatestCallback 稳定化：
   * virtualizer 在 layout effect 阶段就会回调（早于 useLatestRef 的 ref 更新），
   * 稳定化会读到上一轮的 sectionTails 导致触发错位
   */
  const handleVisibleRangeChange = (startIndex: number, endIndex: number) => {
    for (const { rowIndex, section } of sectionTails) {
      if (rowIndex < startIndex || rowIndex > endIndex)
        continue
      if (!section.hasMore || !section.loadMore || section.loading)
        continue
      if (inflightRef.current.has(section.key))
        continue

      inflightRef.current.add(section.key)
      setLoadingKeys((prev) => {
        const next = new Set(prev)
        next.add(section.key)
        return next
      })

      section.loadMore().finally(() => {
        inflightRef.current.delete(section.key)
        if (!mountedRef.current)
          return
        setLoadingKeys((prev) => {
          const next = new Set(prev)
          next.delete(section.key)
          return next
        })
      })
    }
  }

  return {
    rows,
    toggleSection,
    settleGroup,
    handleVisibleRangeChange,
  }
}

type SectionTransition = {
  direction: VirtualSizeTransitionDirection
  /** 本轮涉及的驱动组 */
  groups: string[]
  /** 已播完的驱动组 */
  settledGroups: string[]
}

type UseVirtualGroupParams<T> = {
  sections: VirtualGroupSection<T>[]
  expanded: string[] | undefined
  defaultExpanded: string[] | undefined
  onExpandedChange: VirtualGroupListProps<T>['onExpandedChange']
  /** 原样透传的 key 提取（默认值在行模型内收口为 id ?? indexInSection） */
  getItemKey: VirtualGroupListProps<T>['getItemKey']
  showLoading: boolean
  /** 是否走收放动画；关闭时展开态翻转即刻切换行模型 */
  animateCollapse: boolean
}
