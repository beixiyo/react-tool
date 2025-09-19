# PageSnapshots 组件功能说明

`PageSnapshots` 是一个高度集成的"画廊"组件，其核心目标是自动化地发现并以美观、交互式的方式展示项目中的所有页面和组件。它为开发者提供了一个项目内容的实时概览，极大地提升了组件查找和预览的效率。

## 核心特性

- **自动发现**: 无需任何手动配置，组件能自动扫描 `src/views/**/index.tsx` 和 `src/components/**/Test.tsx` 文件，并将其识别为有效的页面或组件进行展示。
- **文本模式展示**: 目前采用文本描述模式展示组件信息，包含组件名称、类型、路径等详细信息。
- **交互式UI**:
  - 支持按**分类**筛选组件。
  - 支持**分页**浏览。
  - 使用 `framer-motion` 提供了流畅的加载动画和悬停效果。
  - 为加载、成功、失败等不同状态提供了清晰的视觉反馈。

## 工作流程

`PageSnapshots` 组件的运行流程如下：

1.  **初始化**: 组件挂载后，首先调用 `getAllPageInfo` 函数。该函数会利用 Vite 的 `import.meta.glob` API 扫描整个项目，找出所有符合路由规则的页面和组件，生成一个初始的页面信息列表。
2.  **加载状态**: 在获取页面信息的过程中，UI会显示一个全局的加载指示器 (`LoadingState`)。
3.  **渲染展示**: 页面信息列表加载完毕后，组件会根据当前所在的分页，直接渲染文本模式的卡片展示。
4.  **更新UI**:
    - 每个 `SnapshotCard` 显示为文本模式，包含组件名称、类型标识、路径信息等。
    - 卡片支持悬停效果和点击跳转功能。
5.  **错误处理**: 如果在获取页面信息过程中发生错误，会显示错误状态 (`ErrorState`)，并在控制台打印错误信息。
6.  **用户交互**: 用户可以点击卡片跳转到对应的组件/页面路由，也可以使用顶部的筛选器和底部的分页器来浏览。

## 组件结构

### 核心组件
- **`PageSnapshots.tsx`**: 主入口组件，负责整个业务逻辑的调度和状态管理
  - 管理页面信息获取和状态
  - 处理分类筛选和分页逻辑
  - 协调各个子组件的交互

### UI 展示组件
- **`SnapshotGrid.tsx`**: 网格布局组件，负责渲染卡片网格和分页组件
  - 响应式网格布局（支持不同屏幕尺寸的列数配置）
  - 分页逻辑处理（支持内外部分页控制）
  - 卡片动画效果管理

- **`SnapshotCard.tsx`**: 单个卡片组件，负责展示组件/页面信息
  - 文本模式展示（组件名称、类型、路径等）
  - 悬停效果和点击交互
  - 类型标识（页面/组件）

- **`CategoryFilter.tsx`**: 分类筛选器组件
  - 提供分类选择按钮
  - 显示各分类的数量统计
  - 支持动画过渡效果

### 状态组件
- **`LoadingState.tsx`**: 全局加载状态组件
  - 旋转加载动画
  - 可选的进度条显示
  - 加载提示文本

- **`ErrorState.tsx`**: 错误状态组件
  - 错误图标和提示信息
  - 重试按钮功能
  - 装饰性背景元素

### 工具函数
- **`tools/getPageInfo.ts`**: 页面信息发现工具
  - 自动扫描 `src/views/**/index.tsx` 和 `src/components/**/Test.tsx`
  - 生成页面信息列表（名称、路径、类型、分类等）
  - 路径解析和名称格式化

- **`tools/getPageSnaps.ts`**: 截图功能工具（已保留但未使用）
  - 流式截图处理逻辑
  - iframe 池管理
  - 缓存机制（localforage）
  - 支持并发控制和超时处理

### 配置文件
- **`category.ts`**: 分类配置
  - 定义所有可用的分类类型
  - 组件名称到分类的映射关系
  - 分类常量定义

- **`types.ts`**: TypeScript 类型定义
  - 所有组件和函数的类型接口
  - 状态类型定义
  - 配置选项类型

## 数据流程

1. **页面发现**: `getAllPageInfo()` 扫描项目文件 → 生成 `PageInfo[]`
2. **分类处理**: 根据路径匹配 `COMPONENT_CATEGORIES` → 生成分类统计
3. **筛选分页**: 按分类筛选 → 分页处理 → 生成当前页数据
4. **渲染展示**: `SnapshotGrid` → `SnapshotCard` → 文本模式展示
5. **用户交互**: 点击卡片 → 路由跳转 / 分类筛选 → 重新渲染

## 如何使用

在你的页面中，可以直接引入并使用 `PageSnapshots` 组件。

```tsx
import { PageSnapshots } from '@/components/PageSnapshots'

export default function GalleryPage() {
  return (
    <PageSnapshots
      gridCols={ { sm: 1, md: 2, lg: 3, xl: 4 } }
      pagination={ { enabled: true, pageSize: 12 } }
    />
  )
}
```

## 给开发者的重要提示

当你在项目中添加一个新的组件或页面，并希望它能被 `PageSnapshots` 展示时，请确保：

1.  **符合路由规则**:
    - 如果是组件，在组件目录下创建一个 `Test.tsx` 文件作为它的展示页。
    - 如果是页面，在 `src/views` 下创建对应的 `index.tsx` 文件。

2.  **组件命名规范**: 确保组件名称符合 `COMPONENT_CATEGORIES` 中的映射规则，这样能正确分配到对应的分类中。

3.  **路径结构**: 保持清晰的目录结构，便于自动发现和分类。

## 截图功能说明

虽然当前版本不再使用截图功能，但 `getPageSnaps.ts` 工具仍然保留，以备将来需要时使用。该工具包含以下特性：

- **流式处理**: 支持大量组件的并发截图处理
- **iframe 池管理**: 复用 iframe 元素，提高性能
- **缓存机制**: 使用 localforage 缓存截图结果
- **超时控制**: 防止单个截图任务阻塞整个流程
- **进度回调**: 支持实时进度监控

### 截图功能使用要求

如果将来需要重新启用截图功能，需要满足以下条件：

1. **在 `PageSnapshots.tsx` 中调用 `getPageSnaps` 函数**
2. **被截图的组件必须调用 `useNotifyParentReady()` Hook**

```tsx
import { useNotifyParentReady } from 'hooks'

export default function MyComponentTest() {
  // ... 你的组件逻辑 ...

  /** 通知父级 iframe 截图已准备好 */
  useNotifyParentReady()

  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

**重要说明**: `useNotifyParentReady()` Hook 是确保截图成功的关键，它能防止因组件异步渲染或动画未完成而截取到空白或不完整图像。该 Hook 会在组件渲染完成后，通过 `postMessage` API 向父窗口发送"渲染完成"的通知。
