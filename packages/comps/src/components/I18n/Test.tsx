'use client'

/**
 * 自研 i18n 功能测试页
 *
 * 用项目设计 token + 自研 comps 组件，覆盖：
 * - 基础翻译 / 嵌套 key / 插值
 * - CLDR 复数（Intl.PluralRules）
 * - 命名空间 ':' + keyPrefix 前缀 / 清空前缀转义（i18next 模式语法）
 * - 嵌套引用 $t(key)（复用短语 / 传参 / 递归）
 * - 语言 fallback 链（地区回退 + 最终兜底）
 * - 文字方向 dir（LTR / RTL）
 * - key 级 fallback（缺译逐 locale 回退）
 * - 持久化多方案（localStorage / sessionStorage / cookie / queryString / memory）+ 实例级开关
 * - 自定义语言检测
 * - 事件订阅
 */

import type { Language, PersistenceStrategy, Resources } from 'i18n'
import { useLatestCallback } from 'hooks'
import { createI18n, createPersistenceAdapter, LANGUAGES } from 'i18n'
import { I18nProvider, useI18n, useLanguage, useResources, useStorage, useT } from 'i18n-react'
import { memo, useEffect, useState } from 'react'
import { cn } from 'utils'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Card } from '../Card'
import { Input } from '../Input'
import { Message } from '../Message'
import { Select } from '../Select'
import { Separator } from '../Separator'
import { Switch } from '../Switch'

/** 测试资源：zh-CN / en-US / ja-JP，common.onlyEn 故意只在 en-US 存在（演示 key 级 fallback） */
const testResources = {
  [LANGUAGES.ZH_CN]: {
    common: {
      loading: '加载中...',
      greeting: '你好 {{name}}',
      items: { one: '{{count}} 个项目', other: '{{count}} 个项目' },
    },
    user: { profile: '个人资料', settings: '设置' },
    nest: {
      learnMore: '了解更多',
      footer: '点击「$t(nest.learnMore)」查看详情',
      apples: { one: '{{count}} 个苹果', other: '{{count}} 个苹果' },
      basket: '篮子里有 $t(nest.apples, {"count": {{n}} })',
    },
  },
  [LANGUAGES.EN_US]: {
    common: {
      loading: 'Loading...',
      greeting: 'Hello {{name}}',
      onlyEn: 'Only defined in en-US',
      items: { one: '{{count}} item', other: '{{count}} items' },
    },
    user: { profile: 'Profile', settings: 'Settings' },
    nest: {
      learnMore: 'Learn more',
      footer: 'Click "$t(nest.learnMore)" for details',
      apples: { one: '{{count}} apple', other: '{{count}} apples' },
      basket: 'The basket has $t(nest.apples, {"count": {{n}} })',
    },
  },
  [LANGUAGES.JA_JP]: {
    common: {
      loading: '読み込み中...',
      greeting: 'こんにちは {{name}}',
      items: { one: '{{count}} 個', other: '{{count}} 個' },
    },
    user: { profile: 'プロフィール', settings: '設定' },
    nest: {
      learnMore: '詳細',
      footer: '「$t(nest.learnMore)」をクリック',
      apples: { one: '{{count}} 個のリンゴ', other: '{{count}} 個のリンゴ' },
      basket: 'バスケットに $t(nest.apples, {"count": {{n}} })',
    },
  },
} as const satisfies Resources

/** 持久化方案选项 */
const STRATEGY_OPTIONS = [
  { value: 'localStorage', label: 'localStorage' },
  { value: 'sessionStorage', label: 'sessionStorage' },
  { value: 'cookie', label: 'cookie' },
  { value: 'queryString', label: 'queryString' },
  { value: 'memory', label: 'memory' },
]

/** 主语言切换选项（有资源的语言） */
const LANGUAGE_OPTIONS = [
  { value: LANGUAGES.ZH_CN, label: '中文' },
  { value: LANGUAGES.EN_US, label: 'English' },
  { value: LANGUAGES.JA_JP, label: '日本語' },
]

