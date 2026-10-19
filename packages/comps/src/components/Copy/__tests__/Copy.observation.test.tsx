/** Copy 公共生命周期契约；clipboard primitive受控，不证明系统剪贴板写入 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Copy } from '../Copy'

const h = vi.hoisted(() => ({ write: vi.fn() }))
vi.mock('@jl-org/tool', async (importOriginal) => ({ ...await importOriginal<typeof import('@jl-org/tool')>(), copyToClipboard: h.write }))

beforeEach(() => { h.write.mockReset() })
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('同文操作乱序完成仍按点击render回调交付一致且不同的operationId，旧onCopy只收文本', async () => {
  const writes: Array<{ resolve: () => void; onWriteSucceeded?: () => void }> = []
  h.write.mockImplementation((_text, options) =>
    new Promise<void>((resolve) => {
      writes.push({ resolve, onWriteSucceeded: options?.onWriteSucceeded })
    })
  )

  const startA = vi.fn(), successA = vi.fn(), endA = vi.fn(), copyA = vi.fn()
  const startB = vi.fn(), successB = vi.fn(), endB = vi.fn(), copyB = vi.fn()
  const view = render(
    <Copy text="same" onCopyStart={ startA } onCopySuccess={ successA } onCopyEnd={ endA } onCopy={ copyA } buttonProps={ { 'aria-label': 'copy' } } />,
  )

  fireEvent.click(screen.getByRole('button', { name: 'copy' }))
  expect(startA).toHaveBeenCalledTimes(1)
  const firstId = startA.mock.calls[0][0].operationId
  view.rerender(
    <Copy text="same" onCopyStart={ startB } onCopySuccess={ successB } onCopyEnd={ endB } onCopy={ copyB } buttonProps={ { 'aria-label': 'copy' } } />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'copy' }))
  expect(startB).toHaveBeenCalledTimes(1)
  const secondId = startB.mock.calls[0][0].operationId
  expect(secondId).not.toBe(firstId)

  await act(async () => {
    writes[1].onWriteSucceeded?.()
    writes[1].resolve()
  })
  await waitFor(() => expect(endB).toHaveBeenCalledTimes(1))
  await act(async () => {
    writes[0].onWriteSucceeded?.()
    writes[0].resolve()
  })
  await waitFor(() => expect(endA).toHaveBeenCalledTimes(1))

  expect(successA).toHaveBeenCalledWith({ operationId: firstId, text: 'same' })
  expect(endA).toHaveBeenCalledWith({ operationId: firstId, text: 'same' })
  expect(successB).toHaveBeenCalledWith({ operationId: secondId, text: 'same' })
  expect(endB).toHaveBeenCalledWith({ operationId: secondId, text: 'same' })
  expect(copyA.mock.calls).toEqual([['same']])
  expect(copyB.mock.calls).toEqual([['same']])
})

it('卸载后重挂的新实例不会复用仍在途操作的operationId', () => {
  const writes: Array<{ resolve: () => void }> = []
  h.write.mockImplementation(() =>
    new Promise<void>((resolve) => {
      writes.push({ resolve })
    })
  )
  const onCopyStart = vi.fn()
  const first = render(<Copy text="same" onCopyStart={ onCopyStart } buttonProps={ { 'aria-label': 'copy' } } />)
  fireEvent.click(screen.getByRole('button', { name: 'copy' }))
  const firstId = onCopyStart.mock.calls[0][0].operationId
  first.unmount()

  render(<Copy text="same" onCopyStart={ onCopyStart } buttonProps={ { 'aria-label': 'copy' } } />)
  fireEvent.click(screen.getByRole('button', { name: 'copy' }))
  expect(onCopyStart.mock.calls[1][0].operationId).not.toBe(firstId)
  expect(writes).toHaveLength(2)
})

it('观察throw/reject不影响原复制；原回调抛错仍触发onCopyError并总能结束', async () => {
  h.write.mockImplementation(async (_text, options) => {
    options?.onWriteSucceeded?.()
  })
  const onCopy = vi.fn(), onCopyError = vi.fn()
  render(
    <Copy
      text="same"
      onCopyStart={ () => {
        throw new Error('start observer')
      } }
      onCopySuccess={ () => Promise.reject(new Error('success observer')) }
      onCopyEnd={ () => Promise.reject(new Error('end observer')) }
      onCopy={ onCopy }
      onCopyError={ onCopyError }
      buttonProps={ { 'aria-label': 'copy' } }
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'copy' }))
  await waitFor(() => expect(onCopy).toHaveBeenCalledTimes(1))
  expect(onCopy.mock.calls[0]).toEqual(['same'])
  expect(onCopyError).not.toHaveBeenCalled()

  const failure = new Error('onCopy failure')
  const onCopyEndFailure = vi.fn()
  const onCopyErrorFailure = vi.fn()
  h.write.mockResolvedValueOnce(undefined)
  const failedView = render(
    <Copy
      text="failed"
      onCopy={ () => {
        throw failure
      } }
      onCopyError={ onCopyErrorFailure }
      onCopyEnd={ onCopyEndFailure }
      buttonProps={ { 'aria-label': 'copy failed' } }
    />,
  )
  fireEvent.click(screen.getByRole('button', { name: 'copy failed' }))
  await waitFor(() => expect(onCopyEndFailure).toHaveBeenCalledTimes(1))
  expect(onCopyErrorFailure).toHaveBeenCalledWith(failure)
  expect(onCopyEndFailure.mock.calls[0][0]).toEqual({
    operationId: onCopyEndFailure.mock.calls[0][0].operationId,
    error: failure,
  })
  expect(onCopyEndFailure.mock.calls[0][0]).not.toHaveProperty('text')
  failedView.unmount()
})
