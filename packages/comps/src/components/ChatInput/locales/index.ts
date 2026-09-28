import { LANGUAGES } from 'i18n'
import { enUS } from './en-US'
import { jaJP } from './ja-JP'
import { zhCN } from './zh-CN'
import { zhTW } from './zh-TW'

export const chatInputResources = {
  [LANGUAGES.ZH_CN]: zhCN,
  [LANGUAGES.ZH_TW]: zhTW,
  [LANGUAGES.EN_US]: enUS,
  [LANGUAGES.JA_JP]: jaJP,
} as const
