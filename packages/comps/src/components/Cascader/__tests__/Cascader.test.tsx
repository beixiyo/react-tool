import type { CascaderOption, CascaderRef } from '../types'
import { act, render, screen, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Cascader } from '../Cascader'

const options: CascaderOption[] = Array.from({ length: 10 }, (_, index) => ({
  value: `option-${index}`,
  label: `Option ${index}`,
}))

describe('Cascader', () => {
  it('打开菜单时滚动到当前已渲染的选项', async () => {
    const ref = createRef<CascaderRef>()
    const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView')
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    render(
      <Cascader
        ref={ ref }
        options={ options }
        value="option-9"
        dropdownHeight={ 100 }
      />,
    )

    act(() => {
      ref.current?.open()
    })

    const selectedOption = await screen.findByRole('option', { name: 'Option 9' })
    expect(selectedOption.getAttribute('aria-selected')).toBe('true')
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })
    })
    expect(scrollIntoView.mock.contexts).toContain(selectedOption)
  })
})
