import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { resources } from './lang'

export const I18N_STORAGE_KEY = 'i18n:language'

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
    fallbackLng: 'en-US',
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

/** 导出实用函数以便在组件外部使用 */
export const changeLanguage = (lng: string) => i18n.changeLanguage(lng)
export const getCurrentLanguage = () => i18n.language

;(window as any).i18n = i18n
;(window as any).changeLanguage = changeLanguage
;(window as any).getCurrentLanguage = getCurrentLanguage
