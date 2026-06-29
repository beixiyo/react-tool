import type { CaptureKind, RecorderMimeType, RecorderState } from '@jl-org/tool'
import { formatDate, ScreenRecorder } from '@jl-org/tool'
import { Input, Message, Modal } from 'comps'
import { useConst } from 'hooks'
import { useEffect, useRef, useState } from 'react'
import { GithubSourceLink } from '@/components/GithubSourceLink'
import { RecorderOptions } from './RecorderOptions'
import { RecorderPreview } from './RecorderPreview'
import { RecorderRecordDetail } from './RecorderRecordDetail'
import { RecorderRecordList } from './RecorderRecordList'
import { recorderStorage } from './recorderStorage'

/**
 * 视频录制页面
 */
function RecorderPage() {
  const [recState, setRecState] = useState<RecorderState>('idle')
  const [micAudio, setMicAudio] = useState<boolean>(true)
  const [systemAudio, setSystemAudio] = useState<boolean>(true)
  const [captureKind, setCaptureKind] = useState<CaptureKind>('video')

  const [timeslice, setTimeslice] = useState<number | ''>('') // ms
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [lastBlobType, setLastBlobType] = useState<string | null>(null)
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null)

  const [isStarting, setIsStarting] = useState<boolean>(false)
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false)
  const [saveName, setSaveName] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)

  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null)
  const [listRefreshKey, setListRefreshKey] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const recorder = useConst(new ScreenRecorder({
    audioOnly: captureKind === 'audio',
    systemAudio,
    micAudio,
    timesliceMs: typeof timeslice === 'number'
      ? timeslice
      : undefined,
    preferMimeTypes: [
      ...(captureKind === 'audio'
        ? (['audio/webm;codecs=opus', 'audio/webm'] as const)
        : (['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] as const)),
    ] as RecorderMimeType[],
    onStateChange: s => setRecState(s),
    onError: (e) => {
      console.error(e)
      setIsStarting(false)
    },
    onStart: () => {
      setIsStarting(false)
      if (captureKind === 'video') {
        /** 绑定视频预览 */
        const stream = recorder.getMediaStream()
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          videoRef.current.controls = false
          videoRef.current.play().catch(() => { })
        }
      }
    },
    onStop: (finalBlob) => {
      if (!finalBlob)
        return
      const url = URL.createObjectURL(finalBlob)
      setBlobUrl(url)
      setLastBlobType(finalBlob.type || null)
      setCurrentBlob(finalBlob)

      /** 生成默认名称 */
      const defaultName = `${captureKind === 'audio'
        ? '音频'
        : '视频'}_${formatDate('yyyy-MM-dd HH-mm-ss', new Date())}`
      setSaveName(defaultName)

      /** 显示保存对话框 */
      setShowSaveModal(true)

      if (captureKind === 'video' && videoRef.current) {
        videoRef.current.srcObject = null
        videoRef.current!.src = url
        videoRef.current!.controls = true
      }
    },
  }))

  useEffect(() => {
    recorder.updateConfig({
      audioOnly: captureKind === 'audio',
      systemAudio,
      micAudio,
      timesliceMs: typeof timeslice === 'number'
        ? timeslice
        : undefined,
      preferMimeTypes: [
        ...(captureKind === 'audio'
          ? (['audio/webm;codecs=opus', 'audio/webm'] as const)
          : (['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'] as const)),
      ] as RecorderMimeType[],
    })
  }, [captureKind, systemAudio, micAudio, timeslice, recorder])

  const revokeUrl = () => {
    if (blobUrl) {
      console.warn('revokeUrl', blobUrl)
      URL.revokeObjectURL(blobUrl)
    }
    setBlobUrl(null)
  }

  useEffect(() => {
    return () => {
      /** 卸载时释放资源 */
      try {
        recorder.dispose()
      }
      catch { }
      revokeUrl()
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [])

  const handleStart = async () => {
    revokeUrl()
    /** 旧实例清理 */
    try {
      recorder.dispose()
    }
    catch { }

    setIsStarting(true)
    try {
      await recorder.start()
    }
    catch (e) {
      /** 已在内部处理错误状态 */
      setIsStarting(false)
    }
  }

  const handleSave = async () => {
    if (!currentBlob || !saveName.trim()) {
      return
    }

    setSaving(true)
    try {
      await recorderStorage.saveRecord(currentBlob, {
        name: saveName.trim(),
        captureKind,
        systemAudio,
        micAudio,
      })
      setShowSaveModal(false)
      setSaveName('')
      setCurrentBlob(null)
      /** 刷新列表 */
      setListRefreshKey(prev => prev + 1)
    }
    catch (error) {
      console.error('保存录屏失败:', error)
      Message.danger('保存失败，请重试')
    }
    finally {
      setSaving(false)
    }
  }

  const handleCancelSave = () => {
    setShowSaveModal(false)
    setSaveName('')
    setCurrentBlob(null)
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-background">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">视频录制</h2>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        使用浏览器原生能力进行屏幕录制，支持系统音频与麦克风混音
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <RecorderOptions
          recState={ recState }
          systemAudio={ systemAudio }
          micAudio={ micAudio }
          captureKind={ captureKind }
          timeslice={ timeslice }
          isStarting={ isStarting }
          onChangeSystemAudio={ setSystemAudio }
          onChangeMicAudio={ setMicAudio }
          onChangeCaptureKind={ setCaptureKind }
          onChangeTimeslice={ setTimeslice }
          onStart={ handleStart }
          onPause={ () => recorder.pause() }
          onResume={ () => recorder.resume() }
          onStop={ () => recorder.stop() }
        />
        <RecorderPreview
          videoRef={ videoRef as React.RefObject<HTMLVideoElement> }
          blobUrl={ blobUrl }
          isAudio={ lastBlobType
            ? lastBlobType.startsWith('audio')
            : captureKind === 'audio' }
        />
      </div>

      <Modal
        isOpen={ showSaveModal }
        onClose={ handleCancelSave }
        titleText="保存录屏"
        width={ 500 }
        clickOutsideClose={ false }
        onOk={ handleSave }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2">
              录屏名称
            </label>
            <Input
              value={ saveName }
              onChange={ value => setSaveName(value) }
              placeholder="请输入录屏名称"
              onPressEnter={ handleSave }
              autoFocus
              disabled={ saving }
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            录屏将保存到本地 IndexedDB，您可以随时查看和下载
          </p>
        </div>
      </Modal>

      <RecorderRecordList
        key={ listRefreshKey }
        onViewRecord={ setViewingRecordId }
      />

      <RecorderRecordDetail
        recordId={ viewingRecordId }
        isOpen={ viewingRecordId !== null }
        onClose={ () => setViewingRecordId(null) }
      />

      <GithubSourceLink />
    </div>
  )
}

export default RecorderPage
