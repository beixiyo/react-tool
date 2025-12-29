import type { Person } from './tests/makeData'
import type { ExtendedColumnDef } from './types'
import { useMemo } from 'react'
import { ThemeToggle } from '../ThemeToggle'
import { ColumnConfigTable } from './tests/ColumnConfig'
import { EditableTable } from './tests/Editable'
import { makeData } from './tests/makeData'
import { SelectableTable } from './tests/Selectable'
import { VirtualizedTable } from './tests/Virtualized'

const columns: ExtendedColumnDef<Person>[] = [
  {
    header: '姓',
    accessorKey: 'firstName',
    size: 150,
  },
  {
    header: '名',
    accessorKey: 'lastName',
    size: 150,
  },
  {
    header: '年龄',
    accessorKey: 'age',
    size: 80,
  },
  {
    header: '访问次数',
    accessorKey: 'visits',
    size: 100,
  },
  {
    header: '状态',
    accessorKey: 'status',
    size: 120,
    /** 自定义 JSX 渲染示例 */
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
    /** 自定义 JSX 渲染示例 - 进度条 */
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

export default function TableTest() {
  const largeData = useMemo<Person[]>(() => makeData(2000), [])
  const smallData = useMemo<Person[]>(() => makeData(10), [])

  return (
    <div className="p-4 h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">表格组件测试</h1>
        <ThemeToggle />
      </div>

      <div className="border border-border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">虚拟滚动</h2>
        <p className="text-sm text-textSecondary mb-4">该表格展示了排序、筛选和虚拟滚动功能，数据量为 50,000 行，分页已禁用。</p>
        <VirtualizedTable data={ largeData } columns={ columns } />
      </div>

      <div className="border border-border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">分页、行选择</h2>
        <p className="text-sm text-textSecondary mb-4">该表格展示了排序、筛选和行选择功能（单选、多选、全选），支持查看已选择的行信息。</p>
        <SelectableTable data={ largeData } columns={ columns } />
      </div>

      <div className="border border-border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">列配置功能</h2>
        <p className="text-sm text-textSecondary mb-4">该表格展示了列配置功能，可以显示/隐藏列，调整列顺序。</p>
        <ColumnConfigTable data={ smallData } />
      </div>

      <div className="border border-border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">编辑功能</h2>
        <p className="text-sm text-textSecondary mb-4">该表格展示了编辑功能，可以单击或双击单元格进行编辑。</p>
        <EditableTable data={ smallData } />
      </div>
    </div>
  )
}

TableTest.displayName = 'TableTest'
