'use client'

/**
 * i18n 功能完整测试组件
 * 测试所有 i18n 功能，包括基础翻译、插值、语言切换、资源管理、存储管理等
 */

import type { Language, Resources } from 'i18n'
import { LANGUAGES } from 'i18n'
import { I18nProvider, useI18n, useLanguage, useResources, useStorage, useT } from 'i18n/react'
import { memo, useCallback, useEffect, useState } from 'react'
import { cn } from 'utils'
import { Button } from '../Button'
import { Input } from '../Input'
import { Message } from '../Message'

/** 测试资源定义 */
const testResources = {
  [LANGUAGES.ZH_CN]: {
    common: {
      loading: '加载中...',
      greeting: '你好 {{name}}',
      welcome: '欢迎来到 {{appName}}',
      items: {
        one: '有 {{count}} 个项目',
        other: '有 {{count}} 个项目',
      },
      button: {
        submit: '提交',
        cancel: '取消',
        confirm: '确认',
      },
    },
    user: {
      profile: '个人资料',
      settings: '设置',
      logout: '退出登录',
    },
    test: {
      basic: '基础翻译测试',
      interpolation: '插值测试',
      nested: '嵌套键测试',
    },
  },
  [LANGUAGES.EN_US]: {
    common: {
      loading: 'Loading...',
      greeting: 'Hello {{name}}',
      welcome: 'Welcome to {{appName}}',
      items: {
        one: '{{count}} item',
        other: '{{count}} items',
      },
      button: {
        submit: 'Submit',
        cancel: 'Cancel',
        confirm: 'Confirm',
      },
    },
    user: {
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Logout',
    },
    test: {
      basic: 'Basic Translation Test',
      interpolation: 'Interpolation Test',
      nested: 'Nested Key Test',
    },
  },
  [LANGUAGES.JA_JP]: {
    common: {
      loading: '読み込み中...',
      greeting: 'こんにちは {{name}}',
      welcome: '{{appName}} へようこそ',
      items: {
        one: '{{count}} 個のアイテム',
        other: '{{count}} 個のアイテム',
      },
      button: {
        submit: '送信',
        cancel: 'キャンセル',
        confirm: '確認',
      },
    },
    user: {
      profile: 'プロフィール',
      settings: '設定',
      logout: 'ログアウト',
    },
    test: {
      basic: '基本翻訳テスト',
      interpolation: '補間テスト',
      nested: 'ネストされたキーテスト',
    },
  },
} as const satisfies Resources

/**
 * 测试组件容器
 */
export default function I18nTest() {
  const [storageEnabled, setStorageEnabled] = useState(true)
  const [eventLog, setEventLog] = useState<Array<{ time: string, event: string, data: any }>>([])

  const handleLanguageChange = useCallback((language: Language) => {
    setEventLog(prev => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        event: 'language:change',
        data: language,
      },
    ])
  }, [])

  const handleResourceUpdate = useCallback((language: Language, resources: any) => {
    setEventLog(prev => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        event: 'resource:update',
        data: { language, keys: Object.keys(resources).length },
      },
    ])
  }, [])

  return (
    <I18nProvider
      resources={ testResources }
      defaultLanguage={ LANGUAGES.ZH_CN }
      storage={ {
        enabled: storageEnabled,
        key: 'i18n-test:language',
      } }
      onLanguageChange={ handleLanguageChange }
      onResourceUpdate={ handleResourceUpdate }
    >
      <div className={ cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-8') }>
        <div className={ cn('max-w-7xl mx-auto space-y-8') }>
          <h1 className={ cn('text-3xl font-bold text-gray-900 dark:text-white mb-8') }>
            i18n 功能完整测试
          </h1>

          {/* 基础功能测试 */ }
          <TestSection title="基础翻译功能">
            <BasicTranslationTest />
          </TestSection>

          {/* 插值测试 */ }
          <TestSection title="插值功能测试">
            <InterpolationTest />
          </TestSection>

          {/* 语言切换测试 */ }
          <TestSection title="语言切换测试">
            <LanguageSwitcherTest />
          </TestSection>

          {/* 前缀功能测试 */ }
          <TestSection title="前缀功能测试">
            <PrefixTest />
          </TestSection>

          {/* 资源管理测试 */ }
          <TestSection title="资源管理测试">
            <ResourceManagementTest />
          </TestSection>

          {/* 存储管理测试 */ }
          <TestSection title="存储管理测试">
            <StorageManagementTest
              storageEnabled={ storageEnabled }
              onStorageEnabledChange={ setStorageEnabled }
            />
          </TestSection>

          {/* 事件监听测试 */ }
          <TestSection title="事件监听测试">
            <EventTest />
          </TestSection>

          {/* 事件日志 */ }
          <TestSection title="事件日志">
            <EventLogViewer log={ eventLog } onClear={ () => setEventLog([]) } />
          </TestSection>

          {/* 完整功能演示 */ }
          <TestSection title="完整功能演示">
            <FullFeatureDemo />
          </TestSection>
        </div>
      </div>
    </I18nProvider>
  )
}

