/**
 * I18nProvider 组件
 *
 * 重渲染优化为核心目标：
 * 1. 实例只创建一次（useConst），不因 resources/storage 等对象 identity 反复 new
 * 2. 拆分两个 Context 隔离重渲染：
 *    - I18nApiContext：稳定不变的方法集合 + 实例，引用恒稳定（消费方法的组件不会因语言切换重渲染）
 *    - I18nStateContext：随语言/资源变化的 { language, t }（仅消费翻译的组件才重渲染）
 */

import type { I18n, I18nOptions, Language, PersistenceAdapter, Resources } from '../index'
import type { I18nApiContextValue, I18nProviderProps, I18nStateContextValue } from './types'
import { useConst, useLatestCallback, useStable } from 'hooks'
import { createI18n, getI18n } from '../index'
import { createContext, useEffect, useMemo, useState } from 'react'

/**
 * API Context：稳定的方法集合 + 实例
 * 引用在 Provider 生命周期内恒定，消费它的组件不会因语言/资源变化而重渲染
 */
export const I18nApiContext = createContext<I18nApiContextValue | undefined>(undefined)

/**
 * State Context：随语言/资源变化的状态
 * 仅消费它的组件（如 useT）会在语言切换或资源变更时重渲染
 */
export const I18nStateContext = createContext<I18nStateContextValue | undefined>(undefined)

/**
 * I18nProvider 组件
 *
 * @example
 * ```tsx
 * <I18nProvider resources={ resources } defaultLanguage="zh-CN">
 *   <App />
 * </I18nProvider>
 * ```
 */
