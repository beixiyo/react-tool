import type { Translations } from '../core/types'

/**
 * 提取嵌套对象的所有键路径
 * 将嵌套对象转换为点分隔的路径字符串联合类型
 *
 * @example
 * ```ts
 * type Resources = {
 *   common: {
 *     loading: string
 *     error: string
 *   }
 *   user: {
 *     name: string
 *     profile: {
 *       age: string
 *     }
 *   }
 * }
 *
 * type Paths = PathExtractor<Resources>
 * // 结果: 'common.loading' | 'common.error' | 'user.name' | 'user.profile.age'
 * ```
 */
export type PathExtractor<T> = T extends string ? never
  : T extends Record<string, any> ? {
      [K in keyof T]: K extends string ? T[K] extends string ? K | StripPluralSuffix<K>
        : T[K] extends Record<string, any> ? `${K}.${PathExtractor<T[K]>}`
        : K
        : never
    }[keyof T]
  : never

/**
 * 复数分类，与 Intl.LDMLPluralRule 一致
 */
export type PluralCategory = Intl.LDMLPluralRule

/**
 * 去掉 i18next 风格的复数后缀，得到可配合 count 使用的基础键
 *
 * @example
 * ```ts
 * StripPluralSuffix<'remaining_one'> // 'remaining'
 * StripPluralSuffix<'title'> // never
 * ```
 */
export type StripPluralSuffix<K extends string> =
  K extends `${infer Base}_${PluralCategory}`
    ? Base
    : never

/**
 * 提取翻译资源的所有键路径
 * 支持嵌套对象结构，生成点分隔的路径字符串联合类型
 */
export type TranslationPaths<T extends Translations> = PathExtractor<T>

/**
 * 提取复数键路径
 * 对于包含复数形式的键，支持 one/other/zero 等后缀
 */
export type PluralKeyPath<T extends Translations> =
  | TranslationPaths<T>
  | `${TranslationPaths<T>}.one`
  | `${TranslationPaths<T>}.other`
  | `${TranslationPaths<T>}.zero`
  | `${TranslationPaths<T>}.few`
  | `${TranslationPaths<T>}.many`
  | `${TranslationPaths<T>}.two`
