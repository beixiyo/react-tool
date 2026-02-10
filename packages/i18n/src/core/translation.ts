import type { Language, TranslateOptions, Translations } from './types'
import { LANGUAGES } from './types'

/**
 * 键查找结果
 */
interface KeyLookupResult {
  value: any
  found: boolean
  path: string[]
}

/**
 * 键查找器
 * 负责在嵌套的翻译资源中查找指定键的值
 */
class KeyFinder {
  /**
   * 查找嵌套键值
   * @param resources 翻译资源
   * @param key 键路径（点分隔）
   * @returns 查找结果
   */
  find(resources: Translations, key: string): KeyLookupResult {
    const path = key.split('.')
    return this.findNestedValue(resources, path)
  }

  /**
   * 递归查找嵌套值
   */
  private findNestedValue(
    resources: Translations,
    path: string[],
  ): KeyLookupResult {
    let current: any = resources
    const visitedPath: string[] = []

    for (const segment of path) {
      visitedPath.push(segment)

      if (current && typeof current === 'object' && segment in current) {
        current = current[segment]
      }
      else {
        return {
          value: undefined,
          found: false,
          path: visitedPath,
        }
      }
    }

    return {
      value: current,
      found: true,
      path: visitedPath,
    }
  }
}

/**
 * 插值处理器
 * 处理模板字符串中的变量插值（如 {{name}}）
 */
class InterpolationProcessor {
  private readonly prefix = '{{'
  private readonly suffix = '}}'

  /**
   * 处理插值
   * @param template 模板字符串
   * @param variables 变量对象
   * @returns 处理后的字符串
   */
  interpolate(template: string, variables: Record<string, any>): string {
    if (!template || Object.keys(variables).length === 0) {
      return template
    }

    const regex = new RegExp(
      `${this.escapeRegExp(this.prefix)}(\\w+)${this.escapeRegExp(this.suffix)}`,
      'g',
    )

    return template.replace(regex, (match, key) => {
      const value = variables[key]
      return typeof value !== 'undefined'
        ? String(value)
        : match
    })
  }

  /**
   * 转义正则表达式特殊字符
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }
}

/**
 * 复数规则管理器
 */
class PluralRuleManager {
  private rules: Map<Language, (count: number) => string> = new Map()

  constructor() {
    /** 注册内置规则 */
    this.register(LANGUAGES.ZH_CN, (count: number) => {
      return count === 0 || count === 1
        ? 'one'
        : 'other'
    })

    this.register(LANGUAGES.EN_US, (count: number) => {
      if (count === 0)
        return 'zero'
      if (count === 1)
        return 'one'
      return 'other'
    })
  }

  /**
   * 注册语言复数规则
   */
  register(language: Language, rule: (count: number) => string): void {
    this.rules.set(language, rule)
  }

  /**
   * 获取复数键
   * @param language 语言
   * @param count 数量
   */
  getPluralKey(language: Language, count: number): string {
    const rule = this.rules.get(language)
    if (!rule) {
      /** 默认使用英文规则 */
      return this.getPluralKey(LANGUAGES.EN_US, count)
    }
    return rule(count)
  }

  /**
   * 获取默认复数形式
   */
  getDefaultForm(_language: Language): string {
    return 'other'
  }
}

/**
 * 翻译核心类
 * 负责执行翻译逻辑，包括键查找、插值处理、复数处理等
 */
export class TranslationEngine {
  private keyFinder: KeyFinder
  private interpolationProcessor: InterpolationProcessor
  private pluralRuleManager: PluralRuleManager

  constructor() {
    this.keyFinder = new KeyFinder()
    this.interpolationProcessor = new InterpolationProcessor()
    this.pluralRuleManager = new PluralRuleManager()
  }

  /**
   * 翻译
   * @param resources 当前语言的翻译资源
   * @param language 当前语言
   * @param key 键路径
   * @param options 翻译选项
   * @returns 翻译后的字符串
   */
  translate(
    resources: Translations,
    language: Language,
    key: string,
    options?: TranslateOptions,
  ): string {
    const { defaultValue, count, returnObjects, ...interpolation } = options || {}

    /** 查找键值 */
    const lookupResult = this.keyFinder.find(resources, key)

    if (!lookupResult.found) {
      return defaultValue || key
    }

    let value = lookupResult.value

    /** 如果明确要求返回对象，直接返回 */
    if (returnObjects) {
      return value
    }

    /** 处理复数形式 */
    if (typeof count === 'number' && typeof value === 'object') {
      const pluralKey = this.pluralRuleManager.getPluralKey(language, count)

      if (value[pluralKey]) {
        value = value[pluralKey]
      }
      else {
        const defaultForm = this.pluralRuleManager.getDefaultForm(language)
        value = value[defaultForm] || value
      }
    }

    /** 确保值是字符串 */
    if (typeof value !== 'string') {
      return defaultValue || key
    }

    /** 处理插值 */
    /** 将 count 也添加到插值变量中，以便在模板字符串中使用 {{count}} */
    const interpolationVars = { ...interpolation }
    if (typeof count === 'number') {
      interpolationVars.count = count
    }

    if (Object.keys(interpolationVars).length > 0) {
      return this.interpolationProcessor.interpolate(value, interpolationVars)
    }

    return value
  }
}
