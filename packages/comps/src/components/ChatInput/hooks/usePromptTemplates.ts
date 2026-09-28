import { useLatestCallback, useLatestRef } from 'hooks'
import { useEffect, useState } from 'react'
import { useT } from '../../../i18n'
import { createDefaultPromptTemplates } from '../constants'
import type { PromptTemplate, UsePromptTemplatesOptions } from '../types'

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

        if (!canceled) setItems(nextItems)
      }
      finally {
        if (!canceled) setLoading(false)
      }
    }

    loadTemplates()

    return () => {
      canceled = true
    }
  }, [adapterRef, enabled, includeDefaults, tRef, templates])

  const incrementUsage = useLatestCallback((id: string) => {
    setItems((prev) =>
      prev.map((template) =>
        template.id === id
          ? { ...template, usageCount: (template.usageCount || 0) + 1 }
          : template
      )
    )
    adapterRef.current?.touch?.(id)
  })

  return {
    templates: items,
    loading,
    incrementUsage,
  }
}

function dedupeTemplates(templates: PromptTemplate[]): PromptTemplate[] {
  const ids = new Set<string>()
  return templates.filter((template) => {
    if (ids.has(template.id)) return false

    ids.add(template.id)
    return true
  })
}
