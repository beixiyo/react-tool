/** Copy 与实际 clipboard 工具的集成契约；剪贴板 API 受控，禁止真实系统写入 */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { Copy } from '../Copy'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('实际工具只在明确写入成功时通知，不把失败的降级复制报为成功', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  const previousClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  const execCommand = vi.fn().mockReturnValue(false)
  const previous = Object.getOwnPropertyDescriptor(document, 'execCommand')
  Object.defineProperty(document, 'execCommand', { configurable: true, value: execCommand })
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const succeeded = vi.fn()
  const copied = vi.fn()

  try {
    render(<Copy text="controlled" onCopySuccess={ succeeded } onCopy={ copied } buttonProps={ { 'aria-label': 'copy' } } />)
    fireEvent.click(screen.getByRole('button', { name: 'copy' }))
    await waitFor(() => expect(copied).toHaveBeenCalledTimes(1))
    expect(succeeded).toHaveBeenCalledTimes(1)
    expect(succeeded.mock.calls[0][0].text).toBe('controlled')
    expect(typeof succeeded.mock.calls[0][0].operationId).toBe('symbol')

    writeText.mockRejectedValue(new Error('controlled clipboard denial'))
    fireEvent.click(screen.getByRole('button', { name: 'copy' }))
    await waitFor(() => expect(copied).toHaveBeenCalledTimes(2))
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(succeeded).toHaveBeenCalledTimes(1)
  }
  finally {
    if (previousClipboard) Object.defineProperty(navigator, 'clipboard', previousClipboard)
    else Reflect.deleteProperty(navigator, 'clipboard')
    if (previous) Object.defineProperty(document, 'execCommand', previous)
    else Reflect.deleteProperty(document, 'execCommand')
  }
})
