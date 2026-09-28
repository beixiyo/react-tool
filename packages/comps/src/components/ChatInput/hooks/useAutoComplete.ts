import { useLatestCallback, useLatestRef } from 'hooks'
import { useMemo, useRef, useState } from 'react'
import type { AutoCompleteSuggestion, InputHistory, PromptTemplate, UseAutoCompleteOptions } from '../types'

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
  const latestSearchIdRef = useRef(0)

  const searchIndex = useMemo(() => {
    const templateIndex = templates.map((template) => ({
      type: 'template' as const,
      searchText: `${template.title} ${template.description || ''} ${template.tags?.join(' ') || ''}`.toLowerCase(),
      source: template,
    }))

    const historyIndex = histories.map((history) => ({
      type: 'history' as const,
      searchText: history.content.toLowerCase(),
      source: history,
    }))

    return [...templateIndex, ...historyIndex]
  }, [templates, histories])

  const generateSuggestions = useLatestCallback(async (query: string) => {
    const searchId = ++latestSearchIdRef.current

    if (!enabled || !query.trim()) {
      setSuggestions([])
      setSelectedIndex(-1)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const results = adapterRef.current
        ? await adapterRef.current.search(query, { templates, histories })
        : createLocalSuggestions(query, searchIndex)

      if (searchId !== latestSearchIdRef.current) return

      setSuggestions(results)
      setSelectedIndex(
        results.length > 0
          ? 0
          : -1,
      )
    }
    catch {
      if (searchId === latestSearchIdRef.current) {
        setSuggestions([])
        setSelectedIndex(-1)
      }
    }
    finally {
      if (searchId === latestSearchIdRef.current) setLoading(false)
    }
  })

  const getSelectedSuggestion = useLatestCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) return suggestions[selectedIndex]
    return null
  })

  const clearSuggestions = useLatestCallback(() => {
    latestSearchIdRef.current += 1
    setSuggestions([])
    setSelectedIndex(-1)
    setLoading(false)
  })

  return {
    suggestions,
    loading,
    selectedIndex,
    setSelectedIndex,
    generateSuggestions,
    getSelectedSuggestion,
    clearSuggestions,
  }
}

function createLocalSuggestions(query: string, searchIndex: SearchIndexItem[]): AutoCompleteSuggestion[] {
  const results: AutoCompleteSuggestion[] = []

  for (const item of searchIndex) {
    const score = calculateScore(item.searchText, query)
    if (score <= 0) continue

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
      if (scoreA !== scoreB) return scoreB - scoreA
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

  if (lowerSearchText === lowerQuery) return 100
  if (lowerSearchText.startsWith(lowerQuery)) return 80
  if (lowerSearchText.includes(lowerQuery)) return 60

  const words = lowerQuery.split(' ').filter((word) => word.length > 0)
  const matchedWords = words.filter((word) => lowerSearchText.includes(word))
  if (matchedWords.length > 0) return Math.floor((matchedWords.length / words.length) * 40)

  return 0
}

type SearchIndexItem = {
  type: 'template' | 'history'
  searchText: string
  source: PromptTemplate | InputHistory
}
