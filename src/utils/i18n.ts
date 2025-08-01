import i18n from '@/locales'
import { useTranslation } from 'react-i18next'

/**
 * 获取翻译文本
 * @example
 * ```ts
 * t('chat.chatInput.placeholder')
 * ```
 *
 * @param key 翻译键
 * @param options 翻译选项
 * @returns 翻译文本
 */
export function t(key: string, options?: Record<string, any>) {
  return i18n.t(key, options)
}

/**
 * 获取命名空间下的翻译文本
 * @example
 * ```ts
 * tWithNamespace('chat', 'chatInput.placeholder')
 * ```
 */
export function tWithNamespace(namespace: string, key: string, options?: Record<string, any>) {
  return i18n.t(`${namespace}.${key}`, options)
}

/**
 * 获取翻译文本 Hook
 * @example
 * ```ts
 * t('chat.chatInput.placeholder')
 * ```
 */
export function useT() {
  const { t } = useTranslation()
  return t
}
