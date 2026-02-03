import type { Language } from './types'

/**
 * 语言码 → 地区 locale 的 fallback 映射（默认配置）
 *
 * - 语言码 → locale：浏览器常只返回语言码（如 ja、en），资源按 locale（如 ja-JP、en-US）组织，
 *   此处配置「检测到 xx 且无 xx 资源时，尝试 xx-XX」
 * - locale → 语言码：在 resolveLocaleCandidates 中会对 ja-JP 等自动加入 ja，无 ja-JP 资源时尝试 ja
 * - default：最终兜底，无任何匹配时使用（如 ['en-US']）
 */
export const LANGUAGE_TO_LOCALE: Record<string, string[]> = {
  ja: ['ja-JP'],
  en: ['en-US'],
  zh: ['zh-CN'],
  ko: ['ko-KR'],
  fr: ['fr-FR'],
  de: ['de-DE'],
  es: ['es-ES'],
  ru: ['ru-RU'],
  default: ['en-US'],
}

export type LanguageToLocaleMap = Record<string, string[]>

/**
 * 根据请求的语言码解析出要尝试的 locale 候选列表（含自身、locale⇄语言码、最后 default）
 * - 有 default 时会在列表末尾加上 fallbackMap.default（如 ['en-US']）
 * - locale → 语言码：如 ja-JP 会尝试 ja（请求是地区码且无资源时回退到语言码）
 * - 语言码 → locale：如 ja 会尝试 ja-JP（见 LANGUAGE_TO_LOCALE）
 */
export function resolveLocaleCandidates(
  lang: string,
  fallbackMap: LanguageToLocaleMap = LANGUAGE_TO_LOCALE,
): string[] {
  const candidates: string[] = [lang]
  const base = lang.split('-')[0]

  /** locale → 语言码：ja-JP 等无资源时尝试 ja */
  if (base && base !== lang && !candidates.includes(base)) {
    candidates.push(base)
  }

  /** 语言码 → locale：ja → ja-JP 等 */
  if (base && base !== lang && fallbackMap[base]) {
    for (const locale of fallbackMap[base]) {
      if (!candidates.includes(locale))
        candidates.push(locale)
    }
  }
  else if (fallbackMap[lang]) {
    for (const locale of fallbackMap[lang]) {
      if (!candidates.includes(locale))
        candidates.push(locale)
    }
  }

  /** 默认兜底（如 en-US） */
  const defaultLocales = fallbackMap.default
  if (defaultLocales?.length) {
    for (const locale of defaultLocales) {
      if (!candidates.includes(locale))
        candidates.push(locale)
    }
  }

  return candidates
}

/**
 * 从候选列表中选出第一个在资源中存在的 locale
 */
export function getFirstAvailableLocale(
  candidates: string[],
  hasResource: (locale: string) => boolean,
): Language {
  for (const locale of candidates) {
    if (hasResource(locale)) {
      return locale as Language
    }
  }
  return candidates[0] as Language
}
