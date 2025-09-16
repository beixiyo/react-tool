import type { VideoFrame } from '@/components/VideoTimeline'
import { cn } from '@/utils'
import { CornerLeftUp, CornerRightDown, XCircle } from 'lucide-react'
import React, { memo } from 'react'

function formatTimestamp(timestamp?: number): string {
  if (timestamp === undefined || timestamp === null || Number.isNaN(timestamp))
    return '--:--.--'
  const totalSeconds = Math.max(0, timestamp) // 确保时间戳不为负
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const milliseconds = Math.floor((totalSeconds % 1) * 100) // 取小数点后两位作为毫秒部分
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
}

const TimelineMarkerControls: React.FC<TimelineMarkerControlsProps> = ({
  currentTimelineFrame,
  trimStartFrame,
  trimEndFrame,
  onSetTrimStart,
  onSetTrimEnd,
  onClearTrimPoints,
  isProcessing = false,
  activeVideoFile,
  className,
}) => {
  const startTs = trimStartFrame?.timestamp
  const endTs = trimEndFrame?.timestamp
  const currentTs = currentTimelineFrame?.timestamp

  let durationDisplay = '--:--.--'
  if (typeof startTs === 'number' && typeof endTs === 'number' && endTs > startTs) {
    durationDisplay = formatTimestamp(endTs - startTs)
  }

  /**
   * "设置起点"按钮的可用逻辑：
   * 没有其他处理正在进行 (isProcessing 为 false)。
   * 或者当前时间轴有悬停帧 (currentTimelineFrame 不为 null)。
   * 或者当前没有悬停帧，但已有视频加载 (activeVideoFile 不为 null)，并且用户还没有设置过 trimStartFrame。
   * 这种情况下，允许用户点击按钮将起点设置为0
   */
  const canClickSetStart = !isProcessing && (
    !!currentTimelineFrame // 如果有悬停帧，则可以设置
    || (!!activeVideoFile && !trimStartFrame && !currentTimelineFrame) // 或者：有活动视频，且尚未设置起点，也无悬停帧（此时会设为0）
  )

  // "设置终点"按钮的可用逻辑：
  /** 必须有时间轴悬停帧，且没有其他处理。 */
  const canClickSetEnd = !isProcessing && !!currentTimelineFrame

  const handleSetStart = () => {
    if (currentTimelineFrame) { // 优先使用悬停帧
      onSetTrimStart(currentTimelineFrame)
    }
    else if (activeVideoFile && !trimStartFrame) { // 如果没有悬停帧，但有活动视频且未设置过起点，则设为0
      /** 创建一个代表时间0的 VideoFrame 对象 */
      // src 和 id 可以是占位符，因为主要依赖 timestamp
      onSetTrimStart({ id: `default-start-${activeVideoFile.name}`, src: '', timestamp: 0, metadata: { default: true } })
    }
  }

  const handleSetEnd = () => {
    if (currentTimelineFrame) { // 设置终点必须基于当前悬停帧
      onSetTrimEnd(currentTimelineFrame)
    }
  }

  return (
    <div className={ cn('flex flex-col md:flex-row md:flex-wrap items-center justify-between gap-3 md:gap-4 p-3 bg-gray-100 dark:bg-gray-750 rounded-lg shadow-md dark:shadow-gray-900', className) }>
      {/* 左侧按钮组 */ }
      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start sm:gap-3">
        <button
          onClick={ handleSetStart }
          disabled={ !canClickSetStart }
          className="flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors disabled:cursor-not-allowed space-x-1.5 hover:bg-blue-700 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-blue-400 dark:disabled:opacity-30"
          title={ canClickSetStart
            ? (currentTimelineFrame
                ? '设置当前帧为裁剪起点'
                : '设置裁剪起点为视频开始 (0s)')
            : '请先在时间轴选择或等待处理完成' }
        >
          <CornerLeftUp size={ 16 } />
          <span>设置起点</span>
        </button>
        <button
          onClick={ handleSetEnd }
          disabled={ !canClickSetEnd }
          className="flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs text-white transition-colors disabled:cursor-not-allowed space-x-1.5 hover:bg-green-700 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-green-400 dark:disabled:opacity-30"
          title={ canClickSetEnd
            ? '设置当前帧为裁剪终点'
            : '请先在时间轴选择一帧' }
        >
          <CornerRightDown size={ 16 } />
          <span>设置终点</span>
        </button>
        { onClearTrimPoints && (trimStartFrame || trimEndFrame) && (
          <button
            onClick={ onClearTrimPoints }
            disabled={ isProcessing }
            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 hover:text-red-500 disabled:opacity-50 focus:outline-hidden focus:ring-1 focus:ring-red-400 dark:hover:bg-gray-600 dark:hover:text-red-400"
            title="清除裁剪标记点"
          >
            <XCircle size={ 18 } />
          </button>
        ) }
      </div>

      {/* 右侧时间显示组 */ }
      <div className="flex flex-col flex-wrap items-center justify-center gap-1.5 text-center text-xs text-gray-700 tabular-nums md:flex-row md:items-center md:justify-end md:gap-3 md:text-left dark:text-gray-300">
        <div className="min-w-[100px] md:min-w-0">
          <span className="text-gray-500 font-medium dark:text-gray-400">起点: </span>
          <span className={ cn('font-semibold', trimStartFrame
            ? 'text-blue-500 dark:text-blue-300'
            : 'text-gray-400 dark:text-gray-500') }>
            { formatTimestamp(startTs) }
          </span>
        </div>
        <div className="min-w-[100px] md:min-w-0">
          <span className="text-gray-500 font-medium dark:text-gray-400">终点: </span>
          <span className={ cn('font-semibold', trimEndFrame
            ? 'text-green-500 dark:text-green-300'
            : 'text-gray-400 dark:text-gray-500') }>
            { formatTimestamp(endTs) }
          </span>
        </div>
        <div className="min-w-[100px] md:min-w-0">
          <span className="text-gray-500 font-medium dark:text-gray-400">时长: </span>
          <span className={ cn('font-semibold', typeof startTs === 'number' && typeof endTs === 'number' && endTs > startTs
            ? 'text-yellow-500 dark:text-yellow-300'
            : 'text-gray-400 dark:text-gray-500') }>
            { durationDisplay }
          </span>
        </div>
      </div>
    </div>
  )
}

