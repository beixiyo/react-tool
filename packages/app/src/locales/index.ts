import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { resources } from './lang'

export const I18N_STORAGE_KEY = 'i18n:language'

/**
 * 语言码 → 地区 locale 的 fallback 映射
 * 浏览器/系统常只返回语言码（如 ja、en、zh），而资源按 locale（如 ja-JP、en-US、zh-CN）组织，
 * 此处配置「检测到 xx 且无 xx 资源时，尝试 xx-XX」，保证匹配不到地区时也能应用对应翻译
 */
const LANGUAGE_TO_LOCALE: Record<string, string[]> = {
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

/**
 * i18next 配置
 * VSCode i18n Ally 插件配置
 * @see https://github.com/lokalise/i18n-ally
 *
 * i18n Ally 配置项可以在项目根目录的 .vscode/settings.json 中设置:
 * {
 *   "i18n-ally.localesPaths": "src/locales",
 *   "i18n-ally.keystyle": "nested",
 *   "i18n-ally.sortKeys": true,
 *   "i18n-ally.namespace": true,
 *   "i18n-ally.enabledParsers": ["json"],
 *   "i18n-ally.sourceLanguage": "en",
 *   "i18n-ally.displayLanguage": "zh-CN",
 *   "i18n-ally.autoDetection": true
 * }
 */
i18n
  /**
   * 检测用户当前使用的语言
   * @link https://github.com/i18next/i18next-browser-languageDetector
   */
  .use(LanguageDetector)
  /**
   * 注入 react-i18next 实例
   */
  .use(initReactI18next)
  /**
   * 初始化 i18next
   * @link https://www.i18next.com/overview/configuration-options
   */
  .init({
    debug: process.env.NODE_ENV === 'development',
    lng: localStorage.getItem(I18N_STORAGE_KEY) || 'zh-CN',
    fallbackLng: LANGUAGE_TO_LOCALE,
    interpolation: {
      escapeValue: false, // React 已经安全地转义了变量
    },
    detection: {
      /** 设置语言检测的选项 */
      order: ['localStorage', 'navigator', 'querystring', 'cookie'],
      lookupLocalStorage: I18N_STORAGE_KEY,
      caches: ['localStorage'],
    },
    resources,
  })

/** 导出 i18n 实例以便在应用中使用 */
export default i18n

export const changeLanguage = (lng: string) => i18n.changeLanguage(lng)
export const getCurrentLanguage = () => i18n.language
export const getSupportedLanguages = () => Object.keys(resources)

;(window as any).i18n = i18n
;(window as any).changeLanguage = changeLanguage
;(window as any).getCurrentLanguage = getCurrentLanguage
