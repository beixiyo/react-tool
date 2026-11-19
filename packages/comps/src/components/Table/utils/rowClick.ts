import type { Row } from '@tanstack/react-table'
import type { MouseEvent } from 'react'

/**
 * 行点击处理：普通表体与虚拟表体共用
 * - 来自复选框的点击交给复选框自身处理，不触发行选中切换和外部 onClick
 * - 开启 `selectOnRowClick` 时点击行切换选中
 */

/** 判断事件目标是否位于复选框内 */
export function isFromCheckbox(target: EventTarget | null) {
  return target instanceof Element
    && target.closest('input[type="checkbox"], [role="checkbox"]') !== null
}

/** 创建单行的点击处理函数 */
export function createRowClickHandler<TData>(options: CreateRowClickHandlerOptions<TData>) {
  const { row, enableRowSelection, selectOnRowClick, onClick } = options

  return (e: MouseEvent<HTMLTableRowElement>) => {
    if (isFromCheckbox(e.target)) {
      return
    }
    if (enableRowSelection && selectOnRowClick) {
      row.toggleSelected()
    }
    onClick?.(e)
  }
}

export type CreateRowClickHandlerOptions<TData> = {
  row: Row<TData>
  enableRowSelection: boolean
  selectOnRowClick: boolean
  /** 调用方经 getRowProps 传入的行点击回调 */
  onClick?: (e: MouseEvent<HTMLTableRowElement>) => void
}
