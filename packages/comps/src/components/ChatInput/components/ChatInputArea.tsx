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
        /**
         * 不铺底色：根容器已经是 `bg-background`，这里再叠一层同色的 90%
         * 颜色上是恒等变换，却会把 `renderVoicePanel` 的录音光效挡在下面——
         * 光效沉在负 z，被这层不透明底切掉上半截，输入区下沿于是浮出一条硬边
         */
        'border-0 bg-transparent',
        !autoResize && 'h-full',
        inputContainerClassName,
      ) }
    />
  )
})

ChatInputArea.displayName = 'ChatInputArea'
