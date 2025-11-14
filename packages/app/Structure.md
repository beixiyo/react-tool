# React Tool - 核心结构与洞察

---

## 1. 项目概览与结构

- 这是一个使用 React + TypeScript + Vite 构建的组件和工具集合项目
- 使用 pnpm 作为包管理器
- 使用 TailwindCSS 进行样式处理
- 目录结构清晰，按功能（`components`, `views`, `hooks`, `utils`）和业务（`views/*`）分离

---

## 2. 关键模块与功能

### 自动化与工程化

- **自动路由**: 使用 `@jl-org/vite-auto-route` 插件，自动扫描 `src/views/**/page.tsx` 和 `src/components/**/Test.tsx` 文件，生成路由配置，无需手动维护路由表。
- **自动生成CSS变量**: 通过 `scripts/autoWriteStyle.cjs` 脚本，在项目启动时读取 `src/styles/variable.ts` 中的 TypeScript 变量，并自动生成对应的 CSS 和 SCSS 变量文件。这使得样式变量可以在 JS 和 CSS 中共享和统一管理。
- **自动API导入**: Vite 插件 `unplugin-auto-import` 自动导入 React 和 React Router 的核心API，减少了重复的 import 语句。
- **环境变量解析**: 使用 `vite-plugin-env-parse` 插件，为 `import.meta.env` 提供类型提示，增强了代码的健壮性。
- **代码审查工具**: 集成 `code-inspector-plugin`，在开发模式下，可以点击页面元素直接跳转到IDE中的源代码位置，极大地提升了调试效率。
- **构建分析**: 集成 `rollup-plugin-visualizer`，在构建后生成 `dist/stats.html` 文件，可以直观地分析打包产物中各个模块的大小，便于进行性能优化。
- **精细化代码分割**: 在 `vite.config.ts` 中配置了 `manualChunks`，将大型库（如 `react`, `fabric`, `ffmpeg`）分离到不同的 chunk 中，优化了初始加载性能。

### 国际化 (i18n)

- **i18next**: 使用 `i18next` 和 `react-i18next` 提供国际化支持。
- **自动加载语言包**: 在 `src/locales/lang.ts` 中，利用 `import.meta.glob` 动态加载所有语言目录下的 `.json` 文件，实现了语言资源的自动注册，扩展新语言时无需修改入口文件。
- **浏览器语言检测**: 使用 `i18next-browser-languagedetector` 自动检测用户浏览器语言，并提供默认语言回退机制。

### 状态管理

- **Valtio**: 项目中引入了 `valtio`，这是一个基于代理（Proxy）的轻量级状态管理库，提供了简单直观的 API 来管理全局和局部状态。
- **全局状态 hook**: `src/hooks/valtioTool.ts` 对 `valtio` 进行了封装，提供了 `useStore` 和 `getStore` 等便捷的 hook 和工具函数，使得在组件中消费和修改全局状态更加方便。

### 表单系统
- `src/components/Form` 目录包含了一个完整的表单处理系统
- 提供了表单状态管理、验证和提交处理
- 通过 Context API 实现了表单字段与表单的通信
- 支持字段验证、错误状态管理、表单提交等功能

### 输入组件
- 项目包含多种输入组件：Input、NumberInput、Radio、Textarea、Switch、Checkbox、Select等
- 所有表单组件都支持独立使用和表单集成两种模式
- Select组件支持单选和多选模式，并可配置搜索功能

### 代码高亮组件
- 位于 `src/components/CodeHighlight` 目录，使用 Shiki 实现语法高亮
- 使用 Web Worker 在后台线程处理代码高亮，避免主线程阻塞，提高UI响应性
- 支持多种主题，包括 github-dark、nord、material-theme 等多个主题选项
- 通过 transformers 实现行号显示功能，比旧版本使用的插件方式更灵活
- 提供代码复制功能，并有复制成功的交互反馈
- 使用 CSS 模块定制样式，包括行号样式、暗黑模式适配等
- 支持加载状态显示和错误处理，出错时降级为普通代码显示
- 可自定义代码块最大高度、是否显示行号和是否可复制

### 代码预览组件
- 位于 `src/components/CodePreview` 目录，集成了代码展示、编辑和预览功能
- 支持三种模式切换：代码查看、编辑、预览运行
- 支持自定义头部UI，可传入 `customHeader` 函数来完全控制头部区域
- 可与 Switch 组件集成，提供更直观的切换交互
- 内置代码编辑器，支持实时代码修改并预览
- 可设置自动运行代码，适用于教学演示场景
- 支持HTML代码的实时预览，显示渲染结果
- 通过 KeepAlive 组件优化不同模式间的切换性能
- 提供各种自定义选项：主题、行号显示、最大高度等

