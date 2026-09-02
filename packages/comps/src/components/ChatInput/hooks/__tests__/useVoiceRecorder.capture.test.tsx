/** @vitest-environment jsdom */

/** 外部实时采集器必须完整接管 text 模式，且不依赖内置 MediaRecorder。 */

import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { createRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from '../../ChatInput'
import type { ChatInputVoiceController, CustomASRCallbacks, CustomASRCapture, TextInsertController, VoiceControlStatus } from '../../types'
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

  it('外部采集器异步失败时立即结束当前轮次并保留真实错误', async () => {
    let context!: Parameters<CustomASRCapture['start']>[0]
    const onError = vi.fn()
    const capture: CustomASRCapture = {
      start: vi.fn((currentContext) => {
        context = currentContext
      }),
      finish: vi.fn(),
      cancel: vi.fn(),
      destroy: vi.fn(),
    }
    const { result } = renderHook(() =>
      useVoiceRecorder({
        enableVoiceRecorder: true,
        voiceModes: ['text'],
        asrConfig: { capture, callbacks: { onError } },
      })
    )

    await act(() => result.current.handleVoiceButtonClick())
    act(() => context.reportError(new Error('voice typing upstream connection failed')))

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'voice typing upstream connection failed',
    }))
    expect(result.current.voiceError).toBe('voice typing upstream connection failed')
    expect(result.current.voiceStatus).toBe('idle')
    expect(capture.destroy).toHaveBeenCalledTimes(1)
    expect(capture.finish).not.toHaveBeenCalled()
  })

  it('外部采集终止错误同步通知宿主退出语音动作，并保留错误反馈', async () => {
    const voiceControllerRef = createRef<ChatInputVoiceController>()
    const onVoiceStatusChange = vi.fn<(status: VoiceControlStatus) => void>()
    let statusImmediatelyAfterReport: VoiceControlStatus | undefined
    const capture: CustomASRCapture = {
      start: vi.fn(),
      finish: vi.fn((context) => {
        context.reportError(new Error('voice typing upstream connection failed'))
        statusImmediatelyAfterReport = onVoiceStatusChange.mock.lastCall?.[0]
      }),
      cancel: vi.fn(),
      destroy: vi.fn(),
    }

    function Host() {
      const [voiceStatus, setVoiceStatus] = useState<VoiceControlStatus>('idle')
      const isVoiceActive = voiceStatus === 'recording' || voiceStatus === 'processing'

      return (
        <ChatInput
          enableUploader={ false }
          enableHelper={ false }
          enableVoiceRecorder
          voiceModes={ ['text'] }
          asrConfig={ { capture } }
          voiceControllerRef={ voiceControllerRef }
          onVoiceStatusChange={ (status) => {
            onVoiceStatusChange(status)
            setVoiceStatus(status)
          } }
          renderActions={ ({ VoiceControl }) => isVoiceActive
            ? (
                <button
                  type="button"
                  data-testid="voice-actions"
                  onClick={ () => void voiceControllerRef.current?.stop() }
                >
                  stop voice
                </button>
              )
            : (
                <div data-testid="default-actions">
                  <VoiceControl />
                </div>
              ) }
        />
      )
    }

    const view = render(<Host />)
    await act(() => voiceControllerRef.current!.start())
    expect(view.getByTestId('voice-actions')).toBeTruthy()

    fireEvent.click(view.getByTestId('voice-actions'))

    expect(statusImmediatelyAfterReport).toBe('idle')
    expect(onVoiceStatusChange.mock.calls.map(([status]) => status).at(-1)).toBe('idle')
    expect(view.queryByTestId('voice-actions')).toBeNull()
    expect(view.getByTestId('default-actions')).toBeTruthy()
    expect(view.getByRole('alert').textContent).toBe('voice typing upstream connection failed')
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
