import type { VideoFrame } from '@/components/VideoTimeline'
import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { compressVideo, mergeVideos, trimVideo } from '@/utils'
import { downloadByData } from '@jl-org/tool'

export function useFFmpegOperation(
  options: {
    ffmpeg: FFmpeg | null
    activeVideoFile: File | null
    trimStartFrame: VideoFrame | null
    trimEndFrame: VideoFrame | null
    selectedFilesForMerge: File[]
    onOperationError?: (err: string) => void
    onOperationMsg?: (msg: string) => void
    onProcessing?: (isProcessing: boolean) => void
  },
) {
  const {
    ffmpeg,
    activeVideoFile,
    trimStartFrame,
    trimEndFrame,
    selectedFilesForMerge,
    onOperationError,
    onOperationMsg,
    onProcessing,
  } = options

  /** 当前正在进行的FFmpeg操作的名称 */
  const [operationType, setOperationType] = useState<string | null>(null)
  /** FFmpeg操作的进度 (0-100) */
  const [operationProgress, setOperationProgress] = useState<number>(0)

  /** FFmpeg处理后生成的最终视频Blob对象，用于下载或进一步处理 */
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)

  /** 用于确定编辑控件按钮是否可用 */
  const canTrim = !!activeVideoFile && !!trimStartFrame && !!trimEndFrame && trimEndFrame.timestamp > trimStartFrame.timestamp && !Number.isNaN(trimStartFrame.timestamp) && !Number.isNaN(trimEndFrame.timestamp)

  const canMerge = selectedFilesForMerge.length >= 2
  const canCompress = !!activeVideoFile

  /** 执行FFmpeg操作的通用函数 */
  const commonFFmpegOperation = async (
    operationName: string,
    ffmpegFunction: () => Promise<Blob | null>,
  ) => {
    if (!ffmpeg) {
      onOperationError?.('FFmpeg核心未加载')
      return
    }

    onProcessing?.(true)
    setOperationType(operationName)
    setOperationProgress(0)
    onOperationError?.('')
    onOperationMsg?.('')
    setOutputBlob(null)

    URL.revokeObjectURL(outputUrl!)
    setOutputUrl(null)

    try {
      const resultBlob = await ffmpegFunction()
      if (resultBlob) {
        setOutputBlob(resultBlob)
        onOperationMsg?.(`${operationName} 操作成功！输出文件已准备就绪。`)
        setOutputUrl(URL.createObjectURL(resultBlob))
      }
      else {
        onOperationError?.(`${operationName} 操作未产生输出文件。`)
      }
    }
    catch (err) {
      console.error(`${operationName} 操作出错:`, err)
      onOperationError?.(`${operationName} 操作失败: ${err instanceof Error
        ? err.message
        : String(err)}`)
    }
    finally {
      setOperationType(null)
      setOperationProgress(100)
      onProcessing?.(false)
    }
  }

  /** 处理视频裁剪 */
  const handleTrim = async () => {
    if (!canTrim || !activeVideoFile || !trimStartFrame || !trimEndFrame || !ffmpeg)
      return

    onOperationMsg?.('正在裁剪视频...')
    return commonFFmpegOperation('裁剪视频', () =>
      trimVideo(ffmpeg, {
        source: [activeVideoFile],
        startTime: trimStartFrame.timestamp,
        duration: trimEndFrame.timestamp - trimStartFrame.timestamp,
        onProgress: setOperationProgress,
      }))
  }

  /** 处理视频合并 */
  const handleMerge = async () => {
    if (!canMerge || selectedFilesForMerge.length < 2 || !ffmpeg)
      return

    onOperationMsg?.('正在合并视频...')
    return commonFFmpegOperation('合并视频', () =>
      mergeVideos(ffmpeg, {
        source: selectedFilesForMerge,
        onProgress: setOperationProgress,
      }))
  }

  /** 处理视频压缩 */
  const handleCompress = async () => {
    if (!canCompress || !activeVideoFile || !ffmpeg)
      return

    onOperationMsg?.('正在压缩视频...')
    return commonFFmpegOperation('压缩视频', () =>
      compressVideo(ffmpeg, {
        source: [activeVideoFile],
        onProgress: setOperationProgress,
      }))
  }

  /** 处理导出（下载）最终视频 */
  const handleExport = () => {
    if (outputBlob) {
      downloadByData(outputBlob, 'processed_video.mp4')
    }
  }

  return {
    canTrim,
    canMerge,
    canCompress,

    operationType,
    setOperationType,
    operationProgress,
    setOperationProgress,

    outputBlob,
    setOutputBlob,
    outputUrl,
    setOutputUrl,

    handleTrim,
    handleMerge,
    handleCompress,
    handleExport,
  }
}
