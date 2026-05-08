/**
 * 替代 flexRender：直接调用 cell 函数返回 JSX，不用 createElement 包装
 *
 * flexRender 把 cell 函数当组件用 createElement(fn, props)，
 * 函数引用变化时 React 认为是不同组件类型 → 卸载重建 DOM → click 事件丢失
 *
 * 限制：cell 函数内不能使用 Hooks（不是组件上下文）
 * 需要 Hooks 时，将 cell 写为独立的 memo 组件并直接在 cell 里渲染：
 * ```ts
 * cell: ({ row }) => <MyCellComp data={row.original} />
 * ```
 */
export function renderCell(Comp: any, props: any) {
  if (Comp == null)
    return null
  if (typeof Comp === 'function')
    return Comp(props)
  return Comp
}