I18nTest.displayName = 'I18nTest'

/**
 * 测试区块组件
 */
const TestSection = memo<{
  title: string
  children: React.ReactNode
}>(({ title, children }) => {
  return (
    <div
      className={ cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700',
      ) }
    >
      <h2 className={ cn('text-xl font-semibold text-gray-900 dark:text-white mb-4') }>
        { title }
      </h2>
      <div className={ cn('space-y-4') }>{ children }</div>
    </div>
  )
})

TestSection.displayName = 'TestSection'

/**
 * 基础翻译测试
 */
const BasicTranslationTest = memo(() => {
  const t = useT()

  return (
    <div className={ cn('space-y-2') }>
      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>t('common.loading')</p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('common.loading') }
        </p>
      </div>
      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          t('common.button.submit')
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('common.button.submit') }
        </p>
      </div>
      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>t('user.profile')</p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('user.profile') }
        </p>
      </div>
      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          t('test.nested') (嵌套键)
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('test.nested') }
        </p>
      </div>
    </div>
  )
})

BasicTranslationTest.displayName = 'BasicTranslationTest'

/**
 * 插值功能测试
 */
const InterpolationTest = memo(() => {
  const t = useT()
  const [name, setName] = useState('John')
  const [appName, setAppName] = useState('My App')
  const [count, setCount] = useState(5)

  return (
    <div className={ cn('space-y-4') }>
      <Input
        label="名称 (name)"
        value={ name }
        onChange={ value => setName(value) }
        placeholder="请输入名称"
      />

      <Input
        label="应用名称 (appName)"
        value={ appName }
        onChange={ value => setAppName(value) }
        placeholder="请输入应用名称"
      />

      <Input
        label="数量 (count)"
        type="number"
        value={ String(count) }
        onChange={ value => setCount(Number(value) || 0) }
        placeholder="请输入数量"
      />

      <div className={ cn('space-y-2 mt-4') }>
        <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
          <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
            t('common.greeting',
            { ' ' }
            { '{' }
            { ' ' }
            name: '
            { name }
            '
            { ' ' }
            { '}' }
            )
          </p>
          <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
            { t('common.greeting', { name }) }
          </p>
        </div>

        <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
          <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
            t('common.welcome',
            { ' ' }
            { '{' }
            { ' ' }
            appName: '
            { appName }
            '
            { ' ' }
            { '}' }
            )
          </p>
          <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
            { t('common.welcome', { appName }) }
          </p>
        </div>

        <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
          <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
            t('common.items',
            { ' ' }
            { '{' }
            { ' ' }
            count:
            { ' ' }
            { count }
            { ' ' }
            { '}' }
            )
          </p>
          <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
            { t('common.items', { count }) }
          </p>
        </div>
      </div>
    </div>
  )
})

InterpolationTest.displayName = 'InterpolationTest'

/**
 * 语言切换测试
 */
