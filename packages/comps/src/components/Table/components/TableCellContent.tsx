import { TextOverflow } from '../../TextOverflow'

export type TableCellContentProps = {
  children: React.ReactNode
}

/**
 * 表格单元格内容组件，自动检测文本溢出并显示 tooltip
 * 注意：使用 min-w-0 确保在 flex 容器中文本溢出能正常工作
 */
export function TableCellContent({ children }: TableCellContentProps) {
  return (
    <TextOverflow
      line={ 1 }
      mode="ellipsis"
      className="min-w-0"
    >
      { children }
    </TextOverflow>
  )
}
