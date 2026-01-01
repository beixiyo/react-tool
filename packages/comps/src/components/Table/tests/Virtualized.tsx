import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { Person } from './makeData'
import { memo, useDeferredValue, useState } from 'react'
import { Input } from '../../Input/Input'
import { Table } from '../index'

interface VirtualizedTableProps {
  data: Person[]
  columns: ColumnDef<Person>[]
  loading?: boolean
  loadingComponent?: (loading: boolean) => React.ReactNode
}

export const VirtualizedTable = memo<VirtualizedTableProps>(({ data, columns, loading, loadingComponent }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const deferredGlobalFilter = useDeferredValue(globalFilter)

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="搜索所有列..."
        value={ globalFilter }
        onChange={ value => setGlobalFilter(value) }
        containerClassName="max-w-sm"
      />
      <Table
        data={ data }
        columns={ columns }
        enableRowSelection
        enableVirtualization
        onSelectionChange={ (rows) => {
          console.log(rows)
        } }
        sorting={ sorting }
        onSortingChange={ setSorting }
        globalFilter={ deferredGlobalFilter }
        onGlobalFilterChange={ setGlobalFilter }
        loading={ loading }
        loadingComponent={ loadingComponent }
      />
    </div>
  )
})
VirtualizedTable.displayName = 'VirtualizedTable'
