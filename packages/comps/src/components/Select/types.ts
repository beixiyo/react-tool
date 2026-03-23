import type { ReactNode } from 'react'

export interface Option {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  children?: Option[]
}

/** 选项细粒度类名（SelectOption 组件用） */
export interface SelectOptionClassNames {
  className?: string
  contentClassName?: string
  labelClassName?: string
  checkIconClassName?: string
  chevronIconClassName?: string
}

/** 上层传入的选项类名（Select 透传时带 option 前缀） */
export type SelectOptionClassNamesFromParent = {
  [K in keyof SelectOptionClassNames as `option${Capitalize<string & K>}`]?: SelectOptionClassNames[K]
}

export interface SelectOptionProps extends SelectOptionClassNames {
  option: Option
  selected: boolean
  highlighted?: boolean
  onClick: (value: string) => void
  onMouseEnter?: () => void
}

export interface SelectProps<T extends string | string[] = string> extends SelectOptionClassNamesFromParent {
  options: Option[]
  value?: T
  defaultValue?: T
  onClick?: () => void
  onChange?: (value: T) => void
  onClickOutside?: () => void
  placeholder?: string
  placeholderIcon?: ReactNode

  disabled?: boolean
  showDownArrow?: boolean
  rotate?: boolean
  loading?: boolean
  showEmpty?: boolean
  multiple?: boolean
  maxSelect?: number
  searchable?: boolean
  required?: boolean

  /**
   * 是否显示边框
   * @default light: false, dark: true
   */
  bordered?: boolean
  /**
   * 启用 combobox 模式：trigger 变为 input，支持手填自定义值 + 下拉选择
   * - 仅对 single select（非 multiple）生效
   * - blur / Enter 提交当前文本（可以是选项外的任意值）
   * - Escape 回退至上次提交的值
   * @default false
   */
  editable?: boolean
  className?: string
  placeholderClassName?: string
  /** editable 模式下 input 元素的额外类名 */
  editableInputClassName?: string
  /**
   * 自定义下拉框宽度
   * @default 150
   */
  dropdownHeight?: number

  /** 表单相关属性 */
  name?: string
  error?: boolean
  errorMessage?: string
}
