import type { RefObject } from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Textarea } from '../..'

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
  const { t } = useTranslation('chat')

  return (
    <Textarea
      ref={ textareaRef }
      value={ value }
      onChange={ onChange }
      onFocus={ onFocus }
      onBlur={ onBlur }
      onPressEnter={ onPressEnter }
      placeholder={ placeholder || t('chatInput.placeholder') }
      disabled={ disabled }
      className="px-4 text-base leading-relaxed text-textPrimary placeholder:text-textSecondary/70 bg-transparent"
      inputContainerClassName="border-0 bg-background/90 dark:bg-background/80"
      style={ {
        height: `calc(100% - ${bottomBarHeight}px)`,
      } }
    />
  )
})

ChatInputArea.displayName = 'ChatInputArea'
