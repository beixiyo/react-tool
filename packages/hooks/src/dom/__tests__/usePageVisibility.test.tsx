import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { usePageVisibility } from '../usePageVisibility'

function VisibilityProbe() {
  const visibility = usePageVisibility()
  return <div data-testid="visibility">{ visibility }</div>
}

/** visibilityState 定义在 Document 原型上，用实例 getter 遮蔽后可随意切换 */
function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  })
}

describe('usePageVisibility', () => {
  afterEach(() => {
    setVisibility('visible')
  })

  it('visibilitychange 事件驱动更新', async () => {
    render(<VisibilityProbe />)
    expect(screen.getByTestId('visibility').textContent).toBe('visible')

    await act(async () => {
      setVisibility('hidden')
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(screen.getByTestId('visibility').textContent).toBe('hidden')

    await act(async () => {
      setVisibility('visible')
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(screen.getByTestId('visibility').textContent).toBe('visible')
  })
})
