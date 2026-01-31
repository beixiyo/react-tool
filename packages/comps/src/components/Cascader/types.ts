import type { ReactNode } from 'react'

export interface CascaderOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  children?: CascaderOption[]
}

export interface CascaderRef {
  open: () => void
  close: () => void
}

/** 选项细粒度类名（CascaderOption 组件用） */
export interface CascaderOptionClassNames {
  className?: string
  contentClassName?: string
  labelClassName?: string
  checkIconClassName?: string
  chevronIconClassName?: string
}

/** 上层传入的选项类名（Cascader 透传时带 option 前缀） */
export type CascaderOptionClassNamesFromParent = {
  [K in keyof CascaderOptionClassNames as `option${Capitalize<string & K>}`]?: CascaderOptionClassNames[K]
}

export interface CascaderOptionProps extends CascaderOptionClassNames {
  option: CascaderOption
  selected: boolean
  highlighted?: boolean
  onClick: (value: string) => void
  onMouseEnter?: () => void
  /** 命中时不触发选项选中/关闭（由 Cascader 传入） */
  optionClickIgnoreSelector?: string
}

export interface CascaderProps extends CascaderOptionClassNamesFromParent {
  /** 级联选项数据 */
  options: CascaderOption[]
  /** 当前选中的值 */
  value?: string
  /** 默认值 */
  defaultValue?: string
  /** 值变更回调 */
  onChange?: (value: string) => void
  /** 点击外部关闭回调 */
  onClickOutside?: () => void
  /** 打开状态（受控模式） */
  open?: boolean
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void
  /** 自定义触发器元素，如果不提供则不渲染触发器 */
  trigger?: ReactNode
  /** 触发器点击回调 */
  onTriggerClick?: () => void
  /** 下拉面板的定位方式 */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end'
  /** 下拉面板的偏移量 */
  offset?: number
  /** 下拉面板高度 */
  dropdownHeight?: number
  /** 下拉面板最小宽度 */
  dropdownMinWidth?: number
  /** 自定义类名 */
  className?: string
  /** 下拉面板类名 */
  dropdownClassName?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
  /** 下拉容器额外属性 */
  dropdownProps?: React.HTMLAttributes<HTMLDivElement>
  /** 点击外部关闭时忽略的选择器，命中时视为“内部”不关闭（如子 Popover 内容） */
  clickOutsideIgnoreSelector?: string
  /**
   * 选项内“交互元素”选择器，点击命中时不触发选项选中/关闭，以便内部按钮等正常响应
   * @default 'button, [role="button"], a[href], input, textarea, [contenteditable="true"]'
   */
  optionClickIgnoreSelector?: string
}
