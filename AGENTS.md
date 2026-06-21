# 开发规范

## 设计 Token 系统

### 设计 Token 配置

项目使用 **TailwindV4** 作为样式系统，设计 Token 定义在 `tailwind.config.js` 中

### Token 同步机制

设计 Token 的同步流程：

1. **源文件**：`packages/styles/variable.ts`
   - 定义所有设计 Token（颜色、间距等）
   - 包含 `light` 和 `dark` 两种主题配置

2. **自动同步**：通过 Vite 插件 `@jl-org/js-to-style` 实现
   - 自动将 `packages/styles/variable.ts` 中的 Token 同步到 `packages/styles/css/autoVariables.css`
   - 生成 CSS 变量（`--variableName` 格式）

3. **Tailwind 配置**：`tailwind.config.js`
   - 使用 CSS 变量引用设计 Token
   - 格式：`rgb(var(--variableName) / <alpha-value>)`
   - 支持透明度控制（通过 `<alpha-value>` 占位符）

### 使用规范

- ✅ **优先使用 Tailwind Token**：使用 `tailwind.config.js` 中定义的颜色类名
  - 例如：`bg-background2`、`text-systemOrange`、`border-border`
- ✅ **自动适配深色模式**：所有 Token 都支持深色模式自动切换
- ❌ **避免硬编码颜色**：不要直接使用 `#ffffff`、`rgba()` 等硬编码颜色值
- ❌ **不要手动修改 CSS 变量文件**：`packages/styles/css/autoVariables.css` 是自动生成的，不要手动编辑

### 常用 Token 示例

```tsx
// 背景色
<div className="bg-background2" />        // 次要背景
<div className="bg-systemOrange/10" />           // 橙色背景，10% 透明度

// 文字颜色
<span className="text-text" />            // 主要文字
<span className="text-text2" />          // 次要文字（70% 透明度）
<span className="text-systemOrange" />           // 系统橙色

// 边框
<div className="border border-border" />         // 标准边框
<div className="border-systemOrange" />          // 橙色边框
```

## 组件库使用（Comps Package）

### 组件库位置

项目使用 **mono-repo** 架构，通用组件统一放在 `packages/comps` 包中

### 组件导入方式

#### 在应用中使用组件（推荐）

在 `packages/app` 或其他包中使用组件时，直接从 `comps` 包导入：

```tsx
import { Button, Card, Input, Checkbox } from 'comps'

function MyComponent() {
  return (
    <Card>
      <Input placeholder="输入内容" />
      <Button>提交</Button>
    </Card>
  )
}
```

## 写组件流程规范

在 `packages/comps` 新增通用组件时，建议按下列顺序完成，避免遗漏演示页、导出与画廊分类

### 1. 目录与实现

- 新建目录：`packages/comps/src/components/<ComponentName>/`，目录名使用 **PascalCase**（与组件名一致）
- 在目录内实现组件，入口一般为 `index.tsx`
- 样式遵循本文「设计 Token 系统」：优先 Tailwind Token，避免硬编码颜色；`displayName` 按需设置以便调试

### 2. 包导出

- 在 `packages/comps/src/components/index.ts` 增加：`export * from './<ComponentName>'`（路径与目录名一致）

### 3. 演示页 `Test.tsx`（必填）

- 在同目录下新增 `Test.tsx`，作为该组件的独立演示页面
- 路由由 `packages/app` 的 `genRoutes`（见 `packages/app/src/router/index.tsx`）通过 `import.meta.glob` **自动生成，无需改路由表**。实际有三套自动路由：
  - `comps`：扫描 `packages/comps/src/components/**/Test.tsx`（通用组件库，本文档主体）
  - `components`：扫描 `packages/app/src/components/**/Test.tsx`（app 内部组件，如 `Aurora`/`Typewriter`，同样自动注入）
  - `pages`：扫描 `packages/app/src/views/**/page.tsx`（完整页面）
- **如何访问**：`pnpm dev` 启动后访问 `http://localhost:9977/<组件目录名>`（如 `/Button`）。路由**大小写不敏感**（`/button` 与 `/Button` 等价）；首页 `/` 是 `PageSnapshots` 组件画廊，可点进每个演示页

#### 演示页规范（统一标准，必须遵守）

- **统一用组件库（comps）的组件搭建演示页**，而非裸 HTML：分区容器用 `Card`、按钮用 `Button`、滑块用 `Slider`、开关用 `Switch`、输入用 `Input`/`Select` 等
- **必须支持暗色**：放置 `<ThemeToggle />`，页面外壳一律用语义 Token（`bg-background`/`text-text`/`text-text2`/`border-border` 等），**不要硬编码颜色，也不要手写 `dark:` 变体**（Token 自动适配暗色）
  - 例外：当颜色本身是该组件的**演示主体**（如 `GradientText` 的渐变、`DyBgc` 的动态背景色、`Progress` 的 `colors`），保留这些演示色，只 Token 化外壳
- **导入约定**：comps 包内 Test.tsx 用**相对路径**导入兄弟组件（`../Card`/`../ThemeToggle`/`./Xxx`），**禁止 `from 'comps'`**（会绕开源码热更新）；app 包内 Test.tsx 维持 `from 'comps'`
- **覆盖度**：覆盖主要 props 变体 + 边界情况（空状态、单条、多条、禁用、loading 等）
- **保持干净**：不要留 `alert()`、调试 `console.log`、`@TODO`、注释掉的死代码

### 4. PageSnapshots 分类

- 在 `packages/app/src/components/PageSnapshots/category.ts` 中增加映射

### 5. 可选：画廊文案

- 若需在组件画廊中展示固定描述或中文标题，可在 `packages/app/src/components/PageSnapshots/tools/pageDescriptions.ts` 中补充：
  - `COMPONENT_DESCRIPTIONS`：键为 **PascalCase 目录名**（与磁盘上文件夹名一致，如 `AnnouncementBar`）
  - `COMPONENT_NAME_MAP`：同上，用于展示名称格式化

## SVG 资源管理

### SVG 文件位置

所有 SVG 图标和资源统一放在：`src/assets/svg/`

### SVG 使用方式

项目使用 **vite-plugin-svgr** 插件处理 SVG，支持以下两种使用方式：

#### 方式一：作为 React 组件导入（推荐）

```tsx
import { ReactComponent as IconName } from '@/assets/svg/icon-name.svg'

function Component() {
  return <IconName className="w-4 h-4 text-systemOrange" />
}
```

#### 方式二：作为 URL 导入

```tsx
import iconUrl from '@/assets/svg/icon-name.svg'

function Component() {
  return <img src={iconUrl} alt="icon" />
}
```
