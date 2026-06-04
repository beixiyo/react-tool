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
 *
 * 指向 `comps` 命名空间【内层】内容（chatInput / datePicker / common / uploader），
 * 与运行时自动注入的 `comps` 前缀对齐：调用处写 `t('chatInput.xxx')` 即可类型安全，
 * 由下方 useT 在运行时补上 `comps.` 前缀。
 */
export type CompsTranslations = NonNullable<typeof allResources['zh-CN']>['comps'] & Translations

/**
 * Comps 专用的类型安全 useT Hook
 *
 * 自动注入包级命名空间前缀 `comps`，使各组件无需手写前缀即可访问 comps 资源，
 * 同时与其它包（tiptap 等）的资源隔离：
 * - `useT()`            → 绑定到 `comps`，`t('chatInput.send')` 解析 `comps.chatInput.send`
 * - `useT('common')`    → 绑定到 `comps.common`，`t('empty.title')` 解析 `comps.common.empty.title`
 *
 * 需要跨命名空间访问时，仍可用 base 的 `:` 绝对路径（如 `t('comps:chatInput.send')`）。
 */
export function useT(prefix: string): (key: string, options?: any) => string
export function useT<TSchema extends Translations = CompsTranslations>(): TypedTFunction<TSchema>
export function useT(): TypedTFunction<CompsTranslations>
export function useT(prefix?: string): any {
  return useBaseT(prefix
    ? `comps.${prefix}`
    : 'comps')
}
