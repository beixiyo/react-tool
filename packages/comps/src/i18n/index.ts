/**
 * i18n2 统一导出
 * 提供完整的国际化功能，支持全局调用和 React 集成
 */

/** 核心实例 */
export {
  createI18nInstance,
  getI18nInstance,
  I18nInstance,
} from './core/instance'

export type { I18nInstanceOptions } from './core/instance'

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

export { Language } from './core/types'

// React 封装层
export * from './react'

/** 统一资源导出 */
export * from './resources'

/** 类型推导系统 */
export type {
  BuildInterpolationParams,
  BuildTranslateOptions,
  ExtractInterpolationFromValue,
  ExtractInterpolationVars,
  PathExtractor,
  PluralKeyPath,
  TFunctionWithPlural,
  TranslationPaths,
  TFunction as TypedTFunction,
} from './types'

export { createTypedTFunction } from './types'
