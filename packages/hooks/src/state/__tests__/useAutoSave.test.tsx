import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutoSave } from '../useAutoSave'

const DELAY = 800

type Value = { a: number }

function setup(options: {
  initialValue?: Value
  flushOnUnmount?: boolean
  saveFn?: (value: Value) => void | Promise<void>
} = {}) {
  const saveFn = vi.fn(options.saveFn ?? (() => {}))

  const rendered = renderHook(
    ({ value }: { value: Value }) => useAutoSave({
      value,
      saveFn,
      delayMS: DELAY,
      initialValue: options.initialValue,
      flushOnUnmount: options.flushOnUnmount,
    }),
    { initialProps: { value: { a: 1 } } },
  )

  return { ...rendered, saveFn }
}

/** 推进防抖计时并冲刷微任务，让保存 effect 完整执行 */
async function advance(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms)
  })
}

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('值变化后防抖触发一次保存，连续变更被合并', async () => {
    const { rerender, saveFn } = setup({ initialValue: { a: 1 } })

    rerender({ value: { a: 2 } })
    await advance(DELAY / 2)
    rerender({ value: { a: 3 } })
    await advance(DELAY)

    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(saveFn).toHaveBeenCalledWith({ a: 3 })
  })

  it('引用变化但内容深比较相同时不保存', async () => {
    const { rerender, saveFn } = setup({ initialValue: { a: 1 } })

    rerender({ value: { a: 1 } })
    await advance(DELAY * 2)

    expect(saveFn).not.toHaveBeenCalled()
  })

  it('保存后改回初始值不再触发保存', async () => {
    const { rerender, saveFn } = setup({ initialValue: { a: 1 } })

    rerender({ value: { a: 2 } })
    await advance(DELAY)
    expect(saveFn).toHaveBeenCalledTimes(1)

    rerender({ value: { a: 1 } })
    await advance(DELAY * 2)
    expect(saveFn).toHaveBeenCalledTimes(1)
  })

  it('保存进行中产生的新变更会在保存完成后追平', async () => {
    let resolveFirst: () => void
    const firstSave = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })
    const saveImpl = vi.fn()
      .mockReturnValueOnce(firstSave)
      .mockResolvedValue(undefined)

    const { rerender, saveFn } = setup({
      initialValue: { a: 1 },
      saveFn: saveImpl,
    })

    rerender({ value: { a: 2 } })
    await advance(DELAY)
    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(saveFn).toHaveBeenLastCalledWith({ a: 2 })

    /** 第一次保存挂起期间继续修改 */
    rerender({ value: { a: 3 } })
    await advance(DELAY)
    expect(saveFn).toHaveBeenCalledTimes(1)

    /** 第一次保存完成后追平最新值 */
    await act(async () => {
      resolveFirst!()
    })
    expect(saveFn).toHaveBeenCalledTimes(2)
    expect(saveFn).toHaveBeenLastCalledWith({ a: 3 })

    /** 防抖值随后落地不会重复保存 */
    await advance(DELAY * 2)
    expect(saveFn).toHaveBeenCalledTimes(2)
  })

  it('flush：立即保存最新值并等待写入完成', async () => {
    let resolveSave: () => void
    const pendingSave = new Promise<void>((resolve) => {
      resolveSave = resolve
    })
    const { result, rerender, saveFn } = setup({
      initialValue: { a: 1 },
      saveFn: () => pendingSave,
    })

    rerender({ value: { a: 2 } })

    let flushed = false
    let flushTask: Promise<void>
    act(() => {
      flushTask = result.current.flush().then(() => {
        flushed = true
      })
    })

    expect(saveFn).toHaveBeenCalledWith({ a: 2 })
    expect(flushed).toBe(false)

    await act(async () => {
      resolveSave!()
      await flushTask!
    })
    expect(flushed).toBe(true)
  })

  it('flushOnUnmount：防抖挂起时卸载会立即冲刷保存', async () => {
    const { rerender, unmount, saveFn } = setup({
      initialValue: { a: 1 },
      flushOnUnmount: true,
    })

    rerender({ value: { a: 2 } })
    /** 不推进计时器，保存仍在防抖窗口内 */
    unmount()

    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(saveFn).toHaveBeenCalledWith({ a: 2 })
  })

  it('flushOnUnmount：无未保存变更时卸载不触发保存', async () => {
    const { rerender, unmount, saveFn } = setup({
      initialValue: { a: 1 },
      flushOnUnmount: true,
    })

    rerender({ value: { a: 2 } })
    await advance(DELAY)
    expect(saveFn).toHaveBeenCalledTimes(1)

    unmount()
    expect(saveFn).toHaveBeenCalledTimes(1)
  })

  it('默认不开启卸载冲刷：挂起的保存随卸载被丢弃', async () => {
    const { rerender, unmount, saveFn } = setup({ initialValue: { a: 1 } })

    rerender({ value: { a: 2 } })
    unmount()
    await advance(DELAY * 2)

    expect(saveFn).not.toHaveBeenCalled()
  })
})
