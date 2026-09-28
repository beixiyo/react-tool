import { describe, expect, it } from 'vitest'
import { resolveChatInputFeatures } from '../panels/resolveFeatures'

describe('resolveChatInputFeatures', () => {
  it('未配置时关闭可选功能并补全内部默认值', () => {
    expect(resolveChatInputFeatures()).toEqual({
      promptTemplates: {
        enabled: false,
        includeDefaults: true,
        templates: undefined,
        adapter: undefined,
      },
      history: {
        enabled: false,
        maxCount: 50,
        items: undefined,
        adapter: undefined,
      },
      autocomplete: {
        enabled: false,
        adapter: undefined,
      },
    })
  })

  it('统一解析布尔简写和功能对象', () => {
    const adapter = {
      search: () => [],
    }

    const resolved = resolveChatInputFeatures({
      promptTemplates: true,
      history: {
        enabled: true,
        maxCount: 3,
        adapter,
      },
      autocomplete: false,
    })

    expect(resolved.promptTemplates.enabled).toBe(true)
    expect(resolved.promptTemplates.includeDefaults).toBe(true)
    expect(resolved.history.enabled).toBe(true)
    expect(resolved.history.maxCount).toBe(3)
    expect(resolved.history.adapter).toBe(adapter)
    expect(resolved.autocomplete.enabled).toBe(false)
  })
})
