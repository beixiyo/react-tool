import type { ColumnDef } from '@tanstack/react-table'
import type { TextAlign } from '../types'
import type { Person } from './makeData'
import { memo, useState } from 'react'
import { Checkbox } from '../../Checkbox'
import { Table } from '../index'

interface ColumnConfigTableProps {
  data: Person[]
  loading?: boolean
  loadingComponent?: (loading: boolean) => React.ReactNode
}

export const ColumnConfigTable = memo<ColumnConfigTableProps>(({ data, loading, loadingComponent }) => {
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

  // 默认对齐方式
  const [defaultHeaderAlign, setDefaultHeaderAlign] = useState<TextAlign>('left')
  const [defaultCellAlign, setDefaultCellAlign] = useState<TextAlign>('left')

  // 每列的对齐方式
  const [columnHeaderAlign, setColumnHeaderAlign] = useState<Record<string, TextAlign>>({})
  const [columnCellAlign, setColumnCellAlign] = useState<Record<string, TextAlign>>({})

  const columns: ColumnDef<Person>[] = [
    {
      id: 'firstName',
      header: '姓',
      accessorKey: 'firstName',
      size: 180,
      headerAlign: columnHeaderAlign.firstName,
      cellAlign: columnCellAlign.firstName,
    },
    {
      id: 'lastName',
      header: '名',
      accessorKey: 'lastName',
      size: 180,
      headerAlign: columnHeaderAlign.lastName,
      cellAlign: columnCellAlign.lastName,
    },
    {
      id: 'age',
      header: '年龄',
      accessorKey: 'age',
      size: 160,
      headerAlign: columnHeaderAlign.age,
      cellAlign: columnCellAlign.age,
    },
    {
      id: 'visits',
      header: '访问次数',
      accessorKey: 'visits',
      size: 180,
      headerAlign: columnHeaderAlign.visits,
      cellAlign: columnCellAlign.visits,
    },
    {
      id: 'status',
      header: '状态',
      accessorKey: 'status',
      size: 200,
      headerAlign: columnHeaderAlign.status,
      cellAlign: columnCellAlign.status,
    },
    {
      id: 'progress',
      header: '资料完成度',
      accessorKey: 'progress',
      size: 200,
      headerAlign: columnHeaderAlign.progress,
      cellAlign: columnCellAlign.progress,
    },
  ]

  const allColumns = columns.map(col => ({
    id: col.id || ('accessorKey' in col
      ? col.accessorKey
      : '') as string,
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

  const handleColumnHeaderAlignChange = (columnId: string, align: TextAlign | undefined) => {
    if (align === undefined) {
      setColumnHeaderAlign((prev) => {
        const next = { ...prev }
        delete next[columnId]
        return next
      })
    }
    else {
      setColumnHeaderAlign(prev => ({
        ...prev,
        [columnId]: align,
      }))
    }
  }

  const handleColumnCellAlignChange = (columnId: string, align: TextAlign | undefined) => {
    if (align === undefined) {
      setColumnCellAlign((prev) => {
        const next = { ...prev }
        delete next[columnId]
        return next
      })
    }
    else {
      setColumnCellAlign(prev => ({
        ...prev,
        [columnId]: align,
      }))
    }
  }

  const alignOptions: TextAlign[] = ['left', 'center', 'right']

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
                if (!col)
                  return null
                return (
                  <div
                    key={ colId }
                    className="flex items-center gap-2 px-2 py-1 bg-backgroundPrimary rounded border border-border"
                  >
                    <span className="text-xs text-textSecondary">
                      { index + 1 }
                      .
                    </span>
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
          <div>
            <div className="text-xs text-textSecondary mb-2">默认对齐方式：</div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs w-20">表头：</span>
                <div className="flex gap-2">
                  { alignOptions.map(align => (
                    <button
                      key={ align }
                      onClick={ () => setDefaultHeaderAlign(align) }
                      className={ `px-2 py-1 text-xs rounded border transition-colors ${
                        defaultHeaderAlign === align
                          ? 'bg-systemOrange text-white border-systemOrange'
                          : 'bg-backgroundPrimary border-border text-textPrimary hover:bg-backgroundSecondary'
                      }` }
                    >
                      { align === 'left' ? '左' : align === 'center' ? '中' : '右' }
                    </button>
                  )) }
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs w-20">单元格：</span>
                <div className="flex gap-2">
                  { alignOptions.map(align => (
                    <button
                      key={ align }
                      onClick={ () => setDefaultCellAlign(align) }
                      className={ `px-2 py-1 text-xs rounded border transition-colors ${
                        defaultCellAlign === align
                          ? 'bg-systemOrange text-white border-systemOrange'
                          : 'bg-backgroundPrimary border-border text-textPrimary hover:bg-backgroundSecondary'
                      }` }
                    >
                      { align === 'left' ? '左' : align === 'center' ? '中' : '右' }
                    </button>
                  )) }
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-textSecondary mb-2">列对齐方式：</div>
            <div className="flex flex-col gap-2">
              { allColumns.map(col => (
                <div key={ col.id } className="flex items-center gap-3">
                  <span className="text-xs w-20">
                    { col.header }
                    ：
                  </span>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-textSecondary">表头</span>
                    { alignOptions.map(align => (
                      <button
                        key={ `header-${align}` }
                        onClick={ () => handleColumnHeaderAlignChange(
                          col.id,
                          columnHeaderAlign[col.id] === align ? undefined : align,
                        ) }
                        className={ `px-2 py-1 text-xs rounded border transition-colors ${
                          columnHeaderAlign[col.id] === align
                            ? 'bg-systemOrange text-white border-systemOrange'
                            : 'bg-backgroundPrimary border-border text-textPrimary hover:bg-backgroundSecondary'
                        }` }
                      >
                        { align === 'left' ? '左' : align === 'center' ? '中' : '右' }
                      </button>
                    )) }
                    <span className="text-xs text-textSecondary ml-2">单元格</span>
                    { alignOptions.map(align => (
                      <button
                        key={ `cell-${align}` }
                        onClick={ () => handleColumnCellAlignChange(
                          col.id,
                          columnCellAlign[col.id] === align ? undefined : align,
                        ) }
                        className={ `px-2 py-1 text-xs rounded border transition-colors ${
                          columnCellAlign[col.id] === align
                            ? 'bg-systemOrange text-white border-systemOrange'
                            : 'bg-backgroundPrimary border-border text-textPrimary hover:bg-backgroundSecondary'
                        }` }
                      >
                        { align === 'left' ? '左' : align === 'center' ? '中' : '右' }
                      </button>
                    )) }
                  </div>
                </div>
              )) }
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
        defaultHeaderAlign={ defaultHeaderAlign }
        defaultCellAlign={ defaultCellAlign }
        loading={ loading }
        loadingComponent={ loadingComponent }
      />
    </div>
  )
})
ColumnConfigTable.displayName = 'ColumnConfigTable'
