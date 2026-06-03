# i18n

框架无关的轻量 i18n 核心（纯 TS，零框架依赖）。React 用法（Provider + hooks）见子路径导出 `i18n/react`（源码 `src/react/`）

## 快速开始

```ts
import { createI18n } from 'i18n'

const i18n = createI18n({
  language: 'zh-CN',
  resources: {
    'zh-CN': { common: { hello: '你好 {{name}}' } },
    'en-US': { common: { hello: 'Hi {{name}}' } },
  },
})

i18n.t('common.hello', { name: '张三' }) // 你好 张三
i18n.changeLanguage('en-US')
i18n.t('common.hello', { name: 'Bob' }) // Hi Bob
```

## key 语法

| 写法 | 含义 |
|---|---|
| `t('a.b.c')` | `.` 逐层访问嵌套 key |
| `t('ns:a.b')` | `:` 命名空间——从根**绝对**解析（忽略 keyPrefix） |
| `t('x', { keyPrefix: 'a.b' })` | 前缀 → 实际解析 `a.b.x` |
| `t('a.b', { keyPrefix: '' })` | `''` 清空前缀，回到根 |

> `:` 为 i18next 风格；本库是单棵合并树，`ns:key` 等价「绝对路径 + 绕过前缀」

## 插值 & 复数

```ts
t('greeting', { name: 'Bob' }) // {{name}} 插值

// 复数：count 经 Intl.PluralRules 选 one/other/...，并注入 {{count}}
// { items: { one: '{{count}} item', other: '{{count}} items' } }
t('items', { count: 5 }) // 5 items
```

## 嵌套引用

翻译值用 `$t(key)` 引用另一个 key，便于复用公共短语；支持传参与递归（被引用值可再含 `$t`）：

```ts
// { learnMore: '了解更多', footer: '点击「$t(learnMore)」查看' }
t('footer') // 点击「了解更多」查看

// 父级变量自动透传给子级，也可单独指定（如不同 count）
// { boys: '{{count}} 个男孩', summary: '$t(boys, {"count": {{b}} }) 在场' }
t('summary', { b: 3 }) // 3 个男孩 在场
```

> 被引用 key 从根解析（绝对路径，支持 `ns:key`）；嵌套深度上限 10，防互引死循环

## 语言 fallback

```ts
createI18n({ resources, fallback: { fallbackLng: 'en-US' } })
```

- **地区回退**：请求 `zh` 自动尝试 `zh-CN`；请求 `en-US` 回退 `en`
- **最终兜底**：全不命中时用 `fallbackLng`（默认 `en-US`）
- **key 级 fallback**：当前语言缺某 key 时，逐 locale 回退到链上有该 key 的译文（而非裸 key）

## 语言检测

默认用 `navigator`，可完全自定义：

```ts
import { navigatorDetector, queryStringDetector } from 'i18n'

createI18n({ detection: () => 'zh-CN' }) // 单个函数
createI18n({ detection: [queryStringDetector(), navigatorDetector()] }) // 按序，第一个非空命中
```

内置源：`navigatorDetector` / `queryStringDetector(key?)` / `cookieDetector(key?)` / `htmlTagDetector`

## 持久化

**默认不持久化**。内置多方案，也可完全自定义：

```ts
createI18n({
  persistence: {
    enabled: true,
    strategy: 'localStorage', // localStorage | sessionStorage | cookie | queryString | memory
    // key: 'i18n:lang',      // 通用键名（默认）
    // queryKey: 'lang',      // queryString 专用参数名（默认 lang，避免 ':' 被编码成 %3A）
  },
})

// 自定义函数 / 适配器（优先级：get·set > adapter > strategy）
createI18n({ persistence: { enabled: true, get: k => ..., set: (k, v) => ... } })
createI18n({ persistence: { enabled: true, adapter: myAdapter } })
```

## 资源管理 & 事件

```ts
i18n.addResources({ 'zh-CN': { user: { name: '名字' } } })
i18n.mergeResources(res, true) // 深合并
i18n.updateResource('zh-CN', 'user.name', '昵称')
i18n.removeResource('zh-CN', 'user.name')

i18n.on('language:change', lng => console.log(lng))
// 事件：language:change / resource:add / resource:merge / resource:update / resource:remove
```

## 文字方向（RTL）

```ts
i18n.dir() // 当前语言方向：'ltr' | 'rtl'
i18n.dir('ar') // 'rtl'
```

内置识别 ar / he / fa / ur 等 RTL 语言，用于 `<html dir>`。React 侧用 `useLanguage().direction`（随语言切换响应式更新）。

## 配置项

`createI18n(options)` 的 `I18nOptions`：

| 选项 | 说明 |
|---|---|
| `language` | 初始语言（最高优先，常用于受控模式） |
| `defaultLanguage` | 检测/持久化都无值时的默认语言 |
| `resources` | 初始资源 |
| `detection` | 检测：函数 / 函数数组 / `{ order }`（默认 navigator） |
| `persistence` | 持久化（默认关） |
| `fallback` | `{ map?, fallbackLng? }` 语言 fallback 配置 |

类型安全：`createI18n` 的 `t` 支持泛型推导键路径与插值参数，详见 `src/types/`
