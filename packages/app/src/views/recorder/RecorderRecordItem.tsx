import type { RecorderRecordMetadata } from './recorderStorage'
import { downloadByData, downloadByUrl, formatDate } from '@jl-org/tool'
import { Button, Card, Message, Modal } from 'comps'
import { Clock, Download, HardDrive, Music, Play, Trash2, Video } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { recorderStorage } from './recorderStorage'

export interface RecorderRecordItemProps {
  metadata: RecorderRecordMetadata
  onDelete?: (id: string) => void
  onView?: (id: string) => void
}

/**
 * 单个录屏记录项卡片
 */
export const RecorderRecordItem = memo<RecorderRecordItemProps>((props) => {
  const { metadata, onDelete, onView } = props
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [blobUrl])

  const handleDownload = async () => {
    if (blobUrl) {
      downloadByUrl(blobUrl, `${metadata.name}.${getFileExtension(metadata.mimeType)}`)
      return
    }

    setLoading(true)
    try {
      const blob = await recorderStorage.getBlob(metadata.id)
      if (blob) {
        downloadByData(blob, `${metadata.name}.${getFileExtension(metadata.mimeType)}`)
      }
    }
    catch (error) {
      console.error('下载失败:', error)
      Message.danger('下载失败')
    }
    finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    Modal.warning({
      titleText: '确定要删除吗？',
      children: <div>
        确定要删除 "
        {metadata.name}
        " 吗？
      </div>,
      onOk: async () => {
        await recorderStorage.deleteRecord(metadata.id)
        onDelete?.(metadata.id)
      },
    })
  }

  const handleView = () => {
    onView?.(metadata.id)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024)
      return `${bytes} B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const getFileExtension = (mimeType: string) => {
    if (mimeType.includes('webm'))
      return 'webm'
    if (mimeType.includes('mp4'))
      return 'mp4'
    if (mimeType.includes('audio'))
      return 'webm'
    return 'webm'
  }

  const isAudio = metadata.captureKind === 'audio'

  return (
    <Card
      className="transition-all hover:shadow-lg"
      hoverEffect
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1">
              <Clock size={ 14 } />
              <span>{formatDate('yyyy-MM-dd HH:mm', new Date(metadata.createdAt))}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive size={ 14 } />
              <span>{formatFileSize(metadata.size)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={ handleView }
              leftIcon={ <Play size={ 16 } /> }
            >
              查看
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={ handleDownload }
              loading={ loading }
              leftIcon={ <Download size={ 16 } /> }
            >
              下载
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={ handleDelete }
              leftIcon={ <Trash2 size={ 16 } /> }
            >
              删除
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className={ `
          flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center
          ${isAudio
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
    }
        ` }>
          {isAudio
            ? <Music size={ 32 } />
            : <Video size={ 32 } />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {metadata.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            <span className={ `
              px-2 py-0.5 rounded text-xs font-medium
              ${isAudio
      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    }
            ` }>
              {isAudio
                ? '音频'
                : '视频'}
            </span>
            {metadata.systemAudio && (
              <span className="px-2 py-0.5 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                系统音频
              </span>
            )}
            {metadata.micAudio && (
              <span className="px-2 py-0.5 rounded text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                麦克风
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
})

RecorderRecordItem.displayName = 'RecorderRecordItem'
