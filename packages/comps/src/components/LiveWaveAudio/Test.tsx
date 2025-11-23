import type { RecordingControls } from './types'
import { Button } from '../Button'
import { Message } from '../Message'
import { useRef, useState } from 'react'
import { LiveWaveAudio } from './index'

export default function LiveWaveAudioTest() {
  const [recording, setRecording] = useState(false)
  const [paused, setPaused] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const waveformRef = useRef<RecordingControls>(null)

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

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">实时波形测试页面</h1>

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
            active={ true }
            state={ recording ? 'recording' : 'stop' }
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
          <LiveWaveAudio active={ true } state="idle" mode="static" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">自定义样式</h2>
          <LiveWaveAudio
            active={ true }
            state="idle"
            mode="scrolling"
            barWidth={ 4 }
            barGap={ 2 }
            barColor="#3b82f6"
            height={ 100 }
            fadeEdges={ true }
          />
        </div>
      </div>
    </div>
  )
}