export default memo(TimelineMarkerControls)

export type TimelineMarkerControlsProps = {
  /**
   * 当前在时间轴上悬停或通过滑块选定的帧对象。
   * 如果为 null，表示尚未在时间轴上进行有效定位。
   */
  currentTimelineFrame: VideoFrame | null
  /**
   * 当前已选定的裁剪起始帧对象。
   */
  trimStartFrame: VideoFrame | null
  /**
   * 当前已选定的裁剪结束帧对象。
   */
  trimEndFrame: VideoFrame | null
  /**
   * 回调函数，用于设置裁剪的起始点。
   * @param frame 代表裁剪起点的 VideoFrame 对象。
   */
  onSetTrimStart: (frame: VideoFrame) => void
  /**
   * 回调函数，用于设置裁剪的结束点。
   * @param frame 代表裁剪终点的 VideoFrame 对象。
   */
  onSetTrimEnd: (frame: VideoFrame) => void
  /**
   * 回调函数，用于清除已选定的裁剪起止点。
   */
  onClearTrimPoints?: () => void
  /**
   * 指示当前是否有任何后台处理（如FFmpeg操作、帧捕获）正在进行。
   * 如果为 true，部分交互按钮可能会被禁用。
   * @default false
   */
  isProcessing?: boolean
  /**
   * 当前是否有活动的视频文件已加载到编辑器中。
   * 用于判断在没有 currentTimelineFrame 时，是否可以设置一个默认的起始点（如0秒）。
   */
  activeVideoFile?: File | null // 新增：用于判断是否有视频加载
  /**
   * 附加的CSS类名。
   */
  className?: string
}