export default function I18nTest() {
  return (
    <I18nProvider
      resources={ testResources }
      defaultLanguage={ LANGUAGES.ZH_CN }
      persistence={ { key: 'i18n-test:lang' } }
    >
      <div className={ cn('min-h-screen bg-background2 text-text px-4 py-8 md:px-8') }>
        <div className={ cn('mx-auto max-w-3xl space-y-6') }>

          <header className={ cn('space-y-2') }>
            <h1 className={ cn('text-2xl font-semibold tracking-tight') }>
              自研 i18n 功能测试
            </h1>
            <p className={ cn('text-sm text-text3') }>
              框架无关核心 + i18n-react · 设计 token + 自研组件
            </p>
          </header>

          <LanguageBar />

          <BasicSection />
          <PluralSection />
          <SyntaxSection />
          <NestingSection />
          <LanguageFallbackSection />
          <DirectionSection />
          <KeyFallbackSection />
          <PersistenceSection />
          <DetectionSection />
          <ResourceSection />
          <EventSection />
        </div>
      </div>
    </I18nProvider>
  )
}

I18nTest.displayName = 'I18nTest'

/* ============================================================
 * 顶部：当前语言 + 切换
 * ============================================================ */

const LanguageBar = memo(() => {
  const { language, changeLanguage } = useLanguage()

  return (
    <div className={ cn('flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background px-4 py-3') }>
      <span className={ cn('text-sm text-text2') }>当前语言</span>
      <Badge variant="success">{ language }</Badge>

      <div className={ cn('ml-auto flex gap-2') }>
        { LANGUAGE_OPTIONS.map(opt => (
          <Button
            key={ opt.value }
            size="sm"
            variant={ language === opt.value
              ? 'primary'
              : 'default' }
            onClick={ () => changeLanguage(opt.value) }
          >
            { opt.label }
          </Button>
        )) }
      </div>
    </div>
  )
})

LanguageBar.displayName = 'LanguageBar'

/* ============================================================
 * 通用小组件
 * ============================================================ */

/** 一行：左侧代码表达式 + 右侧实际结果 */
const Row = memo<{ code: string, result: React.ReactNode }>(({ code, result }) => {
  return (
    <div className={ cn('flex flex-col gap-1 rounded-lg bg-background3 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4') }>
      <code className={ cn('font-mono text-xs text-text3 break-all') }>{ code }</code>
      <span className={ cn('text-sm font-medium text-text') }>{ result }</span>
    </div>
  )
})

Row.displayName = 'Row'

/** 区块卡片 */
const Section = memo<{ title: string, desc?: string, children: React.ReactNode }>(({ title, desc, children }) => {
  return (
    <Card
      title={ title }
      padding="lg"
    >
      { desc && <p className={ cn('-mt-2 mb-3 text-xs text-text3') }>{ desc }</p> }
      <div className={ cn('space-y-2') }>{ children }</div>
    </Card>
  )
})

Section.displayName = 'Section'

/* ============================================================
 * 基础翻译 + 嵌套
 * ============================================================ */

const BasicSection = memo(() => {
  const t = useT()

  return (
    <Section title="基础翻译 · 嵌套 key">
      <Row code="t('common.loading')" result={ t('common.loading') } />
      <Row code="t('user.profile')" result={ t('user.profile') } />
      <Row code="t('user.settings')" result={ t('user.settings') } />
    </Section>
  )
})

BasicSection.displayName = 'BasicSection'

/* ============================================================
 * 插值 + CLDR 复数
 * ============================================================ */

const PluralSection = memo(() => {
  const t = useT()
  const [name, setName] = useState('张三')
  const [count, setCount] = useState(1)

  return (
    <Section title="插值 · CLDR 复数" desc="复数由 Intl.PluralRules 按语言选择 one/other 形态">
      <div className={ cn('grid gap-3 sm:grid-cols-2') }>
        <Input label="name" value={ name } onChange={ v => setName(v) } />
        <Input label="count" type="number" value={ String(count) } onChange={ v => setCount(Number(v) || 0) } />
      </div>

      <Row code="t('common.greeting', { name })" result={ t('common.greeting', { name }) } />
      <Row code="t('common.items', { count })" result={ t('common.items', { count }) } />

      <div className={ cn('flex flex-wrap gap-2 pt-1') }>
        { [0, 1, 2, 5].map(n => (
          <Button key={ n } size="sm" variant="ghost" onClick={ () => setCount(n) }>
            count =
            { ' ' }
            { n }
          </Button>
        )) }
      </div>
    </Section>
  )
})

PluralSection.displayName = 'PluralSection'

