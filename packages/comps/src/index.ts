// 1. 导入样式
import 'styles/css/autoVariables.css'
import 'styles/css/reset.css'
import 'styles/css/commonClass.css'
import 'styles/css/tailwind.css'

// 2. 导出组件
export * from './components'

// 4. 导出翻译资源
export { allResources, useT } from './i18n'
export { createI18n, getI18n, I18n } from 'i18n'
export type { I18nOptions, Language, Resources, Translations, TypedTFunction } from 'i18n'
// 3. 导出 i18n 相关（从 i18n 包重新导出）
export { I18nProvider, useI18n, useLanguage, useResources, useStorage } from 'i18n/react'
export type { I18nContextValue, I18nProviderProps } from 'i18n/react'
