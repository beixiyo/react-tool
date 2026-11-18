import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { TanstackVirtualListRef, VirtualGroupListProps, VirtualGroupRow } from '../types'

/** 将按 item key 定位的请求同步到虚拟行；目标在收起组内时先请求展开 */
export function useVirtualGroupScrollTarget<T>(options: VirtualGroupScrollTargetOptions<T>) {
  const { rows, getItemKey, scrollTarget, followScrollTarget, toggleSection } = options

  const reduceMotion = useReducedMotion()
  const listRef = useRef<TanstackVirtualListRef>(null)
  const handledTarget = useRef<{ request: NonNullable<typeof scrollTarget>; index: number }>(undefined)
  const requestedExpansion = useRef<typeof scrollTarget>(undefined)
  const matchesTarget = (item: T, index: number) =>
    (
      getItemKey
        ? getItemKey(item, index)
        : (item as { id?: string | number })?.id ?? index
    ) === scrollTarget?.itemKey

  const targetIndex = scrollTarget
    ? rows.findIndex((row) => row.type === 'item' && !row.transition && matchesTarget(row.item, row.ctx.indexInSection))
    : -1
  const collapsedSectionKey = scrollTarget && targetIndex < 0
    ? rows.find((row) => row.type === 'header' && !row.expanded && row.section.items.some(matchesTarget))?.section.key
    : undefined

  useEffect(
    () => {
      if (!scrollTarget) return
      const handled = handledTarget.current

      if (handled?.request === scrollTarget && (!followScrollTarget || handled.index === targetIndex)) return
      if (targetIndex >= 0 && listRef.current) {
        handledTarget.current = { request: scrollTarget, index: targetIndex }
        listRef.current.scrollToIndex(targetIndex, {
          align: scrollTarget.align,
          behavior: reduceMotion
            ? 'auto'
            : scrollTarget.behavior ?? 'smooth',
        })
      }
      else if (collapsedSectionKey !== undefined && requestedExpansion.current !== scrollTarget) {
        requestedExpansion.current = scrollTarget
        toggleSection(collapsedSectionKey)
      }
    },
    [
      scrollTarget,
      targetIndex,
      collapsedSectionKey,
      toggleSection,
      followScrollTarget,
      reduceMotion,
    ],
  )

  return listRef
}

type VirtualGroupScrollTargetOptions<T> =
  & Pick<VirtualGroupListProps<T>, 'getItemKey' | 'scrollTarget'>
  & {
    rows: readonly VirtualGroupRow<T>[]
    followScrollTarget: boolean
    toggleSection: (key: string) => void
  }