/* ============================================================
 * 命名空间 ':' + keyPrefix 语法（i18next 模式）
 * ============================================================ */

const SyntaxSection = memo(() => {
  const t = useT()
  const commonT = useT('common')

  return (
    <Section
      title="命名空间 ':' · keyPrefix 前缀"
      desc="useT('common') 绑定前缀；':' 走命名空间绝对路径；keyPrefix 可覆盖或清空"
    >
      <Row code="commonT = useT('common'); commonT('loading')" result={ commonT('loading') } />
      <Row code="t('user:profile')  // ':' 命名空间，绝对" result={ t('user:profile') } />
      <Row code="commonT('user:profile')  // ':' 忽略前缀" result={ commonT('user:profile') } />
      <Row code="commonT('profile', { keyPrefix: 'user' })  // 覆盖前缀" result={ commonT('profile', { keyPrefix: 'user' }) } />
      <Row code="commonT('user.profile', { keyPrefix: '' })  // 清空前缀转义" result={ commonT('user.profile', { keyPrefix: '' }) } />
    </Section>
  )
})

SyntaxSection.displayName = 'SyntaxSection'

/* ============================================================
 * 嵌套引用 $t(key)
 * ============================================================ */

const NestingSection = memo(() => {
  const t = useT()
  const [n, setN] = useState(3)

  return (
    <Section
      title="嵌套引用 $t"
      desc="翻译值用 $t(key) 引用另一 key；可传参、父级变量自动透传、支持递归"
    >
      <Row code="t('nest.footer')  // 复用 $t(nest.learnMore)" result={ t('nest.footer') } />
      <Row code="t('nest.basket', { n })  // $t(nest.apples, { count: n })" result={ t('nest.basket', { n }) } />

      <div className={ cn('flex flex-wrap gap-2 pt-1') }>
        { [1, 3, 5].map(v => (
          <Button key={ v } size="sm" variant="ghost" onClick={ () => setN(v) }>
            { `n = ${v}` }
          </Button>
        )) }
      </div>
    </Section>
  )
})

NestingSection.displayName = 'NestingSection'

/* ============================================================
 * 语言 fallback 链（地区回退 + 最终兜底）
 * ============================================================ */

/** 用独立实例演示「请求语言 → 实际解析语言」，不影响整页语言 */
const LanguageFallbackSection = memo(() => {
  const [rows] = useState(() =>
    ['zh', 'ja', 'ko', 'fr-FR', 'en-GB'].map(req => ({
      req,
      resolved: createI18n({ resources: testResources, language: req }).getLanguage(),
    })),
  )

  return (
    <Section
      title="语言 fallback 链"
      desc="zh→zh-CN（地区扩展）、ja→ja-JP、无资源语言（ko/fr-FR/en-GB）→ 最终兜底 en-US"
    >
      { rows.map(({ req, resolved }) => (
        <Row
          key={ req }
          code={ `createI18n({ language: '${req}' }).getLanguage()` }
          result={ (
            <span className={ cn('flex items-center gap-2') }>
              <code className={ cn('font-mono text-xs text-text3') }>{ req }</code>
              <span className={ cn('text-text3') }>→</span>
              <Badge variant={ resolved === req
                ? 'success'
                : 'warning' }>
                { resolved }
              </Badge>
            </span>
          ) }
        />
      )) }
    </Section>
  )
})

LanguageFallbackSection.displayName = 'LanguageFallbackSection'

/* ============================================================
 * 文字方向（LTR / RTL）
 * ============================================================ */

/** dir 预览语言：含 RTL（ar/he/fa）与 LTR */
const DIR_DEMO_LANGS = ['en-US', 'ar', 'he', 'fa-IR', 'zh-CN']

