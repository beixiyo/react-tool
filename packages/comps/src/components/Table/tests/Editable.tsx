import type { ExtendedColumnDef } from '../types'
import type { Person } from './makeData'
import { memo, useState } from 'react'
import { Table } from '../index'

interface EditableTableProps {
  data: Person[]
}

export const EditableTable = memo<EditableTableProps>(({ data }) => {
  const [tableData, setTableData] = useState(data)

  const columns: ExtendedColumnDef<Person>[] = [
    {
      header: '姓',
      accessorKey: 'firstName',
      size: 150,
      editConfig: {
        editable: true,
        onCellEdit: async (newValue, row, columnId) => {
          console.log('编辑单元格:', { columnId, newValue, row })
          /** 更新数据 - row 参数已经是原始数据 (TData) */
          if (!row || !row.id) {
            console.error('行数据无效:', row)
            return
          }
          setTableData(prev => prev.map(item =>
            item.id === row.id
              ? { ...item, [columnId]: newValue }
              : item,
          ))
        },
      },
    },
    {
      header: '名',
      accessorKey: 'lastName',
      size: 150,
      editConfig: {
        editable: true,
        onCellEdit: async (newValue, row, columnId) => {
          // row 参数已经是原始数据 (TData)
          if (!row || !row.id) {
            console.error('行数据无效:', row)
            return
          }
          setTableData(prev => prev.map(item =>
            item.id === row.id
              ? { ...item, [columnId]: newValue }
              : item,
          ))
        },
      },
    },
    {
      header: '年龄',
      accessorKey: 'age',
      size: 120,
      editConfig: {
        editable: true,
        onCellEdit: async (newValue, row, columnId) => {
          // row 参数已经是原始数据 (TData)
          if (!row || !row.id) {
            console.error('行数据无效:', row)
            return
          }
          setTableData(prev => prev.map(item =>
            item.id === row.id
              ? { ...item, [columnId]: newValue }
              : item,
          ))
        },
      },
    },
    {
      header: '访问次数',
      accessorKey: 'visits',
      size: 100,
      /** 这个列不可编辑 */
    },
    {
      header: '状态',
      accessorKey: 'status',
      size: 120,
      /** 自定义 JSX 渲染 */
      cell: ({ getValue }) => {
        const status = getValue() as string
        return (
          <span className={ `px-2 py-1 rounded text-xs ${status === 'relationship'
            ? 'bg-systemOrange/20 text-systemOrange'
            : 'bg-backgroundSecondary text-textSecondary'
          }` }>
            { status }
          </span>
        )
      },
    },
    {
      header: '资料完成度',
      accessorKey: 'progress',
      size: 150,
      /** 自定义 JSX 渲染 - 进度条 */
      cell: ({ getValue }) => {
        const progress = getValue() as number
        return (
          <div className="w-full">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-backgroundSecondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-systemOrange transition-all"
                  style={ { width: `${progress}%` } }
                />
              </div>
              <span className="text-xs text-textSecondary">
                { progress }
                %
              </span>
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-textSecondary">
        <p>• 单击或双击可编辑的单元格（姓、名、年龄）开始编辑</p>
        <p>• 状态和资料完成度列展示了自定义 JSX 渲染</p>
      </div>
      <Table
        data={ tableData }
        columns={ columns }
        enableEditing
        onEditStart={ ({ row, columnId, value }) => {
          console.log('🟢 开始编辑:', {
            行ID: row.id,
            列: columnId,
            当前值: value,
            行数据: row,
          })
        } }
        onEditCancel={ ({ row, columnId, originalValue }) => {
          console.log('🔴 取消编辑:', {
            行ID: row.id,
            列: columnId,
            原始值: originalValue,
            行数据: row,
          })
        } }
        onEditSave={ ({ row, columnId, newValue, originalValue }) => {
          console.log('✅ 确认编辑:', {
            行ID: row.id,
            列: columnId,
            原始值: originalValue,
            新值: newValue,
            行数据: row,
          })
        } }
      />
    </div>
  )
})
EditableTable.displayName = 'EditableTable'
