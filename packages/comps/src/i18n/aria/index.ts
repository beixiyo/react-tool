import { LANGUAGES } from 'i18n'
import { enUS } from './en-US'
import { jaJP } from './ja-JP'
import { zhCN } from './zh-CN'
import { zhTW } from './zh-TW'

/**
 * 通用无障碍（aria）文案资源，按语言汇总
 *
 * 经 `resources.ts` 展开进 `comps.aria` 命名空间
 */
export const ariaResources = {
  [LANGUAGES.ZH_CN]: zhCN,
  [LANGUAGES.EN_US]: enUS,
  [LANGUAGES.ZH_TW]: zhTW,
  [LANGUAGES.JA_JP]: jaJP,
} as const
