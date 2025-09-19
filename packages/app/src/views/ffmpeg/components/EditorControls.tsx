import { Download, Film, RotateCcw, Scissors, Zap } from 'lucide-react'
import React, { memo } from 'react'
import { cn } from 'utils'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'

const EditorControls: React.FC<EditorControlsProps> = ({
  onTrim,
  canTrim = false,
  onMerge,
  canMerge = false,
  onCompress,
  canCompress = false,
  onExport,
  canExport = false,
  onResetState,
  isProcessing = false,
  className,
}) => {
  return (
    <div className={ cn('flex flex-wrap gap-3', className) }>
      <Popover
        removeDelay={ 0 }
        content={ !canTrim
          ? '请先选择视频并设置裁剪标记点'
          : '裁剪选定视频片段' }
        className="bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <Button
          onClick={ onTrim }
          disabled={ !canTrim || isProcessing }
          leftIcon={ <Scissors className="h-4 w-4" /> }
          designStyle="neumorphic"
        >
          裁剪
        </Button>
      </Popover>

      <Popover
        removeDelay={ 0 }
        content={ !canMerge
          ? '请至少上传并选择两个视频进行合并'
          : '合并选中的视频' }
        className="bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <Button
          onClick={ onMerge }
          disabled={ !canMerge || isProcessing }
          leftIcon={ <Film className="h-4 w-4" /> }
          designStyle="neumorphic"
        >
          合并
        </Button>
      </Popover>

      <Popover
        removeDelay={ 0 }
        content={ !canCompress
          ? '请先选择一个视频进行压缩'
          : '压缩选定视频' }
        className="bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <Button
          onClick={ onCompress }
          disabled={ !canCompress || isProcessing }
          leftIcon={ <Zap className="h-4 w-4" /> }
          designStyle="neumorphic"
        >
          压缩
        </Button>
      </Popover>

      { onResetState && (
        <Popover
          removeDelay={ 0 }
          content="重置编辑器状态和选择"
          className="bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        >
          <Button
            onClick={ onResetState }
            disabled={ isProcessing }
            leftIcon={ <RotateCcw className="h-4 w-4" /> }
            designStyle="neumorphic"
          >
            重置
          </Button>
        </Popover>
      ) }

      <Popover
        removeDelay={ 0 }
        content={ !canExport
          ? '请先处理视频以生成可下载文件'
          : '下载处理后的视频' }
        className="bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        <Button
          onClick={ onExport }
          disabled={ !canExport || isProcessing }
          leftIcon={ <Download className="h-4 w-4" /> }
          designStyle="neumorphic"
        >
          下载
          { ' ' }
        </Button>
      </Popover>
    </div>
  )
}

export default memo(EditorControls)

export type EditorControlsProps = {
  onTrim?: () => void
  canTrim?: boolean
  onMerge?: () => void
  canMerge?: boolean
  onCompress?: () => void
  canCompress?: boolean
  onExport?: () => void
  canExport?: boolean
  onResetState?: () => void
  isProcessing?: boolean
  className?: string
}
