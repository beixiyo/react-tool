import type { BuildTranslateOptions, TranslationPaths } from '../types'
import type { LanguageToLocaleMap } from './languageFallback'
import type { StorageAdapter, StorageConfig } from './storage'
import type { I18nEventMap, Language, Resources, Translations } from './types'
import { EventBus } from '@jl-org/tool'
import { getBrowserLanguage } from './detection'
import {
  getFirstAvailableLocale,
  LANGUAGE_TO_LOCALE,
  resolveLocaleCandidates,
} from './languageFallback'
import { ResourceManager } from './resourceManager'
import {
  DEFAULT_STORAGE_CONFIG,
  LocalStorageAdapter,

} from './storage'
import { TranslationEngine } from './translation'
import { LANGUAGES } from './types'

const GLOBAL_I18N_INSTANCE_KEY = Symbol('@@__TIPTAP_I18N_INSTANCE__@@')

/**
 * i18n 实例类（单例模式）
 * 提供完整的国际化功能，包括翻译、语言切换、资源管理等
 */
export class I18nInstance extends EventBus<I18nEventMap> {
  private static instance: I18nInstance | null = null

  private resourceManager = new ResourceManager()
  private translationEngine = new TranslationEngine()
  private currentLanguage: Language
  private storageConfig: Required<StorageConfig>
  private storageAdapter: StorageAdapter | null = null
  private languageToLocale: LanguageToLocaleMap

  private constructor(options: I18nInstanceOptions = {}) {
    super()
    this.storageConfig = {
      enabled: options.storage?.enabled ?? DEFAULT_STORAGE_CONFIG.enabled,
      key: options.storage?.key ?? DEFAULT_STORAGE_CONFIG.key,
      adapter: options.storage?.adapter ?? DEFAULT_STORAGE_CONFIG.adapter,
    }
    this.languageToLocale = options.languageToLocale ?? LANGUAGE_TO_LOCALE

    /** 初始化存储适配器 */
    if (this.storageConfig.enabled) {
      this.storageAdapter = this.storageConfig.adapter
    }

    /** 添加初始资源（先加资源，再解析语言以便 fallback 生效） */
    if (options.resources) {
      this.resourceManager.addResources(options.resources)
    }

    /** 初始化语言：stored > defaultLanguage > 浏览器语言 > EN_US 兜底，再按 fallback 解析为已有 locale */
    const storedLanguage = this.loadLanguageFromStorage()
    const rawLanguage = storedLanguage
      || options.defaultLanguage
      || getBrowserLanguage()
      || LANGUAGES.EN_US

    this.currentLanguage = this.resolveResourceLanguage(rawLanguage) as Language
  }

  /**
   * 获取单例实例
   */
  static getInstance(options?: I18nInstanceOptions): I18nInstance {
    const g = globalThis as any

    if (!g[GLOBAL_I18N_INSTANCE_KEY]) {
      g[GLOBAL_I18N_INSTANCE_KEY] = new I18nInstance(options)
    }

    if (!I18nInstance.instance) {
      I18nInstance.instance = g[GLOBAL_I18N_INSTANCE_KEY]
    }

    return g[GLOBAL_I18N_INSTANCE_KEY]
  }

  /**
   * 创建新实例（用于测试或多实例场景）
   */
  static createInstance(options?: I18nInstanceOptions): I18nInstance {
    return new I18nInstance(options)
  }

  /**
   * 根据当前语言 + languageToLocale fallback 解析出实际用于取资源的 locale
   */
  private resolveResourceLanguage(lang: string): Language {
    const candidates = resolveLocaleCandidates(lang, this.languageToLocale)
    return getFirstAvailableLocale(
      candidates,
      locale => this.resourceManager.has(locale),
    )
  }

  /**
   * 翻译函数
   * 支持通过泛型传入资源类型，实现类型安全的键路径与插值参数推导
   * 取资源时会按 languageToLocale 做语言→locale fallback（如 ja → ja-JP）
   * @param key 键路径
   * @param options 翻译选项
   */
  t<
    TSchema extends Translations = Translations,
    TKey extends TranslationPaths<TSchema> = TranslationPaths<TSchema>,
  >(key: TKey,
    options?: BuildTranslateOptions<TSchema, TKey>,
  ): string {
    const resolvedLang = this.resolveResourceLanguage(this.currentLanguage)
    const resources = this.resourceManager.get(resolvedLang)
    if (!resources) {
      return options?.defaultValue || key
    }

    return this.translationEngine.translate(
      resources,
      resolvedLang,
      key,
      options,
    )
  }

  /**
   * 切换语言
   * 会按 languageToLocale 解析为实际存在的 locale（如 ja → ja-JP），并以此作为当前语言
   * @param language 新语言/语言码
   */
  changeLanguage(language: Language): void {
    const resolved = this.resolveResourceLanguage(language) as Language
    if (this.currentLanguage === resolved) {
      return
    }

    this.currentLanguage = resolved

    /** 保存到存储（存解析后的 locale，便于下次直接命中） */
    this.saveLanguageToStorage(resolved)

    /** 触发事件 */
    this.emit('language:change', resolved)
  }

