import type { TableInstance, TableProps } from './types'

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useScrollReachBottom } from 'hooks'
import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Loading } from '../Loading'
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
    enableRowNumber = false,
    onSelectionChange,
    onEditStart,
    onEditCancel,
    onEditSave,
    loadMore,
    hasMore = true,
    showLoading = false,
    getRowProps,
    loading = false,
    loadingComponent,
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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isFirstLoadRef = useRef(true)

  /** 同步 ref 到 container state */
  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current)
    }
  }, [])

  /** 触底加载处理 */
  const handleReachBottom = () => {
    if (!hasMore || isLoading || !loadMore) {
      return
    }

    setIsLoading(true)
    loadMore().finally(() => {
      isFirstLoadRef.current = false
      setIsLoading(false)
    })
  }

  /** 使用触底检测 hook */
  const { getScrollSize } = useScrollReachBottom(
    containerRef as React.RefObject<HTMLElement | null>,
    handleReachBottom,
    {
      threshold: 50,
      enabled: enableVirtualization && !!loadMore && hasMore && !isLoading,
    },
  )

  /** 检查内容是否填满容器，如果没有填满且还有更多数据，则加载更多 */
  useEffect(() => {
    if (
      !container
      || !enableVirtualization
      || !loadMore
      || !hasMore
      || isLoading
      || isFirstLoadRef.current
    ) {
      return
    }

    const { clientHeight, scrollHeight, isReachedBottom } = getScrollSize()
    /** 如果内容高度小于容器高度，说明内容没有填满，需要加载更多 */
    if (scrollHeight <= clientHeight && !isReachedBottom) {
      setIsLoading(true)
      loadMore().finally(() => {
        isFirstLoadRef.current = false
        setIsLoading(false)
      })
    }
  }, [container, enableVirtualization, loadMore, hasMore, isLoading, data, getScrollSize])

  /** 初始加载检查 */
  useEffect(() => {
    if (!container || !enableVirtualization || !loadMore || !hasMore || isLoading) {
      return
    }

    const { clientHeight, scrollHeight } = getScrollSize()
    if (scrollHeight <= clientHeight && isFirstLoadRef.current) {
      setIsLoading(true)
      loadMore().finally(() => {
        isFirstLoadRef.current = false
        setIsLoading(false)
      })
    }
  }, [container, enableVirtualization, loadMore, hasMore, isLoading, getScrollSize])

  // eslint-disable-next-line react/no-nested-component-definitions
  const LoadingEl = () => enableVirtualization
    ? <div className="sticky top-0 left-0 right-0 z-50 size-full">
        {loadingComponent
          ? loadingComponent(loading)
          : <Loading loading={ loading } />}
      </div>
    : <>
        {loadingComponent
          ? loadingComponent(loading)
          : <Loading loading={ loading } />}
      </>

  return (
    <div
      ref={ containerRef }
      className={ cn(
        'overflow-auto relative shadow-md sm:rounded-lg',
        enableVirtualization && 'h-[400px]', // 仅在虚拟滚动时设置固定高度
        className,
      ) }
      style={ style }
    >
      {loading && LoadingEl()}
      <table className="text-sm text-left text-textPrimary min-w-full" style={ { display: 'grid' } }>
        <TableHeader
          headerGroups={ table.getHeaderGroups() }
          enableRowSelection={ enableRowSelection }
          enableRowNumber={ enableRowNumber }
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
                  enableRowNumber={ enableRowNumber }
                  enableEditing={ enableEditing }
                  onEditStart={ onEditStart }
                  onEditCancel={ onEditCancel }
                  onEditSave={ onEditSave }
                  isLoading={ isLoading }
                  showLoading={ showLoading }
                  getRowProps={ getRowProps }
                />
              )
            : (
                <TableBody
                  rows={ table.getRowModel().rows }
                  enableRowSelection={ enableRowSelection }
                  enableRowNumber={ enableRowNumber }
                  enableEditing={ enableEditing }
                  onSelectionChange={ () => {
                  // just trigger rerender
                  } }
                  onEditStart={ onEditStart }
                  onEditCancel={ onEditCancel }
                  onEditSave={ onEditSave }
                  pagination={ pagination }
                  getRowProps={ getRowProps }
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
