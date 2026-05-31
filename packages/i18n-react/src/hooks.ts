/**
 * React Hooks for i18n
 *
 * 重渲染优化要点：
 * - 翻译相关 hook（useI18n / useT / useLanguage）订阅 State Context，语言/资源变化时重渲染
 * - 纯方法 hook（useResources / useStorage）只订阅 API Context，语言切换时【不】重渲染
 */

import type { TFunction as RuntimeTFunction, TranslateOptions, Translations, TypedTFunction } from 'i18n'
import type { I18nApiContextValue, I18nContextValue, I18nStateContextValue } from './types'
import { use } from 'react'
import { I18nApiContext, I18nStateContext } from './provider'

/**
 * 读取 API Context（内部使用）
 */
function useApiContext(): I18nApiContextValue {
  const ctx = use(I18nApiContext)
  if (ctx === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

/**
 * 读取 State Context（内部使用）
 */
function useStateContext(): I18nStateContextValue {
  const ctx = use(I18nStateContext)
  if (ctx === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}

/**
 * @deprecated 请使用 useApiContext 和 useStateContext 组合替代
 * 获取合并后的完整上下文（兼容旧 useI18nContext 形态）
 *
 * 同时消费 api + state，语言/资源变化时会重渲染。
 * 返回 { i18n, language, t, changeLanguage, addResources, ... }
 */
export function useI18nContext(): I18nContextValue {
  const api = useApiContext()
  const state = useStateContext()

  return {
    ...api,
    language: state.language,
    t: state.t,
  }
}

/**
 * @deprecated 请使用 useApiContext 和 useStateContext 组合替代
 * useI18n Hook
 * 返回完整的 i18n 上下文，包括实例和所有方法
 */
export function useI18n(): I18nContextValue {
  return useI18nContext()
}

/**
 * useT Hook
 * 返回翻译函数，支持类型安全和运行时前缀注入
 *
 * @example
 * ```tsx
 * // 基础用法
 * const t = useT()
 * t('common.loading')
 *
 * // 类型安全
 * const t = useT<typeof zhCN>()
 * t('common.loading')
 *
 * // 运行时前缀（自动注入 keyPrefix）
 * const t = useT('common')
 * t('loading')                       // 实际解析 common.loading
 * t('greeting', { name: 'John' })    // 实际解析 common.greeting
 * t('title', { keyPrefix: '' })      // 显式清空前缀，访问外层 key
 * ```
 */
export function useT(prefix: string): (key: string, options?: TranslateOptions) => string
export function useT<TSchema extends Translations>(): TypedTFunction<TSchema>
export function useT(): RuntimeTFunction
export function useT(prefix?: string): any {
  /** 从 State Context 取 t：保证语言/资源变化时重渲染 */
  const { t } = useStateContext()

  /** 无前缀直接返回 t，类型安全由重载签名保证 */
  if (!prefix) {
    return t
  }

  /**
   * 有前缀：返回包装函数，运行时注入 keyPrefix
   * 显式传入的 options.keyPrefix 优先（支持传 '' 清空前缀以访问外层 key）
   */
  return (key: string, options?: TranslateOptions) =>
    t(key, { ...options, keyPrefix: options?.keyPrefix ?? prefix })
}

/**
 * useLanguage Hook
 * 返回当前语言和切换语言的方法
 *
 * language 取自 State Context（随切换重渲染），
 * changeLanguage 取自 API Context（引用稳定）
 *
 * @example
 * ```tsx
 * const { language, changeLanguage } = useLanguage()
 * ```
 */
export function useLanguage() {
  const { language } = useStateContext()
  const { changeLanguage } = useApiContext()

  return { language, changeLanguage }
}

/**
 * useResources Hook
 * 只取 API Context 的资源方法
 *
 * 优化点：消费它的组件在语言切换时【不】重渲染
 *
 * @example
 * ```tsx
 * const { addResources, mergeResources, updateResource, removeResource } = useResources()
 * ```
 */
export function useResources() {
  const {
    addResources,
    mergeResources,
    updateResource,
    removeResource,
    getResources,
    getLanguages,
  } = useApiContext()

  return {
    addResources,
    mergeResources,
    updateResource,
    removeResource,
    getResources,
    getLanguages,
  }
}

/**
 * useStorage Hook
 * 只取 API Context 的存储方法
 *
 * 优化点：消费它的组件在语言切换时【不】重渲染
 *
 * @example
 * ```tsx
 * const { enableStorage, disableStorage, setStorageAdapter } = useStorage()
 * ```
 */
export function useStorage() {
  const { enableStorage, disableStorage, setStorageAdapter } = useApiContext()

  return {
    enableStorage,
    disableStorage,
    setStorageAdapter,
  }
}
