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
  bottomBarHeight: number
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
    bottomBarHeight,
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
      className="px-4 text-base leading-relaxed text-text placeholder:text-text2/70 bg-transparent"
      inputContainerClassName="border-0 bg-background/90 dark:bg-background/80"
      style={ {
        height: `calc(100% - ${bottomBarHeight}px)`,
      } }
    />
  )
})

ChatInputArea.displayName = 'ChatInputArea'
