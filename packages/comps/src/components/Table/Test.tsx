import type { ColumnDef } from '@tanstack/react-table'
import type { Person } from './tests/makeData'
import { useMemo, useState } from 'react'
import { LoadingIcon } from '../Loading'
import { ThemeToggle } from '../ThemeToggle'
import { ColumnConfigTable } from './tests/ColumnConfig'
import { EditableTable } from './tests/Editable'
import { InfiniteLoadTable } from './tests/InfiniteLoad'
import { makeData } from './tests/makeData'
import { SelectableTable } from './tests/Selectable'
import { VirtualizedTable } from './tests/Virtualized'

const columns: ColumnDef<Person>[] = [
  {
    header: '姓',
    accessorKey: 'firstName',
    size: 80,
  },
  {
    header: '名',
    accessorKey: 'lastName',
    size: 150,
    enableSorting: false,
  },
  {
    header: '年龄',
    accessorKey: 'age',
    size: 140,
  },
  {
    header: '访问次数',
    accessorKey: 'visits',
    size: 140,
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
          : 'bg-background2 text-text2'
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
            <div className="flex-1 h-2 bg-background2 rounded-full overflow-hidden">
              <div
                className="h-full bg-systemOrange transition-all"
                style={ { width: `${progress}%` } }
              />
            </div>
            <span className="text-xs text-text2">
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
  const largeData = useMemo<Person[]>(() => makeData(50000), [])
  const smallData = useMemo<Person[]>(() => makeData(10), [])
  const [virtualizedLoading, setVirtualizedLoading] = useState(false)
  const [selectableLoading, setSelectableLoading] = useState(false)
  const [columnConfigLoading, setColumnConfigLoading] = useState(false)
  const [editableLoading, setEditableLoading] = useState(false)
  const [editableCustomLoading, setEditableCustomLoading] = useState(false)

  return (
    <div className="p-4 h-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">表格组件测试</h1>
        <ThemeToggle />
      </div>

      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">虚拟滚动</h2>
          <button
            onClick={ () => setVirtualizedLoading(!virtualizedLoading) }
            className="px-4 py-2 text-sm bg-background2 hover:bg-background2/80 rounded-sm transition-colors"
          >
            { virtualizedLoading ? '隐藏 Loading' : '显示 Loading' }
          </button>
        </div>
        <p className="text-sm text-text2 mb-4">该表格展示了排序、筛选和虚拟滚动功能，数据量为 50,000 行，分页已禁用。</p>
        <VirtualizedTable
          data={ largeData }
          columns={ columns }
          loading={ virtualizedLoading }
        />
      </div>

      <div className="border border-border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">无限自动加载</h2>
        <p className="text-sm text-text2 mb-4">该表格展示了虚拟滚动的无限自动加载功能，滚动到底部时会自动加载更多数据，初始加载 50 条，每次加载 50 条，总共 500 条数据。</p>
        <InfiniteLoadTable columns={ columns } />
      </div>

      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">分页、行选择</h2>
          <button
            onClick={ () => setSelectableLoading(!selectableLoading) }
            className="px-4 py-2 text-sm bg-background2 hover:bg-background2/80 rounded-sm transition-colors"
          >
            { selectableLoading ? '隐藏 Loading' : '显示 Loading' }
          </button>
        </div>
        <p className="text-sm text-text2 mb-4">该表格展示了排序、筛选和行选择功能（单选、多选、全选），支持查看已选择的行信息。</p>
        <SelectableTable
          data={ largeData }
          columns={ columns }
          loading={ selectableLoading }
        />
      </div>

      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">列配置功能</h2>
          <button
            onClick={ () => setColumnConfigLoading(!columnConfigLoading) }
            className="px-4 py-2 text-sm bg-background2 hover:bg-background2/80 rounded-sm transition-colors"
          >
            { columnConfigLoading ? '隐藏 Loading' : '显示 Loading' }
          </button>
        </div>
        <p className="text-sm text-text2 mb-4">该表格展示了列配置功能，可以显示/隐藏列，调整列顺序。</p>
        <ColumnConfigTable
          data={ smallData }
          loading={ columnConfigLoading }
        />
      </div>

      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">编辑功能</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={ () => setEditableLoading(!editableLoading) }
              className="px-4 py-2 text-sm bg-background2 hover:bg-background2/80 rounded-sm transition-colors"
            >
              { editableLoading ? '隐藏默认 Loading' : '显示默认 Loading' }
            </button>
            <button
              onClick={ () => setEditableCustomLoading(!editableCustomLoading) }
              className="px-4 py-2 text-sm bg-background2 hover:bg-background2/80 rounded-sm transition-colors"
            >
              { editableCustomLoading ? '隐藏自定义 Loading' : '显示自定义 Loading' }
            </button>
          </div>
        </div>
        <p className="text-sm text-text2 mb-4">该表格展示了编辑功能，可以单击或双击单元格进行编辑。支持默认 Loading 和自定义 Loading 组件。</p>
        <EditableTable
          data={ smallData }
          loading={ editableLoading || editableCustomLoading }
          loadingComponent={ editableCustomLoading
            ? (loading: boolean) => (
                loading
                  ? (
                      <div className="absolute inset-0 backdrop-blur-xs bg-black/30 flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-2">
                          <LoadingIcon size={ 40 } />
                          <span className="text-sm text-white">自定义加载中...</span>
                        </div>
                      </div>
                    )
                  : null
              )
            : undefined }
        />
      </div>
    </div>
  )
}

TableTest.displayName = 'TableTest'
