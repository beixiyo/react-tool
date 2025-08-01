import type { FileItem as UploaderFileItem } from '@/components/Uploader'
import { Checkbox } from '@/components/Checkbox'
import { useTheme } from '@/hooks'
import { cn } from '@/utils'
import React, { memo } from 'react'

const FileListItem: React.FC<FileListItemProps> = ({
  fileItem,
  isSelected = false,
  isSelectedForMerge = false,
  onClick,
  onMergeSelect,
  onDelete,
  className,
}) => {
  const [theme] = useTheme()

  const handleItemClick = (e: React.MouseEvent) => {
    onClick?.(fileItem.file, e)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(fileItem)
  }

  return (
    <div
      className={ cn(
        'flex items-center justify-between p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 ease-in-out',
        'border backdrop-blur-sm',
        isSelected
          ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 border-blue-400/30 text-white shadow-lg dark:from-blue-600/90 dark:to-purple-700/90'
          : 'bg-white/80 dark:bg-gray-800/80 border-gray-200/30 dark:border-gray-600/30 hover:bg-gray-50/90 dark:hover:bg-gray-700/90 text-gray-700 dark:text-gray-200',
        'hover:shadow-md dark:hover:shadow-gray-900',
        className,
      ) }
      onClick={ handleItemClick }
      role="button"
      tabIndex={ 0 }
      title={ `Click to load ${fileItem.file.name}` }
    >
      <div className="flex items-center overflow-hidden space-x-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            color={ theme === 'light'
              ? '#fff'
              : '#000' }
            checked={ isSelectedForMerge }
            onChange={ (checked, e) => {
              e.stopPropagation()
              onMergeSelect?.(fileItem.file)
            } }
          />
        </div>

        <span className="truncate text-sm font-medium" title={ fileItem.file.name }>
          { fileItem.file.name }
        </span>
      </div>

      { onDelete && (
        <button
          onClick={ handleDeleteClick }
          className={ cn(
            'p-1 rounded-full transition-colors text-gray-400 hover:text-red-400 focus:outline-none',
            isSelected
              ? 'hover:bg-blue-600'
              : 'hover:bg-gray-600',
          ) }
          title={ `Delete ${fileItem.file.name}` }
          aria-label={ `Delete ${fileItem.file.name}` }
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      ) }
    </div>
  )
}

export default memo(FileListItem)

export type FileListItemProps = {
  /**
   * The file item from the Uploader component.
   */
  fileItem: UploaderFileItem
  /**
   * Is this file item currently selected as the active video?
   * @default false
   */
  isSelected?: boolean
  /**
   * Callback when the file item is clicked.
   */
  onClick?: (file: File, e: React.MouseEvent) => void
  /**
   * Callback when the delete button is clicked.
   */
  onDelete?: (fileItem: UploaderFileItem) => void
  /**
   * Additional CSS classes.
   */
  className?: string
  /**
   * 是否被选中用于合并操作
   */
  isSelectedForMerge?: boolean
  /**
   * 合并选择的回调
   */
  onMergeSelect?: (file: File) => void
}