export function I18nProvider(props: I18nProviderProps) {
  const {
    children,
    instance,
    resources: initialResources,
    defaultLanguage,
    persistence,
    detection,
    fallback,
    language: controlledLanguage,
  } = props

  /**
   * 稳定外部传入的复杂对象 props 引用
   * 避免父组件每次渲染传入新对象字面量导致下游 effect/计算反复触发
   */
  const stableResources = useStable(initialResources)
  const stablePersistence = useStable(persistence)
  const stableDetection = useStable(detection)
  const stableFallback = useStable(fallback)

  /**
   * 实例只创建一次
   *
   * 用 useConst 固化：仅在首次挂载时读取一次 props 构建 options，
   * 后续 props 对象 identity 变化【不会】触发重新 new（修复旧 thrash bug）。
   * 受控语言、运行时改资源等场景由后续 effect / 方法处理，无需重建实例。
   */
  const { i18n, createdNewInstance } = useConst<{ i18n: I18n, createdNewInstance: boolean }>(() => {
    if (instance) {
      return { i18n: instance, createdNewInstance: false }
    }

    const options: I18nOptions = {}

    if (controlledLanguage) {
      options.language = controlledLanguage
    }
    if (defaultLanguage) {
      options.defaultLanguage = defaultLanguage
    }
    if (stablePersistence) {
      options.persistence = stablePersistence
    }
    if (stableDetection) {
      options.detection = stableDetection
    }
    if (stableFallback) {
      options.fallback = stableFallback
    }
    if (stableResources) {
      options.resources = stableResources
    }

    /** 有任一配置项则创建新实例；否则复用全局单例 */
    const hasOptions
      = controlledLanguage
        || defaultLanguage
        || stablePersistence
        || stableDetection
        || stableFallback
        || stableResources

    return hasOptions
      ? { i18n: createI18n(options), createdNewInstance: true }
      : { i18n: getI18n(), createdNewInstance: false }
  })

  /**
   * 是否复用了全局单例（既未传 instance，也无任何构建配置）
   * 这是「挂载后是否需要补偿」的唯一判据：新实例已在 options 内处理、
   * 外部 instance 由其自身管理，二者均无需补偿；仅复用全局单例时才补设映射/资源
   */
  const usedGlobalSingleton = !instance && !createdNewInstance

  /** 当前语言：随 'language:change' 事件更新，触发消费 state 的组件重渲染 */
  const [language, setLanguage] = useState<Language>(() => i18n.getLanguage())

  /**
   * 资源版本计数
   * 旧实现资源变更不重渲染——这里订阅 resource:add/merge/update/remove，
   * 自增 version 触发 t 引用刷新，使已渲染文案能跟随资源变更更新
   */
  const [version, setVersion] = useState(0)

  /** 复用全局单例且传了 fallback.map 时，挂载后补设映射（新实例已在 options 内处理） */
  const applyLanguageToLocale = useLatestCallback(() => {
    const map = stableFallback?.map

    if (usedGlobalSingleton && map) {
      i18n.setLanguageToLocale(map)
    }
  })

  /** 全局单例场景下，通过 props 传入 resources 时补充注册（新实例已在创建时注入） */
  const applyInitialResources = useLatestCallback(() => {
    if (usedGlobalSingleton && stableResources) {
      i18n.addResources(stableResources)
    }
  })

  /** 仅挂载时执行一次的初始化补偿逻辑 */
  useEffect(() => {
    applyLanguageToLocale()
    applyInitialResources()
  }, [applyInitialResources, applyLanguageToLocale])

  /** 语言切换事件处理：用 useLatestCallback 规避闭包陈旧（始终调最新 onLanguageChange） */
  const handleLanguageChange = useLatestCallback((next: Language) => {
    setLanguage(next)
    props.onLanguageChange?.(next)
  })

  /** 资源变更事件处理：自增 version 刷新 t 引用，并回调 onResourceUpdate */
  const handleResourceUpdate = useLatestCallback((lang: string) => {
    setVersion(v => v + 1)
    props.onResourceUpdate?.(lang as Language, i18n.getResources(lang as Language)!)
  })

  /** 订阅实例事件：语言切换 + 资源增删改合 */
  useEffect(() => {
    const onLang = (next: Language) => handleLanguageChange(next)
    /** 资源类事件（增删改合）一律刷新 t，只需读取 language 字段 */
    const onResource = ({ language: lang }: { language: string }) => handleResourceUpdate(lang)
    const resourceEvents = ['resource:add', 'resource:merge', 'resource:update', 'resource:remove'] as const

    i18n.on('language:change', onLang)
    resourceEvents.forEach(event => i18n.on(event, onResource))

    return () => {
      i18n.off('language:change', onLang)
      resourceEvents.forEach(event => i18n.off(event, onResource))
    }
  }, [i18n, handleLanguageChange, handleResourceUpdate])

  /** 受控语言：外部 language 变化时同步到实例（保留旧逻辑） */
  const syncControlledLanguage = useLatestCallback(() => {
    if (controlledLanguage != null && controlledLanguage !== i18n.getLanguage()) {
      i18n.changeLanguage(controlledLanguage)
    }
  })

  useEffect(() => {
    syncControlledLanguage()
  }, [controlledLanguage, syncControlledLanguage])

  /**
   * 稳定方法集合（全部用 useLatestCallback 包裹，引用恒稳定）
   * 这些包装函数始终调用最新逻辑，可安全放入只创建一次的 api 对象
   */
  const changeLanguage = useLatestCallback((next: Language) => i18n.changeLanguage(next))
  const addResources = useLatestCallback((resources: Resources) => i18n.addResources(resources))
  const mergeResources = useLatestCallback((resources: Resources, deep?: boolean) => i18n.mergeResources(resources, deep))
  const updateResource = useLatestCallback((lang: Language, key: string, value: any) => i18n.updateResource(lang, key, value))
  const removeResource = useLatestCallback((lang: Language, key: string) => i18n.removeResource(lang, key))
  const getResources = useLatestCallback((lang?: Language) => i18n.getResources(lang))
  const getLanguages = useLatestCallback(() => i18n.getLanguages())
  const enableStorage = useLatestCallback(() => i18n.enableStorage())
  const disableStorage = useLatestCallback(() => i18n.disableStorage())
  const setStorageAdapter = useLatestCallback((adapter: PersistenceAdapter) => i18n.setStorageAdapter(adapter))

  /**
   * API Context 值：用 useMemo([]) 固化为单一引用，永不变化
   * 依赖空数组——内部方法均为 useLatestCallback 稳定引用，i18n 为 useConst 稳定实例
   */
  const apiValue = useMemo<I18nApiContextValue>(
    () => ({
      i18n,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /**
   * State Context 值：language / version 变化时刷新
   * t 引用随 language、version 变化而变，从而消费 useT 的组件能重新翻译
   */
  const stateValue = useMemo<I18nStateContextValue>(
    () => ({
      language,
      t: i18n.t.bind(i18n),
    }),
    // version 用于在资源变更时刷新 t 引用
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n, language, version],
  )

  return (
    <I18nApiContext value={ apiValue }>
      <I18nStateContext value={ stateValue }>
        { children }
      </I18nStateContext>
    </I18nApiContext>
  )
}
