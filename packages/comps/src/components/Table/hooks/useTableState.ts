import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import type { TableProps } from '../types'
import { useState } from 'react'

/**
 * 封装表格状态管理的 Hook，支持受控和非受控模式
 */
export function useTableState<TData extends object>(props: TableProps<TData>) {
  const {
    sorting: controlledSorting,
    onSortingChange: setControlledSorting,
    globalFilter: controlledGlobalFilter,
    onGlobalFilterChange: setControlledGlobalFilter,
    pagination: controlledPagination,
    onPaginationChange: setControlledPagination,
  } = props

  // ======================
  // * 支持受控和非受控模式
  // ======================
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const sorting = controlledSorting ?? internalSorting

  const [internalGlobalFilter, setInternalGlobalFilter] = useState('')
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 30,
  })
  const pagination = controlledPagination ?? internalPagination

  // ======================
  // * OnChangeFn 包装器
  // ======================
  const setSorting: OnChangeFn<SortingState> = (updaterOrValue) => {
    const newSorting = typeof updaterOrValue === 'function'
      ? updaterOrValue(sorting)
      : updaterOrValue
    setControlledSorting?.(newSorting) ?? setInternalSorting(newSorting)
  }

  const setGlobalFilter: OnChangeFn<string> = (updaterOrValue) => {
    const newFilter = typeof updaterOrValue === 'function'
      ? updaterOrValue(globalFilter)
      : updaterOrValue
    setControlledGlobalFilter?.(newFilter) ?? setInternalGlobalFilter(newFilter)
  }

  const setPagination: OnChangeFn<PaginationState> = (updaterOrValue) => {
    const newPagination = typeof updaterOrValue === 'function'
      ? updaterOrValue(pagination)
      : updaterOrValue
    setControlledPagination?.(newPagination) ?? setInternalPagination(newPagination)
  }

  return {
    sorting,
    globalFilter,
    pagination,
    setSorting,
    setGlobalFilter,
    setPagination,
  }
}
