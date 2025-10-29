import type { Resource } from 'i18next'

/**
 * 支持的语言列表
 */
export enum SupportedLanguages {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

/**
 * 获取语言资源对象
 */
const { zh, en } = getLang()

/**
 * 导出合并后的语言资源，供 i18next 使用
 */
export const resources: Resource = {
  [SupportedLanguages.EN_US]: en,
  [SupportedLanguages.ZH_CN]: zh,
}

/**
 * 动态导入全部语言文件并按命名空间整理
 * @returns 按语言分类的翻译资源
 */
function getLang() {
  /** 使用 import.meta.glob 动态导入所有语言文件 */
  const enData = import.meta.glob('./en-US/*.json', { eager: true })
  const zhData = import.meta.glob('./zh-CN/*.json', { eager: true })

  const enModules: Record<string, any> = {}
  const zhModules: Record<string, any> = {}

  /** 处理英文资源文件 */
  Object.entries(enData).forEach(([filePath, module]) => {
    const namespace = filePath.split('/').pop()!.replace('.json', '')
    if (namespace === 'index')
      return

    enModules[namespace] = (module as any).default
  })

  /** 处理中文资源文件 */
  Object.entries(zhData).forEach(([filePath, module]) => {
    const namespace = filePath.split('/').pop()!.replace('.json', '')
    if (namespace === 'index')
      return

    zhModules[namespace] = (module as any).default
  })

  return { en: enModules, zh: zhModules }
}
