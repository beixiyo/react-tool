/**
 * 对外稳定的跨组件 DOM 状态属性名
 *
 * ARIA 属性负责可访问性语义；这些 `data-*` 属性仅用于外部样式和 DOM 查询契约
 */
export const DATA_ATTR = {
  state: 'data-state',
  selected: 'data-selected',
  highlighted: 'data-highlighted',
  disabled: 'data-disabled',
  invalid: 'data-invalid',
  dragging: 'data-dragging',
  sort: 'data-sort',
} as const

/** FloatingArrow 对外暴露的稳定 DOM 选择器属性名 */
export const DATA_FLOATING_ARROW = 'data-floating-arrow'
