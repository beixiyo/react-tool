import { act, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from '../Modal'

describe('模态框', () => {
  it('显式 z-index 同时决定视觉栈顶和 Escape 响应层', () => {
    const onHighClose = vi.fn()
    const onLowClose = vi.fn()
    render(
      <>
        <Modal isOpen zIndex={ 5000 } onClose={ onHighClose }>high</Modal>
        <Modal isOpen zIndex={ 100 } onClose={ onLowClose }>low</Modal>
      </>,
    )

    const highMask = document.querySelector<HTMLElement>('[style*="z-index: 5000"]')
    const lowMask = document.querySelector<HTMLElement>('[style*="z-index: 100"]')
    expect(highMask?.dataset.modalTop).toBe('true')
    expect(lowMask?.dataset.modalTop).toBe('false')

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }))
    })
    expect(onHighClose).toHaveBeenCalledOnce()
    expect(onLowClose).not.toHaveBeenCalled()
  })
})
