import { LANGUAGES } from 'i18n'
import { enUS } from './en-US'
import { zhCN } from './zh-CN'

export const chatInputResources = {
  [LANGUAGES.ZH_CN]: zhCN,
  [LANGUAGES.EN_US]: enUS,
} as const
