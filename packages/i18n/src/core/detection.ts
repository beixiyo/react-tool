/**
 * 浏览器/系统语言检测
 * 用于在未提供 defaultLanguage、且存储无值时，自动使用 navigator 语言
 */

/**
 * 读取浏览器当前语言（navigator.language 或 navigator.languages[0]）
 * - 在 SSR 或 navigator 不可用时返回 null
 * - 返回值格式通常为 BCP 47（如 "zh-CN"、"en-US"、"ja"）
 */
export function getBrowserLanguage(): string | null {
  if (typeof navigator === 'undefined') {
    return null
  }

  try {
    if (navigator.language && typeof navigator.language === 'string') {
      return navigator.language
    }
    if (navigator.languages?.length) {
      const first = navigator.languages[0]
      return typeof first === 'string'
        ? first
        : null
    }
  }
  catch {
    return null
  }

  return null
}
