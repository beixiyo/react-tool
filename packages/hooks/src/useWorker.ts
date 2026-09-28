/**
 * Web Worker 生命周期与通信 Hook
 *
 * - 默认每个组件实例独占一个 worker，卸载时终止
 * - `shared` 时同一脚本（URL 或 `?worker` 构造器）共享一个 worker，按引用计数管理生命周期，
 *   适合初始化昂贵的 worker（如 shiki 需加载 wasm 与语法），避免每个实例重复初始化
 * - `request` 提供请求-响应式调用：自动分配 id，按 id 分发结果，共享 worker 的多个使用者互不串扰
 */
import { useCallback, useEffect, useRef, useState } from 'react'

/** 共享 worker 注册表：脚本 → 实例与引用计数 */
const sharedWorkers = new Map<WorkerScript, { worker: Worker, refs: number }>()

/** 每个 worker 的 request 状态，首次调用 request 时懒创建 */
const rpcStates = new WeakMap<Worker, RpcState>()

/**
 * Web Worker 生命周期与通信
 *
 * @example
 * ```ts
 * // 共享且常驻：多个组件共用一个 worker，全部卸载后仍保留供下次复用
 * const { request, isReady } = useWorker(ShikiWorker, { shared: { keepAlive: true } })
 * useEffect(() => {
 *   if (!isReady) return
 *   request<Result>(payload).then(setResult)
 * }, [isReady, payload, request])
 * ```
 */
export function useWorker(
  WorkerScript: WorkerScript,
  options: WorkerOptions = {},
) {
  const { shared = false, debug = false } = options
  const isShared = shared !== false
  const keepAlive = typeof shared === 'object' && !!shared.keepAlive

  const workerRef = useRef<Worker | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let worker: Worker
    try {
      worker = acquireWorker(WorkerScript, isShared)
    }
    catch (err) {
      setError(err)
      console.error('Worker initialization failed:', err)
      return
    }

    workerRef.current = worker
    setIsReady(true)
    if (debug) {
      console.log('Worker acquired:', WorkerScript)
    }

    return () => {
      workerRef.current = null
      setIsReady(false)
      releaseWorker(WorkerScript, worker, isShared, keepAlive)
      if (debug) {
        console.log('Worker released:', WorkerScript)
      }
    }
  }, [WorkerScript, isShared, keepAlive, debug])

  /** 单向发送消息；worker 未就绪时忽略并告警 */
  const postMessage = useCallback((data: unknown, transfer?: Transferable[]) => {
    if (!workerRef.current) {
      console.warn('Worker not initialized')
      return
    }
    workerRef.current.postMessage(data, transfer ?? [])
  }, [])

  /**
   * 请求-响应式调用
   *
   * 发送 `{ id, data }`，worker 需回传 `{ id, data }`（成功）或 `{ id, error }`（失败）
   * worker 未就绪、回传 error 或被终止时 reject
   */
  const request = useCallback(<TRes = unknown, TData = unknown>(data: TData, transfer?: Transferable[]): Promise<TRes> => {
    const worker = workerRef.current
    if (!worker) {
      return Promise.reject(new Error('Worker not initialized'))
    }

    const rpc = getRpcState(worker)
    const id = ++rpc.seq
    return new Promise<TRes>((resolve, reject) => {
      rpc.pending.set(id, { resolve: resolve as (value: unknown) => void, reject })
      const message: WorkerRequest<TData> = { id, data }
      worker.postMessage(message, transfer ?? [])
    })
  }, [])

  /**
   * 订阅 worker 的全部消息（包括 request 的回传）
   * 返回取消订阅函数，应在 effect 清理中调用；worker 未就绪时返回空函数
   */
  const onMessage = useCallback(<T = unknown>(handler: (event: MessageEvent<T>) => void) => {
    return subscribe(workerRef.current, 'message', handler as EventListener)
  }, [])

  /**
   * 订阅 worker 的错误事件
   * 返回取消订阅函数，应在 effect 清理中调用；worker 未就绪时返回空函数
   */
  const onError = useCallback((handler: (event: ErrorEvent) => void) => {
    return subscribe(workerRef.current, 'error', handler as EventListener)
  }, [])

  return {
    isReady,
    error,
    postMessage,
    request,
    onMessage,
    onError,
  }
}

