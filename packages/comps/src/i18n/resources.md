# 国际化资源统一管理

## 概述

`resources.ts` 文件用于统一导入和管理所有组件的国际化资源，默认提供中英文支持。

## 使用方法

### 在应用中使用

在应用的根组件（如 `App.tsx`）中配置 `I18nProvider`：

```tsx
import { allResources, I18nProvider, Language } from 'comps'

function App() {
  /** 从 localStorage 读取语言偏好，或使用浏览器语言 */
  const defaultLanguage = localStorage.getItem('i18n:language')
    || (navigator.language.startsWith('zh')
      ? Language.ZH_CN
      : Language.EN_US)

  return (
    <I18nProvider
      resources={ allResources }
      defaultLanguage={ defaultLanguage }
      storage={ {
        enabled: true,
        key: 'i18n:language',
      } }
    >
      <YourApp />
    </I18nProvider>
  )
}
```

### 添加新组件的翻译资源

1. 在组件目录下创建 `locales` 文件夹
2. 创建 `zh-CN.ts` 和 `en-US.ts` 文件
3. 创建 `index.ts` 导出资源
4. 在 `resources.ts` 中导入并合并：

```ts
// resources.ts
import { chatInputResources } from '../components/ChatInput/locales'
import { newComponentResources } from '../components/NewComponent/locales'

export const allResources: Resources = {
  [Language.ZH_CN]: {
    ...chatInputResources[Language.ZH_CN],
    ...newComponentResources[Language.ZH_CN],
  },
  [Language.EN_US]: {
    ...chatInputResources[Language.EN_US],
    ...newComponentResources[Language.EN_US],
  },
}
```

## 资源结构

每个组件的资源应该遵循以下结构：

```ts
export const zhCN = {
  componentName: {
    /** 组件的所有翻译键 */
  },
} as const
```

## 注意事项

1. **键名冲突**：如果多个组件使用相同的键名，后面的会覆盖前面的。建议使用组件名作为顶级键（如 `chatInput`、`button` 等）。

2. **深度合并**：当前使用浅合并（展开运算符）。如果需要深度合并嵌套对象，可以使用 `mergeResources` 方法：

```tsx
import { useResources } from 'comps'

function YourComponent() {
  const { mergeResources } = useResources()

  useEffect(() => {
    mergeResources(newResources, true) // true 表示深度合并
  }, [mergeResources])
}
```

3. **类型安全**：使用 `as const` 确保类型推导的准确性。

4. **默认语言**：默认支持 `zh-CN` 和 `en-US`，如需添加其他语言，在 `resources.ts` 中添加对应的语言代码。
