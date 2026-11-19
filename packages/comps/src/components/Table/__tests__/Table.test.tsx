import type { ColumnDef } from '@tanstack/react-table'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { I18n } from 'i18n'
import { I18nProvider } from 'i18n/react'
import { describe, expect, it, vi } from 'vitest'
import { DATA_ATTR, INTERNAL_DATA_ATTR } from '../../../constants/dataAttributes'
import { allResources } from '../../../i18n'
import { Table } from '../Table'

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getTotalSize: () => 52,
    getVirtualItems: () => [{ index: 0, start: 0 }],
    measureElement: vi.fn(),
  }),
}))

type TestRow = {
  id: string
  name: string
  age: number
}

const data: TestRow[] = [
  { id: '1', name: 'Ada', age: 36 },
  { id: '2', name: 'Grace', age: 28 },
]

const columns: ColumnDef<TestRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'age',
    header: 'Age',
  },
]

describe('Table DOM state contract', () => {
  it.each(['输入框', '浮层按钮'])('焦点在%s时，第一次 Escape 放弃修改并关闭编辑浮层', async (focusTarget) => {
    const onCellEdit = vi.fn()
    const onEditCancel = vi.fn()
    const onEditSave = vi.fn()
    const editableColumns: ColumnDef<TestRow>[] = [{
      accessorKey: 'name',
      header: 'Name',
      editConfig: { editable: true, onCellEdit },
    }]
    render(
      <Table
        data={ data }
        columns={ editableColumns }
        enableEditing
        onEditCancel={ onEditCancel }
        onEditSave={ onEditSave }
      />,
    )

    fireEvent.click(screen.getByText('Ada'))
    const input = screen.getByRole<HTMLInputElement>('textbox')
    const cancelButton = await screen.findByRole('button', { name: 'Cancel' })
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    fireEvent.change(input, { target: { value: 'draft' } })
    expect(input.value).toBe('draft')

    const target = focusTarget === '输入框'
      ? input
      : cancelButton
    target.focus()
    fireEvent.keyDown(target, { key: 'Escape' })

    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    expect(screen.getByText('Ada')).toBeTruthy()
    expect(onEditCancel).toHaveBeenCalledTimes(1)
    expect(onEditCancel).toHaveBeenCalledWith({ row: data[0], columnId: 'name', originalValue: 'Ada' })
    expect(onCellEdit).not.toHaveBeenCalled()
    expect(onEditSave).not.toHaveBeenCalled()
  })

  it('已打开的编辑浮层跟随 Provider 的语言和文案变更', async () => {
    const i18n = new I18n({ language: 'en-US', resources: allResources })
    const editableColumns: ColumnDef<TestRow>[] = [{
      accessorKey: 'name',
      header: 'Name',
      editConfig: { editable: true },
    }]
    render(
      <I18nProvider instance={ i18n }>
        <Table data={ data } columns={ editableColumns } enableEditing />
      </I18nProvider>,
    )

    fireEvent.click(screen.getByText('Ada'))
    const saveButton = await screen.findByRole('button', { name: 'Save' })
    act(() => i18n.changeLanguage('zh-CN'))
    expect(screen.getByRole('button', { name: '保存' })).toBe(saveButton)
    expect(screen.getByRole('button', { name: '取消' })).toBeTruthy()

    act(() => i18n.updateResource('zh-CN', 'comps.common.action.save', '确认修改'))
    expect(screen.getByRole('button', { name: '确认修改' })).toBe(saveButton)
  })

  it('exposes ordinary row selection on the row and sorting on the header', () => {
    render(
      <Table
        data={ data }
        columns={ columns }
        enableRowSelection
      />,
    )

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' })

    expect(firstDataRow.getAttribute(DATA_ATTR.selected)).toBe('false')
    expect(firstDataRow.getAttribute('aria-selected')).toBe('false')
    expect(nameHeader.getAttribute(DATA_ATTR.sort)).toBe('none')
    expect(nameHeader.getAttribute('aria-sort')).toBe('none')

    fireEvent.click(screen.getAllByRole('checkbox')[1])

    expect(firstDataRow.getAttribute(DATA_ATTR.selected)).toBe('true')
    expect(firstDataRow.getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByText('Name'))

    expect(nameHeader.getAttribute(DATA_ATTR.sort)).toBe('ascending')
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending')

    fireEvent.click(screen.getByText('Name'))

    expect(nameHeader.getAttribute(DATA_ATTR.sort)).toBe('descending')
    expect(nameHeader.getAttribute('aria-sort')).toBe('descending')
  })

  it('可排序列头渲染为可聚焦的 button', () => {
    render(
      <Table
        data={ data }
        columns={ columns }
        enableRowNumber
      />,
    )

    const sortButton = screen.getByRole('button', { name: 'Name' })
    expect(sortButton.getAttribute('type')).toBe('button')
    expect(sortButton.getAttribute('title')).toBe('Click to sort')
    expect(screen.getByRole('columnheader', { name: '序号' })).toBeTruthy()

    sortButton.focus()
    expect(document.activeElement).toBe(sortButton)
    fireEvent.click(sortButton)
    expect(screen.getByRole('columnheader', { name: 'Name' }).getAttribute('aria-sort')).toBe('ascending')
  })

  it.each([
    ['普通表体', false],
    ['虚拟表体', true],
  ])('%s：selectOnRowClick 点击行切换选中并调用 getRowProps.onClick，点击复选框不触发行 onClick', (_label, enableVirtualization) => {
    const onRowClick = vi.fn()
    render(
      <Table
        data={ data }
        columns={ columns }
        enableRowSelection
        selectOnRowClick
        enableVirtualization={ enableVirtualization }
        getRowProps={ () => ({ onClick: onRowClick }) }
      />,
    )

    const firstDataRow = screen.getAllByRole('row')[1]
    fireEvent.click(screen.getByText('Ada'))
    expect(firstDataRow.getAttribute('aria-selected')).toBe('true')
    expect(onRowClick).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getAllByRole('checkbox')[1])
    expect(firstDataRow.getAttribute('aria-selected')).toBe('false')
    expect(onRowClick).toHaveBeenCalledTimes(1)
  })

  it('keeps the TanStack index attribute alongside the public virtual item index', () => {
    render(
      <Table
        data={ data }
        columns={ columns }
        enableVirtualization
      />,
    )

    const firstDataRow = screen.getAllByRole('row')[1]
    expect(firstDataRow.getAttribute('data-index')).toBe('0')
    expect(firstDataRow.getAttribute(INTERNAL_DATA_ATTR.virtual.itemIndex)).toBe('0')
  })
})
