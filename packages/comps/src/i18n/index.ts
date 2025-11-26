/**
 * i18n2 统一导出
 * 提供完整的国际化功能，支持全局调用和 React 集成
 */

// 核心类型
export type {
  Translations,
  Resources,
  TranslateOptions,
  TFunction,
  I18nEventMap,
} from './core/types'

export { Language } from './core/types'

// 核心实例
export {
  I18nInstance,
  createI18nInstance,
  getI18nInstance,
} from './core/instance'

export type { I18nInstanceOptions } from './core/instance'

// 存储相关
export type {
  StorageAdapter,
  StorageConfig,
} from './core/storage'

export {
  LocalStorageAdapter,
  DEFAULT_STORAGE_CONFIG,
} from './core/storage'

// 资源管理器
export { ResourceManager } from './core/resourceManager'

// 翻译引擎
export { TranslationEngine } from './core/translation'

// 类型推导系统
export type {
  PathExtractor,
  TranslationPaths,
  PluralKeyPath,
  ExtractInterpolationVars,
  ExtractInterpolationFromValue,
  BuildInterpolationParams,
  TFunction as TypedTFunction,
  TFunctionWithPlural,
  BuildTranslateOptions,
} from './types'

export { createTypedTFunction } from './types'

// React 封装层
export * from './react'

