/** 使用真实浏览器麦克风实现 CustomASRCapture，并把转写策略留给宿主注入。 */

import type { RecorderOptions } from '@jl-org/tool'
import { Recorder } from '@jl-org/tool'
import { createAudioLevelReader } from '../../LiveWaveAudio'
import type { CustomASRCapture, CustomASRCaptureCancelContext, CustomASRCaptureContext, MaybePromise, VoiceRecordingResult } from '../types'

export type MediaRecorderASRCaptureStatus = 'idle' | 'starting' | 'recording' | 'processing'

/** 一轮真实 MediaRecorder 采集的结果。 */
export interface MediaRecorderASRRecording extends VoiceRecordingResult {
  /** 本轮从 start 到 stop 的时长。 */
  durationMs: number
  /** 浏览器最终选择的录音 MIME。 */
  mimeType: string
}

/** 转写策略收到的只读上下文。 */
export interface MediaRecorderTranscribeContext {
  /** 当前 ChatInput 录音轮次失效时触发。 */
  signal: AbortSignal
}

/**
 * MediaRecorder 外部采集器配置
 *
 * 该适配器只负责真实麦克风、录音、音量和生命周期；HTTP/WebSocket/ASR
 * 属于宿主策略，通过 `transcribe` 注入
 */
export interface MediaRecorderASRCaptureOptions {
  /**
   * 把真实录音转换成文本；不传时只录音，不写入输入框
   * @default undefined
   */
  transcribe?: (recording: MediaRecorderASRRecording, context: MediaRecorderTranscribeContext) => MaybePromise<string | null | undefined>
  /**
   * 转写文本的写入方式
   * @default 'append'
   */
  textInsertion?: 'append' | 'replace-recording' | 'replace-all'
  /** 真实录音完成后通知宿主，可用于预览、上传或调试。 */
  onRecordingReady?: (recording: MediaRecorderASRRecording) => void
  /** 采集器状态变化。 */
  onStatusChange?: (status: MediaRecorderASRCaptureStatus) => void
  /** 麦克风、录音或转写错误。 */
  onError?: (error: Error) => void
  /**
   * 透传给 `@jl-org/tool` Recorder 的采集选项
   *
   * `autoInit`、`createAnalyser` 和生命周期回调由适配器统一管理
   */
  recorderOptions?: Omit<RecorderOptions, 'autoInit' | 'createAnalyser' | 'onError' | 'onFinish'>
}

/**
 * 创建一个真实麦克风驱动的 text 模式采集器
 *
 * 每轮 start 都创建独立 Recorder；finish/cancel/destroy 均可重复调用
 * finish 会停止媒体流，但保留最后一轮结果 URL 到下一次 start 或 destroy
 */
export function createMediaRecorderASRCapture(options: MediaRecorderASRCaptureOptions = {}): CustomASRCapture {
  let recorder: Recorder | null = null
  let recorderSession = 0
  let chatSessionId: number | null = null
  let startedAt = 0
  let resultAudioUrl = ''
  let status: MediaRecorderASRCaptureStatus = 'idle'
  let startPromise: Promise<void> | null = null
  const reportedErrors = new WeakSet<Error>()

  const readAudioLevel = createAudioLevelReader(() => recorder)

  const setStatus = (nextStatus: MediaRecorderASRCaptureStatus) => {
    if (status === nextStatus) return

    status = nextStatus
    options.onStatusChange?.(nextStatus)
  }

  const reportError = (error: unknown) => {
    const normalizedError = error instanceof Error
      ? error
      : new Error(String(error))
    if (!reportedErrors.has(normalizedError)) {
      reportedErrors.add(normalizedError)
      options.onError?.(normalizedError)
    }
    return normalizedError
  }

  const revokeResultUrl = () => {
    if (!resultAudioUrl) return

    URL.revokeObjectURL(resultAudioUrl)
    resultAudioUrl = ''
  }

  const releaseRecorder = async (target: Recorder | null) => {
    if (!target) return

    if (target.isRecording) {
      await target.stop()
    }
    await target.destroy()
    if (recorder === target) {
      recorder = null
    }
  }

  const isCurrent = (session: number, context?: CustomASRCaptureContext) => {
    return recorderSession === session && (!context || (chatSessionId === context.sessionId && !context.signal.aborted))
  }

  const start = async (context: CustomASRCaptureContext) => {
    if (startPromise || status === 'recording') return

    const session = ++recorderSession
    chatSessionId = context.sessionId
    revokeResultUrl()
    setStatus('starting')

    const nextRecorder = new Recorder({
      ...options.recorderOptions,
      autoInit: false,
      createAnalyser: true,
      onError: (error) => void reportError(error),
    })
    recorder = nextRecorder

    startPromise = (async () => {
      try {
        await nextRecorder.start()
        if (!isCurrent(session, context)) {
          await releaseRecorder(nextRecorder)
          return
        }

        startedAt = performance.now()
        setStatus('recording')
      }
      catch (error) {
        if (isCurrent(session)) {
          setStatus('idle')
        }
        await releaseRecorder(nextRecorder).catch(() => {})
        throw reportError(error)
      }
      finally {
        if (startPromise) {
          startPromise = null
        }
      }
    })()

    await startPromise
  }

  const finish = async (context: CustomASRCaptureContext) => {
    const session = recorderSession
    const target = recorder
    if (!target || !isCurrent(session, context)) return

    setStatus('processing')

    try {
      if (target.isRecording) {
        await target.stop()
      }
      if (!isCurrent(session, context)) return

      const audioBlob = new Blob(target.chunks, { type: target.mimeType })
      resultAudioUrl = URL.createObjectURL(audioBlob)
      const recording: MediaRecorderASRRecording = {
        audioUrl: resultAudioUrl,
        audioBlob,
        chunks: [...target.chunks],
        durationMs: Math.max(0, performance.now() - startedAt),
        mimeType: target.mimeType,
      }

      options.onRecordingReady?.(recording)

      const text = await options.transcribe?.(recording, { signal: context.signal })
      if (!isCurrent(session, context) || !text) return

      switch (options.textInsertion ?? 'append') {
        case 'replace-all':
          context.replaceText(text)
          break
        case 'replace-recording':
          context.insertText(text, true)
          break
        case 'append':
          context.appendText(text)
          break
      }
    }
    catch (error) {
      throw reportError(error)
    }
    finally {
      await releaseRecorder(target).catch((error) => void reportError(error))
      if (isCurrent(session)) {
        chatSessionId = null
        startedAt = 0
        setStatus('idle')
      }
    }
  }

  const cancel = async (context: CustomASRCaptureCancelContext) => {
    if (chatSessionId !== context.sessionId) return

    recorderSession += 1
    chatSessionId = null
    startedAt = 0
    const pendingStart = startPromise
    const target = recorder
    setStatus('idle')

    await pendingStart?.catch(() => {})
    await releaseRecorder(target).catch((error) => void reportError(error))
  }

  const destroy = async () => {
    recorderSession += 1
    chatSessionId = null
    startedAt = 0
    const pendingStart = startPromise
    const target = recorder
    setStatus('idle')

    await pendingStart?.catch(() => {})
    await releaseRecorder(target).catch((error) => void reportError(error))
    revokeResultUrl()
  }

  return {
    start,
    finish,
    cancel,
    destroy,
    getAudioLevel: readAudioLevel,
  }
}
