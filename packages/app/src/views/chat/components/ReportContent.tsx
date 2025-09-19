import type { ReportContentItem } from '../types'
import { motion } from 'framer-motion'
import { Download, FileText } from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { HtmlPreview } from '@/components/HtmlPreview'
import { Icon } from '@/components/Icon'
import { MdEditor } from '@/components/MdEditor'

export const ReportContent = memo<ReportContentProps>((
  {
    item,
    className,
    style,
    title,
  },
) => {
  /** 格式化文件大小 */
  const formatFileSize = (bytes?: number) => {
    if (!bytes)
      return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
  }

  /** 格式化视频时长 */
  const formatDuration = (seconds?: number) => {
    if (!seconds)
      return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderContent = () => {
    switch (item.type) {
      case 'text':
        return (
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed dark:text-gray-300">
              { item.content }
            </p>
          </div>
        )

      case 'markdown':
        return (
          <MdEditor
            content={ item.content }
            title={ title }
          />
        )

      case 'image':
        return (
          <div className="group relative">
            <img
              src={ item.content }
              alt={ item.title || '图片' }
              className="h-auto w-full rounded-lg shadow-xs transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            { item.metadata?.description && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="px-4 text-center text-sm text-white">
                  { item.metadata.description }
                </p>
              </div>
            ) }
          </div>
        )

      case 'video':
        return (
          <div className="group relative">
            <video
              src={ item.content }
              poster={ item.metadata?.thumbnail }
              controls
              className="h-auto w-full rounded-lg shadow-xs"
              preload="metadata"
            >
              您的浏览器不支持视频播放
            </video>
            { item.metadata?.duration && (
              <div className="absolute right-2 top-2 rounded-sm bg-black/70 px-2 py-1 text-xs text-white">
                { formatDuration(item.metadata.duration) }
              </div>
            ) }
          </div>
        )

      case 'file':
        return (
          <div className="border border-gray-200 rounded-lg p-4 transition-colors duration-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-900 font-medium dark:text-gray-200">
                  { item.title || '未命名文件' }
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  { item.metadata?.mimeType && (
                    <span className="uppercase">
                      { item.metadata.mimeType.split('/')[1] }
                    </span>
                  ) }
                  { item.metadata?.size && (
                    <span>{ formatFileSize(item.metadata.size) }</span>
                  ) }
                </div>
              </div>

              <Icon asChild>
                <a
                  href={ item.content }
                  download={ item.title }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download strokeWidth={ 1.5 } size={ 18 } />
                </a>
              </Icon>
            </div>
            { item.metadata?.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                { item.metadata.description }
              </p>
            ) }
          </div>
        )

      case 'code':
        return (
          <div className="relative">
            <HtmlPreview
              html={ item.content }
              title={ item.title || '代码预览' }
              showControls={ item.metadata?.codePreview?.showControls !== false }
              draggable={ false }
              overflow={ item.metadata?.codePreview?.overflow || 'auto' }
              className="w-full"
              minHeight={ 300 }
              maxHeight={ 500 }
            />
            { item.metadata?.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                { item.metadata.description }
              </p>
            ) }
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            不支持的内容类型:
            { ' ' }
            { item.type }
          </div>
        )
    }
  }

  return (
    <motion.div
      className={ cn(
        'ReportContentContainer',
        className,
      ) }
      style={ style }
      initial={ { opacity: 0, y: 20 } }
      animate={ { opacity: 1, y: 0 } }
      transition={ { duration: 0.3 } }
    >
      <div className="content">
        { renderContent() }
      </div>
    </motion.div>
  )
})

ReportContent.displayName = 'ReportContent'

export type ReportContentProps = {
  /**
   * 报告内容项
   */
  item: ReportContentItem
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 自定义样式
   */
  style?: React.CSSProperties
  /**
   * 标题
   */
  title?: string
}
