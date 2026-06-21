import type { VirtualGroupListProps, VirtualGroupRow, VirtualGroupSection } from './types'
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

/**
 * 分组虚拟列表的状态编排：
 * - 展开态：受控 / 非受控双模式；非受控用「用户切换记录」叠加默认值，
 *   异步晚到的新分组也能按默认态展示
 * - 行模型：sections 拍平为 header/item/preview/loader 异构行
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
  } = params

  /** 用户手动切换记录（仅非受控模式参与展开态计算） */
  const [toggledMap, setToggledMap] = useState<Record<string, boolean>>({})

  /**
   * 组内 loadMore 在途状态（驱动组尾 loading 行展示）
   * 不依赖 section.loading：调用方的 loading 往往只覆盖首屏加载（如 RQ 的
   * isLoading 在 fetchNextPage 期间为 false），翻页 loading 必须由组件自管
   */
  const [loadingKeys, setLoadingKeys] = useState<ReadonlySet<string>>(new Set())

  const toggleSection = useLatestCallback((key: string) => {
    const target = sections.find(section => section.key === key)
    if (!target || !target.header || target.collapsible === false)
      return

    const willExpand = !resolveExpanded(target, expanded, toggledMap, defaultExpanded)
    const nextExpandedKeys = sections
      .filter(section => section.key === key
        ? willExpand
        : resolveExpanded(section, expanded, toggledMap, defaultExpanded))
      .map(section => section.key)

    if (!expanded) {
      setToggledMap(prev => ({ ...prev, [key]: willExpand }))
    }
    onExpandedChange?.(nextExpandedKeys)
  })

  const rows = useMemo(() => {
    const keyOf = (item: T, index: number) => getItemKey
      ? getItemKey(item, index)
      : ((item as { id?: string | number })?.id ?? index)

    const result: VirtualGroupRow<T>[] = []

    for (const section of sections) {
      const sectionExpanded = resolveExpanded(section, expanded, toggledMap, defaultExpanded)

      if (section.header) {
        result.push({
          type: 'header',
          key: `header-${section.key}`,
          section,
          expanded: sectionExpanded,
        })
      }

      if (sectionExpanded) {
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
          })
        })

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
  }, [sections, expanded, toggledMap, defaultExpanded, showLoading, getItemKey, loadingKeys])

  /** 每组的「尾行」索引：最后一个 item 行或 loader 行，作为组内加载更多的触发锚点 */
  const sectionTails = useMemo(() => {
    const tails: { rowIndex: number, section: VirtualGroupSection<T> }[] = []

    rows.forEach((row, rowIndex) => {
      if (
        (row.type === 'item' && row.ctx.isLast)
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
    handleVisibleRangeChange,
  }
}

type UseVirtualGroupParams<T> = {
  sections: VirtualGroupSection<T>[]
  expanded: string[] | undefined
  defaultExpanded: string[] | undefined
  onExpandedChange: VirtualGroupListProps<T>['onExpandedChange']
  /** 原样透传的 key 提取（默认值在行模型内收口为 id ?? indexInSection） */
  getItemKey: VirtualGroupListProps<T>['getItemKey']
  showLoading: boolean
}
