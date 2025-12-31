import type { Row } from '@tanstack/react-table'
import type { ChangeEvent } from 'react'
import type { EditCallbacks, GetRowProps, TextAlign } from '../types'
import { flexRender } from '@tanstack/react-table'
import { memo } from 'react'
import { cn } from 'utils'
import { Checkbox } from '../../Checkbox'
import { EditableCell } from './EditableCell'
import { TableCellContent } from './TableCellContent'

export type TableBodyProps<TData extends object> = {
  /**
   * 表格行数据
   */
  rows: Row<TData>[]
  /**
   * 是否启用行选择功能
   */
  enableRowSelection?: boolean
  /**
   * 是否启用自动行号功能
   */
  enableRowNumber?: boolean
  /**
   * 是否启用编辑功能
   */
  enableEditing?: boolean
  onSelectionChange: () => void
  /**
   * 分页状态，用于计算行号
   */
  pagination?: { pageIndex: number, pageSize: number }
  /**
   * 开始编辑时的事件回调
   */
  onEditStart?: EditCallbacks<TData>['onEditStart']
  /**
   * 取消编辑时的事件回调
   */
  onEditCancel?: EditCallbacks<TData>['onEditCancel']
  /**
   * 确认编辑时的事件回调
   */
  onEditSave?: EditCallbacks<TData>['onEditSave']
  /**
   * 获取行属性的函数
   */
  getRowProps?: GetRowProps<TData>
  /**
   * 默认单元格对齐方式
   */
  defaultCellAlign?: TextAlign
}

/**
 * 获取对齐方式的 Tailwind 类名
 */
function getAlignClassName(align?: TextAlign): string {
  switch (align) {
    case 'center':
      return 'justify-center'
    case 'right':
      return 'justify-end'
    case 'left':
    default:
      return 'justify-start'
  }
}

function TableBodyInner<TData extends object>(props: TableBodyProps<TData>) {
  const {
    rows,
    enableRowSelection = false,
    enableRowNumber = false,
    enableEditing = false,
    onSelectionChange,
    pagination,
    onEditStart,
    onEditCancel,
    onEditSave,
    getRowProps,
    defaultCellAlign = 'left',
  } = props

  const onCheckboxChange = (row: Row<TData>, e: ChangeEvent<HTMLInputElement>) => {
    if (!enableRowSelection)
      return

    const handler = row.getToggleSelectedHandler()
    handler(e)
    onSelectionChange()
  }

  /** 计算行号的起始值 */
  const getRowNumber = (index: number) => {
    if (pagination) {
      return pagination.pageIndex * pagination.pageSize + index + 1
    }
    return index + 1
  }

  return (
    <tbody>
      { rows.map((row, index) => {
        const rowProps = getRowProps
          ? getRowProps(row.original, index)
          : {}
        const { className: rowClassName, onClick: rowOnClick, ...restRowProps } = rowProps
        const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
          if (enableRowSelection) {
            onCheckboxChange(row, e as any)
          }
          rowOnClick?.(e)
        }
        return (
          <tr
            key={ row.id }
            className={ cn(
              'flex w-full bg-backgroundPrimary border-b border-border hover:bg-backgroundSecondar hover:bg-backgroundSecondary transition-all duration-300',
              enableRowSelection && 'cursor-pointer',
              rowClassName,
            ) }
            onClick={ handleClick }
            { ...restRowProps }
          >
            { enableRowSelection && (
              <td
                className="px-2 py-4 flex items-center justify-center"
                style={ { width: '48px' } }
              >
                <Checkbox
                  checked={ row.getIsSelected() }
                  indeterminate={ row.getIsSomeSelected() }
                  disabled={ !row.getCanSelect() }
                  onChange={ (_checked, e) => onCheckboxChange(row, e) }
                  size={ 18 }
                />
              </td>
            ) }
            { enableRowNumber && (
              <td
                className="px-2 py-4 flex items-center justify-center text-textSecondary"
                style={ { width: '60px' } }
              >
                <span className="text-sm">{ getRowNumber(index) }</span>
              </td>
            ) }
            { row.getVisibleCells().map((cell) => {
              const columnDef = cell.column.columnDef
              const cellAlign = columnDef.cellAlign ?? defaultCellAlign
              const alignClassName = getAlignClassName(cellAlign)

              return (
                <td
                  key={ cell.id }
                  className={ cn(
                    'px-6 py-4 flex items-center overflow-hidden min-w-0',
                    alignClassName,
                  ) }
                  style={ { width: cell.column.getSize() } }
                >
                  { enableEditing
                    ? (
                        <EditableCell
                          cell={ cell }
                          row={ row }
                          columnDef={ cell.column.columnDef }
                          enableEditing={ enableEditing }
                          onEditStart={ onEditStart }
                          onEditCancel={ onEditCancel }
                          onEditSave={ onEditSave }
                        />
                      )
                    : (
                        <TableCellContent>
                          { flexRender(cell.column.columnDef.cell, cell.getContext()) }
                        </TableCellContent>
                      ) }
                </td>
              )
            }) }
          </tr>
        )
      }) }
    </tbody>
  )
}

export const TableBody = memo(TableBodyInner) as <TData extends object>(
  props: TableBodyProps<TData>,
) => React.ReactElement

TableBodyInner.displayName = 'TableBody'
