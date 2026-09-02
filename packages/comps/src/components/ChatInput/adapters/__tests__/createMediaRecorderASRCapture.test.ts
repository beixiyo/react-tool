/** @vitest-environment jsdom */

/** MediaRecorder adapter 必须把真实录音结果交给宿主策略，并在结束后释放采集资源。 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CustomASRCaptureContext } from '../../types'
import { createMediaRecorderASRCapture } from '../createMediaRecorderASRCapture'

const recorderMocks = vi.hoisted(() => ({
  startQueue: [] as Array<() => Promise<void>>,
  instances: [] as Array<{
    options: Record<string, unknown>
    start: ReturnType<typeof vi.fn>
    stop: ReturnType<typeof vi.fn>
    destroy: ReturnType<typeof vi.fn>
    isRecording: boolean
    chunks: Blob[]
    mimeType: string
    analyser: { frequencyBinCount: number }
    getByteFrequencyData: ReturnType<typeof vi.fn>
  }>,
}))

vi.mock('@jl-org/tool', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@jl-org/tool')>()

  return {
    ...actual,
    Recorder: class Recorder {
      options: Record<string, unknown>
      start = vi.fn(async () => {
        await recorderMocks.startQueue.shift()?.()
        this.isRecording = true
      })
      stop = vi.fn(async () => {
        this.isRecording = false
      })
      destroy = vi.fn(async () => {
        this.isRecording = false
      })
      isRecording = false
      chunks = [new Blob(['recorded-audio'], { type: 'audio/webm' })]
      mimeType = 'audio/webm'
      analyser = { frequencyBinCount: 4 }
      getByteFrequencyData = vi.fn((buffer: Uint8Array) => {
        buffer.set([128, 0, 0, 0])
        return buffer
      })

      constructor(options: Record<string, unknown>) {
        this.options = options
        recorderMocks.instances.push(this)
      }
    },
  }
})

describe('createMediaRecorderASRCapture', () => {
  beforeEach(() => {
    recorderMocks.startQueue.length = 0
    recorderMocks.instances.length = 0
    Object.defineProperties(URL, {
      createObjectURL: {
        configurable: true,
        value: vi.fn(() => 'blob:recording'),
      },
      revokeObjectURL: {
        configurable: true,
        value: vi.fn(),
      },
    })
  })

  it('录音完成后把 Blob 交给 transcribe、写入文本并释放 recorder', async () => {
    const appendText = vi.fn()
    const onRecordingReady = vi.fn()
    const transcribe = vi.fn(async () => 'transcript')
    const capture = createMediaRecorderASRCapture({
      transcribe,
      onRecordingReady,
    })
    const context = createContext({ appendText })

    await capture.start(context)
    expect(capture.getAudioLevel?.()).toBeGreaterThan(0)
    await capture.finish(context)

    const recorder = recorderMocks.instances[0]
    expect(recorder.options).toMatchObject({
      autoInit: false,
      createAnalyser: true,
    })
    expect(transcribe).toHaveBeenCalledTimes(1)
    expect(onRecordingReady).toHaveBeenCalledWith(
      expect.objectContaining({
        audioUrl: 'blob:recording',
        mimeType: 'audio/webm',
      }),
    )
    expect(appendText).toHaveBeenCalledWith('transcript')
    expect(recorder.stop).toHaveBeenCalledTimes(1)
    expect(recorder.destroy).toHaveBeenCalledTimes(1)
  })

  it('取消后使 pending start 失效，并释放刚创建的 recorder', async () => {
    const startDeferred = createDeferred<void>()
    recorderMocks.startQueue.push(() => startDeferred.promise)
    const capture = createMediaRecorderASRCapture()
    const context = createContext()

    const startPromise = capture.start(context)
    const recorder = recorderMocks.instances[0]
    const cancelPromise = capture.cancel(context)

    startDeferred.resolve()
    await Promise.all([startPromise, cancelPromise])

    expect(recorder.destroy).toHaveBeenCalled()
    expect(recorder.isRecording).toBe(false)
  })
})

function createContext(overrides: Partial<CustomASRCaptureContext> = {}): CustomASRCaptureContext {
  const abortController = new AbortController()
  return {
    sessionId: 1,
    signal: abortController.signal,
    reportError: vi.fn(),
    currentText: '',
    textBeforeRecord: '',
    insertText: vi.fn(),
    replaceText: vi.fn(),
    appendText: vi.fn(),
    ...overrides,
  }
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}
