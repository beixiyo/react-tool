'use client'

import type { VoiceControlStatus } from './VoiceControlButton'
import { Button, CloseBtn } from 'comps'
import { Download, Loader2, Pause, Play, RotateCcw, Send, Square } from 'lucide-react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'

export const VoiceRecorderPanel = memo<VoiceRecorderPanelProps>((props) => {
  const {
    visible,
    status,
    waveform,
    durationLabel,
    isPlaying,
    hasRecording,
    errorMessage,
    onClose,
    onStop,
    onReRecord,
    onPlayToggle,
    onDownload,
    onSubmit,
  } = props

  const handleSubmit = () => {
    onClose()
    onSubmit()
  }

  const statusText = useMemo(() => {
    switch (status) {
      case 'recording':
        return '正在录音'
      case 'processing':
        return '处理中'
      case 'review':
        return '录音完成'
      default:
        return '语音准备就绪'
    }
  }, [status])

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

  return (
    <div
      className={ cn(
        'pointer-events-none fixed center -translate-x-1/2 z-20 flex w-full max-w-[28rem] flex-col gap-3 rounded-3xl border border-borderStrong bg-background/50 p-3 backdrop-blur-md transition-all duration-300',
        visible
          ? 'pointer-events-auto opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2',
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
            停止录音
          </Button>
        </div>
      ) }

      { status === 'processing' && (
        <div className="flex items-center justify-center gap-2 text-sm text-info">
          <Loader2 className="size-4 animate-spin" />
          <span>正在整理录音，请稍候</span>
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
              试听
            </Button>

            <Button
              variant="default"
              leftIcon={ <Download className="size-4" /> }
              onClick={ onDownload }
              size="sm"
            >
              下载
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              leftIcon={ <Send className="size-4" /> }
              onClick={ handleSubmit }
              size="sm"
            >
              提交
            </Button>

            <Button
              variant="danger"
              leftIcon={ <RotateCcw className="size-4" /> }
              onClick={ onReRecord }
              size="sm"
            >
              重录
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
  visible: boolean
  status: VoiceControlStatus
  waveform: React.ReactNode
  durationLabel: string
  isPlaying: boolean
  hasRecording: boolean
  errorMessage?: string
  onClose: () => void
  onStop: () => void
  onReRecord: () => void
  onPlayToggle: () => void
  onDownload: () => void
  onSubmit: () => void
}
