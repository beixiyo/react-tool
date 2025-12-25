import type { ColumnDef, RowSelectionState, SortingState, Table as TableInstance } from '@tanstack/react-table'
import type { Person } from './makeData'
import { memo, useDeferredValue, useMemo, useRef, useState } from 'react'
import { Input } from '../../Input/Input'
import { Table } from '../index'

interface SelectableTableProps {
  data: Person[]
  columns: ColumnDef<Person>[]
}

export const SelectableTable = memo<SelectableTableProps>(({ data, columns }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const deferredGlobalFilter = useDeferredValue(globalFilter)
  const tableRef = useRef<TableInstance<Person> | null>(null)

  // 获取已选择的行数据
  const selectedRows = useMemo(() => {
    if (!tableRef.current) return []
    return tableRef.current.getSelectedRowModel().rows.map(row => row.original)
  }, [rowSelection])

  // 获取已选择的行数
  const selectedCount = selectedRows.length

  // 选择变化事件处理
  const handleSelectionChange = (selectedRows: Person[], rowSelection: RowSelectionState) => {
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
          <div className="flex items-center gap-2 text-sm text-textSecondary">
            <span>已选择</span>
            <span className="font-semibold text-textPrimary">{ selectedCount }</span>
            <span>行</span>
            <button
              onClick={ () => setRowSelection({}) }
              className="ml-2 px-3 py-1 text-xs bg-backgroundSecondary hover:bg-backgroundSecondary/80 rounded transition-colors"
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
        rowSelection={ rowSelection }
        onRowSelectionChange={ setRowSelection }
        onSelectionChange={ handleSelectionChange }
      />
      { selectedCount > 0 && (
        <div className="mt-2 p-3 bg-backgroundSecondary rounded-lg">
          <div className="text-sm font-semibold mb-2">已选择的行：</div>
          <div className="text-xs text-textSecondary space-y-1">
            { selectedRows.slice(0, 5).map((row, index) => (
              <div key={ index }>
                { row.firstName } { row.lastName } - { row.age } 岁
              </div>
            )) }
            { selectedRows.length > 5 && (
              <div className="text-textSecondary/70">
                ... 还有 { selectedRows.length - 5 } 行
              </div>
            ) }
          </div>
        </div>
      ) }
    </div>
  )
})
SelectableTable.displayName = 'SelectableTable'