const LanguageSwitcherTest = memo(() => {
  const { language, changeLanguage } = useLanguage()
  const t = useT()

  const languages = [
    { value: LANGUAGES.ZH_CN, label: '中文 (简体)' },
    { value: LANGUAGES.EN_US, label: 'English' },
    { value: LANGUAGES.JA_JP, label: '日本語' },
  ]

  return (
    <div className={ cn('space-y-4') }>
      <div className={ cn('p-3 bg-blue-50 dark:bg-blue-900/20 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>当前语言</p>
        <p className={ cn('text-lg font-semibold text-blue-900 dark:text-blue-100') }>
          { language }
        </p>
      </div>

      <div className={ cn('flex flex-wrap gap-2') }>
        { languages.map(lang => (
          <Button
            key={ lang.value }
            onClick={ () => changeLanguage(lang.value) }
            variant={ language === lang.value
              ? 'primary'
              : 'default' }
          >
            { lang.label }
          </Button>
        )) }
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          切换语言后的翻译结果
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('common.loading') }
        </p>
      </div>
    </div>
  )
})

LanguageSwitcherTest.displayName = 'LanguageSwitcherTest'

/**
 * 前缀功能测试
 */
const PrefixTest = memo(() => {
  const t = useT()
  const commonT = useT('common')
  const buttonT = useT('common.button')
  const userT = useT('user')

  return (
    <div className={ cn('space-y-3') }>
      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          使用前缀: const commonT = useT('common')
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white mb-2') }>
          commonT('loading') =
          { ' ' }
          { commonT('loading') }
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          commonT('greeting',
          { ' ' }
          { '{' }
          { ' ' }
          name: 'Alice'
          { ' ' }
          { '}' }
          ) =
          { ' ' }
          { commonT('greeting', { name: 'Alice' }) }
        </p>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          使用前缀: const buttonT = useT('common.button')
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white mb-2') }>
          buttonT('submit') =
          { ' ' }
          { buttonT('submit') }
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          buttonT('cancel') =
          { ' ' }
          { buttonT('cancel') }
        </p>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          使用前缀: const userT = useT('user')
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white mb-2') }>
          userT('profile') =
          { ' ' }
          { userT('profile') }
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          userT('settings') =
          { ' ' }
          { userT('settings') }
        </p>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          对比: 不使用前缀 vs 使用前缀
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          t('common.loading') =
          { ' ' }
          { t('common.loading') }
          { ' ' }
          | commonT('loading') =
          { ' ' }
          { commonT('loading') }
        </p>
      </div>
    </div>
  )
})

PrefixTest.displayName = 'PrefixTest'

/**
 * 资源管理测试
 */
const ResourceManagementTest = memo(() => {
  const { addResources, mergeResources, updateResource, removeResource, getResources, getLanguages }
    = useResources()
  const { language } = useLanguage()
  const t = useT()

  const handleAddResources = useCallback(() => {
    addResources({
      [language]: {
        dynamic: {
          message: language === LANGUAGES.ZH_CN
            ? '动态添加的消息'
            : 'Dynamically added message',
          timestamp: new Date().toLocaleString(),
        },
      },
    })
  }, [addResources, language])

  const handleMergeResources = useCallback(() => {
    mergeResources(
      {
        [language]: {
          common: {
            newKey: language === LANGUAGES.ZH_CN
              ? '合并的新键'
              : 'Merged new key',
          },
        },
      },
      true,
    )
  }, [mergeResources, language])

  const handleUpdateResource = useCallback(() => {
    updateResource(language, 'common.loading', language === LANGUAGES.ZH_CN
      ? '正在加载...'
      : 'Loading now...')
  }, [updateResource, language])

  const handleRemoveResource = useCallback(() => {
    removeResource(language, 'test.basic')
  }, [removeResource, language])

  const handleShowResources = useCallback(() => {
    const resources = getResources(language)
    console.log('当前语言资源:', resources)
    Message.info(`当前语言资源已输出到控制台，共 ${Object.keys(resources || {}).length} 个顶级键`)
  }, [getResources, language])

  const handleShowLanguages = useCallback(() => {
    const languages = getLanguages()
    Message.info(`支持的语言: ${languages.join(', ')}`)
  }, [getLanguages])

  return (
    <div className={ cn('space-y-4') }>
      <div className={ cn('grid grid-cols-2 md:grid-cols-3 gap-2') }>
        <Button
          onClick={ handleAddResources }
          variant="primary"
        >
          添加资源
        </Button>
        <Button
          onClick={ handleMergeResources }
          variant="primary"
        >
          合并资源
        </Button>
        <Button
          onClick={ handleUpdateResource }
          variant="primary"
        >
          更新资源
        </Button>
        <Button
          onClick={ handleRemoveResource }
          variant="primary"
        >
          删除资源
        </Button>
        <Button
          onClick={ handleShowResources }
          variant="primary"
        >
          查看资源
        </Button>
        <Button
          onClick={ handleShowLanguages }
          variant="primary"
        >
          查看语言
        </Button>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          测试动态添加的资源
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('dynamic.message') || '（点击"添加资源"按钮后显示）' }
        </p>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          测试合并的资源
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('common.newKey') || '（点击"合并资源"按钮后显示）' }
        </p>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          测试更新的资源 (common.loading)
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('common.loading') }
        </p>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
          测试删除的资源 (test.basic)
        </p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { t('test.basic') || '（已删除，显示键名）' }
        </p>
      </div>
    </div>
  )
})

