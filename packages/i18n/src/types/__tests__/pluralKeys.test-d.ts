import { describe, expectTypeOf, it } from 'vitest'
import type { TFunction, TranslationPaths } from '../index'

const resources = {
  quota: {
    remaining_one: '{{count}} minute',
    remaining_other: '{{count}} minutes',
    title: 'Quota',
  },
}

type Res = typeof resources

describe('后缀复数键类型', () => {
  it('基础键与后缀键都是合法路径', () => {
    expectTypeOf<'quota.remaining'>().toExtend<TranslationPaths<Res>>()
    expectTypeOf<'quota.remaining_one'>().toExtend<TranslationPaths<Res>>()
    expectTypeOf<'quota.title'>().toExtend<TranslationPaths<Res>>()
  })

  it('非复数键不会被误剥离', () => {
    expectTypeOf<'quota.tit'>().not.toExtend<TranslationPaths<Res>>()
  })

  it('基础键可以接收 count', () => {
    const t = (() => '') as TFunction<Res>
    t('quota.remaining', { count: 1 })
  })
})
