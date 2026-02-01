# 开发规范

## 设计 Token 系统

### 设计 Token 配置

项目使用 **TailwindCSS** 作为样式系统，设计 Token 定义在 `tailwind.config.js` 中

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
  - 例如：`bg-backgroundSecondary`、`text-systemOrange`、`border-border`
- ✅ **自动适配深色模式**：所有 Token 都支持深色模式自动切换
- ❌ **避免硬编码颜色**：不要直接使用 `#ffffff`、`rgba()` 等硬编码颜色值
- ❌ **不要手动修改 CSS 变量文件**：`packages/styles/css/autoVariables.css` 是自动生成的，不要手动编辑

### 常用 Token 示例

```tsx
// 背景色
<div className="bg-backgroundSecondary" />        // 次要背景
<div className="bg-systemOrange/10" />           // 橙色背景，10% 透明度

// 文字颜色
<span className="text-textPrimary" />            // 主要文字
<span className="text-textSecondary" />          // 次要文字（70% 透明度）
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
