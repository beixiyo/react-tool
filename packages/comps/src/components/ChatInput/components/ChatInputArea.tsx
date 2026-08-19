import { memo } from 'react'
import { cn } from 'utils'
import { useT } from '../../../i18n'
import { Textarea } from '../..'
import { formatShortcut } from '../constants'
import type { ChatInputAreaProps } from '../types'

export const ChatInputArea = memo<ChatInputAreaProps>((
  {
    value,
    textareaRef,
    disabled,
    placeholder,
    autoResize,
    minRows,
    maxRows,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
    inputClassName,
    inputContainerClassName,
  },
) => {
  const t = useT()

  return (
    <Textarea
      ref={ textareaRef }
      value={ value }
      onChange={ onChange }
      onFocus={ onFocus }
      onBlur={ onBlur }
      onPressEnter={ onPressEnter }
      placeholder={ placeholder || t('chatInput.placeholder', { shortcut: formatShortcut('/') }) }
      disabled={ disabled }
      autoResize={ autoResize }
      minRows={ minRows }
      maxRows={ maxRows }
      className={ cn(
        'px-4 text-base leading-relaxed text-text placeholder:text-text2/70 bg-transparent',
        autoResize
          ? 'py-2'
          : 'min-h-0 flex-1',
        inputClassName,
      ) }
      inputContainerClassName={ cn(
        'border-0 bg-background/90 dark:bg-background/80',
        !autoResize && 'h-full',
        inputContainerClassName,
      ) }
    />
  )
})

ChatInputArea.displayName = 'ChatInputArea'
