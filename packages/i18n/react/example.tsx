/**
 * React 封装层使用示例
 * 展示如何使用 I18nProvider 和相关的 Hooks
 */

import type { Language, Resources } from '../src/core/types'
import React from 'react'
import { createI18n } from '../src/core/instance'
import { LANGUAGES } from '../src/core/types'
import { I18nProvider, useI18n, useLanguage, useResources, useStorage, useT } from './index'

// ========== 示例 1: 基础用法 ==========

const resources = {
  [LANGUAGES.ZH_CN]: {
    common: {
      loading: '加载中...',
      greeting: '你好 {{name}}',
    },
  },
  [LANGUAGES.EN_US]: {
    common: {
      loading: 'Loading...',
      greeting: 'Hello {{name}}',
    },
  },
} as const satisfies Resources

function BasicExample() {
  return (
    <I18nProvider
      resources={ resources }
    >
      <BasicExampleContent />
    </I18nProvider>
  )
}

function BasicExampleContent() {
  /** 使用 as const 后，类型推导更精确 */
  const t = useT<typeof resources[typeof LANGUAGES.ZH_CN]>()
  const commonT = useT('common')

  return (
    <div>
      <p>{ t('common.loading') }</p>
      <p>{ t('common.greeting', { name: 'John' }) }</p>
      <p>{ commonT('loading') }</p>
      <p>{ commonT('greeting', { name: 'Jane' }) }</p>
      <LanguageSwitcher />
    </div>
  )
}

// ========== 示例 2: 语言切换 ==========

function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()

  return (
    <select
      value={ language }
      onChange={ e => changeLanguage(e.target.value as Language) }
    >
      <option value={ LANGUAGES.ZH_CN }>中文</option>
      <option value={ LANGUAGES.EN_US }>English</option>
    </select>
  )
}

// ========== 示例 3: 资源管理 ==========

function ResourceManager() {
  const { addResources, mergeResources, updateResource } = useResources()

  const handleAddResources = () => {
    addResources({
      [LANGUAGES.ZH_CN]: {
        newSection: {
          title: '新标题',
          description: '新描述',
        },
      },
    })
  }

  const handleMergeResources = () => {
    mergeResources(
      {
        [LANGUAGES.ZH_CN]: {
          common: {
            error: '错误', // 合并到现有的 common 对象
          },
        },
      },
      true, // 深度合并
    )
  }

  const handleUpdateResource = () => {
    updateResource(LANGUAGES.ZH_CN, 'common.loading', '正在加载...')
  }

  return (
    <div>
      <button onClick={ handleAddResources }>添加资源</button>
      <button onClick={ handleMergeResources }>合并资源</button>
      <button onClick={ handleUpdateResource }>更新资源</button>
    </div>
  )
}

// ========== 示例 4: 存储管理 ==========

function StorageManager() {
  const { enableStorage, disableStorage } = useStorage()

  return (
    <div>
      <button onClick={ enableStorage }>启用持久化</button>
      <button onClick={ disableStorage }>禁用持久化</button>
    </div>
  )
}

// ========== 示例 5: 完整功能 ==========

function FullExample() {
  return (
    <I18nProvider
      defaultLanguage={ LANGUAGES.ZH_CN }
      resources={ {
        [LANGUAGES.ZH_CN]: {
          common: {
            loading: '加载中...',
            error: '错误',
          },
        },
        [LANGUAGES.EN_US]: {
          common: {
            loading: 'Loading...',
            error: 'Error',
          },
        },
      } }
      storage={ {
        enabled: true,
        key: 'my-app:language',
      } }
      onLanguageChange={ (language) => {
        console.log('Language changed to:', language)
      } }
      onResourceUpdate={ (language, resources) => {
        console.log('Resources updated for:', language, resources)
      } }
    >
      <FullApp />
    </I18nProvider>
  )
}

function FullApp() {
  const { i18n, language, t, changeLanguage, addResources } = useI18n()

  /** 可以直接访问 i18n 实例 */
  React.useEffect(() => {
    const unsubscribe = i18n.on('language:change', (lang) => {
      console.log('Language changed:', lang)
    })

    return () => {
      unsubscribe()
    }
  }, [i18n])

  return (
    <div>
      <p>
        当前语言:
        { language }
      </p>
      <p>{ t('common.loading') }</p>
      <button onClick={ () => changeLanguage(LANGUAGES.EN_US) }>
        切换到英文
      </button>
      <button
        onClick={ () => {
          addResources({
            [LANGUAGES.ZH_CN]: {
              dynamic: {
                message: '动态添加的消息',
              },
            },
          })
        } }
      >
        添加动态资源
      </button>
    </div>
  )
}

// ========== 示例 6: 使用自定义实例 ==========

function CustomInstanceExample() {
  const customI18n = React.useMemo(() => {
    return createI18n({
      defaultLanguage: LANGUAGES.EN_US,
      storage: {
        enabled: false, // 禁用持久化
      },
    })
  }, [])

  return (
    <I18nProvider instance={ customI18n }>
      <FullApp />
    </I18nProvider>
  )
}

// ========== 示例 7: 禁用持久化 ==========

function NoStorageExample() {
  return (
    <I18nProvider
      storage={ { enabled: false } }
      resources={ {
        [LANGUAGES.ZH_CN]: {
          common: {
            loading: '加载中...',
          },
        },
      } }
    >
      <FullApp />
    </I18nProvider>
  )
}

export {
  BasicExample,
  CustomInstanceExample,
  FullExample,
  LanguageSwitcher,
  NoStorageExample,
  ResourceManager,
  StorageManager,
}