const DirectionSection = memo(() => {
  const { direction } = useLanguage()
  const { i18n } = useI18n()
  const [previewLang, setPreviewLang] = useState('ar')

  const previewDir = i18n.dir(previewLang)

  return (
    <Section
      title="文字方向（RTL）"
      desc="useLanguage().direction 跟随当前语言；i18n.dir(lng) 查任意语言"
    >
      <Row
        code="useLanguage().direction  // 当前语言"
        result={ (
          <Badge variant={ direction === 'rtl'
            ? 'warning'
            : 'success' }>
            { direction }
          </Badge>
        ) }
      />

      <div className={ cn('flex flex-wrap items-center gap-2 pt-1') }>
        { DIR_DEMO_LANGS.map(lng => (
          <Button
            key={ lng }
            size="sm"
            variant={ previewLang === lng
              ? 'primary'
              : 'default' }
            onClick={ () => setPreviewLang(lng) }
          >
            { lng }
          </Button>
        )) }
      </div>

      <Row
        code={ `i18n.dir('${previewLang}')` }
        result={ (
          <Badge variant={ previewDir === 'rtl'
            ? 'warning'
            : 'success' }>
            { previewDir }
          </Badge>
        ) }
      />

      <div
        dir={ previewDir }
        className={ cn('rounded-lg bg-background3 px-3 py-3 text-sm text-text') }
      >
        { previewDir === 'rtl'
          ? 'مرحبا 世界 — dir=rtl，整行从右向左排版'
          : 'Hello world — dir=ltr，从左向右排版' }
      </div>
    </Section>
  )
})

DirectionSection.displayName = 'DirectionSection'

/* ============================================================
 * key 级 fallback（缺译逐 locale 回退）
 * ============================================================ */

const KeyFallbackSection = memo(() => {
  const { language } = useLanguage()
  const t = useT()

  const missingInCurrent = language !== LANGUAGES.EN_US

  return (
    <Section
      title="key 级 fallback"
      desc="common.onlyEn 只在 en-US 定义；其它语言下逐 locale 回退到 en-US 的译文，而非裸 key"
    >
      <Row
        code="t('common.onlyEn')"
        result={ (
          <span className={ cn('flex items-center gap-2') }>
            { t('common.onlyEn') }
            { missingInCurrent && <Badge variant="secondary">fallback → en-US</Badge> }
          </span>
        ) }
      />
      <Row
        code="t('common.notExist')  // 任何语言都没有"
        result={ <span className={ cn('text-text3') }>{ t('common.notExist') }</span> }
      />
    </Section>
  )
})

KeyFallbackSection.displayName = 'KeyFallbackSection'

/* ============================================================
 * 持久化：内置多方案 roundtrip + 实例级开关
 * ============================================================ */

const PersistenceSection = memo(() => {
  const { language } = useLanguage()
  const { enableStorage, disableStorage } = useStorage()

  const [strategy, setStrategy] = useState<PersistenceStrategy>('localStorage')
  const [readback, setReadback] = useState<string | null>(null)
  const [persistEnabled, setPersistEnabled] = useState(false)

  /** query 友好的 demo 键名（无 ':'，避免 queryString 下被编码成 %3A） */
  const demoKey = 'i18n_demo'

  const handleWrite = useLatestCallback(() => {
    const adapter = createPersistenceAdapter(strategy)
    adapter.set(demoKey, language)
    setReadback(adapter.get(demoKey))
    Message.success(`已用 ${strategy} 写入「${language}」`)
  })

  const handleRead = useLatestCallback(() => {
    const adapter = createPersistenceAdapter(strategy)
    setReadback(adapter.get(demoKey))
  })

  const handleToggle = useLatestCallback((checked: boolean) => {
    setPersistEnabled(checked)
    checked
      ? enableStorage()
      : disableStorage()
    Message.info(checked
      ? '实例持久化已开启（切换语言后刷新会恢复）'
      : '实例持久化已关闭')
  })

  return (
    <Section
      title="持久化"
      desc="内置 5 种方案 + 自定义 adapter/get-set；核心默认不持久化"
    >
      <div className={ cn('flex flex-wrap items-end gap-3') }>
        <div className={ cn('min-w-40') }>
          <Select
            options={ STRATEGY_OPTIONS }
            value={ strategy }
            onChange={ v => setStrategy(v as PersistenceStrategy) }
          />
        </div>
        <Button size="sm" variant="primary" onClick={ handleWrite }>写入当前语言</Button>
        <Button size="sm" variant="default" onClick={ handleRead }>读取</Button>
      </div>

      <Row
        code={ `createPersistenceAdapter('${strategy}').get('${demoKey}')` }
        result={ readback == null
          ? <span className={ cn('text-text3') }>null（未写入）</span>
          : <Badge variant="success">{ readback }</Badge> }
      />

      <Separator className={ cn('my-1') } />

      <div className={ cn('flex items-center justify-between rounded-lg bg-background3 px-3 py-2') }>
        <div className={ cn('flex flex-col') }>
          <span className={ cn('text-sm text-text') }>实例级持久化</span>
          <span className={ cn('text-xs text-text3') }>enableStorage / disableStorage</span>
        </div>
        <Switch checked={ persistEnabled } onChange={ handleToggle } />
      </div>
    </Section>
  )
})

