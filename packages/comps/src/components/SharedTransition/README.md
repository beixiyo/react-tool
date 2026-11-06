# SharedTransition

通过静态工厂凭证关联两个离散端点。一个 Provider 可管理任意多组不同凭证；相同凭证在不同 Provider 中相互隔离

## 连续变形预设

默认开启连续变形：卡片 / 胶囊展开成面板时，自动提供位置与尺寸过渡、圆角裁剪、保持比例的内容快照和分阶段淡化，不需要业务 SCSS。收起时面板内容在前 12% 时长内淡出，实心表面继续缩向来源，避免出现微缩页面：

```tsx
export const PanelTransition = createSharedTransition()

// 可选覆盖；未提供的字段沿用预设默认值
export const CustomTransition = createSharedTransition({
  morph: {
    duration: { open: 520, close: 420 },
    sourceRadius: 20,
    targetRadius: 16,
  },
})
```

## 基本用法

```tsx
// photoTransition.ts：只创建身份和绑定组件，不保存模块级可变状态
export const PhotoTransition = createSharedTransition()

// App.tsx
<SharedTransitionProvider>
  <Thumbnail />
  <Preview />
</SharedTransitionProvider>

// Thumbnail.tsx：来源需要一个稳定的布局容器
function Thumbnail() {
  const { show } = PhotoTransition.useTransition()

  return (
    <div style={{ width: 160, height: 120 }}>
      <PhotoTransition.Source>
        <button onClick={() => show()}>
          <img src="/small.jpg" alt="图片" />
        </button>
      </PhotoTransition.Source>
    </div>
  )
}

// Preview.tsx：Portal 必须在同次提交中挂载；不能延迟到 effect 才插入目标
function Preview() {
  const { isOpen, hide } = PhotoTransition.useTransition()
  if (!isOpen) return null

  return createPortal(
    <PhotoTransition.Target>
      <div>
        <img src="/large.jpg" alt="图片大图" />
        <button onClick={() => hide()}>关闭</button>
      </div>
    </PhotoTransition.Target>,
    document.body,
  )
}
```
