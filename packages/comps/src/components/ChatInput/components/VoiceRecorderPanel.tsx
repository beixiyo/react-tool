'use client'

import type { VoiceControlStatus } from './VoiceControlButton'
import { Download, Loader2, Pause, Play, RotateCcw, Square, X } from 'lucide-react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../..'

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
}

const actionBtnClass = 'flex items-center gap-1.5 rounded-xl border border-border/40 px-3 py-2 text-xs font-medium transition-all duration-200 hover:bg-backgroundMuted dark:hover:bg-backgroundMuted/60'

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
  } = props

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
        'pointer-events-none absolute left-1/2 bottom-full z-20 flex w-full max-w-[28rem] -translate-x-1/2 flex-col gap-3 rounded-3xl border border-border/40 bg-background/85 p-3 shadow-card backdrop-blur-md transition-all duration-300 dark:bg-background/60',
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
        <button
          type="button"
          onClick={ onClose }
          className="rounded-full p-1 text-textSecondary transition-colors duration-200 hover:bg-backgroundMuted hover:text-textPrimary dark:hover:bg-backgroundMuted/60"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="rounded-2xl border border-border/30 bg-backgroundMuted/40 p-3 dark:bg-backgroundMuted/20">
        { waveform }
      </div>

      { status === 'recording' && (
        <div className="flex items-center justify-end">
          <Tooltip content="结束本次录音">
            <button
              type="button"
              onClick={ onStop }
              className="flex items-center gap-2 rounded-2xl bg-dangerBg/50 px-5 py-2 text-sm font-medium text-danger transition-all duration-200 hover:bg-dangerBg"
            >
              <Square className="size-4" />
              停止录音
            </button>
          </Tooltip>
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
            <Tooltip content={ isPlaying
              ? '暂停试听'
              : '试听录音' }>
              <button
                type="button"
                onClick={ onPlayToggle }
                className={ cn(
                  actionBtnClass,
                  isPlaying && 'bg-backgroundMuted text-textPrimary',
                ) }
              >
                { isPlaying
                  ? <Pause className="size-4" />
                  : <Play className="size-4" /> }
                试听
              </button>
            </Tooltip>

            <Tooltip content="下载录音文件">
              <button
                type="button"
                onClick={ onDownload }
                className={ actionBtnClass }
              >
                <Download className="size-4" />
                下载
              </button>
            </Tooltip>
          </div>

          <Tooltip content="重新录制一段语音">
            <button
              type="button"
              onClick={ onReRecord }
              className="flex items-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-xs font-medium text-textSecondary transition-all duration-200 hover:bg-backgroundMuted dark:hover:bg-backgroundMuted/70"
            >
              <RotateCcw className="size-4" />
              重录
            </button>
          </Tooltip>
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
