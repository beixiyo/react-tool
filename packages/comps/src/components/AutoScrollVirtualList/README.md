# AutoScrollVirtualList

动态高度虚拟列表，专为聊天场景设计。只渲染可视区域 + overscan 缓冲，支持自动滚动到底、向上加载历史、流式输出跟随。

## 为什么不用 react-virtuoso

react-virtuoso 功能完整，但引入了完整的响应式引擎（urx），打包 ~50KB gzip。`AutoScrollVirtualList` 是一个 **~200 行**的轻量实现，只做聊天需要的事。

## 架构决策

### 文档流 + paddingTop/Bottom（而非 absolute + translateY）

这是整个组件最关键的设计选择。

#### 两种虚拟列表渲染模型

**模型 A：绝对定位（常见于早期虚拟列表）**

```
scrollContainer
└── heightDiv (height: 5000px)              ← 空壳撑滚动条
    └── contentDiv (position: absolute)      ← 脱离文档流
        └── items (translateY: 1200px)
```

items 脱离文档流后，浏览器只看到一个空的 5000px div。当 item 高度在首次测量后发生变化（估算 80px → 实际 648px），我们必须手动计算 anchor correction 并修改 `scrollTop`：

```
帧1: wheel 事件 → scrollTop = 1534
帧2: useLayoutEffect 测量 → 发现高度变了 → scrollTop += 473 = 2007  ← 内容回跳！
帧3: scrollTop 变化触发的异步 scroll event → handleScroll → updateVisibleData
      → 新的 items 渲染 → 再次测量 → 再次 correction...
```

**问题核心**：`scrollTop` 的每次修改都会在下一帧产生异步 `scroll` 事件，这个事件触发 `updateVisibleData` → 新 renderData → 新测量 → 新 correction → 新 scroll event... 形成**跨帧反馈循环**，用户看到内容来回抖动。

尝试过的补救措施：
- `skipScrollEventRef` 标志位 → 无法区分 correction 的 scroll event 和用户 wheel 的 scroll event
- `requestAnimationFrame` 延迟清标志 → 时序不可靠
- `scrollBy()` 替代 `scrollTop +=` → 同样触发 scroll event
- deviation + marginTop（react-virtuoso 方案）→ 在绝对定位模型下，marginTop 不影响 absolute 子元素位置

**模型 B：文档流 + padding（本组件采用）**

```
scrollContainer (overflow-anchor: none)
└── contentDiv (paddingTop: 1200px, paddingBottom: 2400px)
    └── items (normal flow, overflow-anchor: auto, display: flow-root)
```

items 在文档流中正常渲染。`paddingTop` 撑开上方未渲染区域，`paddingBottom` 撑开下方。

当 `useLayoutEffect` 中测量到 item 高度变化并更新 `paddingTop` 时，浏览器的 **CSS Scroll Anchoring**（`overflow-anchor`）检测到锚定元素位移，在**同一帧的 layout 阶段**自动调整 `scrollTop`：

- 不产生新的 `scroll` 事件
- 不触发 `handleScroll`
- 不形成反馈循环
- 用户零感知

**一句话：`absolute` 是你帮浏览器管滚动位置（且管不好），`padding` 是让浏览器自己管（它管得很好）。**

### display: flow-root

每个 item wrapper 设置 `display: flow-root`，创建独立的 BFC。作用：

- 子元素的 margin（如 `mt-8`）被 `offsetHeight` 正确计入
- 相邻 items 的 margin 不会互相折叠
- 每个 item 的高度测量结果 = 视觉占用高度，无意外

### id-based 高度缓存

缓存 key 用 `item.id` 而非数组 index。当历史消息从顶部 prepend 时，旧消息的 index 变了但 id 没变，缓存命中不受影响。

### shouldAutoScrollRef 同步更新

不用 `useLatestRef`（它在 `useEffect` 中更新 ref，晚于 `useLayoutEffect`）。改为自定义 `setAutoScrollState` 同时更新 state 和 ref，确保 `useLayoutEffect` 中读到最新值。

## 高度预估（estimateItemHeight）

通过 `estimateItemHeight` prop，消费侧可按消息类型提供不同的高度估算。参考实现 `useMessageHeightEstimator`：

- **text / markdown**：按字符数 × 平均字宽估算行数 × 行高
- **card**：固定 280px
- **loading**：固定 40px
- **thinking**：文本高度 + 60px overhead

`calibrate(el)` 从 DOM 读取实际 `fontSize` 和 `lineHeight`，确保估算贴近真实渲染。

如需更精确的文本预测量（如大数据量场景），可接入 [@chenglou/pretext](https://github.com/chenglou/pretext)（纯算术文本布局，无 DOM reflow），通过 `estimateItemHeight` prop 传入即可。

## API

```tsx
<AutoScrollVirtualList
  data={messages}
  itemHeight={100}                          // 默认估算高度
  estimateItemHeight={(item) => ...}        // 按 item 精确估算（可选）
  overscan={5}                              // 视口外缓冲数量

  autoScroll={true}                         // AI 输出时自动跟随
  smooth={true}                             // scrollToBottom 用 smooth
  scrollBottomThreshold={5}                 // 判定"到底"的阈值 (px)

  hasMore={true}                            // 是否还有更多历史
  showLoading={isLoading}                   // 顶部 loading 指示器（纯受控）
  loadMore={onLoadMore}                     // 滚到顶部时触发
  loadMoreThreshold={50}                    // 触发 loadMore 的阈值 (px)
>
  {(item, index) => <MessageItem message={item} />}
</AutoScrollVirtualList>
```

### Ref 方法

```ts
type AutoScrollVirtualListRef = {
  scrollToBottom: () => void
  setAutoScroll: (enabled: boolean) => void
  isAutoScrolling: () => boolean
  getScrollElement: () => HTMLDivElement | null
}
```

### 高度优先级

```
DOM 实测缓存 > estimateItemHeight(item) > itemHeight
```

## 聊天场景集成示例

```tsx
// useMessageHeightEstimator.ts — 用 pretext 预测量
const { estimateHeight, calibrate } = useMessageHeightEstimator(containerWidth)

// ChatHistory.tsx
<AutoScrollVirtualList
  data={messages}
  estimateItemHeight={estimateHeight}
  hasMore={hasMore}
  showLoading={showLoading}
  loadMore={handleLoadMore}
>
  {(msg, i) => <MessageItem message={msg} />}
</AutoScrollVirtualList>
```

### Loading 指示器

- 放在滚动容器内、content div 外（兄弟节点）
- `sticky top-0` 固定在视口顶部
- 出现/消失时 `useLayoutEffect` 补偿 `scrollTop`，防止内容跳动
- 完全由外部 `showLoading` prop 控制（组件不管理加载状态）

### 向上加载历史

- `scrollTop <= loadMoreThreshold` 时触发 `loadMore` 回调
- `isLoadingRef` 防止重复触发
- 新消息 prepend 后，`useLayoutEffect([data])` 自动补偿 scrollTop

## 浏览器兼容

- `overflow-anchor`: Chrome 56+, Firefox 66+, Safari 15.4+, Edge 79+
