# i18n

## 特性

- ✅ **全局调用**：可在任何环境（非 React 组件）中使用
- ✅ **类型安全**：完整的 TypeScript 类型推导，自动补全和类型检查
- ✅ **运行时扩展**：支持动态添加、更新、合并语言资源
- ✅ **事件驱动**：基于 EventBus 的事件通知系统
- ✅ **持久化存储**：支持自定义存储适配器（LocalStorage、IndexedDB 等）
- ✅ **React 集成**：提供 React Hooks 和 Context Provider

## 快速开始

### 基础用法

```typescript
import { createI18nInstance, Language } from '@your-package/i18n2'

/** 创建实例 */
const i18n = createI18nInstance({
  defaultLanguage: Language.ZH_CN,
  resources: {
    [Language.ZH_CN]: {
      common: {
        loading: '加载中...',
        greeting: '你好 {{name}}',
      },
    },
    [Language.EN_US]: {
      common: {
        loading: 'Loading...',
        greeting: 'Hello {{name}}',
      },
    },
  },
})

/** 翻译 */
i18n.t('common.loading') // '加载中...'
i18n.t('common.greeting', { name: 'John' }) // '你好 John'

/** 切换语言 */
i18n.changeLanguage(Language.EN_US)
i18n.t('common.loading') // 'Loading...'
```

### 类型安全

```typescript
import { createTypedTFunction } from '@your-package/i18n2'

const resources = {
  [Language.ZH_CN]: {
    common: {
      loading: '加载中...',
      greeting: '你好 {{name}}',
    },
  },
} as const

const i18n = createI18nInstance({ resources })
const t = createTypedTFunction<typeof resources[typeof Language.ZH_CN]>(i18n)

// ✅ 类型安全：自动补全和类型检查
t('common.loading') // ✅
t('common.greeting', { name: 'John' }) // ✅
t('common.invalid') // ❌ TypeScript 错误
```

### 运行时扩展

```typescript
/** 添加资源 */
i18n.addResources({
  [Language.ZH_CN]: {
    user: {
      name: '用户名',
    },
  },
})

/** 合并资源（深度合并） */
i18n.mergeResources({
  [Language.ZH_CN]: {
    common: {
      error: '错误',
    },
  },
}, true)

/** 更新单个资源 */
i18n.updateResource(Language.ZH_CN, 'common.loading', '正在加载...')

/** 删除资源 */
i18n.removeResource(Language.ZH_CN, 'common.loading')
```

### 事件监听

```typescript
/** 监听语言切换 */
i18n.on('language:change', (language) => {
  console.log('语言切换为:', language)
})

/** 监听资源添加 */
i18n.on('resource:add', ({ language, resources }) => {
  console.log('添加资源:', language, resources)
})

/** 取消订阅 */
const unsubscribe = i18n.on('language:change', handler)
unsubscribe()
```

### 持久化存储

```typescript
/** 使用默认 LocalStorage */
const i18n = createI18nInstance({
  storage: {
    enabled: true,
    key: 'my-app:language',
  },
})

/** 自定义存储适配器 */
class CustomStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    /** 自定义获取逻辑 */
  }

  set(key: string, value: string): void {
    /** 自定义设置逻辑 */
  }

  remove(key: string): void {
    /** 自定义删除逻辑 */
  }
}

const i18n = createI18nInstance({
  storage: {
    enabled: true,
    adapter: new CustomStorageAdapter(),
  },
})
```

### React 集成

```tsx
import { I18nProvider, Language, useLanguage, useResources, useT } from '@your-package/i18n2'

// 1. 使用 Provider 包裹应用
function App() {
  return (
    <I18nProvider
      resources={ {
        [Language.ZH_CN]: {
          common: {
            loading: '加载中...',
            greeting: '你好 {{name}}',
          },
        },
        [Language.EN_US]: {
          common: {
            loading: 'Loading...',
            greeting: 'Hello {{name}}',
          },
        },
      } }
      defaultLanguage={ Language.ZH_CN }
      storage={ { enabled: true } }
      onLanguageChange={ (language) => {
        console.log('Language changed:', language)
      } }
    >
      <MyComponent />
    </I18nProvider>
  )
}

// 2. 在组件中使用 Hooks
function MyComponent() {
  const t = useT()
  const { language, changeLanguage } = useLanguage()
  const { addResources, mergeResources } = useResources()

  return (
    <div>
      <p>{t('common.loading')}</p>
      <p>{t('common.greeting', { name: 'John' })}</p>
      <button onClick={ () => changeLanguage(Language.EN_US) }>
        切换到英文
      </button>
      <button
        onClick={ () => {
          addResources({
            [Language.ZH_CN]: {
              newKey: '新值',
            },
          })
        } }
      >
        添加资源
      </button>
    </div>
  )
}
```

#### React Hooks API

- `useI18n()` - 返回完整的 i18n 上下文（包括实例和所有方法）
- `useT()` - 返回翻译函数
- `useLanguage()` - 返回当前语言和切换语言的方法
- `useResources()` - 返回资源管理相关的方法
- `useStorage()` - 返回存储管理相关的方法
- `useI18nInstance()` - 直接返回 i18n 实例

#### I18nProvider Props

- `children` - 子组件
- `instance?` - 自定义 i18n 实例（可选）
- `resources?` - 初始资源（可选）
- `defaultLanguage?` - 默认语言（可选）
- `storage?` - 存储配置（可选）
- `onLanguageChange?` - 语言切换回调（可选）
- `onResourceUpdate?` - 资源更新回调（可选）

## API

### 核心方法

- `t(key, options?)` - 翻译函数
- `changeLanguage(language)` - 切换语言
- `getLanguage()` - 获取当前语言
- `addResources(resources)` - 添加资源
- `mergeResources(resources, deep?)` - 合并资源
- `updateResource(language, key, value)` - 更新资源
- `removeResource(language, key)` - 删除资源
- `getResources(language?)` - 获取资源
- `getLanguages()` - 获取所有支持的语言

### 事件

- `language:change` - 语言切换事件
- `resource:add` - 资源添加事件
- `resource:update` - 资源更新事件
- `resource:remove` - 资源删除事件
- `resource:merge` - 资源合并事件

## 类型推导

完整的 TypeScript 类型推导系统，支持：

- **键路径推导**：自动提取所有可用的翻译键路径
- **插值参数推导**：从翻译字符串中提取 `{{variable}}` 参数
- **复数支持**：支持 `one`、`other`、`zero` 等复数键

```typescript
type TFunction<T extends Translations> = <Path extends TranslationPaths<T>>(
  key: Path,
  options?: BuildTranslateOptions<T, Path>
) => string
```
