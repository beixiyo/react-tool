import type { PromptCategory, PromptTemplate, UsePromptTemplatesOptions } from '../types'
import { useLatestCallback, useLatestRef } from 'hooks'
import { useEffect, useState } from 'react'
import { useT } from '../../../i18n'
import { createDefaultPromptTemplates } from '../constants'

const EMPTY_TEMPLATES: PromptTemplate[] = []

export function usePromptTemplates(options: UsePromptTemplatesOptions = {}) {
  const {
    enabled = false,
    templates = EMPTY_TEMPLATES,
    includeDefaults = true,
    adapter,
  } = options

  const t = useT()
  const tRef = useLatestRef(t)
  const adapterRef = useLatestRef(adapter)
  const [items, setItems] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    let canceled = false

    async function loadTemplates() {
      if (!enabled) {
        setItems([])
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const externalTemplates = await adapterRef.current?.load?.()
        const defaultTemplates = includeDefaults
          ? createDefaultPromptTemplates(tRef.current)
          : []
        const nextItems = dedupeTemplates([
          ...defaultTemplates,
          ...templates,
          ...(externalTemplates ?? []),
        ])

        if (!canceled)
          setItems(nextItems)
      }
      finally {
        if (!canceled)
          setLoading(false)
      }
    }

    loadTemplates()

    return () => {
      canceled = true
    }
  }, [adapterRef, enabled, includeDefaults, tRef, templates])

  const addCustomTemplate = useLatestCallback((template: Omit<PromptTemplate, 'id' | 'isCustom' | 'createdAt' | 'usageCount'>) => {
    const newTemplate: PromptTemplate = {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      isCustom: true,
      createdAt: Date.now(),
      usageCount: 0,
    }

    setItems(prev => dedupeTemplates([...prev, newTemplate]))
    adapterRef.current?.save?.(newTemplate)

    return newTemplate
  })

  const updateTemplate = useLatestCallback((id: string, updates: Partial<PromptTemplate>) => {
    setItems(prev => prev.map(template =>
      template.id === id
        ? { ...template, ...updates }
        : template,
    ))
    adapterRef.current?.update?.(id, updates)
  })

  const deleteCustomTemplate = useLatestCallback((id: string) => {
    setItems(prev => prev.filter(template => template.id !== id))
    adapterRef.current?.remove?.(id)
  })

  const incrementUsage = useLatestCallback((id: string) => {
    setItems(prev => prev.map(template =>
      template.id === id
        ? { ...template, usageCount: (template.usageCount || 0) + 1 }
        : template,
    ))
    adapterRef.current?.touch?.(id)
  })

  const getTemplatesByCategory = useLatestCallback((category?: PromptCategory) => {
    if (!category)
      return items
    return items.filter(template => template.category === category)
  })

  const searchTemplates = useLatestCallback((query: string, category?: PromptCategory) => {
    const filteredTemplates = category
      ? getTemplatesByCategory(category)
      : items

    if (!query.trim())
      return filteredTemplates

    const searchQuery = query.toLowerCase()
    return filteredTemplates.filter(template =>
      template.title.toLowerCase().includes(searchQuery)
      || template.description?.toLowerCase().includes(searchQuery)
      || template.content.toLowerCase().includes(searchQuery)
      || template.tags?.some(tag => tag.toLowerCase().includes(searchQuery)),
    )
  })

  const getMostUsedTemplates = useLatestCallback((limit = 5) => {
    return [...items]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, limit)
  })

  const getRecentCustomTemplates = useLatestCallback((limit = 5) => {
    return items
      .filter(t => t.isCustom)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, limit)
  })

  return {
    templates: items,
    loading,
    addCustomTemplate,
    updateTemplate,
    deleteCustomTemplate,
    incrementUsage,
    getTemplatesByCategory,
    searchTemplates,
    getMostUsedTemplates,
    getRecentCustomTemplates,
  }
}

function dedupeTemplates(templates: PromptTemplate[]): PromptTemplate[] {
  const ids = new Set<string>()
  return templates.filter((template) => {
    if (ids.has(template.id))
      return false

    ids.add(template.id)
    return true
  })
}
