import type { TableInstance, TableProps } from './types'

import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { cn } from 'utils'
import { Loading } from '../Loading'
import { TableBody } from './components/TableBody'
import { TableHeader } from './components/TableHeader'
import { VirtualizedBody } from './components/VirtualizedBody'
import { useInfiniteLoad } from './hooks/useInfiniteLoad'
import { useTableState } from './hooks/useTableState'
import {
  ROW_NUMBER_COLUMN_WIDTH,
  ROW_SELECTION_COLUMN_WIDTH,
  SCROLL_REACH_BOTTOM_THRESHOLD,
  VIRTUAL_LOADING_HEIGHT,
  VIRTUAL_OVERSCAN,
  VIRTUAL_ROW_ESTIMATE_SIZE,
  VIRTUAL_SCROLL_DEFAULT_HEIGHT,
} from './utils/constants'

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
    defaultHeaderAlign = 'left',
    defaultCellAlign = 'left',
    rowSelectionColumnWidth = ROW_SELECTION_COLUMN_WIDTH,
    rowNumberColumnWidth = ROW_NUMBER_COLUMN_WIDTH,
    virtualScrollDefaultHeight = VIRTUAL_SCROLL_DEFAULT_HEIGHT,
    virtualRowEstimateSize = VIRTUAL_ROW_ESTIMATE_SIZE,
    virtualLoadingHeight = VIRTUAL_LOADING_HEIGHT,
    virtualOverscan = VIRTUAL_OVERSCAN,
    scrollReachBottomThreshold = SCROLL_REACH_BOTTOM_THRESHOLD,
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

  /** 同步 ref 到 container state */
  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current)
    }
  }, [])

  const { isLoading } = useInfiniteLoad({
    enabled: enableVirtualization,
    hasMore,
    loadMore,
    container,
    getScrollSize: () => {
      if (!container) {
        return { clientHeight: 0, scrollHeight: 0, isReachedBottom: false }
      }
      return {
        clientHeight: container.clientHeight,
        scrollHeight: container.scrollHeight,
        isReachedBottom: container.scrollTop + container.clientHeight >= container.scrollHeight - scrollReachBottomThreshold,
      }
    },
    dataLength: data.length,
    scrollReachBottomThreshold,
  })

  /** 渲染加载组件 */
  const renderLoading = useCallback(() => {
    const loadingContent = loadingComponent
      ? loadingComponent(loading)
      : <Loading loading={ loading } />

    if (enableVirtualization) {
      return (
        <div className="sticky top-0 left-0 right-0 z-50 size-full">
          { loadingContent }
        </div>
      )
    }

    return loadingContent
  }, [enableVirtualization, loading, loadingComponent])

  return (
    <div
      ref={ containerRef }
      className={ cn(
        'overflow-auto relative sm:rounded-lg',
        enableVirtualization && 'h-[400px]',
        className,
      ) }
      style={ {
        ...style,
        ...(enableVirtualization && { height: `${virtualScrollDefaultHeight}px` }),
      } }
    >
      { loading && renderLoading() }
      <table className="text-sm text-left text-textPrimary min-w-full" style={ { display: 'grid' } }>
        <TableHeader
          headerGroups={ table.getHeaderGroups() }
          enableRowSelection={ enableRowSelection }
          enableRowNumber={ enableRowNumber }
          table={ table }
          defaultHeaderAlign={ defaultHeaderAlign }
          isAllRowsSelected={ table.getIsAllRowsSelected() }
          isSomeRowsSelected={ table.getIsSomeRowsSelected() }
          rowSelectionColumnWidth={ rowSelectionColumnWidth }
          rowNumberColumnWidth={ rowNumberColumnWidth }
        />

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
                  defaultCellAlign={ defaultCellAlign }
                  rowSelectionColumnWidth={ rowSelectionColumnWidth }
                  rowNumberColumnWidth={ rowNumberColumnWidth }
                  virtualRowEstimateSize={ virtualRowEstimateSize }
                  virtualOverscan={ virtualOverscan }
                  virtualLoadingHeight={ virtualLoadingHeight }
                />
              )
            : (
                <TableBody
                  rows={ table.getRowModel().rows }
                  enableRowSelection={ enableRowSelection }
                  enableRowNumber={ enableRowNumber }
                  enableEditing={ enableEditing }
                  onEditStart={ onEditStart }
                  onEditCancel={ onEditCancel }
                  onEditSave={ onEditSave }
                  pagination={ pagination }
                  getRowProps={ getRowProps }
                  defaultCellAlign={ defaultCellAlign }
                  rowSelectionColumnWidth={ rowSelectionColumnWidth }
                  rowNumberColumnWidth={ rowNumberColumnWidth }
                  onCheckboxChange={ () => {
                  // force render
                  } }
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
