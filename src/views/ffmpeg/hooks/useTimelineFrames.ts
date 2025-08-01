import type { VideoFrame, VideoTimelineRef } from '@/components/VideoTimeline'
import { useGetState } from '@/hooks'
import { captureVideoFrame } from '@jl-org/cvs'
import { genArr, uniqueId } from '@jl-org/tool'
import { useCallback, useRef, useState } from 'react'

export function useTimelineFrames(opts: UseTimelineFramesOpts = {}) {
  const {
    framesToCapturePerBatch = Math.ceil((navigator?.hardwareConcurrency ?? 8) / 3) || 2,
    frameCaptureInterval = 1,
  } = opts

  /** 时间轴上显示的视频帧数据 */
  const [timelineFrames, setTimelineFrames] = useState<VideoFrame[]>([])
  /** 当前鼠标在时间轴上悬停或滑块指示的帧 */
  const [currentTimelineFrame, setCurrentTimelineFrame] = useState<VideoFrame | null>(null)

  /** 时间轴是否还有更多帧可以加载 */
  const [hasMoreFrames, setHasMoreFrames] = useGetState<boolean, true>(true, true)
  /** 是否正在捕获时间轴帧 */
  const [isCapturingFrames, setIsCapturingFrames] = useState<boolean>(false)

  /** 记录上一批帧捕获结束时的时间戳，用于下一批的起始计算 */
  const lastCapturedTimestampRef = useRef<number>(0)

  /** 选定的裁剪开始帧 */
  const [trimStartFrame, setTrimStartFrame] = useState<VideoFrame | null>(null)
  /** 选定的裁剪结束帧 */
  const [trimEndFrame, setTrimEndFrame] = useState<VideoFrame | null>(null)

  const raqId = useRef<number | null>(null)

  /** 当前活动的视频文件引用，用于验证异步操作的有效性 */
  const currentVideoFileRef = useRef<File | null>(null)

  /** 分批加载时间轴帧的函数 */
  const loadTimelineFramesBatch = useCallback(async (
    videoFile: File,
    videoDuration: number,
  ) => {
    /** 检查是否满足加载条件 */
    if (!videoFile || isCapturingFrames || !hasMoreFrames || videoDuration == null) {
      return
    }

    if (lastCapturedTimestampRef.current >= videoDuration) {
      setHasMoreFrames(false)
      return
    }

    setIsCapturingFrames(true)

    /** 计算本批次需要捕获的时间戳 */
    const timestampsToCapture: number[] = []
    if (lastCapturedTimestampRef.current === 0) {
      timestampsToCapture.push(0)
    }

    timestampsToCapture.push(
      ...genArr(
        framesToCapturePerBatch * frameCaptureInterval,
        i => i + lastCapturedTimestampRef.current + 1,
      ).filter(item => item % frameCaptureInterval === 0 && item <= videoDuration),
    )

    /** 如果没有新的时间戳需要捕获，则标记为没有更多帧 */
    lastCapturedTimestampRef.current = Math.max(...timestampsToCapture)
    if (lastCapturedTimestampRef.current + frameCaptureInterval >= videoDuration) {
      setHasMoreFrames(false)
    }

    try {
      const capturedFrameData = await captureVideoFrame(
        videoFile,
        timestampsToCapture,
        'base64',
        {
          mimeType: 'image/webp',
          quality: 0.4,
        },
      )

      /** 验证视频文件是否仍然是当前活动的文件 */
      if (currentVideoFileRef.current !== videoFile) {
        console.log('视频已切换，丢弃旧视频的帧数据')
        return
      }

      const newFrames: VideoFrame[] = capturedFrameData
        .map((base64Src, index) => ({
          id: `${videoFile.name}-frame-${uniqueId()}`,
          src: base64Src,
          timestamp: timestampsToCapture[index],
        }))
        .filter(frame => frame.src)

      if (newFrames.length > 0) {
        setTimelineFrames((prevFrames) => {
          const combined = [...prevFrames, ...newFrames]
          return combined.sort((a, b) => a.timestamp - b.timestamp)
        })
      }
    }
    catch (error) {
      console.error('捕获时间轴帧时出错:', error)
    }
    finally {
      setIsCapturingFrames(false)
    }
  }, [isCapturingFrames, hasMoreFrames])

  /** 检测边界，不断加载新的帧 */
  const checkBoundAndLoadFrames = useMemo(() => (
    timelineElRef: React.RefObject<VideoTimelineRef>,
    activeVideoFile: File | null,
    activeVideoDuration: number | null,
  ) => {
    /** 更新当前视频文件引用 */
    currentVideoFileRef.current = activeVideoFile

    /** 清理上一次的请求动画帧 */
    const clear = () => {
      if (raqId.current) {
        cancelAnimationFrame(raqId.current)
        raqId.current = null
      }
    }

    const loadFn = async () => {
      const timeline = timelineElRef.current
      /** 如果不满足基本条件，停止动画帧循环 */
      if (!timeline || !hasMoreFrames || !activeVideoFile || !activeVideoDuration) {
        clear()
        return
      }

      /** 验证当前视频文件是否匹配 */
      if (currentVideoFileRef.current !== activeVideoFile) {
        clear()
        return
      }

      try {
        /** 只有在时间轴未溢出时才加载新帧 */
        if (!timeline.isOverflow) {
          await loadTimelineFramesBatch(activeVideoFile, activeVideoDuration)
          /** 如果还有更多帧，继续请求下一帧 */
          if (setHasMoreFrames.getLatest()) {
            raqId.current = requestAnimationFrame(run)
          }
        }
        else {
          /** 时间轴已溢出，停止加载 */
          clear()
        }
      }
      catch (error) {
        console.error('加载帧时出错:', error)
        clear()
      }
    }

    const run = () => {
      loadFn()
    }

    /** 启动动画帧循环 */
    run()

    /** 返回清理函数，以便在组件卸载时清理 */
    return clear
  }, [hasMoreFrames, loadTimelineFramesBatch])

  const resetFrames = () => {
    setTimelineFrames([])
    setCurrentTimelineFrame(null)
    setTrimStartFrame(null)
    setTrimEndFrame(null)
    setHasMoreFrames(true)

    lastCapturedTimestampRef.current = 0
    currentVideoFileRef.current = null
  }

  return {
    timelineFrames,
    setTimelineFrames,
    hasMoreFrames,
    isCapturingFrames,

    currentTimelineFrame,
    setCurrentTimelineFrame,

    trimStartFrame,
    setTrimStartFrame,

    trimEndFrame,
    setTrimEndFrame,

    loadTimelineFramesBatch,
    checkBoundAndLoadFrames,
    resetFrames,
  }
}

type UseTimelineFramesOpts = {
  /**
   * 定义每批捕获的帧数
   * @default 2
   */
  framesToCapturePerBatch?: number
  /**
   * 间隔多少帧
   * @default 1
   */
  frameCaptureInterval?: number
}