ResourceManagementTest.displayName = 'ResourceManagementTest'

/**
 * 存储管理测试
 */
const StorageManagementTest = memo<{
  storageEnabled: boolean
  onStorageEnabledChange: (enabled: boolean) => void
}>(({ storageEnabled, onStorageEnabledChange }) => {
      const { enableStorage, disableStorage } = useStorage()
      const { language, changeLanguage } = useLanguage()

      const handleToggleStorage = useCallback(() => {
        if (storageEnabled) {
          disableStorage()
          onStorageEnabledChange(false)
        }
        else {
          enableStorage()
          onStorageEnabledChange(true)
        }
      }, [storageEnabled, enableStorage, disableStorage, onStorageEnabledChange])

      const handleTestPersistence = useCallback(() => {
        /** 切换语言，然后刷新页面测试持久化 */
        const newLang = language === LANGUAGES.ZH_CN
          ? LANGUAGES.EN_US
          : LANGUAGES.ZH_CN
        changeLanguage(newLang)
        Message.info('语言已切换，请刷新页面测试持久化是否生效')
      }, [language, changeLanguage])

      return (
        <div className={ cn('space-y-4') }>
          <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>存储状态</p>
            <p
              className={ cn(
                'text-lg font-semibold',
                storageEnabled
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ) }
            >
              { storageEnabled
                ? '已启用'
                : '已禁用' }
            </p>
          </div>

          <div className={ cn('flex gap-2') }>
            <Button
              onClick={ handleToggleStorage }
              variant={ storageEnabled
                ? 'danger'
                : 'primary' }
            >
              { storageEnabled
                ? '禁用存储'
                : '启用存储' }
            </Button>
            <Button
              onClick={ handleTestPersistence }
              variant="primary"
            >
              测试持久化
            </Button>
          </div>

          <div className={ cn('p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded') }>
            <p className={ cn('text-sm text-yellow-800 dark:text-yellow-200') }>
              💡 提示: 启用存储后，语言选择会保存到 LocalStorage，刷新页面后会自动恢复
            </p>
          </div>
        </div>
      )
    })

StorageManagementTest.displayName = 'StorageManagementTest'

/**
 * 事件监听测试
 */
const EventTest = memo(() => {
  const { i18n } = useI18n()
  const [eventCount, setEventCount] = useState(0)
  const [lastEvent, setLastEvent] = useState<string>('')

  useEffect(() => {
    const handleLanguageChange = (language: Language) => {
      setEventCount(prev => prev + 1)
      setLastEvent(`语言切换: ${language}`)
    }

    const handleResourceAdd = ({ language }: { language: string, resources: any }) => {
      setEventCount(prev => prev + 1)
      setLastEvent(`资源添加: ${language}`)
    }

    const handleResourceUpdate = ({ language, key }: { language: string, key: string, value: any }) => {
      setEventCount(prev => prev + 1)
      setLastEvent(`资源更新: ${language}.${key}`)
    }

    i18n.on('language:change', handleLanguageChange)
    i18n.on('resource:add', handleResourceAdd)
    i18n.on('resource:update', handleResourceUpdate)

    return () => {
      i18n.off('language:change', handleLanguageChange)
      i18n.off('resource:add', handleResourceAdd)
      i18n.off('resource:update', handleResourceUpdate)
    }
  }, [i18n])

  return (
    <div className={ cn('space-y-3') }>
      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>事件计数</p>
        <p className={ cn('text-2xl font-bold text-gray-900 dark:text-white') }>{ eventCount }</p>
      </div>

      <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
        <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>最后事件</p>
        <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
          { lastEvent || '（暂无事件）' }
        </p>
      </div>

      <div className={ cn('p-3 bg-blue-50 dark:bg-blue-900/20 rounded') }>
        <p className={ cn('text-sm text-blue-800 dark:text-blue-200') }>
          💡 提示: 尝试切换语言、添加资源等操作，观察事件计数和最后事件的变化
        </p>
      </div>
    </div>
  )
})

EventTest.displayName = 'EventTest'

/**
 * 事件日志查看器
 */
