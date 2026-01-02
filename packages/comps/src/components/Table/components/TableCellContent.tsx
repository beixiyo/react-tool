import { useTextOverflow } from 'hooks'
import { useRef } from 'react'
import { Tooltip } from '../../Tooltip'

export type TableCellContentProps = {
  children: React.ReactNode
}

/**
 * 表格单元格内容组件，自动检测文本溢出并显示 tooltip
 * 注意：使用 min-w-0 确保在 flex 容器中文本溢出能正常工作
 */
export function TableCellContent({ children }: TableCellContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { isOverflowing, textContent } = useTextOverflow({
    contentRef,
    deps: [children],
  })

  const content = (
    <div
      ref={ contentRef }
      className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0"
    >
      { children }
    </div>
  )

  // 如果文本溢出，则用 Tooltip 包裹
  if (isOverflowing && textContent) {
    return (
      <Tooltip
        content={ textContent }
        placement="top"
        className="w-full"
      >
        { content }
      </Tooltip>
    )
  }

  return content
}
