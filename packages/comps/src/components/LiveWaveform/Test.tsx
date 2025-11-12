import type { RecordingControls } from './types'
import { Button, Message } from 'comps'
import { useRef, useState } from 'react'
import { LiveWaveform } from './index'

export default function LiveWaveformTest() {
  const [active, setActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const waveformRef = useRef<RecordingControls>(null)

  const handleStartRecording = () => {
    /** 开始新录制时清除旧的录音文件 */
    setAudioUrl(null)
    waveformRef.current?.startRecording()
    setRecording(true)
  }

  const handleStopRecording = () => {
    waveformRef.current?.stopRecording()
    setRecording(false)
    /** 注意：音频 URL 会通过 onRecordingFinish 回调自动设置，不需要手动获取 */
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
          variant={ active
            ? 'danger'
            : 'primary' }
          onClick={ () => setActive(!active) }
        >
          { active
            ? '关闭'
            : '开启' }
          { ' ' }
          麦克风
        </Button>
        <Button
          variant={ processing
            ? 'danger'
            : 'default' }
          onClick={ () => setProcessing(!processing) }
        >
          { processing
            ? '停止'
            : '开始' }
          { ' ' }
          处理
        </Button>
        <Button
          variant={ recording
            ? 'danger'
            : 'success' }
          onClick={ recording
            ? handleStopRecording
            : handleStartRecording }
          disabled={ !active }
        >
          { recording
            ? '停止录制'
            : '开始录制' }
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
          <LiveWaveform
            ref={ waveformRef }
            active={ active }
            processing={ processing }
            mode="static"
            enableRecording={ true }
            onRecordingFinish={ (url, _blob, _chunks) => {
              /** 录制完成后自动设置音频 URL */
              setAudioUrl(url)
              setRecording(false)
            } }
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">滚动模式</h2>
          <LiveWaveform active={ active } processing={ processing } mode="scrolling" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">处理状态（静态）</h2>
          <LiveWaveform processing={ true } mode="static" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">处理状态（滚动）</h2>
          <LiveWaveform processing={ true } mode="scrolling" />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">自定义样式</h2>
          <LiveWaveform
            active={ active }
            processing={ processing }
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
