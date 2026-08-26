import type { ColumnDef } from '@tanstack/react-table'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Table } from '../Table'

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

    expect(firstDataRow.getAttribute('data-selected')).toBe('false')
    expect(firstDataRow.getAttribute('aria-selected')).toBe('false')
    expect(nameHeader.getAttribute('data-sort')).toBe('none')
    expect(nameHeader.getAttribute('aria-sort')).toBe('none')

    fireEvent.click(screen.getAllByRole('checkbox')[1])

    expect(firstDataRow.getAttribute('data-selected')).toBe('true')
    expect(firstDataRow.getAttribute('aria-selected')).toBe('true')

    fireEvent.click(screen.getByText('Name'))

    expect(nameHeader.getAttribute('data-sort')).toBe('ascending')
    expect(nameHeader.getAttribute('aria-sort')).toBe('ascending')

    fireEvent.click(screen.getByText('Name'))

    expect(nameHeader.getAttribute('data-sort')).toBe('descending')
    expect(nameHeader.getAttribute('aria-sort')).toBe('descending')
  })
})
