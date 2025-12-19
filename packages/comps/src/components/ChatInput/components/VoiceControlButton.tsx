'use client'

import type { PopoverRef } from '../../..'
import { Check, ChevronDown, FileText, Loader2, Mic, RotateCcw, Square } from 'lucide-react'
import { memo, useMemo, useRef } from 'react'
import { cn } from 'utils'
import { Popover, Tooltip } from '../../..'

export type VoiceControlStatus = 'idle' | 'recording' | 'processing' | 'review'

export type VoiceControlButtonProps = {
  status: VoiceControlStatus
  durationLabel: string
  disabled?: boolean
  onClick: () => void
  voiceMode: 'audio' | 'text'
  onVoiceModeChange: (mode: 'audio' | 'text') => void
}

/**
 * 语音录制触发按钮
 */
export const VoiceControlButton = memo<VoiceControlButtonProps>((props) => {
  const {
    status,
    durationLabel,
    disabled = false,
    onClick,
    voiceMode,
    onVoiceModeChange,
  } = props

  const popoverRef = useRef<PopoverRef>(null)

  const config = useMemo(() => {
    switch (status) {
      case 'recording':
        return {
          icon: <Square className="size-4" />,
          className: 'bg-dangerBg text-danger hover:opacity-70',
          tooltip: voiceMode === 'audio'
            ? '结束录音'
            : '停止识别',
        }
      case 'processing':
        return {
          icon: <Loader2 className="size-4 animate-spin" />,
          className: 'bg-backgroundSecondary text-textSecondary',
          tooltip: '语音处理中',
        }
      case 'review':
        return {
          icon: <RotateCcw className="size-4" />,
          className: 'bg-backgroundSecondary text-textSecondary hover:bg-backgroundMuted dark:hover:bg-backgroundMuted/60',
          tooltip: '重新开始录音',
        }
      case 'idle':
      default:
        return {
          icon: <Mic className="size-5" />,
          className: 'text-textSecondary hover:text-textPrimary hover:bg-backgroundSecondary dark:text-textSecondary dark:hover:text-textPrimary',
          tooltip: voiceMode === 'audio'
            ? '开始录音'
            : '开始语音转文字',
        }
    }
  }, [status, voiceMode])

  const mainButton = (
    <button
      type="button"
      disabled={ disabled || status === 'processing' }
      onClick={ () => {
        if (disabled || status === 'processing') {
          return
        }
        onClick()
      } }
      className={ cn(
        'flex items-center gap-2 p-2 rounded-xl transition-all duration-200',
        'hover:scale-105',
        disabled && 'cursor-not-allowed opacity-60',
        config.className,
      ) }
    >
      { config.icon }
      {/* { status === 'recording' && (
        <span className="font-mono text-xs text-danger">{ durationLabel }</span>
      ) } */}
    </button>
  )

  const selector = (
    <Popover
      ref={ popoverRef }
      trigger="click"
      position="top"
      content={
        <div className="flex flex-col gap-1 p-1 min-w-[120px] bg-background border border-border rounded-lg shadow-xl">
          <button
            className={ cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              'hover:bg-backgroundSecondary text-textPrimary',
              voiceMode === 'audio' && 'bg-backgroundSecondary',
            ) }
            onClick={ () => {
              onVoiceModeChange('audio')
              popoverRef.current?.close()
            } }
          >
            <Mic className="size-4" />
            <span>录制音频</span>
            { voiceMode === 'audio' && <Check className="ml-auto size-3" /> }
          </button>
          <button
            className={ cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
              'hover:bg-backgroundSecondary text-textPrimary',
              voiceMode === 'text' && 'bg-backgroundSecondary',
            ) }
            onClick={ () => {
              onVoiceModeChange('text')
              popoverRef.current?.close()
            } }
          >
            <FileText className="size-4" />
            <span>语音转文字</span>
            { voiceMode === 'text' && <Check className="ml-auto size-3" /> }
          </button>
        </div>
      }
    >
      <button
        type="button"
        disabled={ disabled || status !== 'idle' }
        className={ cn(
          'p-1 -ml-1 rounded-r-xl transition-all duration-200',
          'text-textSecondary hover:text-textPrimary hover:bg-backgroundSecondary',
          (disabled || status !== 'idle') && 'cursor-not-allowed opacity-50',
        ) }
      >
        <ChevronDown className="size-3" />
      </button>
    </Popover>
  )

  if (disabled) {
    return (
      <div className="flex items-center">
        { mainButton }
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      <Tooltip content={ config.tooltip }>
        { mainButton }
      </Tooltip>
      { status === 'idle' && selector }
    </div>
  )
})

VoiceControlButton.displayName = 'VoiceControlButton'