  /**
   * 获取当前语言
   */
  getLanguage(): Language {
    return this.currentLanguage
  }

  /**
   * 添加资源
   * @param resources 资源包
   */
  addResources(resources: Resources): void {
    this.resourceManager.addResources(resources)

    /** 触发事件 */
    Object.entries(resources).forEach(([language, translations]) => {
      if (translations) {
        this.emit('resource:add', { language, resources: translations })
      }
    })
  }

  /**
   * 合并资源
   * @param resources 资源包
   * @param deep 是否深度合并
   */
  mergeResources(resources: Resources, deep: boolean = false): void {
    this.resourceManager.mergeResources(resources, deep)

    /** 触发事件 */
    Object.entries(resources).forEach(([language, translations]) => {
      if (translations) {
        this.emit('resource:merge', { language, resources: translations })
      }
    })
  }

  /**
   * 更新资源
   * @param language 语言
   * @param key 键路径
   * @param value 新值
   */
  updateResource(language: Language, key: string, value: any): void {
    this.resourceManager.update(language, key, value)
    this.emit('resource:update', { language, key, value })
  }

  /**
   * 删除资源
   * @param language 语言
   * @param key 键路径
   */
  removeResource(language: Language, key: string): void {
    this.resourceManager.remove(language, key)
    this.emit('resource:remove', { language, key })
  }

  /**
   * 获取资源
   * 取资源时会按 languageToLocale 做语言→locale fallback
   * @param language 语言（可选，不传则返回当前语言）
   */
  getResources(language?: Language): Translations | undefined {
    const lang = language || this.currentLanguage
    const resolved = this.resolveResourceLanguage(lang)
    return this.resourceManager.get(resolved)
  }

  /**
   * 获取所有支持的语言
   */
  getLanguages(): string[] {
    return this.resourceManager.getLanguages()
  }

  /**
   * 获取存储键
   */
  getStorageKey(): string {
    return this.storageConfig.key
  }

  /**
   * 设置语言→locale fallback 映射（创建实例后仍可传入自定义映射）
   * @param map 语言码 → 地区 locale 列表
   */
  setLanguageToLocale(map: LanguageToLocaleMap): void {
    this.languageToLocale = map
  }

  /**
   * 设置存储适配器
   * @param adapter 存储适配器
   */
  setStorageAdapter(adapter: StorageAdapter): void {
    this.storageAdapter = adapter
    this.storageConfig.adapter = adapter
  }

  /**
   * 启用存储
   */
  enableStorage(): void {
    this.storageConfig.enabled = true
    if (!this.storageAdapter) {
      this.storageAdapter = this.storageConfig.adapter || new LocalStorageAdapter()
    }
    /** 保存当前语言 */
    this.saveLanguageToStorage(this.currentLanguage)
  }

  /**
   * 禁用存储
   */
  disableStorage(): void {
    this.storageConfig.enabled = false
    /** 清除存储 */
    if (this.storageAdapter) {
      this.storageAdapter.remove(this.storageConfig.key)
    }
  }

  /**
   * 从存储加载语言
   * 接受任意语言码（如 ja、ja-JP），后续由 resolveResourceLanguage 做 fallback 解析
   */
  private loadLanguageFromStorage(): Language | null {
    if (!this.storageConfig.enabled || !this.storageAdapter) {
      return null
    }

    try {
      const stored = this.storageAdapter.get(this.storageConfig.key)
      if (stored && typeof stored === 'string' && stored.length > 0) {
        return stored as Language
      }
    }
    catch (error) {
      console.warn('Failed to load language from storage:', error)
    }

    return null
  }

  /**
   * 保存语言到存储
   */
  private saveLanguageToStorage(language: Language): void {
    if (!this.storageConfig.enabled || !this.storageAdapter) {
      return
    }

    try {
      this.storageAdapter.set(this.storageConfig.key, language)
    }
    catch (error) {
      console.warn('Failed to save language to storage:', error)
    }
  }
}

/**
 * 创建 i18n 实例（便捷函数）
 */
export function createI18nInstance(
  options?: I18nInstanceOptions,
): I18nInstance {
  return I18nInstance.getInstance(options)
}

/**
 * 获取全局 i18n 实例
 */
export function getI18nInstance(): I18nInstance {
  return I18nInstance.getInstance()
}

/**
 * i18n 实例配置
 */
export interface I18nInstanceOptions {
  /**
   * 默认语言
   */
  defaultLanguage?: Language

  /**
   * 初始资源
   */
  resources?: Resources

  /**
   * 存储配置
   */
  storage?: StorageConfig

  /**
   * 语言码 → 地区 locale 的 fallback 映射
   * 不传则使用内置 LANGUAGE_TO_LOCALE（ja→ja-JP、en→en-US、zh→zh-CN 等）
   */
  languageToLocale?: LanguageToLocaleMap
}
