/**
 * React Hooks for i18n2
 * 提供便捷的 React Hooks 来使用 i18n 功能
 */

import type { Translations } from '../src/core/types'
import type { TFunction } from '../src/types/builder'
import { useI18nContext } from './provider'

/**
 * useI18n Hook
 * 返回完整的 i18n 上下文，包括实例和所有方法
 */
export function useI18n() {
  return useI18nContext()
}

/**
 * useT Hook
 * 返回翻译函数，支持类型安全和前缀功能
 *
 * @example
 * ```tsx
 * // 基础用法
 * function MyComponent() {
 *   const t = useT()
 *   return <p>{t('common.loading')}</p>
 * }
 *
 * // 类型安全用法
 * const resources = {
 *   [Language.ZH_CN]: {
 *     common: { loading: '加载中...', greeting: '你好 {{name}}' }
 *   }
 * } as const
 *
 * function MyComponent() {
 *   const t = useT<typeof resources[typeof Language.ZH_CN]>()
 *   return <p>{t('common.loading')}</p> // 类型安全
 * }
 *
 * // 使用前缀
 * function MyComponent() {
 *   const t = useT('common')
 *   return <p>{t('loading')}</p> // 自动添加 'common.' 前缀
 * }
 *
 * // 类型安全 + 前缀
 * function MyComponent() {
 *   const t = useT<typeof resources[typeof Language.ZH_CN]>('common')
 *   return <p>{t('loading')}</p> // 类型安全，且只需写 'loading'
 *   return <p>{t('greeting', { name: 'John' })}</p> // 类型安全，自动推导插值参数
 * }
 * ```
 */
export function useT(prefix: string): (key: string, options?: any) => string
export function useT<TSchema extends Translations>(): TFunction<TSchema>
export function useT(): TFunction<Translations>
export function useT(prefix?: string | undefined): any {
  const { t: baseT } = useI18nContext()

  /**
   * 如果没有前缀，返回类型安全的 t 函数
   * 注意：TypeScript 无法在运行时区分泛型，所以这里返回通用的 t
   * 类型安全由函数重载签名保证
   * 当用户传入泛型时，TypeScript 会使用对应的重载签名，提供类型检查
   */
  if (!prefix) {
    /**
     * 返回通用的 t 函数，类型安全由重载签名保证
     * 注意：虽然我们无法在运行时知道是否传入了泛型，但 TypeScript 的类型系统会确保类型安全
     */
    return baseT
  }

  /** 如果有前缀，返回一个包装函数，自动添加前缀 */
  return ((key: string, options?: any) => {
    const fullKey = `${prefix}.${key}`
    return baseT(fullKey, options)
  }) as any
}

/**
 * useLanguage Hook
 * 返回当前语言和切换语言的方法
 *
 * @example
 * ```tsx
 * function LanguageSwitcher() {
 *   const { language, changeLanguage } = useLanguage()
 *
 *   return (
 *     <select value={language} onChange={(e) => changeLanguage(e.target.value as Language)}>
 *       <option value={Language.ZH_CN}>中文</option>
 *       <option value={Language.EN_US}>English</option>
 *     </select>
 *   )
 * }
 * ```
 */
export function useLanguage() {
  const { language, changeLanguage } = useI18nContext()
  return { language, changeLanguage }
}

/**
 * useResources Hook
 * 返回资源管理相关的方法
 *
 * @example
 * ```tsx
 * function ResourceManager() {
 *   const { addResources, mergeResources, updateResource, removeResource } = useResources()
 *
 *   const handleAdd = () => {
 *     addResources({
 *       [Language.ZH_CN]: { newKey: '新值' }
 *     })
 *   }
 *
 *   return <button onClick={handleAdd}>添加资源</button>
 * }
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
  } = useI18nContext()

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
 * 返回存储管理相关的方法
 *
 * @example
 * ```tsx
 * function StorageManager() {
 *   const { enableStorage, disableStorage, setStorageAdapter } = useStorage()
 *
 *   return (
 *     <div>
 *       <button onClick={enableStorage}>启用存储</button>
 *       <button onClick={disableStorage}>禁用存储</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useStorage() {
  const { enableStorage, disableStorage, setStorageAdapter } = useI18nContext()

  return {
    enableStorage,
    disableStorage,
    setStorageAdapter,
  }
}

