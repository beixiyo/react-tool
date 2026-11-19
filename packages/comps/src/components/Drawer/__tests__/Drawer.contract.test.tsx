import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { expectPattern, getAccessibleName } from '../../../__tests__/utils/ariaPatterns'
import { Drawer } from '../Drawer'
import { DrawerFramer } from '../subcomponents/DrawerFramer'

function dispatchKey(key: string) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    document.dispatchEvent(event)
  })
  return event
}

describe.each(
  [
    ['Drawer', Drawer],
    ['DrawerFramer', DrawerFramer],
  ] as const,
)('%s ARIA 契约', (_, Comp) => {
  function Harness() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <span id="drawer-title">筛选条件</span>
        <button type="button" onClick={ () => setOpen(true) }>打开抽屉</button>
        <Comp open={ open } onClose={ () => setOpen(false) } ariaLabelledby="drawer-title" closeButton={ false }>
          <button type="button">应用</button>
        </Comp>
      </>
    )
  }

  it('dialog 带 aria-modal，aria-labelledby 指向存在的标题', () => {
    render(
      <Comp open ariaLabelledby="drawer-title" closeButton={ false }>
        <span id="drawer-title">筛选条件</span>
      </Comp>,
    )

    const dialog = screen.getByRole('dialog')
    expectPattern(dialog, 'dialog')
    expect(getAccessibleName(dialog)).toBe('筛选条件')
  })

  it('默认关闭按钮有可访问名', () => {
    render(<Comp open ariaLabel="设置" />)
    expectPattern(screen.getByRole('dialog'), 'dialog')
    expect(getAccessibleName(screen.getByRole('dialog').querySelector('button')!)).not.toBe('')
  })

  it('Escape 关闭后焦点归还触发器，关闭后不再消费 Escape', async () => {
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: '打开抽屉' })
    trigger.focus()
    fireEvent.click(trigger)

    const apply = await screen.findByRole('button', { name: '应用' })
    await waitFor(() => expect(document.activeElement).toBe(apply))

    expect(dispatchKey('Escape').defaultPrevented).toBe(true)
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(dispatchKey('Escape').defaultPrevented).toBe(false)
  })
})
