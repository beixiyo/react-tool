import type { PromptTemplate } from '../../types'
import { describe, expect, it } from 'vitest'
import { resolveChatInputFeatures } from '../panels/resolveFeatures'

describe('resolveChatInputFeatures', () => {
  it('resolves legacy feature flags and defaults', () => {
    const templates: PromptTemplate[] = [
      {
        id: 'template',
        title: 'Template',
        content: 'Use this',
        category: 'custom',
      },
    ]

    expect(resolveChatInputFeatures({
      enablePromptTemplates: true,
      enableHistory: true,
      enableAutoComplete: true,
      customTemplates: templates,
      maxHistoryCount: 8,
    })).toEqual({
      promptTemplates: {
        enabled: true,
        includeDefaults: true,
        templates,
        adapter: undefined,
      },
      history: {
        enabled: true,
        maxCount: 8,
        items: undefined,
        adapter: undefined,
        shortcut: undefined,
      },
      autocomplete: {
        enabled: true,
        adapter: undefined,
      },
    })
  })

  it('lets explicit feature objects override legacy props', () => {
    const adapter = {
      search: () => [],
    }

    const resolved = resolveChatInputFeatures({
      enableHistory: true,
      maxHistoryCount: 8,
      features: {
        promptTemplates: {
          enabled: false,
          includeDefaults: false,
        },
        history: {
          enabled: false,
          maxCount: 3,
          adapter,
        },
        autocomplete: false,
      },
    })

    expect(resolved.promptTemplates.enabled).toBe(false)
    expect(resolved.promptTemplates.includeDefaults).toBe(false)
    expect(resolved.history.enabled).toBe(false)
    expect(resolved.history.maxCount).toBe(3)
    expect(resolved.history.adapter).toBe(adapter)
    expect(resolved.autocomplete.enabled).toBe(false)
  })
})
