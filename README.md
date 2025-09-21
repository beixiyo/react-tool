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

本项目是一个技术教学型仓库，展示了现代化 React 应用的最佳实践与工程化解决方案。它不仅包含丰富的组件实现，更重要的是展示了如何构建一个高效、可维护的 React 应用架构。

## 🎯 学习目标

- 掌握现代化前端工程化实践和配置技巧
- 了解组件设计模式与最佳实践
- 学习性能优化策略和实现方法
- 探索前沿技术在实际项目中的应用

## 🔍 项目特色

### 1️⃣ 工程化亮点 - 简化开发流程

#### 自动路由系统

**传统问题**：手动维护路由配置繁琐且容易出错，增删页面时需要同步更新路由文件。

**解决方案**：`src/router/index.tsx` 中的自动路由机制。

```tsx
/** 路由配置核心代码 */
export const views = genRoutes({
  globComponentsImport: () => import.meta.glob('/src/views/**/index.tsx'),
  indexFileName: '/index.tsx',
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

**技术原理**：利用 Vite 的 `import.meta.glob` 动态导入功能和命名约定，自动发现并注册路由。

**学习价值**：
- 如何使用 glob 导入实现文件系统路由
- 路由生成的抽象与封装
- 目录结构约定替代配置的实践

#### TypeScript 到 CSS 的变量同步

**传统问题**：设计系统中的变量在 TS/JS 和 CSS 之间难以保持同步，导致重复定义和不一致性。

**解决方案**：`scripts/autoWriteStyle.cjs` 自动同步机制。

```js
/** 核心代码示例 */
const { writeStyle } = require('@jl-org/js-to-style')

