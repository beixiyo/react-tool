import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useReq, useWatchReq } from '../net'

describe('useReq', () => {
  it('tracks loading state and exposes successful data', async () => {
    const onSuccess = vi.fn()
    const onFinally = vi.fn()
    const setLoading = vi.fn()
    const requestFn = vi.fn(async (value: string) => `done:${value}`)

    const { result } = renderHook(() => useReq(requestFn, {
      initData: 'idle',
      initLoading: false,
      onFinally,
      onSuccess,
      setLoading,
    }))

    let requestPromise: Promise<void>
    act(() => {
      requestPromise = result.current.request('task')
    })

    expect(result.current.loading).toBe(true)
    expect(setLoading).toHaveBeenLastCalledWith(true)

    await act(async () => {
      await requestPromise
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe('done:task')
    expect(result.current.error).toBeUndefined()
    expect(onSuccess).toHaveBeenCalledWith('done:task')
    expect(onFinally).toHaveBeenCalledTimes(1)
    expect(setLoading).toHaveBeenLastCalledWith(false)
  })

  it('ignores stale responses from slower previous requests', async () => {
    const first = createDeferred<string>()
    const second = createDeferred<string>()
    const onSuccess = vi.fn()
    const onFinally = vi.fn()
    const requestFn = vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)

    const { result } = renderHook(() => useReq(requestFn, {
      initData: 'idle',
      initLoading: false,
      onFinally,
      onSuccess,
    }))

    let firstRequest: Promise<void>
    let secondRequest: Promise<void>
    act(() => {
      firstRequest = result.current.request()
    })
    act(() => {
      secondRequest = result.current.request()
    })

    await act(async () => {
      second.resolve('latest')
      await secondRequest
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBe('latest')
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledWith('latest')

    await act(async () => {
      first.resolve('stale')
      await firstRequest
    })

    expect(result.current.data).toBe('latest')
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(onFinally).toHaveBeenCalledTimes(1)
  })

  it('rethrows current request errors by default', async () => {
    const error = new Error('boom')
    const onError = vi.fn()
    const onFinally = vi.fn()
    const requestFn = vi.fn(async () => {
      throw error
    })

    const { result } = renderHook(() => useReq(requestFn, {
      initData: 'idle',
      initLoading: false,
      onError,
      onFinally,
    }))

    await act(async () => {
      await expect(result.current.request()).rejects.toThrow(error)
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(error)
    expect(onError).toHaveBeenCalledWith(error)
    expect(onFinally).toHaveBeenCalledTimes(1)
  })

  it('can store current errors without rejecting the caller', async () => {
    const error = new Error('silent')
    const onError = vi.fn()
    const requestFn = vi.fn(async () => {
      throw error
    })

    const { result } = renderHook(() => useReq(requestFn, {
      initData: 'idle',
      initLoading: false,
      onError,
      rethrow: false,
    }))

    await act(async () => {
      await result.current.request()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(error)
    expect(onError).toHaveBeenCalledWith(error)
  })
})

describe('useWatchReq', () => {
  it('captures automatic request failures without unhandled rejections', async () => {
    const error = new Error('watch failed')
    const onError = vi.fn()
    const requestFn = vi.fn(async () => {
      throw error
    })

    const { result } = renderHook(() => useWatchReq(requestFn, [], {
      initData: 'idle',
      initLoading: false,
      onError,
    }))

    await waitFor(() => {
      expect(result.current.error).toBe(error)
    })

    expect(onError).toHaveBeenCalledWith(error)
    expect(result.current.loading).toBe(false)
  })
})

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return {
    promise,
    reject,
    resolve,
  }
}
