/**
 * I18nProvider 组件
 * 为 React 应用提供 i18n 功能，支持外部提供语言包、修改语言包、修改语言、选择持久化等
 */

import type { I18nOptions } from '../src/core/instance'
import type { Language, Resources } from '../src/core/types'
import type { I18nContextValue, I18nProviderProps } from './types'
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react'
import {
  getI18n,
  I18n,

} from '../src/core/instance'

/**
 * I18nContext
 */
const I18nContext = createContext<I18nContextValue | undefined>(undefined)

/**
 * I18nProvider 组件
 *
 * @example
 * ```tsx
 * // 基础用法
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 *
 * // 提供初始资源
 * <I18nProvider
 *   resources={{
 *     [Language.ZH_CN]: { common: { loading: '加载中...' } },
 *     [Language.EN_US]: { common: { loading: 'Loading...' } },
 *   }}
 * >
 *   <App />
 * </I18nProvider>
 *
 * // 使用自定义实例
 * const customI18n = createI18n({ defaultLanguage: Language.EN_US })
 * <I18nProvider instance={customI18n}>
 *   <App />
 * </I18nProvider>
 *
 * // 禁用持久化
 * <I18nProvider storage={{ enabled: false }}>
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider({
  children,
  instance,
  resources: initialResources,
  defaultLanguage,
  storage,
  language: controlledLanguage,
  languageToLocale,
  onLanguageChange,
  onResourceUpdate,
}: I18nProviderProps) {
  /** 获取或创建 i18n 实例 */
  const i18n = useMemo(() => {
    if (instance) {
      return instance
    }

    /** 构建实例选项 */
    const options: I18nOptions = {}
    if (controlledLanguage) {
      options.language = controlledLanguage
    }
    if (defaultLanguage) {
      options.defaultLanguage = defaultLanguage
    }
    if (storage) {
      options.storage = storage
    }
    if (initialResources) {
      options.resources = initialResources
    }
    if (languageToLocale) {
      options.languageToLocale = languageToLocale
    }

    /** 有任一选项则创建新实例；否则使用全局单例（仅传 languageToLocale 时在 useEffect 里 setLanguageToLocale） */
    if (controlledLanguage || defaultLanguage || storage || initialResources || languageToLocale) {
      return new I18n(options)
    }

    return getI18n()
  }, [instance, controlledLanguage, defaultLanguage, storage, initialResources, languageToLocale])

  /** 当前语言状态（用于触发组件更新） */
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => i18n.getLanguage())

  /**
   * 初始化资源
   * 注意：如果实例是新创建的，且传入了 resources/languageToLocale，则不需要再次添加
   * 只有在使用全局单例且通过 props 传入 resources 时，才需要添加
   */
  useEffect(() => {
    /** 如果提供了 instance，不需要添加（由外部管理） */
    if (instance) {
      return
    }

    /** 如果创建了新实例，resources 已经在创建时传入 */
    if (defaultLanguage || storage || initialResources || languageToLocale) {
      return
    }

    /** 使用全局单例，且通过 props 传入了 resources，需要添加 */
    if (initialResources) {
      i18n.addResources(initialResources)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 受控语言：当外部传入 language 时，同步到 comps 实例（用于与 app 的 i18next 等联动） */
  useEffect(() => {
    if (controlledLanguage != null && controlledLanguage !== i18n.getLanguage()) {
      i18n.changeLanguage(controlledLanguage)
    }
  }, [i18n, controlledLanguage])

  /** 监听语言切换事件 */
  useEffect(() => {
    const handleLanguageChange = (language: Language) => {
      setCurrentLanguage(language)
      onLanguageChange?.(language)
    }

    i18n.on('language:change', handleLanguageChange)

    return () => {
      i18n.off('language:change', handleLanguageChange)
    }
  }, [i18n, onLanguageChange])

  /** 监听资源更新事件 */
  useEffect(() => {
    const handleResourceAdd = ({ language }: { language: string, resources: any }) => {
      onResourceUpdate?.(language as Language, i18n.getResources(language as Language)!)
    }

    const handleResourceMerge = ({ language }: { language: string, resources: any }) => {
      onResourceUpdate?.(language as Language, i18n.getResources(language as Language)!)
    }

    const handleResourceUpdate = ({ language }: { language: string, key: string, value: any }) => {
      onResourceUpdate?.(language as Language, i18n.getResources(language as Language)!)
    }

    i18n.on('resource:add', handleResourceAdd)
    i18n.on('resource:merge', handleResourceMerge)
    i18n.on('resource:update', handleResourceUpdate)

    return () => {
      i18n.off('resource:add', handleResourceAdd)
      i18n.off('resource:merge', handleResourceMerge)
      i18n.off('resource:update', handleResourceUpdate)
    }
  }, [i18n, onResourceUpdate])

  /** 切换语言 */
  const changeLanguage = useCallback(
    (language: Language) => {
      i18n.changeLanguage(language)
    },
    [i18n],
  )

  /** 添加资源 */
  const addResources = useCallback(
    (resources: Resources) => {
      i18n.addResources(resources)
    },
    [i18n],
  )

  /** 合并资源 */
  const mergeResources = useCallback(
    (resources: Resources, deep?: boolean) => {
      i18n.mergeResources(resources, deep)
    },
    [i18n],
  )

  /** 更新资源 */
  const updateResource = useCallback(
    (language: Language, key: string, value: any) => {
      i18n.updateResource(language, key, value)
    },
    [i18n],
  )

  /** 删除资源 */
  const removeResource = useCallback(
    (language: Language, key: string) => {
      i18n.removeResource(language, key)
    },
    [i18n],
  )

  /** 获取资源 */
  const getResources = useCallback(
    (language?: Language) => {
      return i18n.getResources(language)
    },
    [i18n],
  )

  /** 获取所有支持的语言 */
  const getLanguages = useCallback(() => {
    return i18n.getLanguages()
  }, [i18n])

  /** 启用存储 */
  const enableStorage = useCallback(() => {
    i18n.enableStorage()
  }, [i18n])

  /** 禁用存储 */
  const disableStorage = useCallback(() => {
    i18n.disableStorage()
  }, [i18n])

  /** 设置存储适配器 */
  const setStorageAdapter = useCallback(
    (adapter: import('../src/core/storage').StorageAdapter) => {
      i18n.setStorageAdapter(adapter)
    },
    [i18n],
  )

  /** 上下文值 */
  const contextValue: I18nContextValue = useMemo(
    () => ({
      i18n,
      language: currentLanguage,
      t: i18n.t.bind(i18n),
      changeLanguage,
      addResources,
      mergeResources,
      updateResource,
      removeResource,
      getResources,
      getLanguages,
      enableStorage,
      disableStorage,
      setStorageAdapter,
    }),
    [
      i18n,
      currentLanguage,
      changeLanguage,
      addResources,
      mergeResources,
      updateResource,
      removeResource,
      getResources,
      getLanguages,
      enableStorage,
      disableStorage,
      setStorageAdapter,
    ],
  )

  return <I18nContext value={ contextValue }>{ children }</I18nContext>
}

/**
 * 获取 I18nContext（内部使用）
 */
export function useI18nContext(): I18nContextValue {
  const context = use(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
