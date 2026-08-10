import type { ReactNode } from 'react'

export interface CascaderOption {
  value: string
  label: ReactNode
  /**
   * 用于搜索匹配与路径展示的纯文本。
   * 当 `label` 为非字符串的 ReactNode（如 JSX）时，搜索/可编辑模式需要它来正确匹配与显示，
   * 未提供时回退到 `value`
   */
  searchLabel?: string
  icon?: ReactNode
  /**
   * 选项右侧的次要说明（灰字），用于展示选中后的结果预览，
   * 例如快捷时间项写回后的具体时刻。不参与搜索匹配
   */
  extra?: ReactNode
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
  /** 自定义触发器元素，不提供时使用内置触发器 */
  trigger?: ReactNode
  /**
   * 默认触发器有值时是否在 hover / focus 状态下以清除按钮替换下拉箭头
   *
   * 仅在未传入 `trigger` 且 `editable` 为 false 时生效
   * @default false
   */
  clearable?: boolean | CascaderClearableConfig
  /** 用户通过清除按钮移除当前选择后触发 */
  onClear?: () => void
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
  /**
   * 每个菜单滚动容器的类名，可用于配置横向溢出策略
   * @default undefined
   */
  menuClassName?: string
  /** 下拉浮层外层样式 */
  dropdownStyle?: React.CSSProperties
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
   * 是否显示边框
   * @default light: false, dark: true
   */
  bordered?: boolean
  /**
   * 是否显示阴影
   * @default true
   */
  shadowed?: boolean
  /**
   * 选项内“交互元素”选择器，点击命中时不触发选项选中/关闭，以便内部按钮等正常响应
   * @default 'button, [role="button"], a[href], input, textarea, [contenteditable="true"]'
   */
  optionClickIgnoreSelector?: string
  /**
   * 是否可搜索
   * @default false
   */
  searchable?: boolean
  /**
   * 是否可编辑（允许手动输入自定义值，同时可从选项中选择）
   * @default false
   */
  editable?: boolean
  /** 可编辑模式下 input 的 placeholder */
  placeholder?: string
  /** 可编辑模式下 input 的自定义类名 */
  editableInputClassName?: string
  /**
   * 触发方式
   * @default 'click'
   */
  triggerMode?: 'click' | 'hover'
  /**
   * hover 模式下鼠标移出后延迟关闭的时间（ms）
   * @default 150
   */
  hoverCloseDelay?: number
}

/** Cascader 默认触发器的清除按钮配置 */
export interface CascaderClearableConfig {
  /** 自定义清除图标，默认使用 CloseBtn 的叉号 */
  clearIcon?: ReactNode
}