const EventLogViewer = memo<{
  log: Array<{ time: string, event: string, data: any }>
  onClear: () => void
}>(({ log, onClear }) => {
      return (
        <div className={ cn('space-y-3') }>
          <div className={ cn('flex justify-between items-center') }>
            <h3 className={ cn('text-lg font-semibold text-gray-900 dark:text-white') }>
              事件日志 (
              { log.length }
              )
            </h3>
            <Button
              onClick={ onClear }
              size="sm"
              variant="default"
            >
              清空日志
            </Button>
          </div>

          { log.length === 0
            ? (
                <div className={ cn('p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded') }>
                  暂无事件日志
                </div>
              )
            : (
                <div className={ cn('max-h-96 overflow-y-auto space-y-2') }>
                  { log.map((item, index) => (
                    <div
                      key={ index }
                      className={ cn(
                        'p-3 bg-gray-50 dark:bg-gray-700 rounded border-l-4',
                        item.event === 'language:change'
                          ? 'border-blue-500'
                          : item.event === 'resource:update'
                            ? 'border-green-500'
                            : 'border-gray-400',
                      ) }
                    >
                      <div className={ cn('flex items-start justify-between gap-2') }>
                        <div className={ cn('flex-1') }>
                          <div className={ cn('flex items-center gap-2 mb-1') }>
                            <span
                              className={ cn(
                                'px-2 py-0.5 text-xs font-medium rounded',
                                item.event === 'language:change'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                                  : item.event === 'resource:update'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200',
                              ) }
                            >
                              { item.event }
                            </span>
                            <span className={ cn('text-xs text-gray-500 dark:text-gray-400') }>{ item.time }</span>
                          </div>
                          <div className={ cn('text-sm text-gray-700 dark:text-gray-300') }>
                            { typeof item.data === 'object'
                              ? (
                                  <pre className={ cn('text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto') }>
                                    { JSON.stringify(item.data, null, 2) }
                                  </pre>
                                )
                              : (
                                  <span>{ String(item.data) }</span>
                                ) }
                          </div>
                        </div>
                      </div>
                    </div>
                  )) }
                </div>
              ) }
        </div>
      )
    })

EventLogViewer.displayName = 'EventLogViewer'

/**
 * 完整功能演示
 * 综合展示所有 i18n 功能在实际场景中的应用
 */