### Web Worker 功能
- 位于 `src/worker` 目录，包含多种后台处理工作的 Worker 文件
- `shikiWorker.ts`：专门用于处理代码高亮任务，防止在处理大型代码块时阻塞主线程
- `zipWorker.js`：处理文件压缩相关任务
- `noiseWorker.ts`：处理噪声生成算法
- 使用 `useWorker` 自定义Hook（位于 `src/hooks/useWorker.ts`）管理 Worker 的生命周期和通信
- Worker 通信采用消息传递模式，支持错误处理和状态反馈

## 3. 代码风格与约定

- 使用 TypeScript 进行类型定义
- 使用函数组件和 React Hooks
- 组件采用 memo 进行性能优化
- 使用 JSDoc 进行代码注释，特别是对于组件 Props 的描述
- 不使用分号，使用两格缩进和单引号

## 4. 核心函数、类与组件

### 表单系统
- `Form`: 主表单组件，提供表单上下文和状态管理
- `useForm`: Hook，用于在子组件中访问表单上下文
- `useFormField`: Hook，用于处理表单字段与表单上下文的交互，支持表单集成和独立使用

### UI组件
- `Input`: 文本输入框组件
- `NumberInput`: 数字输入组件
- `Radio`/`RadioGroup`: 单选按钮组件
- `Textarea`: 多行文本输入组件
- `Switch`: 开关组件
  - 支持不同尺寸：小、中、大
  - 可自定义选中状态颜色
  - 支持在开关上显示图标
  - 支持在滑块中心显示固定图标（icon属性）
  - 支持渐变背景（withGradient属性）
  - 支持自定义滑块样式（iconClassName属性）
  - 集成表单系统，支持错误信息显示
  - 支持禁用状态样式
- `Checkbox`: 复选框组件，基于 Checkmark 构建，支持表单集成
  - 支持根据系统主题自动调整颜色
  - 支持 required 属性，显示必填标记
  - 支持表单验证集成
- `Select`: 下拉选择组件
  - 支持单选和多选模式
  - 支持选项搜索功能
  - 支持自定义占位符和图标
  - 支持表单集成，可以在Form中使用并获得验证
  - 支持禁用状态、加载状态
  - 使用useFormField实现表单集成
- `CodeHighlight`: 代码高亮组件
  - 使用 Shiki 库进行语法高亮
  - 通过 Web Worker 后台处理高亮任务，优化性能
  - 支持多种编程语言和多种主题
  - 提供行号显示、代码复制功能
  - 支持自定义高度和样式
  - 增加了错误处理和加载状态显示
  - 支持直接通过lineHeight属性控制代码行高
- `CodePreview`: 代码预览组件
  - 集成代码展示、编辑和预览功能
  - 支持自定义头部UI，可完全控制头部区域的外观和交互
  - 可使用 Switch 组件替代传统按钮，提供更现代的交互体验
  - 可在 Switch 中显示图标，提供更明确的功能指示
  - 支持代码实时编辑并预览运行
  - 内置代码语法高亮和HTML预览功能
  - 通过 KeepAlive 组件优化不同模式间的切换性能

### 自定义Hooks
- `useTheme`: 获取并订阅当前系统主题
- `useWorker`: 管理Web Worker的生命周期和通信
  - 支持创建和终止Worker
  - 提供消息发送和监听功能
  - 处理Worker错误情况
  - 在组件卸载时自动清理Worker资源

### 主题系统
- 使用 `useTheme` hook 获取当前系统主题
- 支持深色模式和浅色模式切换
- 组件能够根据当前主题自动调整样式

## 5. 文件关联与数据流

- 表单组件通过 Context API 与表单状态交互
- `useFormField` 是连接表单组件和表单上下文的关键，处理表单值的获取和更新
- 主题通过 `useTheme` 钩子在组件间共享，实现统一的主题外观
- CodeHighlight组件使用Web Worker进行代码高亮处理，通过消息传递与Worker通信
- useWorker Hook负责管理Worker的生命周期和通信机制，确保资源正确释放
- CodePreview组件整合了CodeHighlight和HtmlPreview组件，提供完整的代码查看和运行体验

## 6. 项目启动与执行流程

- 组件支持表单集成模式和独立使用模式
- 表单组件首先检查是否在表单上下文中，然后决定使用哪种模式
- 表单验证和提交由 Form 组件统一处理
- 需要高性能计算的任务（如代码高亮）通过Web Worker在后台线程执行，避免阻塞主线程
- 组件的自定义选项通过props传入，实现高度可配置性

## 7. 外部依赖

- React 和 React DOM
- TypeScript
- Vite 作为构建工具
- TailwindCSS 用于样式
- Lucide 图标库
- Shiki 用于代码语法高亮
- @jl-org/tool 工具集合，提供如copyToClipboard等实用函数
