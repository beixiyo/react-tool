/**
 * 支持的语言类型
 */
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  ZH_TW: 'zh-TW',
  EN_US: 'en-US',
  JA_JP: 'ja-JP',
  FR_FR: 'fr-FR',
  DE_DE: 'de-DE',
  KO_KR: 'ko-KR',
  ES_ES: 'es-ES',
  RU_RU: 'ru-RU',
} as const

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES]

/**
 * 翻译资源的类型定义
 * 支持嵌套对象结构
 */
export type Translations = {
  [key: string]: string | Translations
}

/**
 * 翻译资源包类型
 * 每个语言对应一个 Translations 对象
 */
export type Resources = {
  [Lang in Language]?: Translations
}

/**
 * 翻译选项类型
 */
export interface TranslateOptions {
  /**
   * 默认值，当找不到翻译时使用
   */
  defaultValue?: string

  /**
   * 数量，用于复数形式
   */
  count?: number

  /**
   * 插值变量
   */
  [key: string]: any
}

/**
 * 翻译函数类型
 */
export type TFunction = (key: string, options?: TranslateOptions) => string

/**
 * i18n 事件映射类型
 * 定义事件名到参数类型的映射
 */
export interface I18nEventMap {
  /**
   * 语言切换事件
   */
  'language:change': Language

  /**
   * 资源添加事件
   */
  'resource:add': { language: string, resources: Translations }

  /**
   * 资源更新事件
   */
  'resource:update': { language: string, key: string, value: any }

  /**
   * 资源删除事件
   */
  'resource:remove': { language: string, key: string }

  /**
   * 资源合并事件
   */
  'resource:merge': { language: string, resources: Translations }
}
