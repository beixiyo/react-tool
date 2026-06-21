export type StepStatus = 'process' | 'wait' | 'finish' | 'error'

export interface StepProps {
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  status: StepStatus
  disabled?: boolean
  className?: string
}

export interface StepsProps {
  /**
   * 横向布局时是否在步骤之间渲染连接线
   * @default true
   */
  showLinkLine?: boolean
  /**
   * 整体排列方向
   * @default 'horizontal'
   */
  direction?: 'horizontal' | 'vertical'
  /**
   * 标题/描述相对图标的排列方向
   * @default 'horizontal'
   */
  labelPlacement?: 'horizontal' | 'vertical'
  /**
   * 是否使用圆点样式，或传入自定义渲染函数
   * @default false
   */
  progressDot?:
    | boolean
    | ((iconDot: React.ReactNode, { status, index }: { status: StepStatus, index: number }) => React.ReactNode)
  /**
   * 步骤图标尺寸，单位 px
   * @default 18
   */
  size?: number
  /** 步骤数据列表 */
  items: StepProps[]
  /** 根容器自定义类名 */
  className?: string
  /** 展开内容区域自定义类名 */
  slotClassName?: string
  /**
   * 是否显示进度（如 2/5）与展开按钮
   * @default true
   */
  showProgress?: boolean
  /**
   * 是否可展开查看详情
   * @default true
   */
  expandable?: boolean
  /** 自定义展开内容，传入后将覆盖默认内容 */
  children?: React.ReactNode
  /**
   * 展开方向
   * @default 'down'
   */
  expandDirection?: 'up' | 'down'
  /**
   * 默认展开内容里『任务列表』标题文案
   * @default 'Task lists:'
   */
  taskListTitle?: React.ReactNode
  /**
   * 默认展开内容里『进行中』徽标文案
   * @default 'In Progress'
   */
  inProgressLabel?: React.ReactNode
  /**
   * 展开按钮在收起态时的 aria-label
   * @default 'Expand details'
   */
  expandLabel?: string
  /**
   * 展开按钮在展开态时的 aria-label
   * @default 'Collapse details'
   */
  collapseLabel?: string
}
