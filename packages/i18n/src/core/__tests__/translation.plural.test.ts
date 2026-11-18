import { describe, expect, it } from 'vitest'
import { TranslationEngine } from '../translation'
import type { Translations } from '../types'

function createT(resources: Record<string, Translations>, localeChain: string[]) {
  const engine = new TranslationEngine()
  const t = (key: string, options?: Record<string, any>) =>
    engine.translate({
      localeChain,
      getResource: (locale) => resources[locale],
      language: localeChain[0],
      key,
      options,
    })

  return { engine, t }
}

describe('后缀复数键', () => {
  const enUS = {
    quota: {
      remaining_zero: 'zero {{count}}',
      remaining_one: '{{count}} minute',
      remaining_other: '{{count}} minutes',
    },
  }

  it('按 Intl 规则选择 _one / _other，并注入 count', () => {
    const { t } = createT({ 'en-US': enUS }, ['en-US'])

    expect(t('quota.remaining', { count: 1 })).toBe('1 minute')
    expect(t('quota.remaining', { count: 5 })).toBe('5 minutes')
  })

  it('英文 0 归入 other，不命中 _zero', () => {
    const { t } = createT({ 'en-US': enUS }, ['en-US'])

    expect(t('quota.remaining', { count: 0 })).toBe('0 minutes')
  })

  it('阿拉伯语覆盖 zero/one/two/few/many/other 六个分类', () => {
    const ar = {
      n_zero: 'zero',
      n_one: 'one',
      n_two: 'two',
      n_few: 'few',
      n_many: 'many',
      n_other: 'other',
    }
    const { t } = createT({ ar }, ['ar'])

    expect([0, 1, 2, 3, 11, 100].map((count) => t('n', { count })))
      .toEqual(['zero', 'one', 'two', 'few', 'many', 'other'])
  })

  it('缺少对应形态时回退 _other', () => {
    const { t } = createT({ 'zh-CN': { m_other: '{{count}} 分钟' } }, ['zh-CN'])

    expect(t('m', { count: 1 })).toBe('1 分钟')
  })

  it('当前 locale 缺失时按 locale 链回退，并用命中 locale 的规则选形态', () => {
    const { t } = createT(
      { 'zh-CN': {}, 'en-US': enUS },
      ['zh-CN', 'en-US'],
    )

    expect(t('quota.remaining', { count: 1 })).toBe('1 minute')
  })

  it('同一 locale 内后缀形态优先于跨 locale 回退', () => {
    const { t } = createT(
      { 'zh-CN': { m_other: '中文 {{count}}' }, 'en-US': { m_one: 'en {{count}}' } },
      ['zh-CN', 'en-US'],
    )

    expect(t('m', { count: 1 })).toBe('中文 1')
  })

  it('自定义复数规则作用于后缀键', () => {
    const { engine, t } = createT({ 'en-US': enUS }, ['en-US'])
    engine.registerPluralRule('en-US', (count) =>
      count === 0
        ? 'zero'
        : 'other')

    expect(t('quota.remaining', { count: 0 })).toBe('zero 0')
  })

  it('支持命名空间与嵌套 $t 引用后缀复数键', () => {
    const { t } = createT(
      { 'en-US': { ...enUS, summary: 'Left: $t(quota.remaining, {"count": {{n}} })' } },
      ['en-US'],
    )

    expect(t('summary', { n: 1 })).toBe('Left: 1 minute')
  })

  it('不传 count 时后缀键不参与查找', () => {
    const { t } = createT({ 'en-US': enUS }, ['en-US'])

    expect(t('quota.remaining')).toBe('quota.remaining')
    expect(t('quota.remaining_one', { count: 3 })).toBe('3 minute')
  })
})

describe('嵌套复数写法保持兼容', () => {
  it('对象形态按复数分类取值，缺失回退 other', () => {
    const { t } = createT(
      { 'en-US': { items: { one: '{{count}} item', other: '{{count}} items' } } },
      ['en-US'],
    )

    expect(t('items', { count: 1 })).toBe('1 item')
    expect(t('items', { count: 2 })).toBe('2 items')
  })

  it('returnObjects 仍返回原始对象', () => {
    const items = { one: 'a', other: 'b' }
    const { t } = createT({ 'en-US': { items } }, ['en-US'])

    expect(t('items', { count: 1, returnObjects: true })).toEqual(items)
  })
})
