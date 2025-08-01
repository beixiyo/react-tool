import type { ReactNode } from 'react'

export interface Option {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
  children?: Option[]
}

export interface SelectProps {
  options: Option[]
  value?: string | string[]
  defaultValue?: string | string[]
  onClick?: () => void
  onChange?: (value: string | string[]) => void
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

  className?: string
  placeholderClassName?: string
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
