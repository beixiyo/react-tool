import type { AutoCompleteSuggestion, InputHistory, PromptTemplate } from '../types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CONFIG } from '../constants'

/**
 * 自动补全功能 Hook
 */
export function useAutoComplete(
  templates: PromptTemplate[],
  histories: InputHistory[],
  enabled = true,
) {
  const [suggestions, setSuggestions] = useState<AutoCompleteSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  /** 创建搜索索引 */
  const searchIndex = useMemo(() => {
    const templateIndex = templates.map(template => ({
      id: template.id,
      type: 'template' as const,
      searchText: `${template.title} ${template.description || ''} ${template.tags?.join(' ') || ''}`.toLowerCase(),
      source: template,
    }))

    const historyIndex = histories.map(history => ({
      id: history.id,
      type: 'history' as const,
      searchText: history.content.toLowerCase(),
      source: history,
    }))

    return [...templateIndex, ...historyIndex]
  }, [templates, histories])

  /** 计算匹配度分数 */
  const calculateScore = useCallback((searchText: string, query: string) => {
    const lowerQuery = query.toLowerCase()
    const lowerSearchText = searchText.toLowerCase()

    /** 完全匹配得分最高 */
    if (lowerSearchText === lowerQuery)
      return 100

    /** 开头匹配得分较高 */
    if (lowerSearchText.startsWith(lowerQuery))
      return 80

    /** 包含匹配得分中等 */
    if (lowerSearchText.includes(lowerQuery))
      return 60

    /** 模糊匹配得分较低 */
    const words = lowerQuery.split(' ').filter(word => word.length > 0)
    const matchedWords = words.filter(word => lowerSearchText.includes(word))
    if (matchedWords.length > 0) {
      return Math.floor((matchedWords.length / words.length) * 40)
    }

    return 0
  }, [])

  /** 生成建议 */
  const generateSuggestions = useCallback(async (query: string) => {
    if (!enabled || !query.trim()) {
      setSuggestions([])
      setSelectedIndex(-1)
      return
    }

    setLoading(true)

    try {
      /** 模拟异步搜索延迟 */
      await new Promise(resolve => setTimeout(resolve, DEFAULT_CONFIG.AUTOCOMPLETE_DELAY))

      const results: AutoCompleteSuggestion[] = []
      const lowerQuery = query.toLowerCase()

      /** 搜索匹配项 */
      for (const item of searchIndex) {
        const score = calculateScore(item.searchText, query)

        if (score > 0) {
          let suggestion: AutoCompleteSuggestion

          if (item.type === 'template') {
            const template = item.source as PromptTemplate
            suggestion = {
              text: template.title,
              type: 'template',
              source: template,
              score,
            }
          }
          else {
            const history = item.source as InputHistory
            /** 截取历史记录的前50个字符作为建议文本 */
            const truncatedContent = history.content.length > 50
              ? `${history.content.substring(0, 50)}...`
              : history.content

            suggestion = {
              text: truncatedContent,
              type: 'history',
              source: history,
              score,
            }
          }

          results.push(suggestion)
        }
      }

      /** 按分数排序，同分数时模板优先于历史记录 */
      const sortedResults = results
        .sort((a, b) => {
          const scoreA = a.score ?? 0
          const scoreB = b.score ?? 0
          if (scoreA !== scoreB)
            return scoreB - scoreA
          if (a.type !== b.type) {
            return a.type === 'template'
              ? -1
              : 1
          }
          return 0
        })
        .slice(0, 10) // 限制建议数量

      setSuggestions(sortedResults)
      setSelectedIndex(sortedResults.length > 0
        ? 0
        : -1)
    }
    catch (error) {
      console.error('Failed to generate suggestions:', error)
      setSuggestions([])
      setSelectedIndex(-1)
    }
    finally {
      setLoading(false)
    }
  }, [enabled, searchIndex, calculateScore])

  /** 防抖处理 */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      /** 这里可以添加防抖逻辑，但由于我们在 generateSuggestions 中已经有延迟，暂时不需要 */
    }, DEFAULT_CONFIG.SEARCH_DEBOUNCE)

    return () => clearTimeout(timeoutId)
  }, [])

  /** 选择上一个建议 */
  const selectPrevious = useCallback(() => {
    if (suggestions.length === 0)
      return
    setSelectedIndex(prev => prev <= 0
      ? suggestions.length - 1
      : prev - 1)
  }, [suggestions.length])

  /** 选择下一个建议 */
  const selectNext = useCallback(() => {
    if (suggestions.length === 0)
      return
    setSelectedIndex(prev => prev >= suggestions.length - 1
      ? 0
      : prev + 1)
  }, [suggestions.length])

  /** 获取当前选中的建议 */
  const getSelectedSuggestion = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      return suggestions[selectedIndex]
    }
    return null
  }, [suggestions, selectedIndex])

  /** 清空建议 */
  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setSelectedIndex(-1)
  }, [])

  /** 根据类型筛选建议 */
  const getSuggestionsByType = useCallback((type: 'template' | 'history') => {
    return suggestions.filter(suggestion => suggestion.type === type)
  }, [suggestions])

  return {
    suggestions,
    loading,
    selectedIndex,
    generateSuggestions,
    selectPrevious,
    selectNext,
    getSelectedSuggestion,
    clearSuggestions,
    getSuggestionsByType,
  }
}
