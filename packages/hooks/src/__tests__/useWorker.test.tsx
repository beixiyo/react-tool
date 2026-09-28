import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useWorker } from '../useWorker'

/**
 * 回显 worker：收到 `{ id, data }` 后异步回传 `{ id, data: data * 10 }`
 * 用 EventTarget 模拟 Worker 的事件分发，记录实例与终止状态
 */
function createEchoWorkerClass() {
  const instances: EchoWorker[] = []

  class EchoWorker extends EventTarget {
    terminated = false

    constructor() {
      super()
      instances.push(this)
    }

    postMessage(message: { id: number, data: number }) {
      queueMicrotask(() => {
        if (!this.terminated) {
          this.dispatchEvent(new MessageEvent('message', { data: { id: message.id, data: message.data * 10 } }))
        }
      })
    }

    terminate() {
      this.terminated = true
    }
  }

  return { EchoWorker: EchoWorker as unknown as new() => Worker, instances }
}

describe('useWorker shared', () => {
  it('同一脚本的多个使用者共享一个 worker，最后一个卸载后才终止', () => {
    const { EchoWorker, instances } = createEchoWorkerClass()

    const a = renderHook(() => useWorker(EchoWorker, { shared: true }))
    const b = renderHook(() => useWorker(EchoWorker, { shared: true }))
    expect(instances).toHaveLength(1)

    a.unmount()
    expect(instances[0].terminated).toBe(false)

    b.unmount()
    expect(instances[0].terminated).toBe(true)

    /** 终止后重新挂载会创建新实例，而不是复用已终止的 worker */
    const c = renderHook(() => useWorker(EchoWorker, { shared: true }))
    expect(instances).toHaveLength(2)
    c.unmount()
  })

  it('keepAlive 时共享 worker 常驻，重新挂载直接复用', () => {
    const { EchoWorker, instances } = createEchoWorkerClass()

    renderHook(() => useWorker(EchoWorker, { shared: { keepAlive: true } })).unmount()
    renderHook(() => useWorker(EchoWorker, { shared: { keepAlive: true } })).unmount()

    expect(instances).toHaveLength(1)
    expect(instances[0].terminated).toBe(false)
  })
})

describe('useWorker request', () => {
  it('共享 worker 上并发请求按 id 分发给各自的调用方', async () => {
    const { EchoWorker } = createEchoWorkerClass()
    const a = renderHook(() => useWorker(EchoWorker, { shared: true }))
    const b = renderHook(() => useWorker(EchoWorker, { shared: true }))

    const results = await Promise.all([
      a.result.current.request<number>(1),
      b.result.current.request<number>(2),
      a.result.current.request<number>(3),
    ])

    expect(results).toEqual([10, 20, 30])
    a.unmount()
    b.unmount()
  })

  it('worker 被终止时未完成的请求 reject，而不是永远挂起', async () => {
    const { EchoWorker } = createEchoWorkerClass()
    const { result, unmount } = renderHook(() => useWorker(EchoWorker))

    const pending = result.current.request(1)
    unmount()

    await expect(pending).rejects.toThrow('Worker terminated')
  })
})
