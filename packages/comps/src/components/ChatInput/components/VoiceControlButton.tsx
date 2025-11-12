'use client'

import { Loader2, Mic, RotateCcw, Square } from 'lucide-react'
import { memo, useMemo } from 'react'
import { cn } from 'utils'
import { Tooltip } from '../..'

export type VoiceControlStatus = 'idle' | 'recording' | 'processing' | 'review'

export type VoiceControlButtonProps = {
  status: VoiceControlStatus
  durationLabel: string
  disabled?: boolean
  onClick: () => void
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
  } = props

  const config = useMemo(() => {
    switch (status) {
      case 'recording':
        return {
          icon: <Square className="size-4" />,
          text: '停止',
          className: 'bg-dangerBg text-danger hover:opacity-70',
          tooltip: '结束录音',
        }
      case 'processing':
        return {
          icon: <Loader2 className="size-4 animate-spin" />,
          text: '',
          className: 'bg-backgroundSubtle text-textSecondary',
          tooltip: '语音处理中',
        }
      case 'review':
        return {
          icon: <RotateCcw className="size-4" />,
          text: '重录',
          className: 'bg-backgroundSubtle text-textSecondary hover:bg-backgroundMuted dark:hover:bg-backgroundMuted/60',
          tooltip: '重新开始录音',
        }
      case 'idle':
      default:
        return {
          icon: <Mic className="size-5" />,
          text: '',
          className: 'text-textSecondary hover:text-textPrimary hover:bg-backgroundSubtle dark:text-textSecondary dark:hover:text-textPrimary',
          tooltip: '开始录音',
        }
    }
  }, [status])

  const content = (
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
        'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        disabled && 'cursor-not-allowed opacity-60',
        config.className,
      ) }
    >
      { config.icon }
      <span>{ config.text }</span>
      { status === 'recording' && (
        <span className="font-mono text-xs text-danger">{ durationLabel }</span>
      ) }
    </button>
  )

  if (disabled) {
    return content
  }

  return (
    <Tooltip content={ config.tooltip }>
      { content }
    </Tooltip>
  )
})

VoiceControlButton.displayName = 'VoiceControlButton'
