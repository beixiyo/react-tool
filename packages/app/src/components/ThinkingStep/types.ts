import type { ThinkingStepItemProps } from './ThinkingStepItem'

export type StepData = Omit<ThinkingStepItemProps, 'index' | 'isLast'>
  & {
    /**
     * 唯一标识符，用于 React key。如果未提供，将使用数组索引。
     * 使用稳定 ID 对于未来可能存在的删除/重排操作更健壮。
     * @default undefined (内部将使用 index)
     */
    id?: string
    /**
     * Markdown格式的内容，用于展示详细信息。
     */
    markdown: string
    /**
     * 搜索结果数据，当步骤需要展示搜索结果时使用。
     */
    searchResults?: Array<{
      title: string
      icon: string
    }>
  }
