import type { RefObject } from 'react'
import { memo } from 'react'
import { cn } from 'utils'
import { Textarea } from '../..'
import { useT } from '../../../i18n'
import { formatShortcut } from '../constants'

export type ChatInputAreaProps = {
  value: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  disabled?: boolean
  placeholder?: string
  /** 是否根据内容自动调整高度 */
  autoResize?: boolean
  /** 自动高度时的最小行数 */
  minRows?: number
  /** 自动高度时的最大行数，超出后内部滚动 */
  maxRows?: number
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
    autoResize,
    minRows,
    maxRows,
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
      autoResize={ autoResize }
      minRows={ minRows }
      maxRows={ maxRows }
      className={ cn(
        'px-4 text-base leading-relaxed text-text placeholder:text-text2/70 bg-transparent',
        autoResize
          ? 'py-2'
          : 'min-h-0 flex-1',
      ) }
      inputContainerClassName={ cn(
        'border-0 bg-background/90 dark:bg-background/80',
        !autoResize && 'h-full',
      ) }
    />
  )
})

ChatInputArea.displayName = 'ChatInputArea'
