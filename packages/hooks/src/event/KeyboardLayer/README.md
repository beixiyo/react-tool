# KeyboardLayer

`useKeyboardLayer` 用于协调嵌套交互区域的全局键盘事件。最高 `priority` 的活动层拥有响应权；同优先级时最近激活的层优先。同一次按键不会继续触发下层，适合 Modal、Popover、选择器和快捷键面板

```tsx
useKeyboardLayer({
  active: open,
  keys: ['Enter'],
  metaKey: true,
  onKeyDown: submit,
})
```

## 契约

- `active` 决定当前实例是否注册到栈中
- `keys` 匹配 `KeyboardEvent.key`；省略时匹配所有按键，空数组不匹配任何按键
- `ctrlKey`、`shiftKey`、`altKey`、`metaKey` 约束修饰键状态；省略的字段不参与匹配，显式传入 `false` 表示要求未按下
- `when` 负责事件目标或其他复杂条件；它与 `keys`、修饰键约束按 AND 关系匹配
- `priority` 决定视觉层级，数值较大的活动层优先；同优先级按最近激活顺序处理
- 调用方应让 `priority` 与真实视觉 z-index 一致；只有数值型 z-index 能被组件自动同步，CSS class 或字符串覆盖需要显式传入对应数值
- 只有优先级最高的活动层参与匹配；不匹配时不会向下层查找
- `handlerEnabled=false` 时不执行回调，但栈顶层仍可消费匹配事件，避免穿透
- `allowRepeat=false` 时长按产生的重复事件仍被消费，但不重复执行 handler
- `consume=true` 会对匹配事件执行 `preventDefault` 和 `stopPropagation`
- 省略 `onKeyDown` 时，匹配事件仍按 `consume` 处理，可用于纯阻断层

Escape 也是普通键盘层场景，使用 `keys: ['Escape']` 即可

独立的应用快捷键或元素内键盘导航使用 `useShortCutKey`；需要按视觉层级互斥响应的浮层交互使用 `useKeyboardLayer`
