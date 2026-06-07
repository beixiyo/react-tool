/**
 * 统一导入所有组件的国际化资源
 * 默认提供中英文支持
 *
 * 使用说明：
 * 1. 在此文件中导入所有组件的翻译资源
 * 2. 使用对象展开运算符合并资源（浅合并）
 * 3. 如果多个组件有相同的键，后面的会覆盖前面的
 * 4. 如需深度合并，可以使用 mergeResources 方法
 */

import type { Resources } from 'i18n'
import { LANGUAGES } from 'i18n'
import { chatInputResources } from '../components/ChatInput/locales'
import { datePickerResources } from '../components/DatePicker/locales'
import { uploaderResources } from '../components/Uploader/locales'
import { commonResources } from './common'

/**
 * 合并所有组件的翻译资源
 *
 * 统一挂在包级命名空间 `comps` 根 key 下，与其它包（如 tiptap）的资源隔离，
 * 避免通用词（placeholder / confirm 等）跨包碰撞。组件内访问通过 comps 专用
 * useT 自动注入 `comps` 前缀，故调用处仍写 `t('chatInput.xxx')`、无需手写前缀。
 *
 * 添加新组件资源示例（同样放进 comps 命名空间内）：
 * ```ts
 * import { chatInputResources } from '../components/ChatInput/locales'
 * import { otherComponentResources } from '../components/OtherComponent/locales'
 *
 * export const allResources = {
 *   [LANGUAGES.ZH_CN]: {
 *     comps: {
 *       ...chatInputResources[LANGUAGES.ZH_CN],
 *       ...otherComponentResources[LANGUAGES.ZH_CN],
 *     },
 *   },
 * }
 * ```
 */

export const allResources = {
  [LANGUAGES.ZH_CN]: {
    comps: {
      ...commonResources[LANGUAGES.ZH_CN],
      ...chatInputResources[LANGUAGES.ZH_CN],
      ...datePickerResources[LANGUAGES.ZH_CN],
      ...uploaderResources[LANGUAGES.ZH_CN],
    },
  },
  [LANGUAGES.ZH_TW]: {
    comps: {
      ...commonResources[LANGUAGES.ZH_TW],
      ...chatInputResources[LANGUAGES.EN_US],
      ...datePickerResources[LANGUAGES.ZH_TW],
      ...uploaderResources[LANGUAGES.ZH_TW],
    },
  },
  [LANGUAGES.EN_US]: {
    comps: {
      ...commonResources[LANGUAGES.EN_US],
      ...chatInputResources[LANGUAGES.EN_US],
      ...datePickerResources[LANGUAGES.EN_US],
      ...uploaderResources[LANGUAGES.EN_US],
    },
  },
  [LANGUAGES.JA_JP]: {
    comps: {
      ...commonResources[LANGUAGES.JA_JP],
      ...chatInputResources[LANGUAGES.EN_US],
      ...datePickerResources[LANGUAGES.JA_JP],
      ...uploaderResources[LANGUAGES.JA_JP],
    },
  },
} as const as unknown as Resources

/**
 * 默认支持的语言列表
 */
export const supportedLanguages = [
  LANGUAGES.ZH_CN,
  LANGUAGES.ZH_TW,
  LANGUAGES.EN_US,
  LANGUAGES.JA_JP,
  LANGUAGES.KO_KR,
] as const
