import { Language } from '../../../i18n/core/types'
import { enUS } from './en-US'
import { zhCN } from './zh-CN'

export const chatInputResources = {
  [Language.ZH_CN]: zhCN,
  [Language.EN_US]: enUS,
} as const
