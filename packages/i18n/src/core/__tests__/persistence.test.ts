import { describe, expect, it } from 'vitest'
import {
  cookieAdapter,
  createPersistenceAdapter,
  localStorageAdapter,
  memoryAdapter,
  queryStringAdapter,
  resolvePersistence,
  sessionStorageAdapter,
} from '../persistence'

describe('i18n 持久化适配器', () => {
  it('读写并移除 local/session storage 值', () => {
    const local = localStorageAdapter()
    const session = sessionStorageAdapter()

    local.set('lang', 'zh-CN')
    session.set('lang', 'ja-JP')

    expect(local.get('lang')).toBe('zh-CN')
    expect(session.get('lang')).toBe('ja-JP')

    local.remove('lang')
    session.remove('lang')

    expect(local.get('lang')).toBeNull()
    expect(session.get('lang')).toBeNull()
  })

  it('支持内存和 cookie 适配器', () => {
    const memory = memoryAdapter()
    const cookie = cookieAdapter()

    memory.set('lang', 'en-US')
    cookie.set('cookie-lang', 'zh-CN')

    expect(memory.get('lang')).toBe('en-US')
    expect(cookie.get('cookie-lang')).toBe('zh-CN')

    memory.remove('lang')
    cookie.remove('cookie-lang')

    expect(memory.get('lang')).toBeNull()
    expect(cookie.get('cookie-lang')).toBeNull()
  })

  it('更新查询字符串但不改变路径或哈希', () => {
    window.history.replaceState(null, '', '/demo?lang=zh-CN&keep=1#anchor')
    const adapter = queryStringAdapter()

    expect(adapter.get('lang')).toBe('zh-CN')

    adapter.set('lang', 'ja-JP')
    expect(window.location.pathname).toBe('/demo')
    expect(window.location.search).toBe('?lang=ja-JP&keep=1')
    expect(window.location.hash).toBe('#anchor')

    adapter.remove('keep')
    expect(window.location.search).toBe('?lang=ja-JP')
  })

  it('解析持久化配置和内置策略', () => {
    expect(resolvePersistence()).toEqual({
      enabled: false,
      key: 'i18n:lang',
      adapter: null,
    })

    const custom = {
      get: () => 'zh-CN',
      set: () => {},
    }
    const resolved = resolvePersistence({
      enabled: true,
      key: 'custom-lang',
      ...custom,
    })

    expect(resolved.enabled).toBe(true)
    expect(resolved.key).toBe('custom-lang')
    expect(resolved.adapter?.get('custom-lang')).toBe('zh-CN')
    expect(createPersistenceAdapter('memory').get('missing')).toBeNull()
  })
})
