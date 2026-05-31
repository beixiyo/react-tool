/**
 * i18n core 统一导出（barrel）
 * 汇总各核心模块的运行时符号与类型，供上层 src/index.ts 与外部复用
 */

/** 语言检测 */
export {
  cookieDetector,
  detectLanguage,
  getBrowserLanguage,
  htmlTagDetector,
  navigatorDetector,
  queryStringDetector,
  resolveDetection,
} from './detection'

/** 核心实例 */
export {
  createI18n,
  getI18n,
  I18n,
} from './instance'

export type { I18nOptions } from './instance'

/** 语言 fallback：语言码 → locale 映射、locale 链构建 */
export {
  buildLocaleChain,
  getFirstAvailableLocale,
  LANGUAGE_TO_LOCALE,
  resolveLocaleCandidates,
} from './languageFallback'

/** 语言持久化：内置适配器、配置解析、向后兼容形态 */
export {
  cookieAdapter,
  createPersistenceAdapter,
  DEFAULT_STORAGE_CONFIG,
  localStorageAdapter,
  LocalStorageAdapter,
  memoryAdapter,
  queryStringAdapter,
  resolvePersistence,
  sessionStorageAdapter,
} from './persistence'

/** 资源管理器 */
export { ResourceManager } from './resourceManager'

/** 翻译引擎 */
export {
  resolveKeyPath,
  TranslationEngine,
} from './translation'

/** 核心类型 */
export * from './types'
