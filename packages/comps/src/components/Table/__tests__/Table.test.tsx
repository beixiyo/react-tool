import type { ColumnDef } from '@tanstack/react-table'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
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

    expect(firstDataRow.getAttribute('data-vv-selected')).toBe('false')
    expect(firstDataRow.getAttribute('aria-selected')).toBe('false')
    expect(nameHeader.getAttribute('data-vv-sort')).toBe('none')
    expect(nameHeader.getAttribute('aria-sort')).toBe('none')

    fireEvent.click(screen.getAllByRole('checkbox')[1])

    expect(firstDataRow.getAttribute('data-vv-selected')).toBe('true')
    expect(firstDataRow.getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByText('Name'))

    expect(nameHeader.getAttribute('data-vv-sort')).toBe('ascending')
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending')

    fireEvent.click(screen.getByText('Name'))

    expect(nameHeader.getAttribute('data-vv-sort')).toBe('descending')
    expect(nameHeader.getAttribute('aria-sort')).toBe('descending')
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
    expect(firstDataRow.getAttribute('data-vv-virtual-item-index')).toBe('0')
  })
})
