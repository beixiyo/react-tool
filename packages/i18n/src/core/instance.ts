import type { BuildTranslateOptions, TranslationPaths } from '../types'
import type { StorageAdapter, StorageConfig } from './storage'
import type { I18nEventMap, Language, Resources, Translations } from './types'
import { EventBus } from '@jl-org/tool'
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

  private constructor(options: I18nInstanceOptions = {}) {
    super()
    this.storageConfig = {
      enabled: options.storage?.enabled ?? DEFAULT_STORAGE_CONFIG.enabled,
      key: options.storage?.key ?? DEFAULT_STORAGE_CONFIG.key,
      adapter: options.storage?.adapter ?? DEFAULT_STORAGE_CONFIG.adapter,
    }

    /** 初始化存储适配器 */
    if (this.storageConfig.enabled) {
      this.storageAdapter = this.storageConfig.adapter
    }

    /** 初始化语言 */
    const storedLanguage = this.loadLanguageFromStorage()
    this.currentLanguage
      = options.defaultLanguage
        || storedLanguage
        || LANGUAGES.ZH_CN

    /** 如果存储的语言与默认语言不同，使用存储的语言 */
    if (storedLanguage && storedLanguage !== this.currentLanguage) {
      this.currentLanguage = storedLanguage
    }

    /** 添加初始资源 */
    if (options.resources) {
      this.resourceManager.addResources(options.resources)
    }
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
   * 翻译函数
   * 支持通过泛型传入资源类型，实现类型安全的键路径与插值参数推导
   * @param key 键路径
   * @param options 翻译选项
   */
  t<
    TSchema extends Translations = Translations,
    TKey extends TranslationPaths<TSchema> = TranslationPaths<TSchema>,
  >(key: TKey,
    options?: BuildTranslateOptions<TSchema, TKey>,
  ): string {
    const resources = this.resourceManager.get(this.currentLanguage)
    if (!resources) {
      return options?.defaultValue || key
    }

    return this.translationEngine.translate(
      resources,
      this.currentLanguage,
      key,
      options,
    )
  }

  /**
   * 切换语言
   * @param language 新语言
   */
  changeLanguage(language: Language): void {
    if (this.currentLanguage === language) {
      return
    }

    this.currentLanguage = language

    /** 保存到存储 */
    this.saveLanguageToStorage(language)

    /** 触发事件 */
    this.emit('language:change', language)
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
   * @param language 语言（可选，不传则返回当前语言）
   */
  getResources(language?: Language): Translations | undefined {
    const lang = language || this.currentLanguage
    return this.resourceManager.get(lang)
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
   */
  private loadLanguageFromStorage(): Language | null {
    if (!this.storageConfig.enabled || !this.storageAdapter) {
      return null
    }

    try {
      const stored = this.storageAdapter.get(this.storageConfig.key)
      if (stored && (stored === LANGUAGES.ZH_CN || stored === LANGUAGES.EN_US)) {
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
}
