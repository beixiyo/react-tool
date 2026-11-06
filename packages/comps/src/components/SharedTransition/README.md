# SharedTransition

通过静态工厂凭证关联两个离散端点。一个 Provider 可管理任意多组不同凭证；相同凭证在不同 Provider 中相互隔离

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
  const { open, hide } = PhotoTransition.useTransition()
  if (!open) return null

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
