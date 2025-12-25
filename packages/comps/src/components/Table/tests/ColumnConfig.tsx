import type { ExtendedColumnDef } from '../types'
import type { Person } from './makeData'
import { memo, useState } from 'react'
import { Checkbox } from '../../Checkbox'
import { Table } from '../index'
import { makeData } from './makeData'

interface ColumnConfigTableProps {
  data: Person[]
}

export const ColumnConfigTable = memo<ColumnConfigTableProps>(({ data }) => {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    firstName: true,
    lastName: true,
    age: true,
    visits: true,
    status: true,
    progress: true,
  })

  const [columnOrder, setColumnOrder] = useState<string[]>([
    'firstName',
    'lastName',
    'age',
    'visits',
    'status',
    'progress',
  ])

  const columns: ExtendedColumnDef<Person>[] = [
    {
      id: 'firstName',
      header: '姓',
      accessorKey: 'firstName',
      size: 150,
    },
    {
      id: 'lastName',
      header: '名',
      accessorKey: 'lastName',
      size: 150,
    },
    {
      id: 'age',
      header: '年龄',
      accessorKey: 'age',
      size: 80,
    },
    {
      id: 'visits',
      header: '访问次数',
      accessorKey: 'visits',
      size: 100,
    },
    {
      id: 'status',
      header: '状态',
      accessorKey: 'status',
      size: 120,
    },
    {
      id: 'progress',
      header: '资料完成度',
      accessorKey: 'progress',
      size: 150,
    },
  ]

  const allColumns = columns.map(col => ({
    id: col.id || col.accessorKey as string,
    header: col.header as string,
  }))

  const handleToggleColumn = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }))
  }

  const handleMoveColumn = (fromIndex: number, toIndex: number) => {
    const newOrder = [...columnOrder]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)
    setColumnOrder(newOrder)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-border rounded-lg p-4 bg-backgroundSecondary">
        <h3 className="text-sm font-semibold mb-3">列配置</h3>
        <div className="flex flex-col gap-3">
          <div>
            <div className="text-xs text-textSecondary mb-2">显示/隐藏列：</div>
            <div className="flex flex-wrap gap-2">
              { allColumns.map(col => (
                <label
                  key={ col.id }
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={ columnVisibility[col.id] ?? true }
                    onChange={ () => handleToggleColumn(col.id) }
                    size={ 16 }
                  />
                  <span className="text-sm">{ col.header }</span>
                </label>
              )) }
            </div>
          </div>
          <div>
            <div className="text-xs text-textSecondary mb-2">列顺序（拖拽调整）：</div>
            <div className="flex flex-wrap gap-2">
              { columnOrder.map((colId, index) => {
                const col = allColumns.find(c => c.id === colId)
                if (!col) return null
                return (
                  <div
                    key={ colId }
                    className="flex items-center gap-2 px-2 py-1 bg-backgroundPrimary rounded border border-border"
                  >
                    <span className="text-xs text-textSecondary">{ index + 1 }.</span>
                    <span className="text-sm">{ col.header }</span>
                    { index > 0 && (
                      <button
                        onClick={ () => handleMoveColumn(index, index - 1) }
                        className="text-xs text-textSecondary hover:text-textPrimary"
                      >
                        ↑
                      </button>
                    ) }
                    { index < columnOrder.length - 1 && (
                      <button
                        onClick={ () => handleMoveColumn(index, index + 1) }
                        className="text-xs text-textSecondary hover:text-textPrimary"
                      >
                        ↓
                      </button>
                    ) }
                  </div>
                )
              }) }
            </div>
          </div>
        </div>
      </div>
      <Table
        data={ data }
        columns={ columns }
        columnVisibility={ columnVisibility }
        onColumnVisibilityChange={ setColumnVisibility }
        columnOrder={ columnOrder }
        onColumnOrderChange={ setColumnOrder }
      />
    </div>
  )
})
ColumnConfigTable.displayName = 'ColumnConfigTable'

