import { useRef } from 'react'

export type TableCellContentProps = {
  children: React.ReactNode
}

/**
 * 表格单元格内容组件，自动检测文本溢出并添加 tooltip
 */
export function TableCellContent({ children }: TableCellContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ contentRef }
      // data-tooltip={ tooltipText || undefined }
      className="overflow-hidden text-ellipsis whitespace-nowrap w-full"
    >
      { children }
    </div>
  )
}
