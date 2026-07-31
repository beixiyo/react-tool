<div align="center">
  <h1>React Tool</h1>

  <p><strong>React 组件库与前端工程化实践仓库</strong></p>

  <p>
    可复用组件、交互动效、复杂 UI、通用 Hooks 与完整页面案例
  </p>

  <p>
    <a href="https://react-tool-70q.pages.dev/"><strong>在线体验</strong></a>
    ·
    <a href="https://github.com/beixiyo/react-tool">GitHub</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/pnpm-workspace-F69220?logo=pnpm&logoColor=white" alt="pnpm workspace" />
  </p>
</div>

## 在线体验

访问 [react-tool-70q.pages.dev](https://react-tool-70q.pages.dev/)：

- `/`：组件与页面画廊
- `/Button`、`/Modal`、`/CloseBtn` 等：组件独立演示
- 支持亮色与暗色主题
- 可按表单、功能、布局、动画、高级功能和完整页面分类浏览

## 组件库

`packages/comps` 覆盖基础交互、表单、反馈、布局、动画和复杂场景组件

| 分类 | 示例 |
| --- | --- |
| 基础与反馈 | Button、Badge、Icon、Loading、Message、Notification、Progress |
| 表单与输入 | Form、Input、Textarea、Select、Checkbox、Radio、Switch、Slider、Uploader |
| 浮层与导航 | Modal、Drawer、Popover、Dropdown、ContextMenu、Tabs、Pagination、TourGuide |
| 布局与展示 | Card、Sidebar、Toolbar、Table、Steps、SplitPane、CollapsibleSidebar |
| 图片与编辑器 | PreviewImg、LazyImg、ImgThumbnails、MdEditor、HtmlPreview |
| 滚动与性能 | InfiniteScroll、VirtualScroll、VirtualWaterfall、TanstackVirtual |
| 动画与视觉 | Animate、Carousel、GradientText、LiquidGlass、TextReveal、ScrollReveal |

在 monorepo 内可直接从 `comps` 导入：

```tsx
import { Button, Card, Input, Modal } from 'comps'

export function Example() {
  return (
    <Card>
      <Input placeholder="输入内容" />
      <Button>提交</Button>
    </Card>
  )
}
```

## 设计系统

项目使用 Tailwind CSS v4 和语义化设计 Token：

1. `packages/styles/variable.ts` 定义亮色与暗色主题
2. `@jl-org/js-to-style` 自动生成 CSS 变量
3. `tailwind.config.js` 将 Token 映射为 Tailwind 类名

组件优先使用 `bg-background`、`text-text`、`border-border` 等语义类名，无需为暗色模式重复编写 `dark:` 样式

## 工程能力

- `unplugin-auto-import`：自动导入 React 常用 API，并生成 TypeScript 声明
- `vite-plugin-env-parse`：根据环境变量自动生成 `import.meta.env` 类型
- `code-inspector-plugin`：开发环境下 `Alt + 点击`，跳转到配置的编辑器和源码位置
- `agentation`：仅在开发环境加载，为 AI 编程助手提供页面 UI 上下文
- `@jl-org/js-to-style`：让 TypeScript 设计 Token 自动同步到 CSS 和 SCSS
- `@jl-org/vite-auto-route`：根据文件目录生成客户端路由，面向 SPA 而非 SSR
- React 19 + TypeScript + Vite 8
- pnpm workspace + Nx 任务编排和缓存
- Vitest + Testing Library
- ESLint 与共享配置

## 项目定位

React Tool 是一个以组件库为核心的 React monorepo，同时沉淀可复用 Hooks、工具函数、设计 Token 和工程化实践

```text
react-tool/
├── packages/
│   ├── app/          # 组件画廊与页面案例
│   ├── comps/        # React 组件库
│   ├── hooks/        # 通用 Hooks
│   ├── utils/        # 通用工具
│   ├── styles/       # 设计 Token 与共享样式
│   ├── config/       # 共享配置
│   ├── i18n/         # 国际化能力
│   ├── charts/       # 图表能力
│   └── lit-comps/    # Lit 组件实验
├── nx.json
├── pnpm-workspace.yaml
└── tailwind.config.js
```

组件演示通过文件约定自动生成路由。新增组件后，只需提供 `Test.tsx`，即可在首页画廊和独立路由中体验，不需要手动维护路由表

## 本地开发

```bash
git clone https://github.com/beixiyo/react-tool.git
cd react-tool
pnpm install
pnpm dev
```

启动后访问 [http://localhost:9977](http://localhost:9977)

常用命令：

```bash
pnpm dev          # 启动组件画廊
pnpm build        # 构建全部 workspace 包
pnpm build:comps  # 只构建组件库
pnpm test         # 运行测试
pnpm lint         # 检查代码
```

## 新增组件

1. 在 `packages/comps/src/components/<ComponentName>/` 实现组件
2. 添加 `Test.tsx`，覆盖主要变体和边界情况
3. 在 `packages/comps/src/components/index.ts` 导出组件
4. 在 `packages/app/src/components/PageSnapshots/category.ts` 设置画廊分类

详细组件约定见 [AGENTS.md](./AGENTS.md)

## 延伸阅读

- [React 之死](https://juejin.cn/column/7614747451162034211)：关于 React API、状态管理、Signal 与工程实践的系列文章
