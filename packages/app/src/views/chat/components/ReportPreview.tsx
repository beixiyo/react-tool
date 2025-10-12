import type { DropdownSection } from 'comps'
import type { ReportContentItem, ReportData } from '../types'
import { DrawerFramer, Dropdown } from 'comps'

import { getToningThemeByIndex } from 'config'
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Code,
  FileText,
  ImageIcon,
  Tag,
  Video,
} from 'lucide-react'
import { memo } from 'react'
import { cn } from 'utils'
import { ReportContent } from './ReportContent'

export const ReportPreview = memo<ReportPreviewProps>((
  {
    report,
    className,
    isOpen = false,
    onClose,
  },
) => {
  /** 格式化日期 */
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!report)
    return null

  const getIcon = (type: ReportContentItem['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon strokeWidth={ 1.5 } size={ 16 } className="toning-purple-text" />
      case 'video':
        return <Video strokeWidth={ 1.5 } size={ 16 } className="toning-red-text" />
      case 'file':
        return <FileText strokeWidth={ 1.5 } size={ 16 } className="toning-orange-text" />
      case 'code':
        return <Code strokeWidth={ 1.5 } size={ 16 } className="toning-green-text" />
      default:
        return null
    }
  }

  const reportSections: DropdownSection[] = report?.items.map(item => ({
    name: item.id,
    header: (isExpanded) => {
      return (
        <div
          className="w-full flex cursor-pointer items-center justify-between bg-gray-50 px-3 py-2 text-left transition-all duration-300 dark:bg-slate-700/30 hover:bg-gray-100 dark:hover:bg-slate-700/50"
        >
          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium dark:text-gray-300">
            { getIcon(item.type) }
            { item.title || `${item.type} 内容` }
          </div>

          { isExpanded
            ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )
            : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              ) }
        </div>
      )
    },
    items: (
      <div className="border-t border-gray-100 p-3 dark:border-slate-700/50">
        <ReportContent item={ item } />
      </div>
    ),
  })) || []

  return (
    <DrawerFramer
      open={ isOpen }
      onClose={ onClose }
      overlay={ false }
      position="right"
      className={ cn('w-[500px] flex flex-col', className) }
    >
      {/* 头部 */ }
      <div
        className={ cn(
          'shrink-0',
          'p-4 border-b border-gray-100 dark:border-slate-700/50',
        ) }
      >
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 toning-purple-text" />
              <h3 className="truncate toning-purple-text">
                报告预览
              </h3>
            </div>
          </div>

          {/* 报告基本信息 */ }
          <div className="space-y-2">
            <h4 className="text-sm text-gray-900 font-medium leading-tight dark:text-gray-100">
              { report.title }
            </h4>

            { report.description && (
              <p className="text-xs text-gray-600 leading-relaxed dark:text-gray-300">
                { report.description }
              </p>
            ) }

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="size-3 toning-blue-text" />
                <span className="toning-blue-text">{ formatDate(report.updatedAt) }</span>
              </div>
            </div>

            { report.tags && report.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <Tag className="size-3 toning-purple-text" />
                { report.tags.map((tag, index) => (
                  <span
                    key={ tag }
                    className={ cn(
                      'rounded-sm px-1.5 py-0.5 text-xs',
                      getToningThemeByIndex(index),
                    ) }
                  >
                    { tag }
                  </span>
                )) }
              </div>
            ) }
          </div>
        </>
      </div>

      {/* 内容区域 */ }
      <div
        className={ cn(
          'hide-scroll flex-1 overflow-y-auto',
        ) }
      >
        <div className="p-4">
          <Dropdown
            accordion
            items={ reportSections }
            itemClassName="overflow-hidden border border-gray-100 rounded-lg dark:border-slate-700/50"
            className="space-y-2"
            defaultExpanded={ [] }
          />

          { report.items.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-slate-600" />
              <p>暂无内容</p>
            </div>
          ) }
        </div>
      </div>
    </DrawerFramer>
  )
})

ReportPreview.displayName = 'ReportPreview'

export type ReportPreviewProps = {
  /**
   * 报告数据
   */
  report?: ReportData | null
  /**
   * 自定义类名
   */
  className?: string
  /**
   * 是否打开
   * @default false
   */
  isOpen?: boolean
  /**
   * 关闭回调
   */
  onClose?: () => void
}
