'use client'

import { useT } from 'i18n/react'
import { Download, Loader2, Pause, Play, RotateCcw, Send, Square } from 'lucide-react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { CloseBtn } from '../CloseBtn'

/**
 * 语音状态类型
 */
export type VoiceRecorderStatus = 'idle' | 'recording' | 'processing' | 'review'

/**
 * 语音录制面板组件
 * 支持固定定位和静态定位两种模式
 */
export const VoiceRecorderPanel = memo<VoiceRecorderPanelProps>((props) => {
  const {
    visible,
    status,
    waveform,
    durationLabel,
    isPlaying,
    hasRecording,
    errorMessage,
    position = 'fixed',
    className,
    voiceMode = 'audio',
    onClose,
    onStop,
    onReRecord,
    onPlayToggle,
    onDownload,
    onSubmit,
  } = props

  const t = useT()

  const handleSubmit = () => {
    onClose()
    onSubmit()
  }

  const statusText = useMemo(() => {
    switch (status) {
      case 'recording':
        return voiceMode === 'audio'
          ? t('chatInput.voice.status.recording')
          : t('chatInput.voice.status.recordingSpeechToText')
      case 'processing':
        return voiceMode === 'audio'
          ? t('chatInput.voice.status.processing')
          : t('chatInput.voice.status.processingSpeechToText')
      case 'review':
        return t('chatInput.voice.status.recordingComplete')
      default:
        return t('chatInput.voice.status.ready')
    }
  }, [status, voiceMode, t])

  const statusColor = useMemo(() => {
    switch (status) {
      case 'recording':
        return 'text-danger'
      case 'processing':
        return 'text-info'
      case 'review':
        return 'text-success'
      default:
        return 'text-textSecondary'
    }
  }, [status])

  const positionClasses = useMemo(() => {
    if (position === 'static') {
      return ''
    }
    return 'fixed center -translate-x-1/2 z-20'
  }, [position])

  return (
    <div
      className={ cn(
        'pointer-events-none flex w-full max-w-[28rem] flex-col gap-3 rounded-3xl border border-borderStrong bg-background/50 p-3 backdrop-blur-md transition-all duration-300',
        positionClasses,
        visible
          ? 'pointer-events-auto opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2',
        className,
      ) }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={ cn('text-sm font-medium', statusColor) }>{ statusText }</span>
          { status !== 'idle' && (
            <span className="font-mono text-xs text-textSecondary">{ durationLabel }</span>
          ) }
        </div>
        <CloseBtn onClick={ onClose } />
      </div>

      { waveform }

      { status === 'recording' && (
        <div className="flex items-center justify-end">
          <Button
            variant="danger"
            leftIcon={ <Square className="size-4" /> }
            onClick={ onStop }
            size="sm"
          >
            { voiceMode === 'audio'
              ? t('chatInput.voice.status.stopRecording')
              : t('chatInput.voice.status.stopSpeechToText') }
          </Button>
        </div>
      ) }

      { status === 'processing' && (
        <div className="flex items-center justify-center gap-2 text-sm text-info">
          <Loader2 className="size-4 animate-spin" />
          <span>
            { voiceMode === 'audio'
              ? t('chatInput.voice.status.voiceProcessing')
              : t('chatInput.voice.status.speechToTextProcessing') }
          </span>
        </div>
      ) }

      { status === 'review' && hasRecording && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={ isPlaying
                ? 'primary'
                : 'default' }
              leftIcon={ isPlaying
                ? <Pause className="size-4" />
                : <Play className="size-4" /> }
              onClick={ onPlayToggle }
              size="sm"
            >
              { t('chatInput.voice.review') }
            </Button>

            <Button
              variant="default"
              leftIcon={ <Download className="size-4" /> }
              onClick={ onDownload }
              size="sm"
            >
              { t('chatInput.voice.download') }
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              leftIcon={ <Send className="size-4" /> }
              onClick={ handleSubmit }
              size="sm"
            >
              { t('chatInput.voice.submit') }
            </Button>

            <Button
              variant="danger"
              leftIcon={ <RotateCcw className="size-4" /> }
              onClick={ onReRecord }
              size="sm"
            >
              { t('chatInput.voice.reRecord') }
            </Button>
          </div>
        </div>
      ) }

      { errorMessage && (
        <div className="rounded-xl border border-danger/40 bg-dangerBg/20 px-3 py-2 text-xs text-danger">
          { errorMessage }
        </div>
      ) }
    </div>
  )
})

VoiceRecorderPanel.displayName = 'VoiceRecorderPanel'

export type VoiceRecorderPanelProps = {
  /**
   * 是否可见
   */
  visible: boolean
  /**
   * 语音状态
   */
  status: VoiceRecorderStatus
  /**
   * 波形组件
   */
  waveform: React.ReactNode
  /**
   * 时长标签
   */
  durationLabel: string
  /**
   * 是否正在播放
   */
  isPlaying: boolean
  /**
   * 是否有录音
   */
  hasRecording: boolean
  /**
   * 错误消息
   */
  errorMessage?: string
  /**
   * 定位模式
   * @default 'fixed'
   */
  position?: 'fixed' | 'static'
  /**
   * 容器类名
   */
  className?: string
  /**
   * 语音模式
   * @default 'audio'
   */
  voiceMode?: 'audio' | 'text'
  /**
   * 关闭回调
   */
  onClose: () => void
  /**
   * 停止录音回调
   */
  onStop: () => void
  /**
   * 重录回调
   */
  onReRecord: () => void
  /**
   * 播放切换回调
   */
  onPlayToggle: () => void
  /**
   * 下载回调
   */
  onDownload: () => void
  /**
   * 提交回调
   */
  onSubmit: () => void
}
