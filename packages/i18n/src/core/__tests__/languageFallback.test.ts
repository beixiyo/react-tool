import { describe, expect, it } from 'vitest'
import {
  buildLocaleChain,
  getFirstAvailableLocale,
  resolveLocaleCandidates,
} from '../languageFallback'

describe('语言回退', () => {
  it('按优先级解析候选语言且不重复', () => {
    expect(resolveLocaleCandidates('en-US')).toEqual(['en-US', 'en'])
  })

  it('支持自定义回退映射', () => {
    expect(resolveLocaleCandidates('pt-BR', {
      pt: ['pt-PT', 'pt-BR'],
      default: ['en-US'],
    }, 'fr-FR')).toEqual(['pt-BR', 'pt', 'pt-PT', 'fr-FR', 'en-US'])
  })

  it('选择第一个可用语言并构建资源链', () => {
    const hasResource = (locale: string) => ['en-US', 'zh-CN'].includes(locale)

    expect(getFirstAvailableLocale(['ja-JP', 'en-US'], hasResource)).toBe('en-US')
    expect(buildLocaleChain('zh-HK', hasResource)).toEqual(['zh-CN', 'en-US'])
    expect(buildLocaleChain('ja-JP', () => false)).toEqual(['ja-JP'])
  })
})
