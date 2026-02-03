/**
 * React 封装层类型定义
 */

import type { ReactNode } from 'react'
import type { I18nInstance } from '../src/core/instance'
import type { LanguageToLocaleMap } from '../src/core/languageFallback'
import type { StorageConfig } from '../src/core/storage'
import type { Language, Resources, Translations } from '../src/core/types'
import type { TranslationPaths } from '../src/types'

/**
 * I18nProvider 组件属性
 */
export interface I18nProviderProps {
  /**
   * 子组件
   */
  children: ReactNode

  /**
   * i18n 实例（可选，不传则使用全局单例）
   */
  instance?: I18nInstance

  /**
   * 初始资源（可选，会合并到实例中）
   */
  resources?: Resources

  /**
   * 默认语言（可选，仅在创建新实例时生效）
   */
  defaultLanguage?: Language

  /**
   * 存储配置（可选，仅在创建新实例时生效）
   */
  storage?: StorageConfig

  /**
   * 语言码 → 地区 locale 的 fallback 映射（可选）
   * 创建新实例时传入 options；使用全局单例时会在挂载时调用 setLanguageToLocale
   */
  languageToLocale?: LanguageToLocaleMap

  /**
   * 语言切换回调
   */
  onLanguageChange?: (language: Language) => void

  /**
   * 资源更新回调
   */
  onResourceUpdate?: (language: Language, resources: Translations) => void
}

/**
 * I18nContext 值类型
 */
export interface I18nContextValue {
  /**
   * i18n 实例
   */
  i18n: I18nInstance

  /**
   * 当前语言
   */
  language: Language

  /**
   * 翻译函数
   */
  t: I18nInstance['t']

  /**
   * 切换语言
   */
  changeLanguage: (language: Language) => void

  /**
   * 添加资源
   */
  addResources: (resources: Resources) => void

  /**
   * 合并资源
   */
  mergeResources: (resources: Resources, deep?: boolean) => void

  /**
   * 更新资源
   */
  updateResource: (language: Language, key: string, value: any) => void

  /**
   * 删除资源
   */
  removeResource: (language: Language, key: string) => void

  /**
   * 获取资源
   */
  getResources: (language?: Language) => Translations | undefined

  /**
   * 获取所有支持的语言
   */
  getLanguages: () => string[]

  /**
   * 启用存储
   */
  enableStorage: () => void

  /**
   * 禁用存储
   */
  disableStorage: () => void

  /**
   * 设置存储适配器
   */
  setStorageAdapter: (adapter: import('../src/core/storage').StorageAdapter) => void
}

/**
 * 从 Translations 类型中提取指定前缀下的子类型
 * 支持 readonly 类型
 */
export type GetSubTranslations<
  T extends Translations,
  Prefix extends string,
> = Prefix extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? T[Key] extends Translations | Readonly<Translations>
      ? GetSubTranslations<T[Key] & Translations, Rest>
      : never
    : never
  : Prefix extends keyof T
    ? T[Prefix] extends Translations | Readonly<Translations>
      ? T[Prefix] & Translations
      : never
    : never

/**
 * 提取带前缀的路径类型
 */
export type PrefixedPaths<
  T extends Translations,
  Prefix extends string,
> = GetSubTranslations<T, Prefix> extends infer SubT
  ? SubT extends Translations
    ? TranslationPaths<SubT>
    : never
  : never
