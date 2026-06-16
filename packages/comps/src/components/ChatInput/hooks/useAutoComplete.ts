import type { AutoCompleteSuggestion, InputHistory, PromptTemplate, SearchIndexItem, UseAutoCompleteOptions } from '../types'
import { useLatestCallback, useLatestRef } from 'hooks'
import { useMemo, useState } from 'react'

export function useAutoComplete(options: UseAutoCompleteOptions) {
  const {
    templates,
    histories,
    enabled = false,
    adapter,
  } = options

  const adapterRef = useLatestRef(adapter)
  const [suggestions, setSuggestions] = useState<AutoCompleteSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

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

  const generateSuggestions = useLatestCallback(async (query: string) => {
    if (!enabled || !query.trim()) {
      setSuggestions([])
      setSelectedIndex(-1)
      return
    }

    setLoading(true)

    try {
      const results = adapterRef.current
        ? await adapterRef.current.search(query, { templates, histories })
        : createLocalSuggestions(query, searchIndex)

      setSuggestions(results)
      setSelectedIndex(results.length > 0
        ? 0
        : -1)
    }
    finally {
      setLoading(false)
    }
  })

  const selectPrevious = useLatestCallback(() => {
    if (suggestions.length === 0)
      return
    setSelectedIndex(prev => prev <= 0
      ? suggestions.length - 1
      : prev - 1)
  })

  const selectNext = useLatestCallback(() => {
    if (suggestions.length === 0)
      return
    setSelectedIndex(prev => prev >= suggestions.length - 1
      ? 0
      : prev + 1)
  })

  const getSelectedSuggestion = useLatestCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length)
      return suggestions[selectedIndex]
    return null
  })

  const clearSuggestions = useLatestCallback(() => {
    setSuggestions([])
    setSelectedIndex(-1)
  })

  const getSuggestionsByType = useLatestCallback((type: 'template' | 'history') => {
    return suggestions.filter(suggestion => suggestion.type === type)
  })

  return {
    suggestions,
    loading,
    selectedIndex,
    setSelectedIndex,
    generateSuggestions,
    selectPrevious,
    selectNext,
    getSelectedSuggestion,
    clearSuggestions,
    getSuggestionsByType,
  }
}

function createLocalSuggestions(query: string, searchIndex: SearchIndexItem[]): AutoCompleteSuggestion[] {
  const results: AutoCompleteSuggestion[] = []

  for (const item of searchIndex) {
    const score = calculateScore(item.searchText, query)
    if (score <= 0)
      continue

    if (item.type === 'template') {
      const template = item.source as PromptTemplate
      results.push({
        text: template.title,
        type: 'template',
        source: template,
        score,
      })
      continue
    }

    const history = item.source as InputHistory
    results.push({
      text: history.content.length > 50
        ? `${history.content.substring(0, 50)}...`
        : history.content,
      type: 'history',
      source: history,
      score,
    })
  }

  return results
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
    .slice(0, 10)
}

function calculateScore(searchText: string, query: string) {
  const lowerQuery = query.toLowerCase()
  const lowerSearchText = searchText.toLowerCase()

  if (lowerSearchText === lowerQuery)
    return 100
  if (lowerSearchText.startsWith(lowerQuery))
    return 80
  if (lowerSearchText.includes(lowerQuery))
    return 60

  const words = lowerQuery.split(' ').filter(word => word.length > 0)
  const matchedWords = words.filter(word => lowerSearchText.includes(word))
  if (matchedWords.length > 0)
    return Math.floor((matchedWords.length / words.length) * 40)

  return 0
}
