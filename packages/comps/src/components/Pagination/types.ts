export type PaginationProps = {
  /**
   * 当前页码 (1-based)
   */
  currentPage: number
  /**
   * 总页数
   */
  totalPages: number
  /**
   * 页码变化回调
   */
  onPageChange: (page: number) => void
  /**
   * 显示的页码按钮数量
   * @default 5
   */
  maxVisiblePages?: number
  /**
   * 是否显示上一页/下一页按钮
   * @default true
   */
  showPrevNext?: boolean
  /**
   * 是否显示第一页/最后一页按钮
   * @default true
   */
  showFirstLast?: boolean
  /**
   * 是否显示省略号
   * @default true
   */
  showEllipsis?: boolean
  /**
   * 是否禁用分页
   * @default false
   */
  disabled?: boolean
  /**
   * 上一页按钮文本
   */
  prevText?: React.ReactNode
  /**
   * 下一页按钮文本
   */
  nextText?: React.ReactNode
  /**
   * 第一页按钮文本
   */
  firstText?: React.ReactNode
  /**
   * 最后一页按钮文本
   */
  lastText?: React.ReactNode
  /**
   * 省略号文本
   * @default '...'
   */
  ellipsisText?: string
  /**
   * 自定义页码按钮渲染函数
   */
  renderPageButton?: (props: {
    page: number
    isActive: boolean
    disabled: boolean
    onClick: () => void
  }) => React.ReactNode
  /**
   * 自定义上一页按钮渲染函数
   */
  renderPrevButton?: (props: {
    disabled: boolean
    onClick: () => void
  }) => React.ReactNode
  /**
   * 自定义下一页按钮渲染函数
   */
  renderNextButton?: (props: {
    disabled: boolean
    onClick: () => void
  }) => React.ReactNode
  /**
   * 自定义省略号渲染函数
   */
  renderEllipsis?: (position: 'first' | 'last') => React.ReactNode
  /**
   * 页码点击回调（在 onPageChange 之前触发）
   */
  onPageClick?: (page: number) => void
} & React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>

export type PageButtonProps = {
  /**
   * 页码
   */
  page?: number
  /**
   * 是否为当前页
   * @default false
   */
  isActive?: boolean
  /**
   * 是否禁用
   * @default false
   */
  disabled?: boolean
  /**
   * 按钮内容
   */
  children: React.ReactNode
  /**
   * 点击回调
   */
  onClick?: (page: number) => void
}
