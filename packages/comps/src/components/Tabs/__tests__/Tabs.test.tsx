import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Tabs } from '../Tabs'

describe('Tabs keyboard accessibility', () => {
  it('用方向键移动焦点并切换关联面板', () => {
    render(<ControlledTabs />)

    const firstTab = screen.getByRole('tab', { name: 'First' })
    const secondTab = screen.getByRole('tab', { name: 'Second' })
    firstTab.focus()

    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })

    expect(document.activeElement).toBe(secondTab)
    expect(secondTab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Second panel')
    expect(secondTab.getAttribute('aria-controls')).toBe(screen.getByRole('tabpanel').id)
  })

  it('非活动面板不可参与键盘焦点顺序', () => {
    render(<ControlledTabs />)

    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels[0].hasAttribute('inert')).toBe(false)
    expect(panels[1].hasAttribute('inert')).toBe(true)
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
