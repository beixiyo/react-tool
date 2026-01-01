import type { ColumnDef, SortingState } from '@tanstack/react-table'
import type { Person } from './makeData'
import { memo, useDeferredValue, useMemo, useState } from 'react'
import { Input } from '../../Input/Input'
import { Table } from '../index'
import { makeData } from './makeData'

interface InfiniteLoadTableProps {
  columns: ColumnDef<Person>[]
}

/** 每页加载的数据量 */
const PAGE_SIZE = 10

/** 模拟的总数据量 */
const TOTAL_DATA_SIZE = 500

export const InfiniteLoadTable = memo<InfiniteLoadTableProps>(({ columns }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const deferredGlobalFilter = useDeferredValue(globalFilter)

  /** 当前已加载的数据 */
  const [loadedData, setLoadedData] = useState<Person[]>(() => makeData(PAGE_SIZE))
  /** 当前页码 */
  const [currentPage, setCurrentPage] = useState(1)
  /** 是否正在加载 */
  const [isLoading, setIsLoading] = useState(false)
  /** 是否还有更多数据 */
  const hasMore = useMemo(() => {
    return loadedData.length < TOTAL_DATA_SIZE
  }, [loadedData.length])

  /** 模拟加载更多数据 */
  const loadMore = async () => {
    if (isLoading || !hasMore) {
      return
    }

    setIsLoading(true)

    /** 模拟网络请求延迟 */
    await new Promise(resolve => setTimeout(resolve, 800))

    /** 生成新数据 */
    const newData = makeData(PAGE_SIZE)
    const nextPage = currentPage + 1

    setLoadedData(prev => [...prev, ...newData])
    setCurrentPage(nextPage)
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="搜索所有列..."
          value={ globalFilter }
          onChange={ value => setGlobalFilter(value) }
          containerClassName="max-w-sm"
        />
        <div className="text-sm text-textSecondary">
          已加载
          {' '}
          {loadedData.length}
          {' '}
          /
          {' '}
          {TOTAL_DATA_SIZE}
          {' '}
          条数据
        </div>
      </div>
      <Table
        data={ loadedData }
        columns={ columns }
        enableVirtualization
        sorting={ sorting }
        onSortingChange={ setSorting }
        globalFilter={ deferredGlobalFilter }
        onGlobalFilterChange={ setGlobalFilter }
        loadMore={ loadMore }
        hasMore={ hasMore }
        showLoading={ true }
      />
    </div>
  )
})

InfiniteLoadTable.displayName = 'InfiniteLoadTable'
