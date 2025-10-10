import type { ColumnDef } from '@tanstack/react-table'
import type { Person } from './makeData'
import { useMemo } from 'react'
import { makeData } from './makeData'
import { PaginatedTable } from './tests/Paginated'
import { VirtualizedTable } from './tests/Virtualized'

// =================================================================================================
/** 常量 */
// =================================================================================================
const columns: ColumnDef<Person>[] = [
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
  },
  {
    header: '资料完成度',
    accessorKey: 'progress',
    size: 150,
  },
]

// =================================================================================================
/** 主测试组件 */
// =================================================================================================
export default function TableTest() {
  const largeData = useMemo<Person[]>(() => makeData(50000), [])
  const smallData = useMemo<Person[]>(() => makeData(15), [])

  return (
    <div className="p-4 h-full flex flex-col gap-8">
      <h1 className="text-2xl font-bold">表格组件测试</h1>

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">虚拟滚动</h2>
        <p className="text-sm text-gray-500 mb-4">该表格展示了排序、筛选和虚拟滚动功能，数据量为 50,000 行，分页已禁用。</p>
        <VirtualizedTable data={ largeData } columns={ columns } />
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">分页</h2>
        <p className="text-sm text-gray-500 mb-4">该表格展示了排序、筛选和分页功能，数据量同样为 50,000 行，虚拟滚动已禁用。</p>
        <PaginatedTable data={ largeData } columns={ columns } />
      </div>
    </div>
  )
}

TableTest.displayName = 'TableTest'
