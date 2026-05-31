/**
 * i18n-react 统一导出
 * 封装 React Provider + hooks，对外 API 与旧 i18n/react 兼容
 */

export * from './hooks'

export { I18nProvider } from './provider'

export type { I18nContextValue, I18nProviderProps } from './types'
