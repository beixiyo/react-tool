# PageSnapshots 组件功能说明

`PageSnapshots` 是一个高度集成的“画廊”组件，其核心目标是自动化地发现、截图并以美观、交互式的方式展示项目中的所有页面和组件。它为开发者提供了一个项目内容的实时概览，极大地提升了组件查找和预览的效率。

## 核心特性

- **自动发现**: 无需任何手动配置，组件能自动扫描 `src/views/**/index.tsx` 和 `src/components/**/Test.tsx` 文件，并将其识别为有效的页面或组件进行展示。
- **实时截图**: 在浏览器端实时为每个被发现的页面生成截图，确保预览内容永远和最新代码同步。
- **客户端缓存**: 截图结果会使用 `localforage` 缓存在用户浏览器中，二次加载时速度极快，有效降低了性能开销。
- **交互式UI**:
  - 支持按**分类**筛选组件。
  - 支持**分页**浏览。
  - 使用 `framer-motion` 提供了流畅的加载动画和悬停效果。
  - 为加载、成功、失败等不同状态提供了清晰的视觉反馈。

## 工作流程

`PageSnapshots` 组件的运行流程如下：

1.  **初始化**: 组件挂载后，首先调用 `getAllPageInfo` 函数。该函数会利用 Vite 的 `import.meta.glob` API 扫描整个项目，找出所有符合路由规则的页面和组件，生成一个初始的页面信息列表。
2.  **加载状态**: 在获取页面信息的过程中，UI会显示一个全局的加载指示器 (`LoadingState`)。
3.  **触发截图**: 页面信息列表加载完毕后，组件会根据当前所在的分页，调用 `loadPageSnapshots` 函数，准备开始为当前页的项目生成截图。
4.  **执行截图任务**:
    - `loadPageSnapshots` 内部调用核心工具 `getPageSnaps`。
    - `getPageSnaps` 首先会检查 `localforage` 中是否存在有效的缓存，如果存在，则直接使用缓存的截图。
    - 如果没有缓存，它会从一个**隐藏的 `iframe` 池**中取出一个 `iframe`，并将其 `src` 指向目标页面的路径。
    - 为了确保截图的准确性，被截图的页面（`iframe`中的页面）**必须**调用 `useNotifyParentReady()` 这个 Hook。此 Hook 会在组件渲染完成后，通过 `postMessage` API 向父窗口（即主应用）发送一个“渲染完成”的通知。
    - `getPageSnaps` 监听到此消息后，会使用 `@zumer/snapdom` 库对 `iframe` 的内容进行快照，生成一张 WebP 格式的图片。
5.  **更新UI**:
    - 截图成功后，对应的 `SnapshotCard` 状态会从 `loading` 变为 `success`。
    - 图片的 URL 会被更新到组件状态中，并在界面上显示出来。
    - 同时，这张截图的数据会被存入 `localforage` 以供下次使用。
6.  **错误处理**: 如果在截图过程中发生超时或其它错误，`SnapshotCard` 会显示为错误状态 (`ErrorState`)，并在控制台打印错误信息。
7.  **用户交互**: 用户可以点击卡片跳转到对应的组件/页面路由，也可以使用顶部的筛选器和底部的分页器来浏览。

## 组件结构

- `PageSnapshots.tsx`: 核心组件，负责整个业务逻辑的调度和状态管理。
- `SnapshotGrid.tsx`: 负责渲染卡片网格和分页组件。
- `SnapshotCard.tsx`: 负责展示单个组件的预览图及其状态（加载中、成功、失败）。
- `CategoryFilter.tsx`: 顶部的分类筛选器。
- `LoadingState.tsx` / `ErrorState.tsx`: 用于显示全局加载和错误状态的UI组件。
- `tools/`: 存放核心工具函数的目录。
  - `getPageInfo.ts`: 负责自动发现页面。
  - `getPageSnaps.ts`: 负责生成截图的核心逻辑。
- `types.ts`: 提供了该功能所需的所有 TypeScript 类型定义。

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
2.  **调用通知Hook**: 在你的 `Test.tsx` 或 `views/**/index.tsx` 的组件内部，**必须**调用 `useNotifyParentReady()` Hook。这是确保截图成功的关键，它能防止因组件异步渲染或动画未完成而截取到空白或不完整图像。

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
