import { describe, expect, it } from 'vitest'
import {
  buildLocaleChain,
  getFirstAvailableLocale,
  resolveLocaleCandidates,
} from '../languageFallback'

describe('language fallback', () => {
  it('resolves candidates in priority order without duplicates', () => {
    expect(resolveLocaleCandidates('en-US')).toEqual(['en-US', 'en'])
  })

  it('supports custom fallback maps', () => {
    expect(resolveLocaleCandidates('pt-BR', {
      pt: ['pt-PT', 'pt-BR'],
      default: ['en-US'],
    }, 'fr-FR')).toEqual(['pt-BR', 'pt', 'pt-PT', 'fr-FR', 'en-US'])
  })

  it('selects the first available locale and builds resource chains', () => {
    const hasResource = (locale: string) => ['en-US', 'zh-CN'].includes(locale)

    expect(getFirstAvailableLocale(['ja-JP', 'en-US'], hasResource)).toBe('en-US')
    expect(buildLocaleChain('zh-HK', hasResource)).toEqual(['zh-CN', 'en-US'])
    expect(buildLocaleChain('ja-JP', () => false)).toEqual(['ja-JP'])
  })
})