const FullFeatureDemo = memo(() => {
  const { language, changeLanguage } = useLanguage()
  const t = useT()
  const commonT = useT('common')
  const buttonT = useT('common.button')
  const { addResources } = useResources()
  const [userName, setUserName] = useState('Alice')
  const [itemCount, setItemCount] = useState(3)
  const [isLoading, setIsLoading] = useState(false)

  const languages = [
    { value: LANGUAGES.ZH_CN, label: '中文 (简体)', flag: '🇨🇳' },
    { value: LANGUAGES.EN_US, label: 'English', flag: '🇺🇸' },
    { value: LANGUAGES.JA_JP, label: '日本語', flag: '🇯🇵' },
  ]

  const handleSimulateLoading = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }, [])

  const handleAddDemoResource = useCallback(() => {
    addResources({
      [language]: {
        demo: {
          success: language === LANGUAGES.ZH_CN
            ? '操作成功！'
            : language === LANGUAGES.EN_US
              ? 'Success!'
              : '成功しました！',
          message: language === LANGUAGES.ZH_CN
            ? '这是一个动态添加的翻译资源'
            : language === LANGUAGES.EN_US
              ? 'This is a dynamically added translation resource'
              : 'これは動的に追加された翻訳リソースです',
        },
      },
    })
  }, [addResources, language])

  return (
    <div className={ cn('space-y-6') }>
      {/* 模拟应用头部 */ }
      <div className={ cn('bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white') }>
        <div className={ cn('flex items-center justify-between mb-4') }>
          <h2 className={ cn('text-2xl font-bold') }>{ t('common.welcome', { appName: 'i18n Demo App' }) }</h2>
          <div className={ cn('flex gap-2') }>
            { languages.map(lang => (
              <Button
                key={ lang.value }
                onClick={ () => changeLanguage(lang.value) }
                variant={ language === lang.value
                  ? 'primary'
                  : 'default' }
                size="sm"
              >
                { lang.flag }
                { ' ' }
                { lang.label }
              </Button>
            )) }
          </div>
        </div>
        <p className={ cn('text-blue-100') }>
          { t('common.greeting', { name: userName }) }
        </p>
      </div>

      {/* 用户信息卡片 */ }
      <div className={ cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700') }>
        <h3 className={ cn('text-lg font-semibold text-gray-900 dark:text-white mb-4') }>
          { t('user.profile') }
        </h3>
        <div className={ cn('space-y-3') }>
          <Input
            label={ t('common.greeting', { name: '' }).replace(' ', '').split('{{name}}')[0] || '用户名' }
            value={ userName }
            onChange={ value => setUserName(value) }
            placeholder="请输入用户名"
          />

          <Input
            label={ t('common.items', { count: 0 }).replace('{{count}}', '').replace(/\d+/g, '').trim() || '数量' }
            type="number"
            value={ String(itemCount) }
            onChange={ value => setItemCount(Number(value) || 0) }
            placeholder="请输入数量"
          />
          <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>当前状态</p>
            <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
              { t('common.items', { count: itemCount }) }
            </p>
          </div>
        </div>
      </div>

      {/* 操作按钮区域 */ }
      <div className={ cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700') }>
        <h3 className={ cn('text-lg font-semibold text-gray-900 dark:text-white mb-4') }>
          操作演示
        </h3>
        <div className={ cn('grid grid-cols-2 md:grid-cols-4 gap-3') }>
          <Button
            onClick={ handleSimulateLoading }
            disabled={ isLoading }
            loading={ isLoading }
            variant="primary"
          >
            { isLoading
              ? commonT('loading')
              : buttonT('submit') }
          </Button>
          <Button
            variant="default"
          >
            { buttonT('cancel') }
          </Button>
          <Button
            variant="primary"
          >
            { buttonT('confirm') }
          </Button>
          <Button
            onClick={ handleAddDemoResource }
            variant="primary"
          >
            { language === LANGUAGES.ZH_CN
              ? '添加资源'
              : language === LANGUAGES.EN_US
                ? 'Add Resource'
                : 'リソース追加' }
          </Button>
        </div>
      </div>

      {/* 动态资源演示 */ }
      <div className={ cn('bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700') }>
        <h3 className={ cn('text-lg font-semibold text-gray-900 dark:text-white mb-4') }>
          动态资源演示
        </h3>
        <div className={ cn('space-y-2') }>
          <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
              demo.success
            </p>
            <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
              { t('demo.success') || '（点击"添加资源"按钮后显示）' }
            </p>
          </div>
          <div className={ cn('p-3 bg-gray-50 dark:bg-gray-700 rounded') }>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400 mb-1') }>
              demo.message
            </p>
            <p className={ cn('text-base font-medium text-gray-900 dark:text-white') }>
              { t('demo.message') || '（点击"添加资源"按钮后显示）' }
            </p>
          </div>
        </div>
      </div>

      {/* 功能特性展示 */ }
      <div className={ cn('bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6') }>
        <h3 className={ cn('text-lg font-semibold text-gray-900 dark:text-white mb-4') }>
          功能特性
        </h3>
        <div className={ cn('grid grid-cols-1 md:grid-cols-2 gap-4') }>
          <div className={ cn('p-4 bg-white dark:bg-gray-700 rounded-lg') }>
            <h4 className={ cn('font-semibold text-gray-900 dark:text-white mb-2') }>
              ✓ 类型安全
            </h4>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400') }>
              完整的 TypeScript 类型推导，编译时检查翻译键的正确性
            </p>
          </div>
          <div className={ cn('p-4 bg-white dark:bg-gray-700 rounded-lg') }>
            <h4 className={ cn('font-semibold text-gray-900 dark:text-white mb-2') }>
              ✓ 前缀支持
            </h4>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400') }>
              使用 useT('common') 可以简化嵌套键的调用
            </p>
          </div>
          <div className={ cn('p-4 bg-white dark:bg-gray-700 rounded-lg') }>
            <h4 className={ cn('font-semibold text-gray-900 dark:text-white mb-2') }>
              ✓ 插值功能
            </h4>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400') }>
              支持
              { ' ' }
              { '{{' }
              variable
              { '}}' }
              { ' ' }
              格式的变量插值，自动类型推导
            </p>
          </div>
          <div className={ cn('p-4 bg-white dark:bg-gray-700 rounded-lg') }>
            <h4 className={ cn('font-semibold text-gray-900 dark:text-white mb-2') }>
              ✓ 动态资源
            </h4>
            <p className={ cn('text-sm text-gray-600 dark:text-gray-400') }>
              支持运行时动态添加、更新、删除翻译资源
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

FullFeatureDemo.displayName = 'FullFeatureDemo'
