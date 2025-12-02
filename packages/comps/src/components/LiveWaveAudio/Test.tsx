import type { RecordingControls } from './types'
import { Recorder } from '@jl-org/tool'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../Button'
import { Message } from '../Message'
import { ThemeToggle } from '../ThemeToggle'
import { LiveWaveAudio } from './index'

export default function LiveWaveAudioTest() {
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const waveformRef = useRef<RecordingControls>(null)
  const [externalStream, setExternalStream] = useState<MediaStream | null>(null)

  /**
   * 录制按钮点击：未录制则初始化并开始，录制中则停止
   */
  const handleToggleRecording = async () => {
    const ref = waveformRef.current
    if (!ref)
      return
    if (recording) {
      await ref.stop()
      setRecording(false)
      setPaused(false)
      return
    }

    /** 开始新录制时清除旧的录音文件 */
    setAudioUrl(null)
    await ref.start()
    setRecording(true)
    setPaused(false)
  }

  const handlePause = () => {
    const ref = waveformRef.current
    if (!ref || !recording || paused)
      return
    ref.pause()
    setPaused(true)
  }

  const handleResume = () => {
    const ref = waveformRef.current
    if (!ref || !recording || !paused)
      return
    ref.resume()
    setPaused(false)
  }

  const handleDownload = () => {
    const recorder = waveformRef.current?.getRecorder()
    if (!recorder) {
      Message.warning('无可用录音器实例')
      return
    }
    recorder.download()
  }

  /**
   * 获取外部流（使用麦克风）
   */
  const handleStartExternalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setExternalStream(stream)
      Message.success('外部流已启动')
    }
    catch (error) {
      Message.error(`获取外部流失败: ${(error as Error).message}`)
    }
  }

  /**
   * 停止外部流
   */
  const handleStopExternalStream = () => {
    if (externalStream) {
      externalStream.getTracks().forEach(track => track.stop())
      setExternalStream(null)
      Message.success('外部流已停止')
    }
  }

  /** 组件卸载时清理外部流 */
  useEffect(() => {
    console.log(Recorder.getSupportedFormats())
    return () => {
      if (externalStream) {
        externalStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [externalStream])

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">实时波形测试页面</h1>
        <ThemeToggle size={ 72 } />
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <Button
          variant={ recording
            ? 'danger'
            : 'success' }
          onClick={ handleToggleRecording }
        >
          { recording
            ? '停止录制'
            : '开始录制' }
        </Button>
        <Button
          variant="warning"
          disabled={ !recording || paused }
          onClick={ handlePause }
        >
          暂停录制
        </Button>
        <Button
          variant="info"
          disabled={ !recording || !paused }
          onClick={ handleResume }
        >
          继续录制
        </Button>
      </div>

      { audioUrl && (
        <div className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">录制的音频</h3>
          <audio
            controls
            src={ audioUrl }
            className="w-full mb-2"
          />
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={ handleDownload }>下载</Button>
          </div>
        </div>
      ) }

      <div className="grid gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">静态模式（支持录制）</h2>
          <LiveWaveAudio
            ref={ waveformRef }
            state={ recording
              ? 'recording'
              : 'stop' }
            mode="static"
            onRecordingFinish={ (url, _blob, _chunks) => {
              /** 录制完成后自动设置音频 URL */
              setAudioUrl(url)
              setRecording(false)
              setPaused(false)
            } }
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">静态模式（空闲动画）</h2>
          <LiveWaveAudio state="idle" mode="static" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">自定义样式</h2>
          <LiveWaveAudio
            state="idle"
            mode="scrolling"
            barWidth={ 4 }
            barGap={ 2 }
            barColor="#3b82f6"
            height={ 100 }
            fadeEdges={ true }
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">外部流测试（优先级最高）</h2>
          <div className="mb-4 flex gap-2 flex-wrap">
            <Button
              variant={ externalStream
                ? 'danger'
                : 'success' }
              onClick={ externalStream
                ? handleStopExternalStream
                : handleStartExternalStream }
            >
              { externalStream
                ? '停止外部流'
                : '启动外部流' }
            </Button>
            { externalStream && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                外部流运行中
              </div>
            ) }
          </div>
          <LiveWaveAudio
            externalStream={ externalStream }
            state={ externalStream
              ? 'recording'
              : 'idle' }
            mode="static"
            barColor="#10b981"
            height={ 80 }
            onStreamReady={ (stream) => {
              Message.success(`外部流已就绪，轨道数: ${stream.getTracks().length}`)
            } }
            onStreamEnd={ () => {
              Message.info('外部流已结束')
            } }
            onError={ (error) => {
              Message.error(`外部流错误: ${error.message}`)
            } }
          />
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            外部流优先级最高，当传入 externalStream 时，组件会使用外部流而不是麦克风。
            即使调用 start() 方法也不会启动录制。
          </p>
        </div>
      </div>
    </div>
  )
}
