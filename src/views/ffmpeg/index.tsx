import type { UploaderRef } from '@/components/Uploader'
import type { VideoFrame, VideoTimelineRef } from '@/components/VideoTimeline'

import { Checkmark } from '@/components/Checkbox'
import { Sortable } from '@/components/Sortable'
import { Uploader } from '@/components/Uploader'
import { VideoTimeline } from '@/components/VideoTimeline'
import { useNotifyParentReady, useUpdateEffect } from '@/hooks'
import { useFFmpeg } from '@/utils'

import { motion } from 'framer-motion'
import { AlertTriangle, Loader2 } from 'lucide-react'
import React, { useCallback, useRef } from 'react'
import EditorControls from './components/EditorControls'
import FileListItem from './components/FileListItem'
import Player from './components/Player'
import ProgressBar from './components/ProgressBar'
import TimelineMarkerControls from './components/TimelineMarkerControls'
import VideoFilter from './components/VideoFilter'
import { useFFmpegOperation } from './hooks/useFFmpegOperation'
import { useFileManager } from './hooks/useFileManager'
import { usePlayer } from './hooks/usePlayer'
import { useTimelineFrames } from './hooks/useTimelineFrames'

export default function FFmpegDemoPage() {
  /** 通知父窗口组件准备就绪（用于截图） */
  useNotifyParentReady()

  const { ffmpeg, loading: ffmpegLoading, error: ffmpegError, reload: reloadFFmpeg } = useFFmpeg()
  const uploaderRef = useRef<UploaderRef>(null)
  const timelineElRef = useRef<VideoTimelineRef>(null)

  /** FFmpeg操作产生的错误信息 */
  const [operationError, setOperationError] = useState<string>('')
  /** FFmpeg操作成功的提示信息 */
  const [operationMsg, setOperationMsg] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    uploadedFiles,
    setUploadedFiles,
    handleUploadedFiles,
    selectedFilesForMerge,
    setSelectedFilesForMerge,
    activeVideoFile,
    setActiveVideoFile,
    activeVideoDuration,
    setActiveVideoDuration,
    handleDeleteUploadedFile,
  } = useFileManager()

  const {
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
  } = useTimelineFrames()

  const {
    playerSrc,
    playerSeekTime,
    setPlayerSeekTime,
    setPlayerSrc,
  } = usePlayer()

  const {
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
  } = useFFmpegOperation(
    {
      ffmpeg,
      activeVideoFile,
      trimStartFrame,
      trimEndFrame,
      selectedFilesForMerge,
      onOperationError: setOperationError,
      onOperationMsg: setOperationMsg,
      onProcessing: resetOutputAndSetProcessing,
    },
  )

  const canExport = !!outputBlob
  const lastKey = useRef<string>('')

  /***************************************************
   *                    Fns
   ***************************************************/

  const getKey = (file: File) => file.name + file.lastModified

  const handleFilterComplete = (resultBlob: Blob) => {
    outputUrl && URL.revokeObjectURL(outputUrl)

    setOutputBlob(resultBlob)
    const url = URL.createObjectURL(resultBlob)
    setOutputUrl(url)
    setOperationMsg('滤镜应用成功！输出文件已准备就绪。')
  }

  /** 时间轴请求加载更多数据的回调 */
  const handleTimelineLoadData = useCallback(async () => {
    if (activeVideoFile && activeVideoDuration !== null) { // 确保 duration 已加载
      await loadTimelineFramesBatch(activeVideoFile, activeVideoDuration)
    }
  }, [activeVideoFile, activeVideoDuration, loadTimelineFramesBatch])

  /** 时间轴当前帧变化时的回调 */
  const handleTimelineFrameChange = useCallback((frame: VideoFrame | null) => { // 允许 null
    setCurrentTimelineFrame(frame)
    if (frame) {
      setPlayerSeekTime(frame.timestamp)
    }
  }, [setCurrentTimelineFrame, setPlayerSeekTime])

  function resetOutputAndSetProcessing(value: boolean) {
    // true 说明开始处理，所以清空上次的数据
    if (value) {
      setOutputBlob(null)
      setOutputUrl(null)
    }
    setIsProcessing(value)
  }

  /***************************************************
   *                    Effects
   ***************************************************/

  /** 当激活的视频文件改变时的副作用处理 */
  useUpdateEffect(() => {
    if (activeVideoFile) {
      if (playerSrc) {
        URL.revokeObjectURL(playerSrc)
      }

      if (activeVideoFile) {
        const url = URL.createObjectURL(activeVideoFile)
        setPlayerSrc(url)
      }
      else {
        setPlayerSrc(null)
      }

      setOperationError('')
      setOperationMsg('')
    }

    setActiveVideoDuration(null) // 等待播放器元数据加载
    resetFrames()

    // captureFrame(ffmpeg!, { source: activeVideoFile! }).then((res) => {
    //   const url = URL.createObjectURL(res)
    //   console.log(url)
    // })

    return () => {
      if (playerSrc) {
        URL.revokeObjectURL(playerSrc)
      }
    }
  }, [activeVideoFile])

  useUpdateEffect(
    () => {
      return checkBoundAndLoadFrames(timelineElRef, activeVideoFile, activeVideoDuration)
    },
    [activeVideoFile, activeVideoDuration, checkBoundAndLoadFrames],
    { effectFn: useLayoutEffect },
  )

  /** 当播放器成功加载视频元数据 (如时长) 后的回调 */
  const handlePlayerMetadataLoaded = useCallback((duration: number) => {
    setActiveVideoDuration(duration)
  }, [setActiveVideoDuration]) // 依赖 activeVideoFile 以便在它变化时重新创建回调

  /** 当 timelineFrames 或 activeVideoDuration 更新后，尝试设置初始的 currentTimelineHoverFrame */
  useUpdateEffect(() => {
    if (activeVideoDuration !== null && timelineFrames.length > 0 && !currentTimelineFrame) {
      const frameZero = timelineFrames.find(f => f.timestamp === 0)
      if (frameZero) {
        setCurrentTimelineFrame(frameZero)
        setPlayerSeekTime(0)
      }
      else if (timelineFrames.length > 0) { // 如果没有0秒帧，则用第一帧
        setCurrentTimelineFrame(timelineFrames[0])
        setPlayerSeekTime(timelineFrames[0].timestamp)
      }
    }
  }, [activeVideoDuration, timelineFrames, currentTimelineFrame, setCurrentTimelineFrame, setPlayerSeekTime])

  /** 重置编辑器所有状态 */
  const handleResetAll = () => {
    if (uploaderRef.current)
      uploaderRef.current.clear()

    setUploadedFiles([])
    setSelectedFilesForMerge([])
    setActiveVideoFile(null)

    // activeVideoDuration 将在 setActiveVideoFile(null) 后被 useEffect 清理
    // timelineFrames, currentTimelineHoverFrame, trimStartFrame, trimEndFrame 也会被 useEffect 清理

    setPlayerSeekTime(0)
    setOperationType(null)
    setOperationProgress(0)
    setOperationError('')
    setOperationMsg('')
    setOutputBlob(null)
    console.log('编辑器状态已重置。')
  }

  // FFmpeg核心加载中的UI
  if (ffmpegLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-gray-800 dark:bg-gray-900 dark:text-white">
        <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
        <p className="mt-6 text-xl font-medium">正在加载 FFmpeg 核心...</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">这可能需要一点时间。</p>
      </div>
    )
  }

  // FFmpeg核心加载失败的UI
  if (ffmpegError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-gray-800 dark:bg-gray-900 dark:text-white">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <p className="mt-6 text-xl text-red-400 font-medium">FFmpeg 错误</p>
        <p className="mt-1 max-w-md text-center text-sm text-gray-600 dark:text-gray-300">{ ffmpegError.message }</p>
        <p className="mt-2 text-xs text-gray-500">如果你使用多线程版本，请确保您的浏览器支持 SharedArrayBuffer，并且服务器已正确设置 COOP/COEP 头部。</p>
        <button
          onClick={ () => reloadFFmpeg() }
          className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-sm text-white font-medium transition-colors hover:bg-blue-700"
        >
          重试加载
        </button>
      </div>
    )
  }

  /** 主页面UI */
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 p-2 text-gray-800 space-y-3 dark:bg-gray-900 sm:p-4 dark:text-gray-100 sm:space-y-4">
      {/* 主要布局区域: 左侧上传与文件列表 | 右侧播放器、时间轴、控制区 */ }
      <div className="flex flex-1 flex-col gap-3 overflow-hidden lg:flex-row sm:gap-4">
        {/* 左侧面板 */ }
        <aside className="w-72 flex shrink-0 flex-col gap-3 overflow-y-auto sm:gap-4">
          <div className="flex flex-col rounded-xl bg-[#e8e8e8] p-3 shadow-lg dark:bg-neutral-800 sm:p-4">
            <h2 className="mb-3 border-b border-gray-300 pb-2 text-lg text-gray-900 font-semibold dark:border-gray-700 dark:text-gray-300">1. 上传视频</h2>

            <Uploader
              ref={ uploaderRef }
              multiple
              distinct
              accept="video/*"
              onChange={ handleUploadedFiles }
              className="h-auto min-h-36 flex-1 border-gray-300 bg-gray-100 text-gray-700 transition-colors dark:border-gray-600 hover:border-blue-500 dark:bg-gray-800 dark:text-gray-300"
              dragActiveClassName="border-blue-400 bg-blue-50 dark:bg-blue-900 bg-opacity-30"
              placeholder="拖拽视频到此处，或点击选择文件"
            />
          </div>

          { uploadedFiles.length > 0 && (
            <div className="min-h-[200px] flex flex-1 flex-col rounded-xl bg-white p-3 shadow-lg dark:bg-neutral-800 sm:p-4">
              <h2 className="mb-3 flex-shrink-0 border-b border-gray-300 pb-2 text-lg text-gray-800 font-semibold dark:border-gray-700 dark:text-gray-300">
                已上传文件 (
                { uploadedFiles.length }
                )
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  (选中合并:
                  { ' ' }
                  { selectedFilesForMerge.length }
                  )
                </span>
              </h2>
              <div className="flex-grow overflow-y-auto pr-1">
                <Sortable
                  items={ uploadedFiles.map(item => ({ id: getKey(item.file), item })) }
                  setItems={ (newItems) => {
                    setUploadedFiles(newItems.map(({ item }) => item))
                  } }
                  className="space-y-2"
                >
                  { ({ item }) => (
                    <FileListItem
                      fileItem={ item }
                      isSelected={ activeVideoFile?.name === item.file.name && activeVideoFile?.lastModified === item.file.lastModified }
                      isSelectedForMerge={ selectedFilesForMerge.some(f => f.name === item.file.name && f.lastModified === item.file.lastModified) }
                      onDelete={ () => handleDeleteUploadedFile(item) }
                      onClick={ (_, e) => {
                        if (lastKey.current === getKey(item.file)) {
                          return
                        }

                        e.stopPropagation()
                        setTimelineFrames([])
                        setActiveVideoFile(item.file)
                        lastKey.current = getKey(item.file)
                      } }
                      onMergeSelect={ (file) => {
                        setSelectedFilesForMerge((prev) => {
                          const index = prev.findIndex(f => f.name === file.name && f.lastModified === file.lastModified)
                          if (index > -1) {
                            return prev.filter((_, i) => i !== index)
                          }
                          return [...prev, file]
                        })
                      } }
                    />
                  ) }
                </Sortable>
              </div>
            </div>
          ) }
        </aside>

        {/* 右侧面板 */ }
        <main className="flex flex-1 flex-col gap-3 overflow-hidden sm:gap-4">
          <section className="scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700 flex flex-1 flex-col gap-3 overflow-y-auto p-1 xl:flex-row sm:gap-4">

            <div className="scrollbar-thin w-full flex flex-col gap-3 xl:max-h-full xl:w-2/3 xl:overflow-y-auto">
              {/* 播放器 */ }
              <Player
                src={ playerSrc }
                seekTime={ playerSeekTime }
                onMetadataLoaded={ handlePlayerMetadataLoaded }
                className="h-full w-full"
              />

              <motion.div layout className="flex-shrink-0 space-y-2">
                { operationType && isProcessing && (
                  <ProgressBar
                    label={ operationMsg }
                    progress={ operationProgress }
                    visible={ !!operationType }
                  />
                ) }

                { operationError && !operationType && (
                  <motion.div
                    key="error"
                    initial={ { opacity: 0, y: 10 } }
                    animate={ { opacity: 1, y: 0 } }
                    exit={ { opacity: 0, y: -10 } }
                    className="flex items-center gap-2 rounded-lg bg-red-800 bg-opacity-80 p-3 text-sm text-red-100 shadow-md"
                  >
                    <AlertTriangle size={ 20 } />
                    { ' ' }
                    { operationError }
                  </motion.div>
                ) }

                { operationMsg && operationProgress === 100 && (
                  <motion.div
                    key="success"
                    initial={ { opacity: 0, y: 10 } }
                    animate={ { opacity: 1, y: 0 } }
                    exit={ { opacity: 0, y: -10 } }
                    className="flex items-center gap-2 rounded-lg bg-green-700 bg-opacity-80 p-3 text-sm text-green-100 shadow-md"
                  >
                    <Checkmark />
                    { ' ' }
                    { operationMsg }
                  </motion.div>
                ) }
              </motion.div>
            </div>

            {/* 编辑控件区域 */ }
            <div className="scrollbar-thin w-full flex flex-col justify-start rounded-xl bg-white p-3 shadow-lg xl:max-h-full xl:w-1/3 xl:overflow-y-auto dark:bg-neutral-800 sm:p-4">
              <EditorControls
                onTrim={ handleTrim }
                canTrim={ canTrim }
                onMerge={ handleMerge }
                canMerge={ canMerge }
                onCompress={ handleCompress }
                canCompress={ canCompress }
                onExport={ handleExport }
                canExport={ canExport }
                onResetState={ handleResetAll }
                isProcessing={ isProcessing }
              />

              {/* 预览变更 */ }
              { outputUrl && <video
                src={ outputUrl }
                muted
                autoPlay
                loop
                controls
                playsInline
                width="100%"
                className="mt-6"
              ></video> }

              <div className="mt-6 space-y-8">
                {/* 滤镜控件 */ }
                { activeVideoFile && (
                  <div className="border-t border-gray-300 pt-4 dark:border-gray-700">
                    <h3 className="text-md mb-4 text-gray-600 font-semibold dark:text-gray-400">视频滤镜</h3>
                    <VideoFilter
                      ffmpeg={ ffmpeg }
                      videoFile={ activeVideoFile }
                      onProgress={ setOperationProgress }
                      setOperationType={ setOperationType }
                      onProcessComplete={ handleFilterComplete }
                      isProcessing={ isProcessing }
                      onProcessing={ resetOutputAndSetProcessing }
                      onOperationError={ setOperationError }
                      onOperationMsg={ setOperationMsg }
                    />
                  </div>
                ) }

                <div className="border-t border-gray-300 pt-4 dark:border-gray-700">
                  <h3 className="text-md mb-2 text-gray-600 font-semibold dark:text-gray-400">裁剪标记点</h3>
                  <TimelineMarkerControls
                    currentTimelineFrame={ currentTimelineFrame }
                    trimStartFrame={ trimStartFrame }
                    trimEndFrame={ trimEndFrame }
                    onSetTrimStart={ setTrimStartFrame }
                    onSetTrimEnd={ setTrimEndFrame }
                    onClearTrimPoints={ () => { setTrimStartFrame(null); setTrimEndFrame(null) } }
                    isProcessing={ !!operationType || isCapturingFrames }
                    activeVideoFile={ activeVideoFile }
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 时间轴区域 */ }
          <section className="h-50 flex-shrink-0 rounded-xl bg-gray-200 px-3 shadow-lg dark:bg-gray-800">
            { activeVideoFile
              ? (
                  <VideoTimeline
                    key={ activeVideoFile.name + activeVideoFile.lastModified } // Key确保切换视频时时间轴重置
                    data={ timelineFrames }
                    loadData={ handleTimelineLoadData }
                    hasMore={ hasMoreFrames }
                    onFrameChange={ handleTimelineFrameChange }
                    trackHeight={ 60 }
                    previewHeight={ 100 }
                    ref={ timelineElRef }
                  />
                )
              : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>请选择一个视频以加载时间轴。</p>
                  </div>
                ) }
            { isCapturingFrames && !operationType && <p className="mt-1 animate-pulse text-center text-xs text-blue-400">正在加载帧...</p> }
          </section>
        </main>
      </div>
    </div>
  )
}
