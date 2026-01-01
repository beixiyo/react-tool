export type TableCellContentProps = {
  children: React.ReactNode
}

/**
 * 表格单元格内容组件，自动检测文本溢出
 * 注意：使用 min-w-0 确保在 flex 容器中文本溢出能正常工作
 */
export function TableCellContent({ children }: TableCellContentProps) {
  return (
    <div className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
      { children }
    </div>
  )
}
