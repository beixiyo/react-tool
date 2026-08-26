import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DATA_ATTR } from '../../../constants/dataAttributes'
import { Tabs } from '../Tabs'

describe('Tabs DOM 状态契约', () => {
  it('切换时同步 tab 与 tabpanel 的选中属性', () => {
    render(<ControlledTabs />)

    const firstTab = screen.getByRole('tab', { name: 'First' })
    const secondTab = screen.getByRole('tab', { name: 'Second' })
    expect(firstTab.getAttribute(DATA_ATTR.selected)).toBe('true')
    expect(secondTab.getAttribute(DATA_ATTR.selected)).toBe('false')

    fireEvent.click(secondTab)

    expect(firstTab.getAttribute(DATA_ATTR.selected)).toBe('false')
    expect(secondTab.getAttribute(DATA_ATTR.selected)).toBe('true')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels[0].getAttribute(DATA_ATTR.selected)).toBe('false')
    expect(panels[1].getAttribute(DATA_ATTR.selected)).toBe('true')
  })
})

function ControlledTabs() {
  const [activeKey, setActiveKey] = useState<'first' | 'second'>('first')

  return (
    <Tabs
      items={ [
        { value: 'first', label: 'First', children: 'First panel' },
        { value: 'second', label: 'Second', children: 'Second panel' },
      ] }
      activeKey={ activeKey }
      onChange={ (item) => setActiveKey(item.value) }
      mode="none"
    />
  )
}
