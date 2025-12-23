'use client'

import type { PopoverRef } from '../../..'
import { Check, ChevronDown, FileText, Loader2, Mic, RotateCcw, Square } from 'lucide-react'
import { memo, useMemo, useRef } from 'react'
import { cn } from 'utils'
import { Popover, Tooltip } from '../../..'
import { useT } from '../../../i18n'

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

  const t = useT()
  const popoverRef = useRef<PopoverRef>(null)

  const config = useMemo(() => {
    switch (status) {
      case 'recording':
        return {
          icon: <Square className="size-4" />,
          className: 'bg-dangerBg text-danger hover:opacity-70',
          tooltip: voiceMode === 'audio'
            ? t('chatInput.voice.endRecording')
            : t('chatInput.voice.status.stopSpeechToText'),
        }
      case 'processing':
        return {
          icon: <Loader2 className="size-4 animate-spin" />,
          className: 'bg-backgroundSecondary text-textSecondary',
          tooltip: voiceMode === 'audio'
            ? t('chatInput.voice.status.voiceProcessing')
            : t('chatInput.voice.status.processingSpeechToText'),
        }
      case 'review':
        return {
          icon: <RotateCcw className="size-4" />,
          className: 'bg-backgroundSecondary text-textSecondary hover:bg-backgroundMuted dark:hover:bg-backgroundMuted/60',
          tooltip: t('chatInput.voice.reRecord'),
        }
      case 'idle':
      default:
        return {
          icon: <Mic className="size-5" />,
          className: 'text-textSecondary hover:text-textPrimary hover:bg-backgroundSecondary dark:text-textSecondary dark:hover:text-textPrimary',
          tooltip: voiceMode === 'audio'
            ? t('chatInput.voice.startRecording')
            : t('chatInput.voice.startSpeechToText'),
        }
    }
  }, [status, voiceMode, t])

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
            <span>{ t('chatInput.voice.voiceMode.audio') }</span>
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
            <span>{ t('chatInput.voice.voiceMode.text') }</span>
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
