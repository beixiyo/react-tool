# 项目开发约定

## 样式与尺寸

- 优先用 `tailwind.config.js` 的语义 Token，复用已有的亮暗主题，不硬编码主题色。新增 Token 改 `packages/styles/variable.ts`，不手改生成的 `packages/styles/css/autoVariables.css`
- `size` 按含义选尺度，不跨用：图标用 `components/icons/utils.ts`，控件高度用 `utils/controlSizes.ts`，圆角用 `utils/roundedUtils.ts`（均相对 `packages/comps/src`）；Checkbox、Radio、Switch 各用自己的尺寸表
- 常规控件用 `Size`（`sm / md / lg` 或数字），缺省在入口归一为 `md`；图标用 `IconSize`。单一几何量可用有明确含义的数字属性，如 `thumbSize`
- 字符串档位和数字尺寸用 `utils/sizeUtils.ts` 的 `getSizeStyles`；数字尺寸传给 cva 时用 `size: null` 跳过默认档。不同含义的子组件尺寸先换算再传；已有档位的像素值是公共契约

## 组件与演示

- 通用组件放 `packages/comps/src/components/<PascalCase>/`，包含主组件、`types.ts`（或 `types/`）、纯 re-export 的 `index.ts` 和不导出的演示页 `Test.tsx`。可选文件和目录以 [结构检查脚本](packages/app/scripts/checkComponentStructure.ts) 为准；从 `packages/app` 运行 `bun run scripts/checkComponentStructure.ts <DirName>`
- 新组件同时加入 `packages/comps/src/components/index.ts` 和 `packages/app/src/components/PageSnapshots/category.ts`。画廊标题和描述按需改 `PageSnapshots/tools/pageDescriptions.ts`
- 演示页用已有 `comps` 组件搭建，覆盖主要变体和边界。`comps` 内的演示页用相对导入以保留源码热更新，应用内从 `comps` 导入。仅演示 hooks 等能力的页面放 `packages/app/src/components/<Name>/Test.tsx`。演示路由自动生成：`http://localhost:9977/<目录名>`
- 新增模块顶层副作用时更新对应包 `package.json` 的 `sideEffects`，避免被 tree-shake
- SVG 放所在包的 `src/assets/svg/`；app 中作为 React 组件导入时用 `.svg?react`

## 动画

- 动画参数统一放在 `MOTION_TRANSITIONS`
- 列表入退场用 `createListItemEnter` 生成位移与透明度状态，错峰由调用方用 Motion 的 `stagger(LIST_ENTER_INTERVAL)` 编排
- `Animate` 管入退场，`AnimateShow` 管受控显隐，`SizeTransition` 提供单节点尺寸过渡

## 键盘与 DOM 契约

- 组件快捷键默认限定在组件内，用 `useShortCutKey` 并指定 `el`；全局快捷键显式配置。浮层用 `useKeyboardLayer`，Escape 只关闭栈顶可关闭浮层；隐藏或禁用时停用监听
- 非输入组件的快捷键不抢占可编辑目标；只消费实际处理的按键。方向键、Home / End 和确认选择跳过禁用项
- 组件定义的 `data-*` 统一放 `packages/comps/src/constants/dataAttributes/`：跨组件的稳定公开状态放 `public.ts`，组件专用属性放 `components.ts`，共享内部属性放 `internal.ts`。公开状态挂在实际承载该状态的稳定节点，不用 `data-*` 替代 ARIA
