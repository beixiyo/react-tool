import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useClickOutside } from '../useClickOutside'

describe('useClickOutside', () => {
  it('仅在点击被跟踪 ref 外部时调用处理器', () => {
    const onOutside = vi.fn()
    render(<ClickOutsideProbe onOutside={ onOutside } />)

    fireEvent.mouseDown(screen.getByTestId('inside'))
    expect(onOutside).not.toHaveBeenCalled()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onOutside).toHaveBeenCalledTimes(1)
  })

  it('将额外选择器视为内部目标', () => {
    const onOutside = vi.fn()
    render(
      <ClickOutsideProbe
        additionalSelectors={ ['[data-floating-panel]'] }
        onOutside={ onOutside }
      />,
    )

    fireEvent.mouseDown(screen.getByTestId('floating'))
    expect(onOutside).not.toHaveBeenCalled()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onOutside).toHaveBeenCalledTimes(1)
  })

  it('遵循禁用状态并在卸载时清理监听器', () => {
    const onOutside = vi.fn()
    const { rerender, unmount } = render(
      <ClickOutsideProbe
        enabled={ false }
        onOutside={ onOutside }
      />,
    )

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onOutside).not.toHaveBeenCalled()

    rerender(<ClickOutsideProbe onOutside={ onOutside } />)
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onOutside).toHaveBeenCalledTimes(1)

    unmount()
    fireEvent.mouseDown(document.body)
    expect(onOutside).toHaveBeenCalledTimes(1)
  })
})

function ClickOutsideProbe({
  additionalSelectors,
  enabled = true,
  onOutside,
}: ClickOutsideProbeProps) {
  const ref = useRef<HTMLDivElement>(null)

  useClickOutside([ref], onOutside, {
    additionalSelectors,
    enabled,
  })

  return (
    <>
      <div ref={ ref } data-testid="inside" />
      <div data-floating-panel data-testid="floating" />
      <button data-testid="outside" type="button">outside</button>
    </>
  )
}

type ClickOutsideProbeProps = {
  additionalSelectors?: string[]
  enabled?: boolean
  onOutside: () => void
}
