<div align="center">
  <h1 align="center">React 工程化实践与组件库</h1>

  <p align="center">
    现代化 React 应用的工程实践、架构设计与高性能组件示例
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/UnoCSS-333333?logo=unocss&logoColor=white" alt="UnoCSS" />
  </p>
</div>

# 📖 技术学习指南

本项目是一个技术教学型仓库，展示了现代化 React 应用的最佳实践与工程化解决方案。它不仅包含丰富的组件实现，更重要的是展示了如何构建一个高效、可维护的 React 应用架构

**但是 React 是一坨大屎山，非必要别学**，详见我的文章 [React 正在演变为一场不可逆的赛博瘟疫：AI 投毒、编译器迷信与装死的官方](https://juejin.cn/spost/7614057963394711567)

## 🎯 学习目标

- 掌握现代化前端工程化实践和配置技巧
- 了解组件设计模式与最佳实践
- 学习性能优化策略和实现方法
- 探索前沿技术在实际项目中的应用

## 🔍 项目特色

### 1️⃣ Mono-repo 架构 - 高效的代码组织

**项目结构**：
```
react-tool/
├── packages/
│   ├── app/          # 主应用
│   ├── comps/        # 通用组件库
│   ├── hooks/        # 通用 Hooks 库
│   ├── utils/        # 工具函数库
│   ├── styles/       # 样式系统（CSS/SCSS/变量）
│   └── config/       # 配置包
├── pnpm-workspace.yaml
├── nx.json
└── package.json
```

**技术亮点**：

1. **包管理器**：使用 `pnpm@10.24.0` 的 workspace 特性
   - 通过 `workspace:*` 协议引用本地包，确保版本一致性
   - 高效的依赖管理和磁盘空间利用
   - 支持跨包的类型推导和代码跳转

2. **构建工具**：使用 Nx 管理任务与缓存
   - 内置任务图与分布式缓存，避免重复构建
   - `run-many` 支持并行/串行执行，灵活筛选项目
   - 与 `pnpm` workspace 协作，保持原有包内命令不变

3. **包设计**：
   - `comps`：通用组件库，供主应用与各模块复用
   - `hooks`：提供响应式状态、生命周期、主题等通用 Hooks
   - `utils`：封装常用工具函数，支持 CJS/ESM 双模式导出
   - `styles`：统一的样式系统，包含设计 Token、通用样式和主题
   - `config`：共享配置和常量定义

**学习价值**：
- 如何搭建和管理 Mono-repo 项目
- 包之间的依赖关系设计
- 通用代码的抽象与复用策略
- 构建工具的选型与配置

### 2️⃣ 工程化亮点 - 简化开发流程

#### 自动路由系统

**传统问题**：手动维护路由配置繁琐且容易出错，增删页面时需要同步更新路由文件

**解决方案**：`src/router/index.tsx` 中的自动路由机制

```tsx
/** 路由配置核心代码 */
export const views = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/page.tsx'),
  indexFileName: '/page.tsx',
  routerPathFolder: '/src/views',
  pathPrefix: /^\/src\/views/,
})

export const components = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/components/**/Test.tsx'),
  indexFileName: '/Test.tsx',
  routerPathFolder: '/src/components',
  pathPrefix: /^\/src\/components/,
})
```

**技术原理**：利用 Vite 的 `import.meta.glob` 动态导入功能和命名约定，自动发现并注册路由

**学习价值**：
- 如何使用 glob 导入实现文件系统路由
- 路由生成的抽象与封装
- 目录结构约定替代配置的实践

#### TypeScript 到 CSS 的变量同步

**传统问题**：设计系统中的变量在 TS/JS 和 CSS 之间难以保持同步，导致重复定义和不一致性

**解决方案**：通过 Vite 插件 `@jl-org/js-to-style` 实现自动同步

```ts
// vite.config.ts 中的核心配置
import { autoParseStyles } from '@jl-org/js-to-style'

export default defineConfig({
  plugins: [
    autoParseStyles({
      jsPath: fileURLToPath(new URL('../styles/variable.ts', import.meta.url)),
      cssPath: fileURLToPath(new URL('../styles/css/autoVariables.css', import.meta.url)),
      scssPath: fileURLToPath(new URL('../styles/scss/autoVariables.scss', import.meta.url)),
      dev: true,
      build: true,
    }),
  ],
})
```

**技术原理**：
- 在开发和构建阶段，Vite 插件自动监听 TypeScript 变量定义文件的变化
- 实时解析并生成对应的 CSS 和 SCSS 变量文件
- 支持 mono-repo 架构，通过 workspace 协议共享样式包

**学习价值**：
- 设计系统变量的统一管理
- 跨语言环境的变量同步策略
- Vite 插件的开发与应用
- Mono-repo 架构中的资源共享

#### 极致的开发体验优化 (Vite 插件)

**传统问题**：开发过程中的上下文切换、类型定义维护和环境变量管理都会降低开发效率

**解决方案**：通过一系列精心配置的 Vite 插件显著提升开发体验

```ts
// vite.config.ts 中的关键插件配置
plugins: [
  // API 自动导入
  AutoImport({
    imports: ['react', 'react-router'],
    dts: './src/auto-imports.d.ts',
  }),

  /** 环境变量类型自动生成 */
  envParse(),

  /** 从页面到代码的跳转 */
  codeInspectorPlugin({
    bundler: 'vite',
    editor: 'cursor',
  }),
]
```

**关键功能详解**：

1. **自动 API 导入** (`unplugin-auto-import`)
   - 自动导入 React 和 React Router 的常用 API
   - 无需手动编写 `import { useState, useEffect } from 'react'` 等重复代码
   - 同时生成 TypeScript 类型声明文件，保证类型安全

2. **环境变量类型自动生成** (`vite-plugin-env-parse`)
   - 自动分析 `.env` 文件，生成 TypeScript 类型定义
   - 提供 `import.meta.env` 的完整类型推导，代码编写时就能获得智能提示
   - 消除了手动维护环境变量类型定义的工作，并防止类型不同步错误
   - 当环境变量发生变化时，类型定义自动更新

3. **浏览器到编辑器的无缝跳转** (`code-inspector-plugin`)
   - 在开发模式下，按住 `Alt` 键并点击页面上的任何元素
   - 自动在 Cursor 编辑器中打开对应的源代码文件，并定位到确切位置
   - 极大加速了从页面错误/调试到源码的定位过程
   - 使问题追踪和组件调试更加高效

4. **UI 上下文抓取**（[react-grab](https://react-grab.com)）
   - 在页面上直接选取元素上下文，供 Cursor、Claude Code 等 AI 编程助手理解
   - 仅在 `import.meta.env.DEV` 时动态 `import('react-grab')`，零生产依赖

**学习价值**：
- 如何通过工具链配置显著提升开发效率
- 类型安全与开发便利性的平衡方案
- 现代前端工程中常见痛点的自动化解决方案

#### 栅格图体积优化（optimize-assets-size）

**传统问题**：PNG、JPEG 等栅格图直接进仓库会拖大 Git 体积；手动转 WebP、改 import 路径容易漏改或与路径别名不一致

**解决方案**：使用 [optimize-assets-size](https://github.com/beixiyo/optimize-assets-size)（npm：`@jl-org/optimize-assets-size`，依赖 `sharp`）在源码侧批量压缩、可选转 WebP，并按 `tsconfig` 的 `paths` 自动重写 import。与 Vite 构建期 imagetools 等互补，侧重**写回源文件**以控制仓库体积

**在本项目**：根目录已安装 `@jl-org/optimize-assets-size` 与 `sharp`，主应用脚本见 `packages/app/package.json` 的 `optimize:assets`（当前为 `--dry-run` 预览，不落盘）

```bash
# 在仓库根目录：预览优化效果（不写文件）
pnpm -F app optimize:assets
```

正式执行时：在 `packages/app/package.json` 的 `optimize:assets` 中去掉 `--dry-run`，再运行同上命令。可按需增加 `--dirs`、`--max-width` 等参数，详见 [README](https://github.com/beixiyo/optimize-assets-size/blob/main/README.md)

**学习价值**：
- 栅格资源与路径别名的批量治理方式
- 在 Mono-repo 中用 workspace 级 devDependency 复用 CLI 工具

### 3️⃣ 组件架构设计 - 可复用性与性能平衡

#### 扁平化分层组件设计

**项目结构**：
```
packages/app/src/
├── components/     # 基础组件
│   ├── Button/     # 组件独立目录
│   │   ├── Button.tsx     # 核心实现
│   │   ├── index.ts       # 导出入口
│   │   ├── styles.ts      # 样式定义
│   │   └── Test.tsx       # 测试/Demo页面
│   └── ...
├── views/          # 业务页面
├── hooks/          # 应用级 Hooks
└── ...

packages/hooks/     # 通用 Hooks 库（跨应用复用）
packages/utils/     # 工具函数库
packages/styles/    # 样式系统
```

**设计理念**：
- 每个组件都是一个独立的目录，包含实现、样式、测试和文档
- Test.tsx 文件不仅作为测试，也作为示例文档和自动路由端点
- 扁平化结构避免过深嵌套，同时保持清晰的分组

**学习价值**：
- 如何设计易于维护的组件文件结构
- 将测试与文档结合的实践
- 通过文件命名约定实现功能自动化

### 4️⃣ 国际化方案 - 可扩展的动态多语言

#### 自动化语言资源管理

**核心实现**：`src/locales/lang.ts` 中的动态语言包加载

```ts
/** 核心代码示例 */
function getLang() {
  const enData = import.meta.glob('./en-US/*.json', { eager: true })
  const zhData = import.meta.glob('./zh-CN/*.json', { eager: true })

  /** 处理语言资源，自动整合模块化的语言文件 */
  const enModules = processLanguageFiles(enData)
  const zhModules = processLanguageFiles(zhData)

  return { en: enModules, zh: zhModules }
}
```

**技术原理**：利用 Vite 的模块 glob 导入，自动扫描语言文件夹中的所有翻译文件，支持按模块分离语言资源

**学习价值**：
- 如何设计可扩展的国际化架构
- 模块化语言资源的管理
- 自动化导入减少手动配置

## 📚 组件与功能概览

项目包含多种类型的实现，可作为学习参考：

### 🧩 基础组件
- **表单系统**：Form、Input、Select、Radio、Checkbox 等
- **布局组件**：Card、Drawer、Sidebar、Grid 等
- **交互组件**：Button、Tooltip、Modal、Dropdown 等

### ✨ 高级功能
- **动画效果**：基于 Framer Motion 的各类动画组件
- **性能优化**：虚拟滚动、懒加载、代码分割、Web Worker
- **特色功能**：代码高亮、Markdown 编辑器、图像处理

## 🚀 开始学习

### 环境准备

```bash
# 确保安装了 Node.js 18+ 和 pnpm
npm install -g pnpm@10.24.0

# 克隆仓库
git clone https://github.com/beixiyo/react-tool.git
cd react-tool

# 安装依赖（自动安装所有 workspace 包）
pnpm install

# 启动开发服务器（通过 Nx 跑 app 项目）
pnpm dev

# 或者只启动主应用
pnpm nx run app:dev
```

### Mono-repo 常用命令

```bash
# 构建所有包（按 Nx 项目图串联缓存）
pnpm build

# 构建特定包
pnpm build:app      # 构建主应用
pnpm build:comps    # 构建组件库
pnpm build:hooks    # 构建 hooks 包
pnpm build:utils    # 构建 utils 包

# 代码检查
pnpm lint           # 检查所有包
pnpm lint:app       # 只检查主应用

# 为特定包添加依赖
pnpm --filter app add lucide-react
pnpm --filter hooks add jotai

# 栅格图优化（预览，不写盘；见 packages/app package.json 的 optimize:assets）
pnpm --filter app run optimize:assets
```

### 学习路径建议

1. **理解 Mono-repo 架构**：查看 `pnpm-workspace.yaml` 和 `nx.json`，了解包管理和 Nx 任务编排
2. **浏览项目结构**：了解各 workspace 包的职责和组织方式
3. **研究构建配置**：查看 `packages/app/vite.config.ts` 和各包的 `package.json` 理解工程化配置
4. **探索组件实现**：从基础组件（如 Button、Form）开始，逐步学习复杂组件
5. **学习性能优化**：研究虚拟滚动、Web Worker 等性能优化实现
6. **理解包依赖关系**：观察 `hooks`、`utils`、`styles` 等包如何被主应用引用

## 📝 学习总结

本项目展示了多种现代前端工程化实践和组件设计模式，核心价值在于：

- **Mono-repo 架构**：如何组织和管理大型前端项目，实现代码复用和高效协作
- **工程化思维**：如何通过自动化和约定减少人为错误和重复工作
- **组件化设计**：如何设计可复用、可维护的组件体系
- **性能优化策略**：如何在不同场景选择合适的优化方案
- **现代化工具应用**：如何充分利用现代前端工具生态（Vite、Nx、pnpm 等）

这些实践和模式可以应用到各种规模的 React 项目中，提高开发效率和代码质量
