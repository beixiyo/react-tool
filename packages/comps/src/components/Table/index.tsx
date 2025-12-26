import type { Table as TableInstance } from '@tanstack/react-table'
import type { TableProps } from './types'

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { TableBody } from './components/TableBody'
import { TableHeader } from './components/TableHeader'
import { VirtualizedBody } from './components/VirtualizedBody'
import { useTableState } from './hooks/useTableState'

function InnerTable<TData extends object>(props: TableProps<TData>, ref: React.Ref<TableInstance<TData> | null>) {
  const {
    style,
    className,
    data,
    columns,
    enableVirtualization = false,
    enableRowSelection = false,
    enableEditing = false,
    onSelectionChange,
    onEditStart,
    onEditCancel,
    onEditSave,
  } = props

  const {
    sorting,
    globalFilter,
    pagination,
    rowSelection,
    columnVisibility,
    columnOrder,
    setSorting,
    setGlobalFilter,
    setPagination,
    setRowSelection,
    setColumnVisibility,
    setColumnOrder,
  } = useTableState(props)

  const table = useReactTable({
    data,
    columns,
    enableRowSelection,
    state: {
      sorting,
      globalFilter,
      ...(!enableVirtualization && { pagination }),
      ...(enableRowSelection && { rowSelection }),
      columnVisibility,
      columnOrder,
    },

    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    ...(enableRowSelection && { onRowSelectionChange: setRowSelection }),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,

    ...(!enableVirtualization && { onPaginationChange: setPagination }),
    ...(!enableVirtualization && { getPaginationRowModel: getPaginationRowModel() }),

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    /**
     * 当筛选或排序变化时，自动重置分页索引到第一页
     * 注意：如果使用 manualPagination，此选项默认为 false
     */
    autoResetPageIndex: !enableVirtualization,
  })

  useImperativeHandle(ref, () => table, [table])

  /** 使用 ref 跟踪上一次的 rowSelection，避免初始化时触发 */
  const prevRowSelectionRef = useRef<string>(JSON.stringify(rowSelection))
  const isInitialMount = useRef(true)

  /** 监听 rowSelection 变化，使用最新的状态调用 onSelectionChange */
  useEffect(() => {
    const currentRowSelectionStr = JSON.stringify(rowSelection)

    /** 跳过初始化时的调用 */
    if (isInitialMount.current) {
      isInitialMount.current = false
      prevRowSelectionRef.current = currentRowSelectionStr
      return
    }

    /** 只在 rowSelection 真正变化时调用 */
    if (enableRowSelection && onSelectionChange && prevRowSelectionRef.current !== currentRowSelectionStr) {
      /** 使用 table.getState().rowSelection 获取最新状态，确保数据同步 */
      const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
      const currentRowSelection = table.getState().rowSelection
      onSelectionChange(selectedRows, currentRowSelection)
      prevRowSelectionRef.current = currentRowSelectionStr
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, enableRowSelection, onSelectionChange])

  /** 用于虚拟滚动的容器引用 */
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  return (
    <div
      ref={ setContainer }
      className={ cn(
        'overflow-auto relative shadow-md sm:rounded-lg',
        enableVirtualization && 'h-[400px]', // 仅在虚拟滚动时设置固定高度
        className,
      ) }
      style={ style }
    >
      <table className="text-sm text-left text-textPrimary min-w-full" style={ { display: 'grid' } }>
        <TableHeader
          headerGroups={ table.getHeaderGroups() }
          enableRowSelection={ enableRowSelection }
          table={ table }
          onSelectionChange={ () => {
            // just trigger rerender
          } } />

        {
          enableVirtualization
            ? (
                <VirtualizedBody
                  table={ table }
                  container={ container }
                  enableRowSelection={ enableRowSelection }
                  enableEditing={ enableEditing }
                  onEditStart={ onEditStart }
                  onEditCancel={ onEditCancel }
                  onEditSave={ onEditSave }
                />
              )
            : (
                <TableBody
                  rows={ table.getRowModel().rows }
                  enableRowSelection={ enableRowSelection }
                  enableEditing={ enableEditing }
                  onSelectionChange={ () => {
                  // just trigger rerender
                  } }
                  onEditStart={ onEditStart }
                  onEditCancel={ onEditCancel }
                  onEditSave={ onEditSave }
                />
              )
        }
      </table>
    </div>
  )
}

export const Table = memo(forwardRef(InnerTable)) as <TData extends object>(
  props: TableProps<TData> & React.RefAttributes<TableInstance<TData> | null>,
) => React.ReactElement | null

InnerTable.displayName = 'Table'
