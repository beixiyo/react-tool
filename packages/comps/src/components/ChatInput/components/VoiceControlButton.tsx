'use client'

import { AlertCircle, Check, ChevronDown, FileText, Loader2, Mic, RotateCcw, Square } from 'lucide-react'
import type React from 'react'
import { memo, useMemo, useRef } from 'react'
import { cn } from 'utils'
import type { PopoverRef } from '../../..'
import { Button, Popover, Tooltip } from '../../..'
import { useT } from '../../../i18n'
import type { VoiceControlButtonProps, VoiceMode } from '../types'
import { BottomBarActionIcon } from './BottomBar/BottomBarActionIcon'
import { ICON_BTN_CLS } from './BottomBar/styles'

/**
 * 语音录制触发按钮
 */
export const VoiceControlButton = memo<VoiceControlButtonProps>((props) => {
  const {
    className,
    icon,
    status,
    disabled = false,
    durationLabel,
    errorMessage,
    onClick,
    voiceMode,
    onVoiceModeChange,
    availableModes = ['audio', 'text'],
  } = props

  const t = useT()
  const popoverRef = useRef<PopoverRef>(null)

  const config = useMemo<VoiceControlConfig>(() => {
    if (errorMessage) {
      return {
        icon: <AlertCircle />,
        label: errorMessage,
        className: 'bg-dangerBg text-danger hover:opacity-70',
        tooltip: errorMessage,
      }
    }

    switch (status) {
      case 'recording':
        return {
          icon: <Square />,
          label: durationLabel || t('chatInput.voice.status.recording'),
          labelClassName: 'font-mono',
          className: 'bg-dangerBg text-danger hover:opacity-70',
          tooltip: voiceMode === 'audio'
            ? t('chatInput.voice.endRecording')
            : t('chatInput.voice.status.stopSpeechToText'),
        }
      case 'processing':
        return {
          icon: <Loader2 className="animate-spin" />,
          label: voiceMode === 'audio'
            ? t('chatInput.voice.status.processing')
            : t('chatInput.voice.status.processingSpeechToText'),
          className: 'bg-background2 text-text2',
          tooltip: voiceMode === 'audio'
            ? t('chatInput.voice.status.voiceProcessing')
            : t('chatInput.voice.status.processingSpeechToText'),
        }
      case 'review':
        return {
          icon: <RotateCcw />,
          label: t('chatInput.voice.status.recordingComplete'),
          className: 'bg-background2 text-text2 hover:bg-background3',
          tooltip: t('chatInput.voice.reRecord'),
        }
      case 'idle':
      default:
        return {
          icon: <Mic />,
          label: undefined,
          className: '',
          tooltip: voiceMode === 'audio'
            ? t('chatInput.voice.startRecording')
            : t('chatInput.voice.startSpeechToText'),
        }
    }
  }, [durationLabel, errorMessage, status, voiceMode, t])

  const mainButtonDisabled = disabled || status === 'processing'

  const mainButton = (
    <button
      type="button"
      aria-label={ config.tooltip }
      aria-pressed={ status === 'recording' }
      aria-busy={ status === 'processing' }
      disabled={ mainButtonDisabled }
      onClick={ () => {
        if (mainButtonDisabled) {
          return
        }
        onClick()
      } }
      className={ cn(
        config.label && 'flex h-8 max-w-32 min-w-0 items-center justify-center gap-2 rounded-xl transition-colors duration-200',
        config.label
          ? 'px-2'
          : ICON_BTN_CLS,
        mainButtonDisabled && 'cursor-not-allowed opacity-60',
        config.className,
        className,
      ) }
    >
      <BottomBarActionIcon icon={ icon ?? config.icon } />
      { config.label && <span className={ cn('max-w-24 min-w-0 truncate text-xs font-medium', config.labelClassName) }>{ config.label }</span> }
    </button>
  )

  const modeOptions = useMemo(() => {
    const options: Array<{ mode: VoiceMode; icon: React.ReactNode; label: string }> = []

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
          <div className="flex min-w-30 flex-col gap-1 rounded-lg border border-border bg-background p-1 shadow-sm">
            { modeOptions.map((option) => (
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
          aria-label={ modeOptions.find((option) => option.mode === voiceMode)?.label ?? voiceMode }
          variant="ghost"
          rounded="md"
          size="sm"
          disabled={ disabled || status !== 'idle' }
          leftIcon={ <BottomBarActionIcon icon={ <ChevronDown className="text-text2" /> } /> }
        />
      </Popover>
    )
    : null

  if (disabled) {
    return (
      <div className="flex items-center">
        { errorMessage && (
          <span className="sr-only" role="alert">
            { errorMessage }
          </span>
        ) }
        { mainButton }
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      { errorMessage && (
        <span className="sr-only" role="alert">
          { errorMessage }
        </span>
      ) }
      <Tooltip content={ config.tooltip }>{ mainButton }</Tooltip>
      { status === 'idle' && selector }
    </div>
  )
})

VoiceControlButton.displayName = 'VoiceControlButton'

type VoiceControlConfig = {
  icon: React.ReactNode
  label?: string
  labelClassName?: string
  className: string
  tooltip: string
}
