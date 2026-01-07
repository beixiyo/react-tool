# useFloatingPosition 迁移记录（comps 浮层定位统一）

本文档用于记录 `useFloatingPosition` 在 `packages/comps` 的落地与迁移进度，确保“浮层在限定范围内展示（防出界/防不可见）”的逻辑可复用、可追踪。

## 背景

在组件库里存在多类“浮层/悬浮层”：

- **相对触发器定位**：Tooltip/Popover/DatePicker/Cascader 等
- **相对鼠标/光标定位**：ContextMenu、输入法/补全提示面板等（需要“虚拟 reference”）
- **全屏遮罩/居中弹层**：Modal/PreviewImg 等（通常不需要触发器定位）

为统一“定位 + 防出界 + 跟随滚动/resize 更新”，新增了通用 Hook：

- `packages/hooks/src/useFloatingPosition.ts`

## Hook 能力边界（当前版本）

- **支持**：相对触发器的 placement（`top/bottom/left/right` + `-start/-end/-center`）、`flip`、`shift(clamp)`、`scroll/resize` 自动更新（scroll 默认 capture）、`ResizeObserver` 更新
- **不支持（需扩展）**：不依赖 DOM ref 的“虚拟 reference”（鼠标坐标、光标坐标、任意 Rect）

## 迁移状态总览

### 已完成（已统一使用 useFloatingPosition）

| 组件 | 文件 | 说明 | 状态 |
| --- | --- | --- | --- |
| Tooltip | `packages/comps/src/components/Tooltip/useTooltip.ts` | 保持既有行为：只做 clamp，不 flip；scroll/resize 更新交给 hook | ✅ 完成 |
| Popover | `packages/comps/src/components/Popover/index.tsx` | flip + clamp + scroll/resize(capture) 更新统一 | ✅ 完成 |
| DatePicker | `packages/comps/src/components/DatePicker/DatePicker.tsx` | 补齐 scroll/resize 跟随，统一 flip+clamp | ✅ 完成 |
| Cascader | `packages/comps/src/components/Cascader/Cascader.tsx` | 补齐 scroll/resize 跟随，统一 flip+clamp | ✅ 完成 |

### 未完成（强烈建议迁移：同类逻辑重复，且缺少跟随）

| 组件 | 文件 | 当前问题/现状 | 推荐改造 | 状态 |
| --- | --- | --- | --- | --- |
| DateRangePicker | `packages/comps/src/components/DatePicker/DateRangePicker.tsx` | 手写 `calculatePosition`，打开后不跟随 scroll/resize | 直接接入 `useFloatingPosition`（同 DatePicker） | ⏳ 待改造 |
| MonthPicker | `packages/comps/src/components/DatePicker/MonthPicker.tsx` | 同上 | 同上 | ⏳ 待改造 |
| YearPicker | `packages/comps/src/components/DatePicker/YearPicker.tsx` | 同上 | 同上 | ⏳ 待改造 |

### 适合迁移，但需要先扩展 hook（虚拟 reference）

| 组件 | 文件 | 当前定位方式 | 需要的 hook 扩展 | 状态 |
| --- | --- | --- | --- | --- |
| ContextMenu | `packages/comps/src/components/ContextMenu/ContextMenu.tsx` | 使用鼠标 `clientX/clientY` + menuRect 做边界修正 | `useFloatingPosition` 支持 `virtualReferenceRect`（或 `reference: { getBoundingClientRect() }`） | 🧩 需扩展 |
| AutoCompletePanel | `packages/comps/src/components/ChatInput/components/AutoCompletePanel.tsx` | `trackCursorCoord` 返回光标坐标，直接 `style.top/left` | 同上（虚拟 reference 为“光标矩形”）+ clamp | 🧩 需扩展 |

### 不建议使用本 hook（定位目标不是“触发器相对浮层”）

| 组件 | 文件 | 原因 | 状态 |
| --- | --- | --- | --- |
| Modal | `packages/comps/src/components/Modal/Modal.tsx` | 全屏遮罩 + 居中弹层，不依赖触发器定位 | 🚫 不适用 |
| PreviewImg | `packages/comps/src/components/PreviewImg/index.tsx` | 全屏遮罩预览，不依赖触发器定位 | 🚫 不适用 |
| Message | `packages/comps/src/components/Message/index.tsx` | 固定顶部居中 Toast，不依赖触发器定位（但可做 viewport clamp） | ⚪ 可选 |

### 候选（可迁移：相对元素的“预览浮层”）

| 组件 | 文件 | 当前定位方式 | 推荐 | 状态 |
| --- | --- | --- | --- | --- |
| PhoneCarousel 预览图 | `packages/comps/src/components/PhoneCarousel/index.tsx` | `getBoundingClientRect()` 计算 `previewPosition`，并监听 scroll/resize | 用 `useFloatingPosition(phoneCarouselRef, previewRef)` 统一；顺便加 clamp | 🟡 候选 |

## 搜索/扫描方法（以后新增组件也能快速归类）

在 `packages/comps/src/components` 下，用下面关键词扫描：

- **定位测量**：`getBoundingClientRect(`
- **Portal 浮层**：`createPortal(`
- **fixed/absolute 坐标渲染**：`position: 'fixed'`、`className.*\\bfixed\\b`、`style.*top.*left`
- **边界修正**：`innerWidth`、`innerHeight`、`Math.min`/`Math.max` clamp
- **跟随更新**：`addEventListener('scroll'`、`addEventListener('resize'`

## 维护规则

- 新增“相对触发器定位”的浮层组件：优先直接使用 `useFloatingPosition`
- 新增“相对鼠标/光标定位”的浮层：先扩展 `useFloatingPosition` 支持虚拟 reference，再统一接入
- 文档中的表格状态必须同步更新（完成/待改造/不适用）


