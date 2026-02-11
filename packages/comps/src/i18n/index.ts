import type { Translations, TypedTFunction } from 'i18n'
import type { allResources } from './resources'
import { useT as useBaseT, useLanguage } from 'i18n/react'

/**
 * 导出通用资源
 */
export * from './common'

/**
 * 导出所有翻译资源
 */
export * from './resources'

/**
 * 导出 i18n hooks
 */
export { useLanguage }

/**
 * 获取 Comps 的翻译资源类型
 */
export type CompsTranslations = typeof allResources['zh-CN'] & Translations

/**
 * Comps 专用的类型安全 useT Hook
 * 默认使用 comps 的资源类型
 */
export function useT(prefix: string): (key: string, options?: any) => string
export function useT<TSchema extends Translations = CompsTranslations>(): TypedTFunction<TSchema>
export function useT(): TypedTFunction<CompsTranslations>
export function useT(prefix?: string): any {
  return useBaseT(prefix as any)
}