function subscribe(worker: Worker | null, event: 'message' | 'error', handler: EventListener) {
  if (!worker) {
    return () => {}
  }
  worker.addEventListener(event, handler)
  return () => worker.removeEventListener(event, handler)
}

function createWorker(script: WorkerScript) {
  return typeof script === 'string'
    ? new Worker(script)
    : new script()
}

/** 获取 worker：shared 时复用并增加引用计数 */
function acquireWorker(script: WorkerScript, shared: boolean) {
  if (!shared) {
    return createWorker(script)
  }

  const entry = sharedWorkers.get(script)
  if (entry) {
    entry.refs++
    return entry.worker
  }

  const worker = createWorker(script)
  sharedWorkers.set(script, { worker, refs: 1 })
  return worker
}

/**
 * 释放 worker：独占时直接终止；shared 时引用归零才终止，
 * keepAlive 则保留在注册表中，后续挂载直接复用
 */
function releaseWorker(script: WorkerScript, worker: Worker, shared: boolean, keepAlive: boolean) {
  if (shared) {
    const entry = sharedWorkers.get(script)
    if (entry?.worker !== worker) {
      return
    }
    entry.refs = Math.max(0, entry.refs - 1)
    if (entry.refs > 0 || keepAlive) {
      return
    }
    sharedWorkers.delete(script)
  }

  terminateWorker(worker)
}

/** 终止 worker 并拒绝其所有未完成的 request，避免 Promise 永远挂起 */
function terminateWorker(worker: Worker) {
  worker.terminate()

  const rpc = rpcStates.get(worker)
  if (!rpc) {
    return
  }
  rpc.pending.forEach(({ reject }) => reject(new Error('Worker terminated')))
  rpc.pending.clear()
  worker.removeEventListener('message', rpc.listener)
  rpcStates.delete(worker)
}

function getRpcState(worker: Worker): RpcState {
  const existing = rpcStates.get(worker)
  if (existing) {
    return existing
  }

  const pending: RpcState['pending'] = new Map()
  const listener = (e: MessageEvent) => {
    const msg = e.data as Partial<WorkerResponse> | null
    if (!msg || typeof msg !== 'object' || typeof msg.id !== 'number') {
      return
    }
    const task = pending.get(msg.id)
    if (!task) {
      return
    }
    pending.delete(msg.id)
    if (msg.error !== undefined) {
      task.reject(new Error(msg.error))
    }
    else {
      task.resolve(msg.data)
    }
  }

  worker.addEventListener('message', listener)
  const state: RpcState = { seq: 0, pending, listener }
  rpcStates.set(worker, state)
  return state
}

/** worker 脚本：URL 字符串或 Vite `?worker` 导入的构造器 */
export type WorkerScript = string | (new() => Worker)

export type WorkerOptions = {
  /**
   * 同一脚本是否在所有使用者间共享一个 worker 实例
   * - `false`：每个组件实例独占，卸载即终止
   * - `true`：共享，最后一个使用者卸载时终止
   * - `{ keepAlive: true }`：共享且常驻，全部卸载后仍保留供下次复用
   * @default false
   */
  shared?: boolean | {
    /**
     * 最后一个使用者卸载后是否保留 worker
     * @default false
     */
    keepAlive?: boolean
  }
  /**
   * 打印获取 / 释放日志
   * @default false
   */
  debug?: boolean
}

/** request 发往 worker 的消息 */
export type WorkerRequest<TData = unknown> = {
  id: number
  data: TData
}

/** worker 对 request 的回传；带 error 时视为失败 */
export type WorkerResponse<TRes = unknown> = {
  id: number
  data?: TRes
  error?: string
}

type RpcState = {
  seq: number
  pending: Map<number, { resolve: (value: unknown) => void, reject: (reason: Error) => void }>
  listener: (e: MessageEvent) => void
}
