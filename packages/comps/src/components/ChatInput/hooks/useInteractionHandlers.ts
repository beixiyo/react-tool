import type { RefObject } from 'react'
import type { AutoCompleteSuggestion, ChatInputProps, ChatSubmitPayload, InputHistory, PromptTemplate } from '../types'
import type { useAutoComplete } from './useAutoComplete'
import type { useInputHistory } from './useInputHistory'
import type { usePromptTemplates } from './usePromptTemplates'
import { useCallback } from 'react'

type InteractionHandlerProps = {
  /** 外部属性 */
  loading: ChatInputProps['loading']
  disabled: ChatInputProps['disabled']
  enableHistory: ChatInputProps['enableHistory']
  enableAutoComplete: ChatInputProps['enableAutoComplete']
  onSubmit: ChatInputProps['onSubmit']
  onTemplateSelect: ChatInputProps['onTemplateSelect']
  onHistorySelect: ChatInputProps['onHistorySelect']

  /** 值管理器 */
  actualValue: string
  handleChangeVal: (val: string) => void

  /** 面板管理器 */
  setShowPromptPanel: (show: boolean) => void
  setShowHistoryPanel: (show: boolean) => void
  setShowAutoComplete: (show: boolean) => void
  closeAllPanels: () => void

  /** 状态 */
  setSearchQuery: (query: string) => void

  /** 引用 */
  textareaRef: RefObject<HTMLTextAreaElement | null>

  /** 自定义 Hooks */
  promptTemplatesHook: ReturnType<typeof usePromptTemplates>
  inputHistoryHook: ReturnType<typeof useInputHistory>
  autoCompleteHook: ReturnType<typeof useAutoComplete>
}

/**
 * 用于处理核心用户交互（如输入、提交和选择）的 Hook
 */
export function useInteractionHandlers({
  loading,
  disabled,
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
}: InteractionHandlerProps) {
  const { incrementUsage } = promptTemplatesHook
  const { addHistory, resetHistoryNavigation } = inputHistoryHook
  const { generateSuggestions, clearSuggestions } = autoCompleteHook

  /** Handle template selection */
  const handleTemplateSelect = useCallback((template: PromptTemplate) => {
    handleChangeVal(template.content)
    onTemplateSelect?.(template)
    incrementUsage(template.id)
    setShowPromptPanel(false)
    textareaRef.current?.focus()
  }, [handleChangeVal, onTemplateSelect, incrementUsage, setShowPromptPanel, textareaRef])

  /** Handle history selection */
  const handleHistorySelect = useCallback((history: InputHistory) => {
    handleChangeVal(history.content)
    onHistorySelect?.(history)
    setShowHistoryPanel(false)
    textareaRef.current?.focus()
  }, [handleChangeVal, onHistorySelect, setShowHistoryPanel, textareaRef])

  /** Handle autocomplete selection */
  const handleAutoCompleteSelect = useCallback((suggestion: AutoCompleteSuggestion) => {
    if (suggestion.type === 'template' && suggestion.source) {
      handleTemplateSelect(suggestion.source as PromptTemplate)
    }
    else if (suggestion.type === 'history' && suggestion.source) {
      handleHistorySelect(suggestion.source as InputHistory)
    }
    setShowAutoComplete(false)
  }, [handleHistorySelect, handleTemplateSelect, setShowAutoComplete])

  /** Handle input changes */
  const handleInputChange = useCallback((value: string) => {
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
  }, [
    handleChangeVal,
    resetHistoryNavigation,
    enableAutoComplete,
    setSearchQuery,
    generateSuggestions,
    setShowAutoComplete,
    clearSuggestions,
  ])

  /** Handle submission */
  const handleSubmit = useCallback((extra?: Partial<ChatSubmitPayload>) => {
    if (!actualValue.trim() || loading || disabled)
      return

    if (enableHistory) {
      addHistory(actualValue.trim())
    }

    onSubmit?.({
      text: actualValue.trim(),
      ...extra,
    })
    handleChangeVal('')
    closeAllPanels()
  }, [actualValue, loading, disabled, enableHistory, addHistory, onSubmit, handleChangeVal, closeAllPanels])

  return {
    handleInputChange,
    handleSubmit,
    handleTemplateSelect,
    handleHistorySelect,
    handleAutoCompleteSelect,
  }
}
