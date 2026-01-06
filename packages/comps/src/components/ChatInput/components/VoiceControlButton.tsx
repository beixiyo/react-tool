'use client'

import type React from 'react'
import type { PopoverRef } from '../../..'
import type { VoiceMode } from '../types'
import { useT } from 'i18n/react'
import { Check, ChevronDown, FileText, Loader2, Mic, RotateCcw, Square } from 'lucide-react'
import { memo, useMemo, useRef } from 'react'
import { cn } from 'utils'
import { Button, Popover, Tooltip } from '../../..'

export type VoiceControlStatus = 'idle' | 'recording' | 'processing' | 'review'

export type VoiceControlButtonProps = {
  status: VoiceControlStatus
  durationLabel: string
  disabled?: boolean
  onClick: () => void
  voiceMode: VoiceMode
  onVoiceModeChange: (mode: VoiceMode) => void
  /**
   * 可用的语音模式选项
   * 如果不提供，默认显示所有选项 ['audio', 'text']
   * @default ['audio', 'text']
   */
  availableModes?: VoiceMode[]
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
    availableModes = ['audio', 'text'],
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

  const modeOptions = useMemo(() => {
    const options: Array<{ mode: VoiceMode, icon: React.ReactNode, label: string }> = []

    if (availableModes.includes('audio')) {
      options.push({
        mode: 'audio',
        icon: <Mic className="size-4" />,
        label: t('chatInput.voice.voiceMode.audio'),
      })
    }

    if (availableModes.includes('text')) {
      options.push({
        mode: 'text',
        icon: <FileText className="size-4" />,
        label: t('chatInput.voice.voiceMode.text'),
      })
    }

    return options
  }, [availableModes, t])

  const selector = modeOptions.length > 1
    ? (
        <Popover
          ref={ popoverRef }
          trigger="click"
          position="top"
          content={
            <div className="flex flex-col gap-1 p-1 min-w-[120px] bg-background border border-border rounded-lg shadow-xl">
              { modeOptions.map(option => (
                <Button
                  key={ option.mode }
                  variant="ghost"
                  rounded="md"
                  size="sm"
                  leftIcon={ option.icon }
                  onClick={ () => {
                    onVoiceModeChange(option.mode)
                    popoverRef.current?.close()
                  } }
                >
                  <span className="flex-1">{ option.label }</span>
                  { voiceMode === option.mode && <Check className="ml-auto size-3" /> }
                </Button>
              )) }
            </div>
          }
        >
          <Button
            variant="ghost"
            rounded="md"
            size="sm"
            disabled={ disabled || status !== 'idle' }
            leftIcon={ <ChevronDown className="size-5 text-textSecondary" /> }
          />
        </Popover>
      )
    : null

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
