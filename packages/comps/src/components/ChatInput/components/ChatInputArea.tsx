import type { RefObject } from 'react'
import { useT } from 'i18n/react'
import { memo } from 'react'
import { Textarea } from '../..'
import { formatShortcut } from '../constants'

export type ChatInputAreaProps = {
  value: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  disabled?: boolean
  placeholder?: string
  onChange: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onPressEnter: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

export const ChatInputArea = memo<ChatInputAreaProps>((
  {
    value,
    textareaRef,
    disabled,
    placeholder,
    onChange,
    onFocus,
    onBlur,
    onPressEnter,
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
      className="min-h-0 flex-1 px-4 text-base leading-relaxed text-text placeholder:text-text2/70 bg-transparent"
      inputContainerClassName="border-0 bg-background/90 dark:bg-background/80 h-full"
    />
  )
})

ChatInputArea.displayName = 'ChatInputArea'
