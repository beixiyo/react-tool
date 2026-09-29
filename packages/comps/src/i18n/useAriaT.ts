import { I18nStateContext } from 'i18n/react'
import { use } from 'react'
import { enUS } from './aria/en-US'
import type { AriaTranslations } from './aria/en-US'

/**
 * aria 文案键类型，与 `aria/en-US.ts` 的资源键保持一致
 */
export type AriaKey = keyof AriaTranslations

/**
 * 插值变量表，对应资源模板中的 `{{name}}` 占位符
 */
export type AriaVars = Record<string, unknown>

/** aria 文案取值函数签名 */
export type AriaTFunction = (key: AriaKey, vars?: AriaVars) => string

/**
 * 无 I18nProvider 时的静态英文兜底：直接查表 + `{{name}}` 插值，
 * 与各组件历史默认文案一致，保证组件脱离 Provider 仍可用
 */
function translateFallback(key: AriaKey, vars?: AriaVars): string {
  const template: string = enUS.aria[key]
  if (!vars) return template

  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const value = vars[name]
    return value === undefined || value === null
      ? match
      : String(value)
  })
}

/**
 * 获取 aria 文案翻译函数（供组件的无障碍标签默认值使用）
 *
 * 与 `useT` 的区别在于**不要求** I18nProvider：
 * - 有 Provider：解析 `comps.aria.*`，随语言切换重渲染
 * - 无 Provider：静态英文兜底（历史默认文案），组件可独立使用
 *
 * 仅用于无障碍标签等短语文案；可见 UI 文案请使用 `useT`
 *
 * @example
 * ```tsx
 * const t = useAriaT()
 * <button aria-label={ t('clear') } />
 * <button aria-label={ t('goToImage', { index: index + 1 }) } />
 * ```
 */
export function useAriaT(): AriaTFunction {
  const ctx = use(I18nStateContext)

  /** 无 Provider：静态英文兜底 */
  if (!ctx) return translateFallback

  /** 有 Provider：走 comps.aria 命名空间，插值变量置于 options 顶层 */
  return (key, vars) => ctx.t(key, { keyPrefix: 'comps.aria', ...vars })
}
