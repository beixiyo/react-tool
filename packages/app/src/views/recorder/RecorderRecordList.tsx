import type { RecorderRecordMetadata } from './recorderStorage'
import { Message } from 'comps'
import { FolderOpen } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import { recorderStorage } from './recorderStorage'
import { RecorderRecordItem } from './RecorderRecordItem'

export interface RecorderRecordListProps {
  onViewRecord?: (id: string) => void
  refreshKey?: number
}

/**
 * 录屏记录列表组件
 */
export const RecorderRecordList = memo<RecorderRecordListProps>((props) => {
  const { onViewRecord, refreshKey } = props
  const [records, setRecords] = useState<RecorderRecordMetadata[]>([])
  const [loading, setLoading] = useState(false)

  const loadRecords = useCallback(async () => {
    try {
      const metadataList = await recorderStorage.getAllMetadata()
      setRecords(metadataList)
    }
    catch (error) {
      console.error('加载录屏列表失败:', error)
      Message.error('加载失败，请重试')
    }
    finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    loadRecords()
  }, [loadRecords])

  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      loadRecords()
    }
  }, [refreshKey, loadRecords])

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  const handleView = (id: string) => {
    onViewRecord?.(id)
  }

  if (loading) {
    return (
      <div className="mt-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100"></div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="mt-8">
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <FolderOpen className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600" />
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">暂无保存的录屏</p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">停止录制后可以保存录屏到本地</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          已保存的录屏 (
          {records.length}
          )
        </h3>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {records.map(record => (
          <RecorderRecordItem
            key={ record.id }
            metadata={ record }
            onDelete={ handleDelete }
            onView={ handleView }
          />
        ))}
      </div>
    </div>
  )
})

RecorderRecordList.displayName = 'RecorderRecordList'
