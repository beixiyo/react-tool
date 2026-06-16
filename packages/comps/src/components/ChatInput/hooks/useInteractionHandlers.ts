import type { AutoCompleteSuggestion, ChatSubmitPayload, InputHistory, InteractionHandlerOptions, PromptTemplate } from '../types'
import { useLatestCallback } from 'hooks'

/**
 * 用于处理核心用户交互（如输入、提交和选择）的 Hook
 */
export function useInteractionHandlers({
  loading,
  disabled,
  allowEmptySubmit,
  enableHistory,
  enableAutoComplete,
  onSubmit,
  onTemplateSelect,
  onHistorySelect,
  actualValue,
  handleChangeVal,
  setShowPromptPanel,
  setShowHistoryPanel,
  setShowAutoComplete,
  closeAllPanels,
  setSearchQuery,
  textareaRef,
  promptTemplatesHook,
  inputHistoryHook,
  autoCompleteHook,
}: InteractionHandlerOptions) {
  const { incrementUsage } = promptTemplatesHook
  const { addHistory, resetHistoryNavigation } = inputHistoryHook
  const { generateSuggestions, clearSuggestions } = autoCompleteHook

  /** Handle template selection */
  const handleTemplateSelect = useLatestCallback((template: PromptTemplate) => {
    handleChangeVal(template.content)
    onTemplateSelect?.(template)
    incrementUsage(template.id)
    setShowPromptPanel(false)
    textareaRef.current?.focus()
  })

  /** Handle history selection */
  const handleHistorySelect = useLatestCallback((history: InputHistory) => {
    handleChangeVal(history.content)
    onHistorySelect?.(history)
    setShowHistoryPanel(false)
    textareaRef.current?.focus()
  })

  /** Handle autocomplete selection */
  const handleAutoCompleteSelect = useLatestCallback((suggestion: AutoCompleteSuggestion) => {
    if (suggestion.type === 'template' && suggestion.source) {
      handleTemplateSelect(suggestion.source as PromptTemplate)
    }
    else if (suggestion.type === 'history' && suggestion.source) {
      handleHistorySelect(suggestion.source as InputHistory)
    }
    setShowAutoComplete(false)
  })

  /** Handle input changes */
  const handleInputChange = useLatestCallback((value: string) => {
    handleChangeVal(value)
    resetHistoryNavigation()

    if (enableAutoComplete && value.trim()) {
      setSearchQuery(value)
      generateSuggestions(value)
      setShowAutoComplete(true)
    }
    else {
      setShowAutoComplete(false)
      clearSuggestions()
    }
  })

  /** Handle submission */
  const handleSubmit = useLatestCallback((extra?: Partial<ChatSubmitPayload>) => {
    const text = actualValue.trim()
    /** 允许纯文字、纯图片或纯语音任一存在即可发送；allowEmptySubmit 时由消费方保证有外部可发送内容 */
    const hasContent = allowEmptySubmit || !!text || !!extra?.images?.length || !!extra?.voice
    if (!hasContent || loading || disabled)
      return

    if (enableHistory && text) {
      addHistory(text)
    }

    onSubmit?.({
      text,
      ...extra,
    })
    handleChangeVal('')
    closeAllPanels()
  })

  return {
    handleInputChange,
    handleSubmit,
    handleTemplateSelect,
    handleHistorySelect,
    handleAutoCompleteSelect,
  }
}
