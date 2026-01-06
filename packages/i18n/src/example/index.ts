import { createI18nInstance, getI18nInstance } from '../core/instance'
import { LANGUAGES } from '../core/types'
import { createTypedTFunction } from '../types'

const resources = {
  [LANGUAGES.ZH_CN]: {
    common: {
      loading: '加载中...',
      greeting: '你好 {{name}}',
    },
  },
} as const

const i18n = createI18nInstance({ resources })
const t = createTypedTFunction<typeof resources[typeof LANGUAGES.ZH_CN]>(i18n)

// ✅ 类型安全：自动补全和类型检查
t('common.greeting') // ✅
t('common.greeting', { name: 'John' }) // ✅
// t('common.invalid') // ❌ TypeScript 错误

getI18nInstance().t<typeof resources[typeof LANGUAGES.ZH_CN]>('common.greeting')
