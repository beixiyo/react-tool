/** @vitest-environment jsdom */

/** 外部实时采集器必须完整接管 text 模式，且不依赖内置 MediaRecorder。 */

import { act, render, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from '../../ChatInput'
import type { ChatInputVoiceController, CustomASRCallbacks, CustomASRCapture, TextInsertController } from '../../types'
import { useVoiceRecorder } from '../useVoiceRecorder'

vi.mock('../../../../i18n', () => ({
  useT: () => (key: string) => key,
}))

function setup() {
  const capture: CustomASRCapture = {
    start: vi.fn(async () => {}),
    finish: vi.fn(async (controller: TextInsertController) => {
      controller.appendText('hello')
    }),
    cancel: vi.fn(async () => {}),
    destroy: vi.fn(async () => {}),
    getAudioLevel: () => 0.5,
  }
  const handleChangeVal = vi.fn()
  const { result } = renderHook(() =>
    useVoiceRecorder({
      enableVoiceRecorder: true,
      voiceModes: ['text'],
      asrConfig: { capture },
      actualValue: 'before ',
      handleChangeVal,
      textBeforeRecordRef: { current: 'before ' },
    })
  )

  return { capture, handleChangeVal, result }
}

describe('useVoiceRecorder external capture', () => {
  it('由外部采集器完成开始、停止和最终文本回填', async () => {
    const { capture, handleChangeVal, result } = setup()

    await act(() => result.current.handleVoiceButtonClick())
    expect(capture.start).toHaveBeenCalledTimes(1)
    expect(result.current.voiceStatus).toBe('recording')

    await act(() => result.current.handleStopRecording())
    expect(capture.finish).toHaveBeenCalledTimes(1)
    expect(handleChangeVal).toHaveBeenCalledWith('before hello')
    expect(result.current.voiceStatus).toBe('idle')
  })

  it('取消时调用外部采集器并恢复 idle', async () => {
    const { capture, result } = setup()

    await act(() => result.current.handleVoiceButtonClick())
    await act(() => result.current.cancelRecording())

    expect(capture.cancel).toHaveBeenCalledTimes(1)
    expect(result.current.voiceStatus).toBe('idle')
  })

  it('audio 模式不被仅用于 text 的外部采集器接管', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const capture: CustomASRCapture = {
      start: vi.fn(),
      finish: vi.fn(),
      cancel: vi.fn(),
      getAudioLevel: () => 0.5,
    }

    const view = render(
      <ChatInput
        enableUploader={ false }
        enableVoiceRecorder
        voiceModes={ ['audio'] }
        asrConfig={ { capture } }
      />,
    )

    expect(view.getByRole('img', { name: 'Audio waveform stopped' })).toBeTruthy()
  })

  it('imperative start 返回前，getStatus 已同步进入 recording', async () => {
    const startDeferred = createDeferred<void>()
    const capture: CustomASRCapture = {
      ...createCapture(),
      start: vi.fn(() => startDeferred.promise),
    }
    const voiceControllerRef = createRef<ChatInputVoiceController>()
    render(
      <ChatInput
        enableUploader={ false }
        enableVoiceRecorder
        voiceModes={ ['text'] }
        asrConfig={ { capture } }
        voiceControllerRef={ voiceControllerRef }
      />,
    )
    const controller = voiceControllerRef.current!

    expect(controller.getStatus()).toBe('idle')
    let startPromise!: Promise<void>
    act(() => {
      startPromise = controller.start()
    })
    expect(controller.getStatus()).toBe('recording')

    startDeferred.resolve()
    await act(() => startPromise)
    expect(controller.getStatus()).toBe('recording')
    await act(() => controller.cancel())
    expect(controller.getStatus()).toBe('idle')
  })

  it('取消 pending start 后，迟到的 start 不会把状态恢复成 recording', async () => {
    const startDeferred = createDeferred<void>()
    const capture: CustomASRCapture = {
      start: vi.fn(() => startDeferred.promise),
      finish: vi.fn(),
      cancel: vi.fn(),
    }
    const { result } = renderHook(() =>
      useVoiceRecorder({
        enableVoiceRecorder: true,
        voiceModes: ['text'],
        asrConfig: { capture },
      })
    )

    let startPromise!: Promise<void>
    act(() => {
      startPromise = result.current.handleVoiceButtonClick()
    })
    await act(() => result.current.cancelRecording())

    startDeferred.resolve()
    await act(() => startPromise)

    expect(capture.start).toHaveBeenCalledTimes(1)
    expect(capture.cancel).toHaveBeenCalledTimes(1)
    expect(result.current.voiceStatus).toBe('idle')
  })

  it('网络启动尚未完成时停止，会在 start 落定后恰好 finish 一次', async () => {
    const startDeferred = createDeferred<void>()
    const capture: CustomASRCapture = {
      start: vi.fn(() => startDeferred.promise),
      finish: vi.fn(),
      cancel: vi.fn(),
    }
    const { result } = renderHook(() =>
      useVoiceRecorder({
        enableVoiceRecorder: true,
        voiceModes: ['text'],
        asrConfig: { capture },
      })
    )

    let startPromise!: Promise<void>
    act(() => {
      startPromise = result.current.handleVoiceButtonClick()
    })
    await act(() => result.current.handleStopRecording())
    expect(capture.finish).not.toHaveBeenCalled()

    startDeferred.resolve()
    await act(() => startPromise)

    expect(capture.finish).toHaveBeenCalledTimes(1)
    expect(result.current.voiceStatus).toBe('idle')
  })

  it('finish pending 时取消，迟到的转写不能写回文本', async () => {
    const finishDeferred = createDeferred<void>()
    const handleChangeVal = vi.fn()
    const capture: CustomASRCapture = {
      start: vi.fn(),
      finish: vi.fn(async (context) => {
        await finishDeferred.promise
        context.appendText('stale transcript')
      }),
      cancel: vi.fn(),
    }
    const { result } = renderHook(() =>
      useVoiceRecorder({
        enableVoiceRecorder: true,
        voiceModes: ['text'],
        asrConfig: { capture },
        actualValue: 'current',
        handleChangeVal,
      })
    )

    await act(() => result.current.handleVoiceButtonClick())
    let finishPromise!: Promise<void>
    act(() => {
      finishPromise = result.current.handleStopRecording()
    })
    await act(() => result.current.cancelRecording())

    finishDeferred.resolve()
    await act(() => finishPromise)

    expect(handleChangeVal).not.toHaveBeenCalled()
    expect(result.current.voiceStatus).toBe('idle')
  })

  it('capture 取消时交出的 controller 可在清理后回填撤销转写', async () => {
    let savedController: TextInsertController | null = null
    const handleChangeVal = vi.fn()
    const capture: CustomASRCapture = {
      start: vi.fn(),
      finish: vi.fn(),
      cancel: vi.fn((controller) => {
        savedController = controller
      }),
    }
    const { result } = renderHook(() =>
      useVoiceRecorder({
        enableVoiceRecorder: true,
        voiceModes: ['text'],
        asrConfig: { capture },
        actualValue: 'edited ',
        handleChangeVal,
      })
    )

    await act(() => result.current.handleVoiceButtonClick())
    await act(() => result.current.cancelRecording())
    act(() => savedController?.appendText('restored'))

    expect(savedController).not.toBeNull()
    expect(handleChangeVal).toHaveBeenLastCalledWith('edited restored')
  })

  it('录音期间替换 capture 配置，停止仍交给本轮开始时的 driver', async () => {
    const captureA = createCapture()
    const captureB = createCapture()
    const { result, rerender } = renderHook(
      ({ capture }) =>
        useVoiceRecorder({
          enableVoiceRecorder: true,
          voiceModes: ['text'],
          asrConfig: { capture },
        }),
      { initialProps: { capture: captureA } },
    )

    await act(() => result.current.handleVoiceButtonClick())
    rerender({ capture: captureB })
    await act(() => result.current.handleStopRecording())

    expect(captureA.finish).toHaveBeenCalledTimes(1)
    expect(captureB.finish).not.toHaveBeenCalled()
  })

  it('onCancelRecord 保存的 controller 可在组件清理后恢复文本', async () => {
    let savedController: TextInsertController | null = null
    const callbacks: CustomASRCallbacks = {
      onCancelRecord: (_recording, controller) => {
        savedController = controller
      },
    }
    const handleChangeVal = vi.fn()
    const { result } = renderHook(() =>
      useVoiceRecorder({
        enableVoiceRecorder: true,
        voiceModes: ['text'],
        asrConfig: { callbacks },
        actualValue: 'edited ',
        handleChangeVal,
        textBeforeRecordRef: { current: 'before ' },
      })
    )
    const recorder = {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {
        await result.current.handleRecordingFinish(
          'blob:test',
          new Blob(['audio'], { type: 'audio/webm' }),
          [new Blob(['audio'])],
        )
      }),
      destroy: vi.fn(async () => {}),
      isRecording: vi.fn(() => true),
    }
    result.current.LiveWaveAudioRef.current = recorder as never

    await act(() => result.current.handleVoiceButtonClick())
    await act(() => result.current.cancelRecording())
    act(() => savedController?.appendText('restored'))

    expect(savedController).not.toBeNull()
    expect(handleChangeVal).toHaveBeenLastCalledWith('edited restored')
  })

  it('上一轮内建 recorder 的迟到 finish 不会结束新一轮录音', async () => {
    const handleChangeVal = vi.fn()
    const callbacks: CustomASRCallbacks = {
      onEndRecord: (_recording, controller) => controller.appendText('stale'),
    }
    const { result } = renderHook(() =>
      useVoiceRecorder({
        enableVoiceRecorder: true,
        voiceModes: ['text'],
        asrConfig: { callbacks },
        actualValue: 'current ',
        handleChangeVal,
      })
    )
    result.current.LiveWaveAudioRef.current = {
      start: vi.fn(async () => {}),
      stop: vi.fn(async () => {}),
      destroy: vi.fn(async () => {}),
      isRecording: vi.fn(() => true),
    } as never

    await act(() => result.current.handleVoiceButtonClick())
    await act(() => result.current.cancelRecording())
    await act(() => result.current.handleVoiceButtonClick())
    await act(() =>
      result.current.handleRecordingFinish(
        'blob:stale',
        new Blob(['stale'], { type: 'audio/webm' }),
        [new Blob(['stale'])],
      )
    )

    expect(handleChangeVal).not.toHaveBeenCalled()
    expect(result.current.voiceStatus).toBe('recording')
  })
})

function createCapture(): CustomASRCapture {
  return {
    start: vi.fn(),
    finish: vi.fn(),
    cancel: vi.fn(),
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
