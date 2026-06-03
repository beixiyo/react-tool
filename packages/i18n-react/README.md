# i18n-react

[`i18n`](../i18n/README.md) 的 React 封装：`I18nProvider` + hooks

> 核心概念（[key 语法](../i18n/README.md#key- 语法)、[检测](../i18n/README.md#语言检测)、[持久化](../i18n/README.md#持久化)、[fallback](../i18n/README.md#语言 -fallback)、[资源/事件](../i18n/README.md#资源管理--事件)）见核心包，本文只讲 React 部分

## Provider

```tsx
import { I18nProvider } from 'i18n-react'

<I18nProvider resources={resources} defaultLanguage="zh-CN">
  <App />
</I18nProvider>
```

Provider 接受与 `createI18n` 相同的配置（`resources` / `defaultLanguage` / `detection` / `persistence` / `fallback`，见[配置项](../i18n/README.md#配置项)），外加：

| 额外 prop | 说明 |
|---|---|
| `instance?` | 传入已创建的 i18n 实例（不传则按配置创建或复用全局单例） |
| `language?` | **受控语言**——外部（如 i18next）切语言时同步给本库 |
| `onLanguageChange?` / `onResourceUpdate?` | 回调 |

## Hooks

```tsx
import { useLanguage, useResources, useStorage, useT } from 'i18n-react'

const t = useT() //                t('common.hello')
const ct = useT('common') //       前缀：ct('hello') → common.hello
const t2 = useT<typeof zhCN>() //  类型安全（键路径 + 插值参数推导）

const { language, changeLanguage, direction } = useLanguage() // direction: 'ltr' | 'rtl'
const { addResources, mergeResources, updateResource, removeResource } = useResources()
const { enableStorage, disableStorage, setStorageAdapter } = useStorage()
```

前缀转义同核心：`ct('user.name', { keyPrefix: '' })` 回到根，`t('ns:key')` 走命名空间（见 [key 语法](../i18n/README.md#key- 语法)）

## 重渲染优化

Provider 内部拆成 **API Context（方法集合，引用恒稳定）** 与 **State Context（`language` / `t`）**：

- `useT` / `useLanguage` —— 仅在语言或资源变化时重渲染
- `useResources` / `useStorage` —— 只取方法，语言切换**不**重渲染