writeStyle({
  jsPath: resolve(__dirname, '../src/styles/variable.ts'),
  cssPath: resolve(__dirname, '../src/styles/css/autoVariables.css'),
  scssPath: resolve(__dirname, '../src/styles/scss/autoVariables.scss'),
})
```

**技术原理**：开发服务启动时，自动从 TypeScript 变量定义文件生成对应的 CSS 和 SCSS 变量文件。

**学习价值**：
- 设计系统变量的统一管理
- 跨语言环境的变量同步策略
- 构建钩子的巧妙应用

#### 极致的开发体验优化 (Vite 插件)

**传统问题**：开发过程中的上下文切换、类型定义维护和环境变量管理都会降低开发效率。

**解决方案**：通过一系列精心配置的 Vite 插件显著提升开发体验。

```ts
// vite.config.ts 中的关键插件配置
plugins: [
  // API 自动导入
  AutoImport({
    imports: ['react', 'react-router-dom'],
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

**学习价值**：
- 如何通过工具链配置显著提升开发效率
- 类型安全与开发便利性的平衡方案
- 现代前端工程中常见痛点的自动化解决方案

### 2️⃣ 组件架构设计 - 可复用性与性能平衡

#### 扁平化分层组件设计

**项目结构**：
```
src/
├── components/     # 基础组件
│   ├── Button/     # 组件独立目录
│   │   ├── Button.tsx     # 核心实现
│   │   ├── index.ts       # 导出入口
│   │   ├── styles.ts      # 样式定义
│   │   └── Test.tsx       # 测试/Demo页面
│   └── ...
├── views/          # 业务页面
├── hooks/          # 通用Hooks
└── ...
```

**设计理念**：
- 每个组件都是一个独立的目录，包含实现、样式、测试和文档
- Test.tsx 文件不仅作为测试，也作为示例文档和自动路由端点
- 扁平化结构避免过深嵌套，同时保持清晰的分组

**学习价值**：
- 如何设计易于维护的组件文件结构
- 将测试与文档结合的实践
- 通过文件命名约定实现功能自动化

### 3️⃣ 国际化方案 - 可扩展的动态多语言

#### 自动化语言资源管理

**核心实现**：`src/locales/lang.ts` 中的动态语言包加载。

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

**技术原理**：利用 Vite 的模块 glob 导入，自动扫描语言文件夹中的所有翻译文件，支持按模块分离语言资源。

**学习价值**：
- 如何设计可扩展的国际化架构
- 模块化语言资源的管理
- 自动化导入减少手动配置

### 4️⃣ 状态管理优化 - 简化全局状态

**传统问题**：
- Redux 样板代码冗长，Action/Reducer 的编写和维护成本高
- React Context 在大型应用中可能导致不必要的重渲染
- 全局状态生命周期管理困难，容易造成内存泄露和状态残留
- TypeScript 类型支持复杂，常需手动维护类型定义

**解决方案**：`src/hooks/valtioTool.ts` 中的增强版 Valtio 状态管理。

```tsx
/** 核心实现 */
export function createProxy<T extends object>(initState: ExcludeProps & T) {
  const getInitState = () => deepClone(initState) as T
  const store = proxy(getInitState())

  const reset = (key?: keyof T, initState?: Partial<T>) => {
    /** 实现重置状态的逻辑 */
  }

  const use = (options?: Options) => useSnapshot(store, options)
  const dispose = (initState?: Partial<T>) => onUnmounted(() => reset(undefined, initState))
  const useAndDispose = (options?: Options) => (dispose(), use(options))

  return Object.assign(store, {
    use,
    useAndDispose,
    reset,
    dispose,
    getInitState
  })
}

/** 使用示例 */
const todoStore = createProxy({ items: [], loading: false })

/** 组件中使用 */
function TodoList() {
  /** 获取响应式状态，组件卸载时自动重置状态 */
  const { items } = todoStore.useAndDispose()

  /** 直接修改状态 - 无需 dispatch actions */
  const addItem = () => { todoStore.items.push({ text: 'New Task' }) }

  return <>{items.map(item => <TodoItem { ...item } key={ item.id } />)}</>
}
```

**技术亮点**：

1. **增强的状态管理工具**
  - 基于 Valtio 的代理（Proxy）实现，API 极简且直观
  - 扩展了状态重置、生命周期管理等核心功能
  - 支持精细化控制，可重置单个属性或整个状态

2. **TypeScript 友好设计**
  - 完整的泛型支持，自动推导状态和方法的类型
  - 通过 `ExcludeProps` 类型确保初始状态不会与内部方法名冲突
  - 为内部方法提供明确的类型定义，带有详细的 JSDoc 注释

3. **组件生命周期集成**
  - `dispose` 方法自动在组件卸载时重置状态，防止状态残留
  - `useAndDispose` 结合了状态获取和自动清理，简化常见用例
  - 避免了全局状态在单页应用中积累和污染的问题

4. **灵活的状态重置**
  - 支持全量重置或指定属性重置
  - 可以指定自定义的初始状态，而不仅限于创建时的状态
  - 提供 `getInitState` 方法获取原始状态的深拷贝，防止引用污染

**学习价值**：
- 如何增强第三方库以满足项目特定需求
- 全局状态的生命周期管理最佳实践
- TypeScript 高级类型技术在实际项目中的应用
- 平衡开发便利性和应用健壮性的状态设计

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
# 确保安装了 Node.js 18+ 和 pnpm@9.7.0
npm install -g pnpm

# 克隆仓库
git clone https://github.com/yourusername/react-tool.git
cd react-tool

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 学习路径建议

1. **浏览项目结构**：了解各目录职责和组织方式
2. **研究构建配置**：查看 `vite.config.ts` 和 `package.json` 理解工程化配置
3. **探索组件实现**：从基础组件（如Button、Form）开始，逐步学习复杂组件
4. **学习性能优化**：研究虚拟滚动、Web Worker 等性能优化实现

## 📝 学习总结

本项目展示了多种现代前端工程化实践和组件设计模式，核心价值在于：

- **工程化思维**：如何通过自动化和约定减少人为错误和重复工作
- **组件化设计**：如何设计可复用、可维护的组件体系
- **性能优化策略**：如何在不同场景选择合适的优化方案
- **现代化工具应用**：如何充分利用现代前端工具生态

这些实践和模式可以应用到各种规模的 React 项目中，提高开发效率和代码质量。
