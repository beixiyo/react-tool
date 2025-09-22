import type { PaginationState, SortingState, TableOptions } from '@tanstack/react-table'
import type { TableProps } from '../types'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

/**
 * 封装 TanStack Table 状态管理和实例创建的 Hook
 */
export function useTableState<TData extends object>(props: TableProps<TData>) {
  const {
    data,
    columns,
    enableVirtualization = false,
    sorting: controlledSorting,
    onSortingChange: setControlledSorting,
    globalFilter: controlledGlobalFilter,
    onGlobalFilterChange: setControlledGlobalFilter,
    pagination: controlledPagination,
    onPaginationChange: setControlledPagination,
  } = props

  /** 状态管理：支持受控和非受控模式 */
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const sorting = controlledSorting ?? internalSorting
  const setSorting = setControlledSorting ?? setInternalSorting

  const [internalGlobalFilter, setInternalGlobalFilter] = useState('')
  const globalFilter = controlledGlobalFilter ?? internalGlobalFilter
  const setGlobalFilter = setControlledGlobalFilter ?? setInternalGlobalFilter

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 30,
  })
  const pagination = controlledPagination ?? internalPagination
  const setPagination = setControlledPagination ?? setInternalPagination

  // TanStack Table 核心配置
  const tableOptions: TableOptions<TData> = {
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  }

  /** 根据是否启用虚拟滚动来决定是否添加分页配置 */
  if (!enableVirtualization) {
    tableOptions.state!.pagination = pagination
    tableOptions.onPaginationChange = setPagination
    tableOptions.getPaginationRowModel = getPaginationRowModel()
  }

  const table = useReactTable(tableOptions)

  return { table }
}
