import type { ColumnDef, PaginationState, RowSelectionState, SortingState } from '@tanstack/react-table'
import type { TableInstance } from '../types'
import type { Person } from './makeData'
import { memo, useDeferredValue, useRef, useState } from 'react'
import { Input } from '../../Input/Input'
import { Pagination } from '../../Pagination'
import { Table } from '../index'

interface SelectableTableProps {
  data: Person[]
  columns: ColumnDef<Person>[]
  loading?: boolean
  loadingComponent?: (loading: boolean) => React.ReactNode
}

export const SelectableTable = memo<SelectableTableProps>(({ data, columns, loading, loadingComponent }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const deferredGlobalFilter = useDeferredValue(globalFilter)
  const tableRef = useRef<TableInstance<Person> | null>(null)

  const [selectedRows, setSelectedRows] = useState<Person[]>([])

  const selectedCount = selectedRows.length

  const handleSelectionChange = (selectedRows: Person[], rowSelection: RowSelectionState) => {
    setSelectedRows(selectedRows)
    console.log({
      rowSelection,
      selectedRows,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="搜索所有列..."
          value={ globalFilter }
          onChange={ value => setGlobalFilter(value) }
          containerClassName="max-w-sm"
        />
        { selectedCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-text2">
            <span>已选择</span>
            <span className="font-semibold text-text">{ selectedCount }</span>
            <span>行</span>
            <button
              onClick={ () => setRowSelection({}) }
              className="ml-2 px-3 py-1 text-xs bg-background2 hover:bg-background2/80 rounded-sm transition-colors"
            >
              清除选择
            </button>
          </div>
        ) }
      </div>

      <Table
        ref={ tableRef }
        data={ data }
        columns={ columns }
        enableRowSelection
        sorting={ sorting }
        onSortingChange={ setSorting }
        globalFilter={ deferredGlobalFilter }
        onGlobalFilterChange={ setGlobalFilter }
        pagination={ pagination }
        onPaginationChange={ setPagination }
        rowSelection={ rowSelection }
        onRowSelectionChange={ setRowSelection }
        onSelectionChange={ handleSelectionChange }
        enableRowNumber
        loading={ loading }
        loadingComponent={ loadingComponent }
      />

      <div className="flex justify-center">
        <Pagination
          currentPage={ pagination.pageIndex + 1 }
          totalPages={ tableRef.current?.getPageCount() || data.length / pagination.pageSize }
          onPageChange={ page => setPagination(prev => ({ ...prev, pageIndex: page - 1 })) }
        />
      </div>

      { selectedCount > 0 && (
        <div className="mt-2 p-3 bg-background2 rounded-lg">
          <div className="text-sm font-semibold mb-2">已选择的行：</div>
          <div className="text-xs text-text2 space-y-1">
            { selectedRows.slice(0, 5).map((row, index) => (
              <div key={ index }>
                { row.firstName }
                { ' ' }
                { row.lastName }
                { ' ' }
                -
                { ' ' }
                { row.age }
                { ' ' }
                岁
              </div>
            )) }
            { selectedRows.length > 5 && (
              <div className="text-text2/70">
                ... 还有
                { ' ' }
                { selectedRows.length - 5 }
                { ' ' }
                行
              </div>
            ) }
          </div>
        </div>
      ) }
    </div>
  )
})
SelectableTable.displayName = 'SelectableTable'