PersistenceSection.displayName = 'PersistenceSection'

/* ============================================================
 * 自定义语言检测
 * ============================================================ */

const DetectionSection = memo(() => {
  const [rows] = useState(() => [
    {
      code: 'detection 缺省（navigator）',
      result: createI18n({ resources: testResources }).getLanguage(),
    },
    {
      code: 'detection: () => \'ja-JP\'',
      result: createI18n({ resources: testResources, detection: () => LANGUAGES.JA_JP }).getLanguage(),
    },
    {
      code: 'detection: [() => null, () => \'en\']',
      result: createI18n({ resources: testResources, detection: [() => null, () => 'en'] }).getLanguage(),
    },
  ])

  return (
    <Section title="语言检测" desc="默认用 navigator；可传函数 / 函数数组 / 配置对象完全自定义">
      { rows.map(row => (
        <Row key={ row.code } code={ row.code } result={ <Badge variant="secondary">{ row.result }</Badge> } />
      )) }
    </Section>
  )
})

DetectionSection.displayName = 'DetectionSection'

/* ============================================================
 * 运行时资源管理
 * ============================================================ */

const ResourceSection = memo(() => {
  const { language } = useLanguage()
  const { addResources, updateResource } = useResources()
  const t = useT()

  const handleAdd = useLatestCallback(() => {
    addResources({
      [language]: { dynamic: { hello: language === LANGUAGES.EN_US
        ? 'Dynamic hello'
        : '动态添加' } },
    })
    Message.success('已添加 dynamic.hello（界面应即时更新）')
  })

  const handleUpdate = useLatestCallback(() => {
    updateResource(language, 'common.loading', language === LANGUAGES.EN_US
      ? 'Loading now...'
      : '正在加载...')
    Message.success('已更新 common.loading')
  })

  return (
    <Section title="运行时资源" desc="增 / 改资源后，已渲染文案应即时重渲染（修复点）">
      <div className={ cn('flex flex-wrap gap-2') }>
        <Button size="sm" variant="primary" onClick={ handleAdd }>添加 dynamic.hello</Button>
        <Button size="sm" variant="default" onClick={ handleUpdate }>更新 common.loading</Button>
      </div>
      <Row code="t('dynamic.hello')" result={ t('dynamic.hello') } />
      <Row code="t('common.loading')" result={ t('common.loading') } />
    </Section>
  )
})

ResourceSection.displayName = 'ResourceSection'

/* ============================================================
 * 事件订阅
 * ============================================================ */

const EventSection = memo(() => {
  const { i18n } = useI18n()
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    const onLang = (lng: Language) => setLog(prev => [`language:change → ${lng}`, ...prev].slice(0, 6))
    const onAdd = ({ language }: { language: string }) => setLog(prev => [`resource:add → ${language}`, ...prev].slice(0, 6))
    const onUpdate = ({ key }: { key: string }) => setLog(prev => [`resource:update → ${key}`, ...prev].slice(0, 6))

    i18n.on('language:change', onLang)
    i18n.on('resource:add', onAdd)
    i18n.on('resource:update', onUpdate)

    return () => {
      i18n.off('language:change', onLang)
      i18n.off('resource:add', onAdd)
      i18n.off('resource:update', onUpdate)
    }
  }, [i18n])

  return (
    <Section title="事件订阅" desc="language:change / resource:add / resource:update">
      { log.length === 0
        ? <p className={ cn('rounded-lg bg-background3 px-3 py-4 text-center text-sm text-text3') }>暂无事件，试试切换语言或改资源</p>
        : (
            <div className={ cn('space-y-1') }>
              { log.map((line, i) => (
                <code key={ i } className={ cn('block rounded-md bg-background3 px-3 py-1.5 font-mono text-xs text-text2') }>
                  { line }
                </code>
              )) }
            </div>
          ) }
    </Section>
  )
})

EventSection.displayName = 'EventSection'
