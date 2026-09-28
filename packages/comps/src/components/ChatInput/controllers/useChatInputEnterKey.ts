import { useLatestCallback } from 'hooks'
import { isChatInputShortcutMatch } from '../features/shortcuts'
import type { UseChatInputEnterKeyOptions } from '../types'

export function useChatInputEnterKey(options: UseChatInputEnterKeyOptions) {
  const {
    textareaRef,
    value,
    shortcuts,
    autoCompleteVisible,
    selectedSuggestion,
    onChange,
    onSubmit,
    onAutoCompleteSelect,
  } = options

  const insertLineBreak = useLatestCallback(() => {
    const el = textareaRef.current
    const cursorStart = el?.selectionStart ?? value.length
    const cursorEnd = el?.selectionEnd ?? cursorStart
    const nextValue = `${value.slice(0, cursorStart)}\n${value.slice(cursorEnd)}`
    const nextCursor = cursorStart + 1

    onChange(nextValue)

    requestAnimationFrame(() => {
      if (!textareaRef.current) return

      textareaRef.current.selectionStart = nextCursor
      textareaRef.current.selectionEnd = nextCursor
    })
  })

  return useLatestCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return

    if (autoCompleteVisible && selectedSuggestion) {
      e.preventDefault()
      e.stopPropagation()
      onAutoCompleteSelect(selectedSuggestion)
      return
    }

    if (isChatInputShortcutMatch(e, shortcuts.send)) {
      e.preventDefault()
      e.stopPropagation()
      onSubmit()
      return
    }

    if (isChatInputShortcutMatch(e, shortcuts.wrap)) {
      e.preventDefault()
      e.stopPropagation()
      insertLineBreak()
    }
  })
}
