import { useLatestCallback } from 'hooks'
import type { KeyboardEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

/**
 * 固定列数的选项网格键盘导航（月份、年份面板）
 *
 * - roving tabindex：只有一个选项可被 Tab 聚焦
 * - 左右 ±1、上下 ±columns，遇到禁用项沿同方向继续寻找，不循环
 * - Home / End 到当前行首 / 行末的首个可用项
 * - Enter / Space 由选项 button 原生触发点击
 */
export function useRovingGrid({
  count,
  columns,
  selectedIndex,
  isDisabled,
}: UseRovingGridOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const pendingFocusRef = useRef(false)

  const isUsable = (index: number | null | undefined): index is number => index != null && index >= 0 && index < count && !isDisabled(index)

  const activeIndex = isUsable(focusedIndex)
    ? focusedIndex
    : isUsable(selectedIndex)
    ? selectedIndex
    : Array.from({ length: count }, (_, index) => index).find((index) => isUsable(index)) ?? -1

  useEffect(() => {
    if (!pendingFocusRef.current || activeIndex < 0) return
    pendingFocusRef.current = false
    itemRefs.current[activeIndex]?.focus()
  }, [activeIndex])

  const findEnabled = (start: number, step: number, bound?: number) => {
    for (let index = start; index >= 0 && index < count; index += step) {
      if (
        bound !== undefined && (step > 0
          ? index > bound
          : index < bound)
      ) {
        return -1
      }
      if (!isDisabled(index)) return index
    }
    return -1
  }

  const onKeyDown = useLatestCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || activeIndex < 0) return

    const rowStart = activeIndex - activeIndex % columns
    const rowEnd = Math.min(rowStart + columns - 1, count - 1)
    let target: number

    switch (event.key) {
      case 'ArrowLeft':
        target = findEnabled(activeIndex - 1, -1)
        break
      case 'ArrowRight':
        target = findEnabled(activeIndex + 1, 1)
        break
      case 'ArrowUp':
        target = findEnabled(activeIndex - columns, -columns)
        break
      case 'ArrowDown':
        target = findEnabled(activeIndex + columns, columns)
        break
      case 'Home':
        target = findEnabled(rowStart, 1, rowEnd)
        break
      case 'End':
        target = findEnabled(rowEnd, -1, rowStart)
        break
      default:
        return
    }

    event.preventDefault()
    if (target < 0 || target === activeIndex) return

    pendingFocusRef.current = true
    setFocusedIndex(target)
  })

  /** 返回选项 button 需要的 roving 属性 */
  const getItemNavProps = (index: number) => ({
    tabIndex: index === activeIndex
      ? 0
      : -1,
    ref: (node: HTMLButtonElement | null) => {
      itemRefs.current[index] = node
    },
    onFocus: () => {
      if (focusedIndex !== index) setFocusedIndex(index)
    },
  })

  return {
    activeIndex,
    onKeyDown,
    getItemNavProps,
  }
}

/** 把一维列表按列数切成行，供 role="row" 渲染 */
export function chunkRows<T>(items: T[], columns: number): T[][] {
  const rows: T[][] = []
  for (let index = 0; index < items.length; index += columns) {
    rows.push(items.slice(index, index + columns))
  }
  return rows
}

export interface UseRovingGridOptions {
  /** 选项总数 */
  count: number
  /** 每行列数 */
  columns: number
  /** 已选中项索引，作为初始可聚焦项 */
  selectedIndex?: number
  /** 选项是否禁用 */
  isDisabled: (index: number) => boolean
}
