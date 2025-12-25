import type { ColumnDef, TableOptions, TableState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

/**
 * 创建 TanStack Table 实例的 Hook
 */
export function useTableInstance<TData extends object>(
  data: TData[],
  columns: ColumnDef<TData>[],
  state: Partial<TableState>,
  enableVirtualization: boolean,
) {
  // TanStack Table 核心配置
  const tableOptions: TableOptions<TData> = {
    data,
    columns,
    state,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  }

  /** 根据是否启用虚拟滚动来决定是否添加分页配置 */
  if (!enableVirtualization) {
    tableOptions.getPaginationRowModel = getPaginationRowModel()
  }

  const table = useReactTable(tableOptions)

  return table
}
