import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { Person } from '../makeData'
import { memo, useState } from 'react'
import { Input } from '../../Input/Input'
import { Table } from '../index'

interface VirtualizedTableProps {
  data: Person[]
  columns: ColumnDef<Person>[]
}

export const VirtualizedTable = memo<VirtualizedTableProps>(({ data, columns }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

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
        enableVirtualization
        sorting={ sorting }
        onSortingChange={ setSorting }
        globalFilter={ globalFilter }
        onGlobalFilterChange={ setGlobalFilter }
      />
    </div>
  )
})
