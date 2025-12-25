import type { ColumnDef, PaginationState, SortingState, Table as TableInstance } from '@tanstack/react-table'
import type { Person } from './makeData'
import { memo, useDeferredValue, useRef, useState } from 'react'
import { Input } from '../../Input/Input'
import { Pagination } from '../../Pagination'
import { Table } from '../index'

interface PaginatedTableProps {
  data: Person[]
  columns: ColumnDef<Person>[]
}

export const PaginatedTable = memo<PaginatedTableProps>(({ data, columns }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const deferredGlobalFilter = useDeferredValue(globalFilter)
  const tableRef = useRef<TableInstance<Person> | null>(null)

  // 获取筛选后的总页数
  const totalPages = tableRef.current?.getPageCount() ?? 1

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="搜索所有列..."
        value={ globalFilter }
        onChange={ value => setGlobalFilter(value) }
        containerClassName="max-w-sm"
      />
      <Table
        ref={ tableRef }
        data={ data }
        columns={ columns }
        sorting={ sorting }
        onSortingChange={ setSorting }
        globalFilter={ deferredGlobalFilter }
        onGlobalFilterChange={ setGlobalFilter }
        pagination={ pagination }
        onPaginationChange={ setPagination }
      />
      <div className="flex justify-center">
        <Pagination
          currentPage={ pagination.pageIndex + 1 }
          totalPages={ totalPages }
          onPageChange={ page => setPagination(prev => ({ ...prev, pageIndex: page - 1 })) }
        />
      </div>
    </div>
  )
})
PaginatedTable.displayName = 'PaginatedTable'