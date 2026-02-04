/**
 * i18n 统一导出
 * 提供完整的国际化功能，支持全局调用
 */

/** 浏览器语言检测 */
export { getBrowserLanguage } from './core/detection'

/** 核心实例 */
export {
  createI18n,
  getI18n,
  I18n,
} from './core/instance'

export type { I18nOptions } from './core/instance'

/** 语言 fallback：语言码 → locale 映射，用于无地区资源时回退 */
export {
  getFirstAvailableLocale,
  LANGUAGE_TO_LOCALE,
  resolveLocaleCandidates,
} from './core/languageFallback'

export type { LanguageToLocaleMap } from './core/languageFallback'

/** 资源管理器 */
export { ResourceManager } from './core/resourceManager'

/** 存储相关 */
export type {
  StorageAdapter,
  StorageConfig,
} from './core/storage'

export {
  DEFAULT_STORAGE_CONFIG,
  LocalStorageAdapter,
} from './core/storage'

/** 翻译引擎 */
export { TranslationEngine } from './core/translation'

/** 核心类型 */
export type {
  I18nEventMap,
  Resources,
  TFunction,
  TranslateOptions,
  Translations,
} from './core/types'

export * from './core/types'

/** 高级类型支持 */
export type {
  BuildTranslateOptions,
  TFunction as TypedTFunction,
} from './types/builder'

export type {
  TranslationPaths,
} from './types/pathExtractor'
